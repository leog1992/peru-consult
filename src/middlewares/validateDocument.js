const { isValidRuc, isValidDni } = require('../utils/documentValidator');
const { errorResponse } = require('../utils/responseHandler');

const validateRucParam = (req, res, next) => {
  const { ruc } = req.params;
  if (!ruc) {
    return errorResponse(res, 'El parámetro RUC es obligatorio', 400);
  }

  if (!isValidRuc(ruc)) {
    return errorResponse(res, 'El RUC ingresado no es válido. Debe tener 11 dígitos y cumplir con el formato oficial.', 400);
  }

  next();
};

const validateDniParam = (req, res, next) => {
  const { dni } = req.params;
  if (!dni) {
    return errorResponse(res, 'El parámetro DNI es obligatorio', 400);
  }

  if (!isValidDni(dni)) {
    return errorResponse(res, 'El DNI ingresado no es válido. Debe contener exactamente 8 dígitos numéricos.', 400);
  }

  next();
};

module.exports = {
  validateRucParam,
  validateDniParam
};
