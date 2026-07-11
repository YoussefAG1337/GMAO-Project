import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuditContext } from '../interfaces/services/IAuthService';
import { UnauthorizedError } from '../utils/errors';

/** Durée du cookie access_token en millisecondes (15 minutes) */
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;

/** Durée du cookie refresh_token en millisecondes (7 jours) */
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

//Définit les cookies httpOnly pour les tokens

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

export async function signup(req: Request, res: Response): Promise<void> {
  const user = await authService.signup(req.body);
  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès. En attente de validation par un administrateur.',
    data: { ...user, statut: 'EN_ATTENTE' },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
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
}

//Rafraîchissement du token d'accès

export async function refresh(req: Request, res: Response): Promise<void> {
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
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshTokenCookie = req.cookies?.refresh_token;
  const email = req.user?.email || 'unknown';
  const userId = req.user?.userId || null;

  await authService.logout(refreshTokenCookie, email, userId, getAuditContext(req));
  clearTokenCookies(res);

  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie.',
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié.', 'NOT_AUTHENTICATED');
  }

  const user = await authService.getProfile(req.user.userId);

  res.status(200).json({
    success: true,
    data: { user },
  });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié.', 'NOT_AUTHENTICATED');
  }

  await authService.changePassword(req.user.userId, req.user.email, req.body, getAuditContext(req));
  clearTokenCookies(res);

  res.status(200).json({
    success: true,
    message: 'Mot de passe modifié avec succès. Veuillez vous reconnecter.',
  });
}
