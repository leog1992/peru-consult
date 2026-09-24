const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { errorResponse } = require('./utils/responseHandler');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prefijo de rutas API
app.use('/api/v1', apiRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  return errorResponse(res, `Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404);
});

// Middleware centralizado de errores
app.use(errorHandler);

module.exports = app;
