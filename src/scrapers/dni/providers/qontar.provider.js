const axios = require('axios');
const config = require('../../../config/env');

class QontarProvider {
  constructor() {
    this.name = 'QONTAR';
    this.endpoint = config.qontarURL;
  }

  async fetchByDni(dni) {
    try {
      const response = await axios.get(`${this.endpoint}?dni=${dni}`, {
        headers: {
          'User-Agent': config.defaultHeaders['User-Agent']
        },
        timeout: 5000
      });

      const data = response.data;
      if (!data || data.message || (!data.nomPerNat && !data.apePaterno)) {
        return null;
      }

      return {
        dni,
        nombres: data.nomPerNat,
        apellidoPaterno: data.apePaterno,
        apellidoMaterno: data.apeMaterno,
        fuente: 'QONTAR'
      };
    } catch {
      return null;
    }
  }
}

module.exports = new QontarProvider();
