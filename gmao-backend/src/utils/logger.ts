import pino from 'pino';
import { trace } from '@opentelemetry/api';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  serializers: {
    err: pino.stdSerializers.err,
  },

  hooks: {
    logMethod(inputArgs, method) {
      const span = trace.getActiveSpan();
      const lastIdx = inputArgs.length - 1;
      if (span && typeof inputArgs[lastIdx] === 'string') {
        inputArgs[lastIdx] += ` [trace_id=${span.spanContext().traceId}]`;
      }
      return method.apply(this, inputArgs);
    },
  },
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      },
});
