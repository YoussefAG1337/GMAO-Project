import { User, AuditAction } from '@prisma/client';
import { AuditContext } from '../../services/auth.service';

export interface IAuthService {
  logAudit(
    action: AuditAction,
    email: string,
    context: AuditContext,
    userId?: number | null,
    details?: string,
  ): Promise<void>;
  signup(data: any): Promise<Partial<User>>;
  login(
    data: any,
    context: AuditContext,
  ): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }>;
  refresh(
    refreshTokenCookie: string,
    context: AuditContext,
  ): Promise<{ user: Partial<User>; newAccessToken: string; newRefreshToken: string }>;
  logout(
    refreshTokenCookie: string | undefined,
    email: string,
    userId: number | null,
    context: AuditContext,
  ): Promise<void>;
  getProfile(userId: number): Promise<Partial<User>>;
  changePassword(userId: number, email: string, data: any, context: AuditContext): Promise<void>;
}
