const iconv = require('iconv-lite');

class GotScrapingManager {
  constructor() {
    this.gotScraping = null;
    this.initPromise = null;
  }

  async getClient() {
    if (this.gotScraping) {
      return this.gotScraping;
    }

    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          const { gotScraping } = await import('got-scraping');
          this.gotScraping = gotScraping;
          return gotScraping;
        } catch (error) {
          this.initPromise = null;
          throw error;
        }
      })();
    }

    return this.initPromise;
  }

  /**
   * Ejecuta petición POST con emulación de navegador y decodificación de caracteres
   * @param {string} url
   * @param {object} options
   */
  async post(url, options = {}) {
    const client = await this.getClient();
    const { body, headers = {}, encoding = 'ISO-8859-1', ...rest } = options;

    const response = await client.post(url, {
      body,
      headers,
      responseType: 'buffer',
      throwHttpErrors: false,
      ...rest
    });

    const buffer = response.rawBody || response.body;
    let textContent = '';
    if (buffer && Buffer.isBuffer(buffer)) {
      try {
        textContent = iconv.decode(buffer, encoding);
      } catch {
        textContent = buffer.toString('utf-8');
      }
    } else {
      textContent = response.body ? String(response.body) : '';
    }

    return {
      status: response.statusCode,
      headers: response.headers,
      data: textContent
    };
  }

  /**
   * Ejecuta petición GET con emulación de navegador y decodificación de caracteres
   * @param {string} url
   * @param {object} options
   */
  async get(url, options = {}) {
    const client = await this.getClient();
    const { headers = {}, encoding = 'ISO-8859-1', ...rest } = options;

    const response = await client.get(url, {
      headers,
      responseType: 'buffer',
      throwHttpErrors: false,
      ...rest
    });

    const buffer = response.rawBody || response.body;
    let textContent = '';
    if (buffer && Buffer.isBuffer(buffer)) {
      try {
        textContent = iconv.decode(buffer, encoding);
      } catch {
        textContent = buffer.toString('utf-8');
      }
    } else {
      textContent = response.body ? String(response.body) : '';
    }

    return {
      status: response.statusCode,
      headers: response.headers,
      data: textContent
    };
  }

  async close() {
    // got-scraping se ejecuta nativamente en Node.js, no requiere matar subprocesos
    this.gotScraping = null;
    this.initPromise = null;
  }
}

module.exports = new GotScrapingManager();
