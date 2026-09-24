const { Router } = require('express');
const rucRoutes = require('./ruc.routes');
const dniRoutes = require('./dni.routes');

const router = Router();

// Healthcheck
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Rutas de consulta
router.use('/ruc', rucRoutes);
router.use('/dni', dniRoutes);

module.exports = router;
