/**
 * @fileoverview Extension des types Express
 * @description Ajoute la propriété `user` à l'objet Request pour l'authentification.
 */

import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: Role;
      };
    }
  }
}

export {};
