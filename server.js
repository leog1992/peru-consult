const app = require('./src/app');
const config = require('./src/config/env');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Perú Consult API corriendo en puerto ${PORT}`);
  console.log(`📡 Entorno: ${config.nodeEnv}`);
  console.log(`🔗 Healthcheck: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔍 RUC endpoint: http://localhost:${PORT}/api/v1/ruc/:ruc`);
  console.log(`🔍 DNI endpoint: http://localhost:${PORT}/api/v1/dni/:dni`);
  console.log(`===============================================`);
});

const cycleTlsClient = require('./src/scrapers/cycleTlsClient');

const gracefulShutdown = async (signal) => {
  console.log(`\nRecibida señal ${signal}, cerrando servidor y subprocesos...`);
  await cycleTlsClient.close();
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

