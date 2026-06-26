/**
 * @fileoverview Middleware de limitation du débit des requêtes
 * @description Protège les endpoints sensibles contre les attaques par force brute
 *              et les abus en limitant le nombre de requêtes par fenêtre de temps.
 */

import rateLimit from 'express-rate-limit';

/**
 * Limiteur pour les tentatives de connexion
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 5000,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Limiteur pour le rafraîchissement des tokens
 * 10 requêtes par fenêtre de 15 minutes
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Trop de requêtes de rafraîchissement. Veuillez réessayer plus tard.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limiteur général pour toutes les routes de l'API
 * 100 requêtes par fenêtre de 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez réessayer plus tard.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
