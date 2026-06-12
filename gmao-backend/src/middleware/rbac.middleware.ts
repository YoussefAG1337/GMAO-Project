/**
 * @fileoverview Middleware de contrôle d'accès basé sur les rôles (RBAC)
 * @description Vérifie que l'utilisateur authentifié possède un rôle autorisé.
 */

import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

/**
 * Factory de middleware RBAC
 * @param allowedRoles - Liste des rôles autorisés à accéder à la ressource
 * @returns Middleware Express qui vérifie le rôle de l'utilisateur
 *
 * @example
 * // Seuls les admins peuvent accéder
 * router.get('/admin', authMiddleware, rbac([Role.ADMIN]), controller);
 *
 * // Admins et chefs de maintenance
 * router.get('/manage', authMiddleware, rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), controller);
 */
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
