/**
 * Validador de formatos de documentos peruanos
 */
const isValidDni = (dni) => {
  return /^\d{8}$/.test(dni);
};

const isValidRuc = (ruc) => {
  if (!/^\d{11}$/.test(ruc)) return false;

  // Los RUC inician con 10, 15, 17, 20
  const prefix = ruc.substring(0, 2);
  const validPrefixes = ['10', '15', '16', '17', '20'];
  if (!validPrefixes.includes(prefix)) return false;

  // Validación de dígito verificador módulo 11
  const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(ruc.charAt(i), 10) * factors[i];
  }

  const remainder = sum % 11;
  const checkDigit = 11 - remainder;
  const expectedDigit = checkDigit === 10 ? 0 : checkDigit === 11 ? 1 : checkDigit;

  return parseInt(ruc.charAt(10), 10) === expectedDigit;
};

/**
 * Calcula el dígito verificador numérico del DNI
 */
const calculateDniCheckDigit = (dni) => {
  if (!/^\d{8}$/.test(dni)) return null;
  let sum = 5;
  const hash = [3, 2, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 8; i++) {
    sum += parseInt(dni.charAt(i), 10) * hash[i];
  }
  const entero = Math.floor(sum / 11);
  const digito = 11 - (sum - entero * 11);
  return String(digito > 9 ? digito - 10 : digito);
};

module.exports = {
  isValidDni,
  isValidRuc,
  calculateDniCheckDigit
};

