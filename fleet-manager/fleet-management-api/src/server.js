import app from './app.js';
import { config } from './core/config.js';
import { logger } from './core/logger.js';

const server = app.listen(config.port, () => {
  logger.info({ 
    port: config.port, 
    env: config.env,
    service: 'FleetManagementService'
  }, 'Server started');
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info({ signal }, 'Shutting down server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
