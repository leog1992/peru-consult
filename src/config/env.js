require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cacheTtl: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  sunatToken: process.env.SUNAT_TOKEN,
  qontarURL: process.env.QONTAR_URL,
  defaultHeaders: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'es-PE,es;q=0.9,en-US;q=0.8,en;q=0.7'
  }
};
