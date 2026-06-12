/**
 * @fileoverview Contrôleur d'authentification
 * @description Gère la connexion, la déconnexion, le rafraîchissement des tokens,
 *              le changement de mot de passe et la récupération du profil utilisateur.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  TokenExpiredError,
  JsonWebTokenError,
} from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import { AuditAction } from '@prisma/client';

/** Durée du cookie access_token en millisecondes (15 minutes) */
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;

/** Durée du cookie refresh_token en millisecondes (7 jours) */
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * Définit les cookies httpOnly pour les tokens
 */
function setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ACCESS_COOKIE_MAX_AGE,
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/api/auth',
  });
}

/**
 * Efface les cookies d'authentification
 */
function clearTokenCookies(res: Response): void {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/auth' });
}

/**
 * Enregistre une entrée dans le journal d'audit
 */
async function logAudit(
  action: AuditAction,
  email: string,
  req: Request,
  userId?: number | null,
  details?: string,
): Promise<void> {
  try {
    await prisma.loginAudit.create({
      data: {
        action,
        email,
        userId: userId ?? null,
        ipAddress: (req.ip || req.socket.remoteAddress || 'unknown').slice(0, 45),
        userAgent: req.headers['user-agent']?.slice(0, 500) || null,
        details: details || null,
      },
    });
  } catch (error) {
    // L'échec du log d'audit ne doit pas bloquer l'opération principale
    console.error("[AUDIT] Erreur lors de l'écriture du journal d'audit:", error);
  }
}

/**
 * Connexion de l'utilisateur
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, motDePasse } = req.body;

    // 1. Recherche de l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await logAudit(AuditAction.LOGIN_FAILED, email, req, null, 'Utilisateur introuvable');
      res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // 2. Vérification que le compte est actif
    if (!user.actif) {
      await logAudit(AuditAction.LOGIN_FAILED, email, req, user.id, 'Compte désactivé');
      res.status(403).json({
        success: false,
        message: 'Votre compte a été désactivé. Contactez un administrateur.',
        code: 'ACCOUNT_DISABLED',
      });
      return;
    }

    // 3. Vérification du verrouillage du compte
    if (user.verrouilleJusqua && user.verrouilleJusqua > new Date()) {
      const minutesRestantes = Math.ceil(
        (user.verrouilleJusqua.getTime() - Date.now()) / (1000 * 60),
      );
      await logAudit(
        AuditAction.LOGIN_FAILED,
        email,
        req,
        user.id,
        `Compte verrouillé (${minutesRestantes} min restantes)`,
      );
      res.status(423).json({
        success: false,
        message: `Compte verrouillé suite à trop de tentatives échouées. Réessayez dans ${minutesRestantes} minute(s).`,
        code: 'ACCOUNT_LOCKED',
      });
      return;
    }

    // 4. Vérification du mot de passe
    const passwordValid = await comparePassword(motDePasse, user.motDePasse);

    if (!passwordValid) {
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
      const lockoutMinutes = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10);
      const tentatives = user.tentativesEchouees + 1;

      const updateData: Record<string, unknown> = {
        tentativesEchouees: tentatives,
      };

      // Verrouillage si le nombre max de tentatives est atteint
      if (tentatives >= maxAttempts) {
        const verrouilleJusqua = new Date(Date.now() + lockoutMinutes * 60 * 1000);
        updateData.verrouilleJusqua = verrouilleJusqua;

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });

        await logAudit(
          AuditAction.ACCOUNT_LOCKED,
          email,
          req,
          user.id,
          `Verrouillé après ${tentatives} tentatives`,
        );

        res.status(423).json({
          success: false,
          message: `Compte verrouillé suite à ${tentatives} tentatives échouées. Réessayez dans ${lockoutMinutes} minutes.`,
          code: 'ACCOUNT_LOCKED',
        });
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      await logAudit(
        AuditAction.LOGIN_FAILED,
        email,
        req,
        user.id,
        `Tentative ${tentatives}/${maxAttempts}`,
      );

      res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // 5. Connexion réussie — réinitialisation des tentatives et mise à jour du dernier login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        tentativesEchouees: 0,
        verrouilleJusqua: null,
        dernierLogin: new Date(),
      },
    });

    // 6. Génération des tokens
    const tokenFamily = uuidv4();

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenFamily,
    });

    // 7. Stockage du hash du refresh token en base
    const refreshTokenHash = hashToken(refreshToken);
    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        tokenFamily,
        expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE),
      },
    });

    // 8. Définition des cookies
    setTokenCookies(res, accessToken, refreshToken);

    // 9. Log d'audit
    await logAudit(AuditAction.LOGIN_SUCCESS, email, req, user.id);

    // 10. Réponse sans mot de passe
    const { motDePasse: _, ...userSansMotDePasse } = user;

    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      data: {
        user: userSansMotDePasse,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Rafraîchissement du token d'accès
 * POST /api/auth/refresh
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshTokenCookie = req.cookies?.refresh_token;

    if (!refreshTokenCookie) {
      res.status(401).json({
        success: false,
        message: 'Token de rafraîchissement manquant.',
        code: 'NO_REFRESH_TOKEN',
      });
      return;
    }

    // 1. Vérification de la signature JWT
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenCookie);
    } catch (error) {
      clearTokenCookies(res);
      res.status(401).json({
        success: false,
        message: 'Token de rafraîchissement invalide ou expiré.',
        code: 'INVALID_REFRESH_TOKEN',
      });
      return;
    }

    // 2. Recherche du token en base de données
    const tokenHash = hashToken(refreshTokenCookie);
    const storedToken = await prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });

    // 3. Détection de réutilisation de token (reuse detection)
    if (!storedToken || storedToken.revoque) {
      // Si le token existe mais est révoqué → possible vol de token
      // Révoquer TOUTE la famille de tokens par sécurité
      if (storedToken || payload.tokenFamily) {
        const familyId = storedToken?.tokenFamily || payload.tokenFamily;
        await prisma.refreshToken.updateMany({
          where: {
            tokenFamily: familyId,
            revoque: false,
          },
          data: {
            revoque: true,
            revoqueRaison: 'REUSE_DETECTION',
          },
        });

        console.warn(`[SÉCURITÉ] Détection de réutilisation de token pour la famille: ${familyId}`);
      }

      clearTokenCookies(res);
      res.status(401).json({
        success: false,
        message: 'Token de rafraîchissement invalide. Veuillez vous reconnecter.',
        code: 'TOKEN_REUSE_DETECTED',
      });
      return;
    }

    // 4. Vérification de l'expiration
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoque: true, revoqueRaison: 'EXPIRED' },
      });

      clearTokenCookies(res);
      res.status(401).json({
        success: false,
        message: 'Token de rafraîchissement expiré. Veuillez vous reconnecter.',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
      return;
    }

    // 5. Révocation du token actuel (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoque: true, revoqueRaison: 'ROTATION' },
    });

    // 6. Génération de nouveaux tokens (même famille)
    const user = storedToken.user;
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenFamily: storedToken.tokenFamily,
    });

    // 7. Stockage du nouveau refresh token hash
    const newTokenHash = hashToken(newRefreshToken);
    await prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: user.id,
        tokenFamily: storedToken.tokenFamily,
        expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE),
      },
    });

    // 8. Mise à jour des cookies
    setTokenCookies(res, newAccessToken, newRefreshToken);

    // 9. Log d'audit
    await logAudit(AuditAction.TOKEN_REFRESH, user.email, req, user.id);

    // 10. Réponse
    const { motDePasse: _, ...userSansMotDePasse } = user;

    res.status(200).json({
      success: true,
      message: 'Token rafraîchi avec succès.',
      data: {
        user: userSansMotDePasse,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Déconnexion de l'utilisateur
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshTokenCookie = req.cookies?.refresh_token;

    if (refreshTokenCookie) {
      // Révocation du refresh token en base
      const tokenHash = hashToken(refreshTokenCookie);
      const storedToken = await prisma.refreshToken.findFirst({
        where: { tokenHash, revoque: false },
      });

      if (storedToken) {
        await prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revoque: true, revoqueRaison: 'LOGOUT' },
        });
      }
    }

    // Log d'audit
    const email = req.user?.email || 'unknown';
    const userId = req.user?.userId || null;
    await logAudit(AuditAction.LOGOUT, email, req, userId);

    // Suppression des cookies
    clearTokenCookies(res);

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Récupération du profil de l'utilisateur connecté
 * GET /api/auth/me
 */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié.',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        actif: true,
        dernierLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable.',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Changement de mot de passe de l'utilisateur connecté
 * POST /api/auth/change-password
 */
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié.',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    // 1. Récupération de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable.',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    // 2. Vérification de l'ancien mot de passe
    const isOldPasswordValid = await comparePassword(ancienMotDePasse, user.motDePasse);
    if (!isOldPasswordValid) {
      res.status(401).json({
        success: false,
        message: "L'ancien mot de passe est incorrect.",
        code: 'INVALID_OLD_PASSWORD',
      });
      return;
    }

    // 3. Vérification que le nouveau mot de passe est différent
    const isSamePassword = await comparePassword(nouveauMotDePasse, user.motDePasse);
    if (isSamePassword) {
      res.status(400).json({
        success: false,
        message: "Le nouveau mot de passe doit être différent de l'ancien.",
        code: 'SAME_PASSWORD',
      });
      return;
    }

    // 4. Hachage et mise à jour du nouveau mot de passe
    const hashedPassword = await hashPassword(nouveauMotDePasse);
    await prisma.user.update({
      where: { id: user.id },
      data: { motDePasse: hashedPassword },
    });

    // 5. Révocation de TOUS les refresh tokens de l'utilisateur
    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revoque: false,
      },
      data: {
        revoque: true,
        revoqueRaison: 'PASSWORD_CHANGED',
      },
    });

    // 6. Log d'audit
    await logAudit(AuditAction.PASSWORD_CHANGED, user.email, req, user.id);

    // 7. Suppression des cookies (force la reconnexion)
    clearTokenCookies(res);

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès. Veuillez vous reconnecter.',
    });
  } catch (error) {
    next(error);
  }
}
