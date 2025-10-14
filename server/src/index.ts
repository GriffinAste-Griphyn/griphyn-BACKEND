import 'dotenv/config';
import { createServer } from 'http';
import app from './app';
import { loadConfig } from '@config/env';
import logger from '@lib/logger';

async function bootstrap() {
  const config = loadConfig();

  const server = createServer(app);

  server.listen(config.port, () => {
    logger.info({ port: config.port }, 'API server listening');
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'Shutting down server');
    server.close((error) => {
      if (error) {
        logger.error({ err: error }, 'Error closing server');
        process.exit(1);
      }
      logger.info('Server closed gracefully');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
