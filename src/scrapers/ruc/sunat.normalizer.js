/**
 * Limpia y estandariza los datos extraídos de la consulta de RUC de SUNAT
 */
const normalizeSunatData = (rawData) => {
  const clean = (val) => {
    if (!val) return null;
    const str = String(val).replace(/\s+/g, ' ').trim();
    return str === '-' || str === '' ? null : str;
  };

  return {
    ruc: clean(rawData.ruc),
    razonSocial: clean(rawData.razonSocial),
    tipoContribuyente: clean(rawData.tipoContribuyente),
    nombreComercial: clean(rawData.nombreComercial),
    fechaInscripcion: clean(rawData.fechaInscripcion),
    fechaInicioActividades: clean(rawData.fechaInicioActividades),
    estado: clean(rawData.estado),
    fechaBaja: clean(rawData.fechaBaja),
    condicion: clean(rawData.condicion),
    domicilioFiscal: clean(rawData.domicilioFiscal),
    direccion: clean(rawData.direccion),
    departamento: clean(rawData.departamento),
    provincia: clean(rawData.provincia),
    distrito: clean(rawData.distrito),
    sistemaEmision: clean(rawData.sistemaEmision),
    actividadComercioExterior: clean(rawData.actividadComercioExterior),
    sistemaContabilidad: clean(rawData.sistemaContabilidad),
    emisorElectronicoDesde: clean(rawData.emisorElectronicoDesde),
    comprobantesElectronicos: clean(rawData.comprobantesElectronicos),
    afiliadoPleDesde: clean(rawData.afiliadoPleDesde),
    actividadesEconomicas: Array.isArray(rawData.actividadesEconomicas) ? rawData.actividadesEconomicas : [],
    comprobantesAutorizados: Array.isArray(rawData.comprobantesAutorizados) ? rawData.comprobantesAutorizados : [],
    sistemasEmisionElectronica: Array.isArray(rawData.sistemasEmisionElectronica) ? rawData.sistemasEmisionElectronica : [],
    padrones: Array.isArray(rawData.padrones) ? rawData.padrones : [],
    fuente: 'SUNAT'
  };
};

module.exports = {
  normalizeSunatData
};
