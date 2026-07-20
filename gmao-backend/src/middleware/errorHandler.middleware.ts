/**
 * @fileoverview Middleware de gestion globale des erreurs
 * @description Capture toutes les erreurs non gérées et retourne des réponses JSON structurées.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

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

  logger.error({ method: req.method, url: req.originalUrl, statusCode, code, err }, message);

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
