if (typeof (PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

const app = require('./src/app');
const config = require('./src/config/env');

const portOrPassenger = (typeof (PhusionPassenger) !== 'undefined')
  ? 'passenger'
  : (process.env.PORT || 3000);

const server = app.listen(portOrPassenger, () => {
  console.log(`===============================================`);
  console.log(`🚀 Perú Consult API corriendo en: ${portOrPassenger}`);
  console.log(`📡 Entorno: ${config.nodeEnv}`);
  console.log(`🔗 Healthcheck: /api/v1/health`);
  console.log(`🔍 RUC endpoint: /api/v1/ruc/:ruc`);
  console.log(`🔍 DNI endpoint: /api/v1/dni/:dni`);
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

