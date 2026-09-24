const { errorResponse } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  return errorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};

module.exports = errorHandler;
