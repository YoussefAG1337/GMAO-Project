import Redis from 'ioredis';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'redis' });

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    commandTimeout: 2000,
    maxRetriesPerRequest: 2,
  });

redis.on('error', (err) => {
  log.error({ err }, 'Redis client error');
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
