/**
 * @fileoverview Middleware de validation des entrées avec Zod
 * @description Factory qui valide req.body avec un schéma Zod
 *              et retourne les erreurs de validation en français.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Factory de middleware de validation
 * @param schema - Schéma Zod à utiliser pour la validation
 * @returns Middleware Express qui valide req.body
 *
 * @example
 * router.post('/login', validate(loginSchema), loginController);
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      // Remplace le body par les données validées et transformées
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const erreurs = error.issues.map((err) => ({
          champ: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: 'Erreur de validation des données.',
          code: 'VALIDATION_ERROR',
          erreurs,
        });
        return;
      }

      next(error);
    }
  };
}
