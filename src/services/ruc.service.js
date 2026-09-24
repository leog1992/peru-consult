const sunatScraper = require('../scrapers/ruc/sunat.scraper');
const config = require('../config/env');

class RucService {
  constructor() {
    // Caché en memoria (clave -> { data, expiresAt })
    // Puede reemplazarse por Redis si escalas horizontalmente
    this.cache = new Map();
  }

  /**
   * Obtiene datos de RUC con patrón Cache-Aside
   * @param {string} ruc 
   */
  async getRuc(ruc) {
    const cached = this.getFromCache(ruc);
    if (cached) {
      return { ...cached, _fromCache: true };
    }

    // Estrategia principal de scraping
    const data = await sunatScraper.scrapeByRuc(ruc);

    if (!data) {
      const err = new Error('No se encontró información para el RUC especificado');
      err.statusCode = 404;
      throw err;
    }

    this.saveToCache(ruc, data);
    return { ...data, _fromCache: false };
  }

  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  saveToCache(key, data) {
    const expiresAt = Date.now() + config.cacheTtl * 1000;
    this.cache.set(key, { data, expiresAt });
  }
}

module.exports = new RucService();
