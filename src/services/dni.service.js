const reniecScraper = require('../scrapers/dni/reniec.scraper');
const config = require('../config/env');

class DniService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Obtiene datos de DNI con patrón Cache-Aside
   * @param {string} dni 
   */
  async getDni(dni) {
    const cached = this.getFromCache(dni);
    if (cached) {
      return { ...cached, _fromCache: true };
    }

    const data = await reniecScraper.scrapeByDni(dni);

    if (!data) {
      const err = new Error('No se encontró información para el DNI especificado');
      err.statusCode = 404;
      throw err;
    }

    this.saveToCache(dni, data);
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

module.exports = new DniService();
