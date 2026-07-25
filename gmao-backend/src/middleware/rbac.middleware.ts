import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export function rbac(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Authentification requise.',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Accès interdit. Vous n'avez pas les permissions nécessaires pour cette action.",
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}
