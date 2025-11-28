const app = require('./server');
const config = require('./utils/config');
const logger = require('./utils/logger');

const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`Fathom Integration Server running on port ${PORT}`);
  logger.info(`Environment: ${config.server.env}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
