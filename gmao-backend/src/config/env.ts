import 'dotenv/config';
import { z } from 'zod';

function isWeakSecret(secret: string): boolean {
  return secret.length < 32 || /^changeme$/i.test(secret) || /secret_jwt_key_for_dev/i.test(secret);
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),

    ACCESS_TOKEN_SECRET: z.string().min(1, 'ACCESS_TOKEN_SECRET est requis'),
    REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET est requis'),
    ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
    REFRESH_TOKEN_EXPIRY: z.string().default('7d'),

    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).default(12),
    MAX_LOGIN_ATTEMPTS: z.coerce.number().int().positive().default(5),
    LOCKOUT_DURATION_MINUTES: z.coerce.number().int().positive().default(15),

    PORT: z.coerce.number().int().positive().default(5000),
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),

    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().default('"GMAO System" <noreply@gmao.com>'),

    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),

    OTEL_SERVICE_NAME: z.string().default('gmao-backend'),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.NODE_ENV === 'production') {
      for (const key of ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'] as const) {
        if (isWeakSecret(val[key])) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} doit faire au moins 32 caractères et ne pas être une valeur par défaut en production (générez avec \`openssl rand -hex 64\`)`,
          });
        }
      }
      if (val.ACCESS_TOKEN_SECRET === val.REFRESH_TOKEN_SECRET) {
        ctx.addIssue({
          code: 'custom',
          path: ['REFRESH_TOKEN_SECRET'],
          message: 'REFRESH_TOKEN_SECRET doit être différent de ACCESS_TOKEN_SECRET',
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(racine)'}: ${issue.message}`)
    .join('\n');
  console.error(`\n Configuration d'environnement invalide :\n${issues}\n`);
  process.exit(1);
}


export const env = parsed.data;
export type Env = typeof env;
