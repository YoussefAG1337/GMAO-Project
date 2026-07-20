import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import crypto from 'crypto';


export interface AccessTokenPayload {
  userId: number;
  email: string;
  role: string;
}


export interface RefreshTokenPayload {
  userId: number;
  email: string;
  role: string;
  tokenFamily: string;
}


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


export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export { TokenExpiredError, JsonWebTokenError };
