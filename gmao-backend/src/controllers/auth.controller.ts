/**
 * @fileoverview Contrôleur d'authentification
 * @description Gère la connexion, la déconnexion, le rafraîchissement des tokens,
 *              le changement de mot de passe et la récupération du profil utilisateur.
 */

import { Request, Response, NextFunction } from 'express';
import { authService, AuditContext } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';

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

function getAuditContext(req: Request): AuditContext {
  return {
    ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || null,
  };
}

/**
 * Inscription d'un nouvel utilisateur (en attente de validation)
 * POST /api/auth/signup
 */
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès. En attente de validation par un administrateur.',
      data: { ...user, statut: 'EN_ATTENTE' },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Connexion de l'utilisateur
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body,
      getAuditContext(req),
    );

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      data: { user },
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
      throw new UnauthorizedError('Token de rafraîchissement manquant.', 'NO_REFRESH_TOKEN');
    }

    try {
      const { user, newAccessToken, newRefreshToken } = await authService.refresh(
        refreshTokenCookie,
        getAuditContext(req),
      );
      setTokenCookies(res, newAccessToken, newRefreshToken);

      res.status(200).json({
        success: true,
        message: 'Token rafraîchi avec succès.',
        data: { user },
      });
    } catch (serviceError) {
      // Clear cookies if the token was invalid or expired
      clearTokenCookies(res);
      throw serviceError;
    }
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
    const email = req.user?.email || 'unknown';
    const userId = req.user?.userId || null;

    await authService.logout(refreshTokenCookie, email, userId, getAuditContext(req));
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
      throw new UnauthorizedError('Utilisateur non authentifié.', 'NOT_AUTHENTICATED');
    }

    const user = await authService.getProfile(req.user.userId);

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
      throw new UnauthorizedError('Utilisateur non authentifié.', 'NOT_AUTHENTICATED');
    }

    await authService.changePassword(
      req.user.userId,
      req.user.email,
      req.body,
      getAuditContext(req),
    );
    clearTokenCookies(res);

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès. Veuillez vous reconnecter.',
    });
  } catch (error) {
    next(error);
  }
}
