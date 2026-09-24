const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const config = require('../../../config/env');

class ElDniProvider {
  constructor() {
    this.name = 'ELDNI';
    this.url = 'https://eldni.com/pe/buscar-datos-por-dni';
  }

  async fetchByDni(dni) {
    try {
      // 1. Obtener la página para extraer token CSRF y cookie de sesión
      const getResponse = await axios.get(this.url, {
        headers: {
          'User-Agent': config.defaultHeaders['User-Agent'],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8'
        },
        timeout: 6000
      });

      const setCookies = getResponse.headers['set-cookie'];
      const cookieHeader = setCookies ? setCookies.map(c => c.split(';')[0]).join('; ') : '';

      const $ = cheerio.load(getResponse.data);
      const token = $('input[name="_token"]').val();

      if (!token) {
        return null;
      }

      // 2. Realizar POST multipart con el token y el DNI
      const form = new FormData();
      form.append('_token', token);
      form.append('dni', dni);

      const postResponse = await axios.post(this.url, form, {
        headers: {
          ...form.getHeaders(),
          'Cookie': cookieHeader,
          'Origin': 'https://eldni.com',
          'Referer': this.url,
          'User-Agent': config.defaultHeaders['User-Agent']
        },
        timeout: 6000
      });

      const html = postResponse.data;
      if (!html || !html.includes('Resultados')) {
        return null;
      }

      const $result = cheerio.load(html);
      const tableRow = $result('table tbody tr').first();
      const cells = tableRow.find('td').map((_, el) => $result(el).text().trim()).get();

      if (cells.length < 4) {
        return null;
      }

      return {
        dni: cells[0],
        nombres: cells[1],
        apellidoPaterno: cells[2],
        apellidoMaterno: cells[3],
        fuente: 'ELDNI'
      };
    } catch {
      return null;
    }
  }
}

module.exports = new ElDniProvider();
