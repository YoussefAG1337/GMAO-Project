/**
 * @fileoverview Utilitaires JWT pour la gestion des tokens
 * @description Fournit les fonctions de signature, vérification et hachage des tokens JWT.
 */

import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import crypto from 'crypto';

/** Payload contenu dans le token d'accès */
export interface AccessTokenPayload {
  userId: number;
  email: string;
  role: string;
}

/** Payload contenu dans le token de rafraîchissement */
export interface RefreshTokenPayload {
  userId: number;
  email: string;
  role: string;
  tokenFamily: string;
}

/**
 * Signe un token d'accès JWT
 * @param payload - Données à inclure dans le token
 * @returns Token JWT signé
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET non défini dans les variables d'environnement");
  }

  const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || '15m';

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as any,
    issuer: 'gmao-api',
    audience: 'gmao-client',
  });
}

/**
 * Signe un token de rafraîchissement JWT
 * @param payload - Données à inclure dans le token
 * @returns Token JWT signé
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET non défini dans les variables d'environnement");
  }

  const expiresIn = process.env.REFRESH_TOKEN_EXPIRY || '7d';

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as any,
    issuer: 'gmao-api',
    audience: 'gmao-client',
  });
}

/**
 * Vérifie et décode un token d'accès
 * @param token - Token JWT à vérifier
 * @returns Payload décodé ou null si invalide
 * @throws {TokenExpiredError} Si le token est expiré
 * @throws {JsonWebTokenError} Si le token est invalide
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET non défini dans les variables d'environnement");
  }

  return jwt.verify(token, secret, {
    issuer: 'gmao-api',
    audience: 'gmao-client',
  }) as AccessTokenPayload;
}

/**
 * Vérifie et décode un token de rafraîchissement
 * @param token - Token JWT à vérifier
 * @returns Payload décodé
 * @throws {TokenExpiredError} Si le token est expiré
 * @throws {JsonWebTokenError} Si le token est invalide
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET non défini dans les variables d'environnement");
  }

  return jwt.verify(token, secret, {
    issuer: 'gmao-api',
    audience: 'gmao-client',
  }) as RefreshTokenPayload;
}

/**
 * Hache un token avec SHA-256 pour le stockage sécurisé en base de données
 * @param token - Token brut à hacher
 * @returns Hash hexadécimal du token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export { TokenExpiredError, JsonWebTokenError };
