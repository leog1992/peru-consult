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

// Diagnóstico del entorno y CycleTLS (útil sin SSH)
router.get('/diag', (req, res) => {
  const path = require('path');
  const fs = require('fs');
  const os = require('os');
  const { exec } = require('child_process');

  const binaryName = process.platform === 'win32' ? 'index.exe' : 'index';
  const binaryPath = path.resolve(__dirname, '../../node_modules/cycletls/dist', binaryName);

  const exists = fs.existsSync(binaryPath);
  let stat = null;
  if (exists) {
    try {
      const s = fs.statSync(binaryPath);
      stat = {
        mode: (s.mode & 0o777).toString(8),
        size: s.size
      };
    } catch (e) {
      stat = { error: e.message };
    }
  }

  exec(`"${binaryPath}"`, { timeout: 1500 }, (error, stdout, stderr) => {
    res.json({
      system: {
        platform: process.platform,
        arch: os.arch(),
        release: os.release(),
        node: process.version
      },
      binary: {
        path: binaryPath,
        exists,
        stat
      },
      execTest: {
        error: error ? {
          message: error.message,
          code: error.code,
          signal: error.signal,
          killed: error.killed
        } : null,
        stdout,
        stderr
      }
    });
  });
});

// Rutas de consulta
router.use('/ruc', rucRoutes);
router.use('/dni', dniRoutes);

module.exports = router;
