import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import { AuditAction, User } from '@prisma/client';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from '../utils/errors';
import { IAuthService } from '../interfaces/services/IAuthService';
import { LoginDTO, RegisterDTO, ChangePasswordDTO } from '../dtos/auth.dto';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_dev';
const JWT_EXPIRES_IN = '24h';

export interface AuditContext {
  ipAddress: string;
  userAgent: string | null;
}

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

class AuthService implements IAuthService {
  /**
   * Enregistre une entrée dans le journal d'audit
   */
  public async logAudit(
    action: AuditAction,
    email: string,
    context: AuditContext,
    userId?: number | null,
    details?: string,
  ): Promise<void> {
    try {
      await prisma.loginAudit.create({
        data: {
          action,
          email,
          userId: userId ?? null,
          ipAddress: context.ipAddress.slice(0, 45),
          userAgent: context.userAgent?.slice(0, 500) || null,
          details: details || null,
        },
      });
    } catch (error) {
      console.error("[AUDIT] Erreur lors de l'écriture du journal d'audit:", error);
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  public async signup(data: RegisterDTO): Promise<Partial<User>> {
    const { nom, prenom, email, motDePasse } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Un compte avec cet email existe déjà.', 'EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await hashPassword(motDePasse);

    const newUser = await prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        motDePasse: hashedPassword,
        role: 'TECHNICIEN',
        actif: false,
      },
    });

    return { id: newUser.id, email: newUser.email };
  }

  /**
   * Connexion de l'utilisateur
   */
  public async login(
    data: LoginDTO,
    context: AuditContext,
  ): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const { email, motDePasse } = data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      await this.logAudit(
        AuditAction.LOGIN_FAILED,
        email,
        context,
        null,
        'Utilisateur introuvable',
      );
      throw new UnauthorizedError('Identifiants incorrects.', 'INVALID_CREDENTIALS');
    }

    if (!user.actif) {
      await this.logAudit(AuditAction.LOGIN_FAILED, email, context, user.id, 'Compte désactivé');
      throw new ForbiddenError(
        'Votre compte a été désactivé. Contactez un administrateur.',
        'ACCOUNT_DISABLED',
      );
    }

    if (user.verrouilleJusqua && user.verrouilleJusqua > new Date()) {
      const minutesRestantes = Math.ceil(
        (user.verrouilleJusqua.getTime() - Date.now()) / (1000 * 60),
      );
      await this.logAudit(
        AuditAction.LOGIN_FAILED,
        email,
        context,
        user.id,
        `Compte verrouillé (${minutesRestantes} min restantes)`,
      );
      throw new AppError(
        `Compte verrouillé suite à trop de tentatives échouées. Réessayez dans ${minutesRestantes} minute(s).`,
        423,
        'ACCOUNT_LOCKED',
      );
    }

    const passwordValid = await comparePassword(motDePasse, user.motDePasse);

    if (!passwordValid) {
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
      const lockoutMinutes = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10);
      const tentatives = user.tentativesEchouees + 1;

      const updateData: Record<string, any> = { tentativesEchouees: tentatives };

      if (tentatives >= maxAttempts) {
        const verrouilleJusqua = new Date(Date.now() + lockoutMinutes * 60 * 1000);
        updateData.verrouilleJusqua = verrouilleJusqua;

        await prisma.user.update({ where: { id: user.id }, data: updateData });
        await this.logAudit(
          AuditAction.ACCOUNT_LOCKED,
          email,
          context,
          user.id,
          `Verrouillé après ${tentatives} tentatives`,
        );

        throw new AppError(
          `Compte verrouillé suite à ${tentatives} tentatives échouées. Réessayez dans ${lockoutMinutes} minutes.`,
          423,
          'ACCOUNT_LOCKED',
        );
      }

      await prisma.user.update({ where: { id: user.id }, data: updateData });
      await this.logAudit(
        AuditAction.LOGIN_FAILED,
        email,
        context,
        user.id,
        `Tentative ${tentatives}/${maxAttempts}`,
      );

      throw new UnauthorizedError('Identifiants incorrects.', 'INVALID_CREDENTIALS');
    }

    // Connexion réussie
    await prisma.user.update({
      where: { id: user.id },
      data: { tentativesEchouees: 0, verrouilleJusqua: null, dernierLogin: new Date() },
    });

    const tokenFamily = uuidv4();
    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenFamily,
    });
    const refreshTokenHash = hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        tokenFamily,
        expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE),
      },
    });

    await this.logAudit(AuditAction.LOGIN_SUCCESS, email, context, user.id);

    const { motDePasse: _, ...userSansMotDePasse } = user;
    return { user: userSansMotDePasse, accessToken, refreshToken };
  }

  /**
   * Rafraîchissement du token d'accès
   */
  public async refresh(
    refreshTokenCookie: string,
    context: AuditContext,
  ): Promise<{ user: Partial<User>; newAccessToken: string; newRefreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenCookie);
    } catch (error) {
      throw new UnauthorizedError(
        'Token de rafraîchissement invalide ou expiré.',
        'INVALID_REFRESH_TOKEN',
      );
    }

    const tokenHash = hashToken(refreshTokenCookie);
    const storedToken = await prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoque) {
      if (storedToken || payload.tokenFamily) {
        const familyId = storedToken?.tokenFamily || payload.tokenFamily;
        await prisma.refreshToken.updateMany({
          where: { tokenFamily: familyId, revoque: false },
          data: { revoque: true, revoqueRaison: 'REUSE_DETECTION' },
        });
        console.warn(`[SÉCURITÉ] Détection de réutilisation de token pour la famille: ${familyId}`);
      }
      throw new UnauthorizedError(
        'Token de rafraîchissement invalide. Veuillez vous reconnecter.',
        'TOKEN_REUSE_DETECTED',
      );
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoque: true, revoqueRaison: 'EXPIRED' },
      });
      throw new UnauthorizedError(
        'Token de rafraîchissement expiré. Veuillez vous reconnecter.',
        'REFRESH_TOKEN_EXPIRED',
      );
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoque: true, revoqueRaison: 'ROTATION' },
    });

    const user = storedToken.user;
    const newAccessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenFamily: storedToken.tokenFamily,
    });
    const newTokenHash = hashToken(newRefreshToken);

    await prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: user.id,
        tokenFamily: storedToken.tokenFamily,
        expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE),
      },
    });

    await this.logAudit(AuditAction.TOKEN_REFRESH, user.email, context, user.id);

    const { motDePasse: _, ...userSansMotDePasse } = user;
    return { user: userSansMotDePasse, newAccessToken, newRefreshToken };
  }

  /**
   * Déconnexion de l'utilisateur
   */
  public async logout(
    refreshTokenCookie: string | undefined,
    email: string,
    userId: number | null,
    context: AuditContext,
  ): Promise<void> {
    if (refreshTokenCookie) {
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

    await this.logAudit(AuditAction.LOGOUT, email, context, userId);
  }

  /**
   * Récupération du profil
   */
  public async getProfile(userId: number): Promise<Partial<User>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      throw new NotFoundError('Utilisateur introuvable.');
    }

    return user;
  }

  /**
   * Changement de mot de passe
   */
  public async changePassword(
    userId: number,
    email: string,
    data: any,
    context: AuditContext,
  ): Promise<void> {
    const { ancienMotDePasse, nouveauMotDePasse } = data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('Utilisateur introuvable.');
    }

    const isOldPasswordValid = await comparePassword(ancienMotDePasse, user.motDePasse);
    if (!isOldPasswordValid) {
      throw new UnauthorizedError("L'ancien mot de passe est incorrect.", 'INVALID_OLD_PASSWORD');
    }

    const isSamePassword = await comparePassword(nouveauMotDePasse, user.motDePasse);
    if (isSamePassword) {
      throw new BadRequestError(
        "Le nouveau mot de passe doit être différent de l'ancien.",
        'SAME_PASSWORD',
      );
    }

    const hashedPassword = await hashPassword(nouveauMotDePasse);
    await prisma.user.update({
      where: { id: user.id },
      data: { motDePasse: hashedPassword },
    });

    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoque: false },
      data: { revoque: true, revoqueRaison: 'PASSWORD_CHANGED' },
    });

    await this.logAudit(AuditAction.PASSWORD_CHANGED, email, context, user.id);
  }
}

export const authService = new AuthService();
