import pino from 'pino';
import { loadConfig } from '@config/env';

const config = loadConfig();

const logger = pino({
  level: config.logLevel,
  transport: config.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard'
        }
      }
    : undefined,
  base: {
    env: config.env
  }
});

export default logger;
