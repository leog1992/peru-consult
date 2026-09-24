const sunatDniProvider = require('./providers/sunatDni.provider');
const qontarProvider = require('./providers/qontar.provider');
const elDniProvider = require('./providers/elDni.provider');
const { normalizeReniecData } = require('./reniec.normalizer');

class ReniecScraper {
  constructor() {
    // Lista de proveedores en orden de prioridad (Fallback Strategy)
    this.providers = [
      elDniProvider,
      sunatDniProvider,
      qontarProvider,

    ];
  }

  /**
   * Consulta el DNI iterando por los proveedores hasta encontrar resultado válido
   * @param {string} dni 
   */
  async scrapeByDni(dni) {
    let lastError = null;

    for (const provider of this.providers) {
      try {
        const rawData = await provider.fetchByDni(dni);
        if (rawData && (rawData.nombres || rawData.apellidoPaterno)) {
          return normalizeReniecData(rawData);
        }
      } catch (err) {
        lastError = err;
        console.warn(`[DNI Scraper] Proveedor ${provider.name} falló para DNI ${dni}:`, err.message);
      }
    }

    if (lastError) {
      console.error('[DNI Scraper] Todos los proveedores fallaron:', lastError.message);
    }

    return null;
  }
}

module.exports = new ReniecScraper();
