/**
 * @fileoverview Middleware de gestion globale des erreurs
 * @description Capture toutes les erreurs non gérées et retourne des réponses JSON structurées.
 */

import { Request, Response, NextFunction } from 'express';

/** Interface pour les erreurs applicatives enrichies */
interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

/**
 * Middleware de gestion globale des erreurs Express
 * Capture toutes les erreurs et retourne une réponse JSON cohérente.
 * En développement, inclut la stack trace pour le débogage.
 */
export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Une erreur interne est survenue.';

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
    message: statusCode === 500 ? 'Une erreur interne est survenue.' : message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: message,
    }),
  });
}
