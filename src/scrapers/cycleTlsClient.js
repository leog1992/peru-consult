const initCycleTLS = require('cycletls');
const iconv = require('iconv-lite');

class CycleTlsManager {
  constructor() {
    this.instance = null;
    this.initPromise = null;
  }

  async getInstance() {
    if (this.instance) {
      return this.instance;
    }

    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          const client = await initCycleTLS();
          this.instance = client;
          return client;
        } catch (error) {
          this.initPromise = null;
          throw error;
        }
      })();
    }

    return this.initPromise;
  }

  /**
   * Ejecuta petición POST decodificando correctamente caracteres ISO-8859-1
   */
  async post(url, options = {}) {
    const client = await this.getInstance();
    const response = await client(url, options, 'post');

    let textContent = '';
    if (response.arrayBuffer) {
      try {
        const buffer = Buffer.from(await response.arrayBuffer());
        textContent = iconv.decode(buffer, 'ISO-8859-1');
      } catch {
        textContent = await response.text();
      }
    } else if (response.text) {
      textContent = await response.text();
    } else {
      textContent = response.body || '';
    }

    return {
      status: response.status,
      headers: response.headers,
      data: textContent
    };
  }

  async close() {
    if (this.instance) {
      try {
        await this.instance.exit();
      } catch (err) {
        console.error('Error cerrando CycleTLS:', err.message);
      } finally {
        this.instance = null;
        this.initPromise = null;
      }
    }
  }
}

module.exports = new CycleTlsManager();
