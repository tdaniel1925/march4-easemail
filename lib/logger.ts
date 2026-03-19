import pino from 'pino';

/**
 * Structured logger for EaseMail
 * Uses pino for fast, structured JSON logging
 *
 * Usage:
 * - logger.info({ userId, action }, 'User logged in')
 * - logger.error({ err, context }, 'Failed to send email')
 * - logger.warn({ status }, 'Rate limit approaching')
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Pretty print in development for readability
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
      singleLine: false,
    }
  } : undefined,

  // Production configuration
  ...(!isDevelopment && {
    formatters: {
      level: (label: string) => {
        return { level: label };
      },
    },
  }),

  // Base fields included in every log
  base: {
    env: process.env.NODE_ENV || 'development',
    app: 'easemail',
  },

  // Serialize errors properly
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'accessToken',
      'refreshToken',
      'token',
      'authorization',
      'cookie',
      '*.password',
      '*.accessToken',
      '*.refreshToken',
      '*.token',
    ],
    remove: true,
  },
});

// Child loggers for specific subsystems
export const authLogger = logger.child({ subsystem: 'auth' });
export const graphLogger = logger.child({ subsystem: 'microsoft-graph' });
export const syncLogger = logger.child({ subsystem: 'sync' });
export const cronLogger = logger.child({ subsystem: 'cron' });
export const apiLogger = logger.child({ subsystem: 'api' });
