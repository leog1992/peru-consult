const { calculateDniCheckDigit } = require('../../utils/documentValidator');

/**
 * Limpia y estandariza los datos extraídos de la consulta de DNI
 */
const normalizeReniecData = (rawData) => {
  const clean = (val) => {
    if (!val) return null;
    const str = String(val).replace(/\s+/g, ' ').trim();
    return str === '-' || str === '' ? null : str;
  };

  const dni = clean(rawData.dni);
  const nombres = clean(rawData.nombres);
  const apellidoPaterno = clean(rawData.apellidoPaterno);
  const apellidoMaterno = clean(rawData.apellidoMaterno);

  const nombreCompleto = [apellidoPaterno, apellidoMaterno, nombres]
    .filter(Boolean)
    .join(' ');

  const digitoVerificador = clean(rawData.digitoVerificador) || clean(rawData.codVerifica) || calculateDniCheckDigit(dni);

  let fechaNacimiento = clean(rawData.fechaNacimiento);
  if (fechaNacimiento === '01/01/1000') {
    fechaNacimiento = null;
  }

  return {
    dni,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    nombreCompleto,
    fechaNacimiento,
    codVerifica: digitoVerificador,
    fuente: clean(rawData.fuente) || 'RENIEC'
  };
};

module.exports = {
  normalizeReniecData
};
