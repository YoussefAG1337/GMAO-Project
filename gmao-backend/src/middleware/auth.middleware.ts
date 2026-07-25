import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenExpiredError, JsonWebTokenError } from '../utils/jwt';
import { Role } from '@prisma/client';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Accès non autorisé. Token d'authentification manquant.",
        code: 'NO_TOKEN',
      });
      return;
    }

    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role as Role,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Le token d'authentification a expiré. Veuillez rafraîchir votre session.",
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Token d'authentification invalide.",
        code: 'INVALID_TOKEN',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Erreur d'authentification.",
      code: 'AUTH_ERROR',
    });
  }
}
