const qs = require('qs');
const cheerio = require('cheerio');
const config = require('../../config/env');
const cycleTlsClient = require('../cycleTlsClient');
const { normalizeSunatData } = require('./sunat.normalizer');

class SunatScraper {
  constructor() {
    this.baseUrl = 'https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/jcrS00Alias';
  }

  /**
   * Consulta y scrapea el portal de SUNAT usando CycleTLS para eludir Cloudflare
   * @param {string} ruc 
   */
  async scrapeByRuc(ruc) {
    try {
      const payload = qs.stringify({
        'accion': 'consPorRuc',
        'razSoc': '',
        'nroRuc': ruc,
        'nrodoc': '',
        'token': config.sunatToken,
        'contexto': 'ti-it',
        'modo': '1',
        'rbtnTipo': '1',
        'search1': ruc,
        'tipdoc': '1',
        'search2': '',
        'search3': '',
        'codigo': ''
      });

      const response = await cycleTlsClient.post(this.baseUrl, {
        body: payload,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': config.defaultHeaders['User-Agent'],
          'Accept': config.defaultHeaders['Accept'],
          'Accept-Language': config.defaultHeaders['Accept-Language']
        }
      });

      if (!response || response.status !== 200 || !response.data) {
        throw new Error(`Respuesta inválida de SUNAT: status ${response ? response.status : 'desconocido'}`);
      }

      return this.parseHtml(response.data, ruc);
    } catch (error) {
      throw new Error(`Error en SunatScraper: ${error.message}`);
    }
  }

  parseHtml(html, requestedRuc) {
    const $ = cheerio.load(html);

    // Verificar si SUNAT devolvió error de no encontrado o captcha
    const pageText = $('body').text();
    if (pageText.includes('El RUC ingresado no existe') || pageText.includes('no encontrado')) {
      const err = new Error('El RUC ingresado no existe en los registros de SUNAT');
      err.statusCode = 404;
      throw err;
    }

    const clean = (str) => {
      if (!str) return null;
      const trimmed = str.replace(/\s+/g, ' ').trim();
      return trimmed === '-' || trimmed === '' ? null : trimmed;
    };

    const rawData = {
      ruc: requestedRuc,
      razonSocial: null,
      tipoContribuyente: null,
      nombreComercial: null,
      fechaInscripcion: null,
      fechaInicioActividades: null,
      estado: null,
      fechaBaja: null,
      condicion: null,
      domicilioFiscal: null,
      departamento: null,
      provincia: null,
      distrito: null,
      sistemaEmision: null,
      actividadComercioExterior: null,
      sistemaContabilidad: null,
      emisorElectronicoDesde: null,
      comprobantesElectronicos: null,
      afiliadoPleDesde: null,
      actividadesEconomicas: [],
      comprobantesAutorizados: [],
      sistemasEmisionElectronica: [],
      padrones: []
    };

    // Recorrer los list-group-item de Bootstrap
    $('.list-group-item').each((_, item) => {
      const $item = $(item);

      $item.find('.row').each((_, row) => {
        const cols = $(row).children();
        for (let i = 0; i < cols.length; i++) {
          const h4Text = clean($(cols[i]).find('h4').text()) || '';
          const h4Lower = h4Text.toLowerCase();

          // Número de RUC y Razón Social
          if (h4Lower.includes('ruc') && (h4Lower.includes('número') || h4Lower.includes('numero') || h4Lower.includes('nmero'))) {
            const val = clean($(cols[i + 1]).find('h4').text()) || clean($(cols[i + 1]).text());
            if (val) {
              const sep = val.indexOf(' - ');
              if (sep !== -1) {
                rawData.ruc = clean(val.substring(0, sep));
                rawData.razonSocial = clean(val.substring(sep + 3));
              } else {
                rawData.razonSocial = val;
              }
            }
          }

          // Tipo Contribuyente
          if (h4Lower.includes('tipo') && h4Lower.includes('contribuyente')) {
            rawData.tipoContribuyente = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }

          // Nombre Comercial
          if (h4Lower.includes('nombre') && h4Lower.includes('comercial')) {
            rawData.nombreComercial = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }

          // Fecha de Inscripción
          if (h4Lower.includes('inscripci') || h4Lower.includes('inscripc')) {
            rawData.fechaInscripcion = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }

          // Fecha de Inicio de Actividades
          if (h4Lower.includes('inicio') && h4Lower.includes('actividades')) {
            rawData.fechaInicioActividades = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }

          // Estado del Contribuyente
          if (h4Lower.includes('estado') && h4Lower.includes('contribuyente')) {
            const rawEstado = $(cols[i + 1]).text();
            if (rawEstado) {
              const lines = rawEstado.split('\n').map(l => l.trim()).filter(Boolean);
              rawData.estado = lines[0] || null;
              const bajaIndex = lines.findIndex(l => l.toLowerCase().includes('fecha de baja'));
              if (bajaIndex !== -1 && lines[bajaIndex + 1]) {
                rawData.fechaBaja = clean(lines[bajaIndex + 1]);
              }
            }
          }

          // Condición del Contribuyente
          if (h4Lower.includes('condici') && h4Lower.includes('contribuyente')) {
            rawData.condicion = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }

          // Domicilio Fiscal
          if (h4Lower.includes('domicilio') && h4Lower.includes('fiscal')) {
            const dom = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
            rawData.domicilioFiscal = dom;
            if (dom && dom.includes(' - ')) {
              const parts = dom.split(' - ').map(p => clean(p)).filter(Boolean);
              if (parts.length >= 4) {
                rawData.distrito = parts[parts.length - 1];
                rawData.provincia = parts[parts.length - 2];
                rawData.departamento = parts[parts.length - 3];
                rawData.direccion = parts.slice(0, parts.length - 3).join(' - ');
              } else if (parts.length === 3) {
                rawData.distrito = parts[2];
                rawData.provincia = parts[1];
                // En formato "DIRECCION DEPARTAMENTO - PROVINCIA - DISTRITO"
                const firstPart = parts[0];
                const lastSpace = firstPart.lastIndexOf(' ');
                if (lastSpace !== -1) {
                  rawData.departamento = firstPart.substring(lastSpace + 1).trim();
                  rawData.direccion = firstPart.substring(0, lastSpace).trim();
                } else {
                  rawData.departamento = firstPart;
                  rawData.direccion = firstPart;
                }
              }
            } else {
              rawData.direccion = dom;
            }
          }

          // Sistema Emisión de Comprobante
          if (h4Lower.includes('sistema') && (h4Lower.includes('emisi') || h4Lower.includes('emis')) && h4Lower.includes('comprobante')) {
            rawData.sistemaEmision = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }

          // Actividad Comercio Exterior
          if (h4Lower.includes('comercio') && h4Lower.includes('exterior')) {
            rawData.actividadComercioExterior = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }

          // Sistema Contabilidad
          if (h4Lower.includes('sistema') && h4Lower.includes('contabilidad')) {
            rawData.sistemaContabilidad = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }

          // Emisor electrónico desde
          if (h4Lower.includes('emisor') && (h4Lower.includes('electr') || h4Lower.includes('electr')) && h4Lower.includes('desde')) {
            rawData.emisorElectronicoDesde = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }

          // Comprobantes Electrónicos
          if (h4Lower.includes('comprobantes') && (h4Lower.includes('electr') || h4Lower.includes('electr'))) {
            rawData.comprobantesElectrónicos = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }

          // Afiliado al PLE desde
          if (h4Lower.includes('ple')) {
            rawData.afiliadoPleDesde = clean($(cols[i + 1]).find('p').text()) || clean($(cols[i + 1]).text());
          }
        }
      });

      // Extracción de Tablas dentro del list-group
      const firstH4 = clean($item.find('h4').first().text()) || '';
      const firstLower = firstH4.toLowerCase();

      if (firstLower.includes('actividad') && firstLower.includes('econ')) {
        $item.find('table tbody tr').each((_, tr) => {
          const t = clean($(tr).text());
          if (t && t !== 'NINGUNO') rawData.actividadesEconomicas.push(t);
        });
      }

      if (firstLower.includes('comprobantes de pago')) {
        $item.find('table tbody tr').each((_, tr) => {
          const t = clean($(tr).text());
          if (t && t !== 'NINGUNO') rawData.comprobantesAutorizados.push(t);
        });
      }

      if (firstLower.includes('sistema') && firstLower.includes('emisi') && firstLower.includes('electr')) {
        $item.find('table tbody tr').each((_, tr) => {
          const t = clean($(tr).text());
          if (t && t !== 'NINGUNO') rawData.sistemasEmisionElectronica.push(t);
        });
      }

      if (firstLower.includes('padron')) {
        $item.find('table tbody tr').each((_, tr) => {
          const t = clean($(tr).text());
          if (t && t !== 'NINGUNO') rawData.padrones.push(t);
        });
      }
    });

    if (!rawData.razonSocial) {
      throw new Error('No se pudo extraer la razón social del documento.');
    }

    return normalizeSunatData(rawData);
  }
}

module.exports = new SunatScraper();
