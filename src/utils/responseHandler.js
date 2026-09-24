/**
 * Standard API response helper
 */
const successResponse = (res, data, message = 'Consulta exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'Ocurrió un error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

module.exports = {
  successResponse,
  errorResponse
};
