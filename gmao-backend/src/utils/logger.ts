import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  serializers: {
    err: pino.stdSerializers.err,
  },
  // pino-pretty is a devDependency only — this branch never runs in the
  // production Docker image (NODE_ENV=production there), so it's safe for
  // the module not to be resolvable in that build.
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      },
});
