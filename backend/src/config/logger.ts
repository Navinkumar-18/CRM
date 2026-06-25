import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Singleton structured logger.
 * - Production: JSON output, level=info
 * - Development: pretty-print, level=debug
 *
 * Sensitive fields are redacted at the transport layer so they never
 * appear in log files even if accidentally passed to logger calls.
 */
export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.password_hash',
      'req.body.token',
      'req.body.refreshToken',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }),
});
