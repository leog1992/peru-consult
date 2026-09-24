const axios = require('axios');
const config = require('../../../config/env');

class SunatDniProvider {
  constructor() {
    this.name = 'SUNAT';
    this.endpoint = 'https://ww1.sunat.gob.pe/ol-ti-itatencionf5030/registro/solicitante';
    this.token = 'bokps2nhd7icpwpepn8v0e258caocy9nr4uizszitvn6aa8x2vhj';
  }

  async fetchByDni(dni) {
    // 1. Probar para mayores de edad (tipo = 1)
    let result = await this.querySunat(dni, 1);
    if (result) return result;

    // 2. Probar para menores de edad (tipo = 2)
    result = await this.querySunat(dni, 2);
    if (result) return result;

    return null;
  }

  async querySunat(dni, tipo) {
    try {
      const payload = {
        tipDocu: '1',
        numDocu: dni,
        tipPers: tipo,
        token: this.token
      };

      const response = await axios.post(this.endpoint, payload, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'User-Agent': config.defaultHeaders['User-Agent']
        },
        timeout: 4000
      });

      const data = response.data;
      if (!data || data.message || data.error) {
        return null;
      }

      if (!data.nombreSoli && !data.apePatSoli) {
        return null;
      }

      return {
        dni,
        nombres: data.nombreSoli,
        apellidoPaterno: data.apePatSoli,
        apellidoMaterno: data.apeMatSoli,
        fuente: 'SUNAT'
      };
    } catch {
      return null;
    }
  }
}

module.exports = new SunatDniProvider();
