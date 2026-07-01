/**
 * @fileoverview Middleware de gestion globale des erreurs
 * @description Capture toutes les erreurs non gérées et retourne des réponses JSON structurées.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * Middleware de gestion globale des erreurs Express
 * Capture toutes les erreurs et retourne une réponse JSON cohérente.
 * En développement, inclut la stack trace pour le débogage.
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Une erreur interne est survenue.';
  let code = 'INTERNAL_ERROR';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if ('statusCode' in err) {
    // Cas où une erreur est lancée avec un statusCode mais n'est pas un AppError (ex: multer)
    statusCode = (err as any).statusCode;
    message = err.message;
    code = (err as any).code || 'UNKNOWN_ERROR';
  }

  // Log détaillé en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('═══════════════════════════════════════');
    console.error(`[ERREUR] ${new Date().toISOString()}`);
    console.error(`[URL] ${req.method} ${req.originalUrl}`);
    console.error(`[STATUS] ${statusCode}`);
    console.error(`[MESSAGE] ${message}`);
    if (err.stack) {
      console.error(`[STACK] ${err.stack}`);
    }
    console.error('═══════════════════════════════════════');
  } else {
    // Log minimal en production
    console.error(`[ERREUR] ${new Date().toISOString()} - ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: message,
    }),
  });
}
