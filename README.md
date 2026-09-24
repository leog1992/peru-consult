# Perú Consult API 🇵🇪

API REST desacoplada para la consulta de información de **RUC** (SUNAT) y **DNI** (RENIEC / Fuentes Oficiales y Alternativas) con patrones de alta disponibilidad (Fallback Strategy), Scraping y Normalización de datos en Node.js / Express.

---

## Arquitectura y Patrones Aplicados

- **Controller - Service - Provider (Arquitectura en capas):**
  - **Routes & Middlewares:** Validaciones de entrada (DNI 8 dígitos, RUC 11 dígitos con algoritmo Módulo 11).
  - **Controllers:** Manejo de peticiones HTTP y respuestas estandarizadas.
  - **Services:** Lógica de negocio y orquestación con **Cache-Aside** (TTL configurable).
  - **Providers / Fallback Strategy (Patrón Estrategia):**
    - **Consulta RUC:** Scraping a SUNAT mediante **got-scraping** para emulación nativa de huellas TLS (JA3/JA4), HTTP/2 y elusión de WAF/Cloudflare, con decodificación `ISO-8859-1` (`iconv-lite`) y Cheerio.
    - **Consulta DNI:** Estrategia con cascada automática de respaldo (*failover*):
      1. **SUNAT DNI** (Endpoint directo para personas mayores y menores de edad - tiempo de respuesta < 300ms).
      2. **Qontar** (Respaldo que además provee dirección fiscal y ubigeo).
      3. **ElDni** (Scraping con CSRF token y sesión).
  - **Normalizers (DTOs):** Unifican las salidas en contratos JSON idénticos y calculan el **Dígito Verificador** oficial de RENIEC mediante algoritmo ponderado.

---

## Estructura del Proyecto

```text
peru-consult/
├── src/
│   ├── config/
│   │   └── env.js                   # Variables de entorno y headers
│   ├── controllers/
│   │   ├── dni.controller.js        # Controlador de DNI
│   │   └── ruc.controller.js        # Controlador de RUC
│   ├── middlewares/
│   │   ├── errorHandler.js          # Manejo centralizado de excepciones
│   │   └── validateDocument.js      # Validación de parámetros :dni y :ruc
│   ├── routes/
│   │   ├── dni.routes.js            # GET /api/v1/dni/:dni
│   │   ├── index.js                 # Router principal con /health
│   │   └── ruc.routes.js            # GET /api/v1/ruc/:ruc
│   ├── scrapers/
│   │   ├── gotScrapingClient.js     # Cliente nativo got-scraping para bypass de Cloudflare/WAF
│   │   ├── dni/
│   │   │   ├── providers/
│   │   │   │   ├── elDni.provider.js    # Proveedor eldni.com
│   │   │   │   ├── qontar.provider.js   # Proveedor Qontar (con dirección)
│   │   │   │   └── sunatDni.provider.js # Proveedor SUNAT Solicitante (modo 1 y 2)
│   │   │   ├── reniec.normalizer.js     # Estandarización y cálculo dígito verificador
│   │   │   └── reniec.scraper.js        # Orquestador con Fallback Strategy
│   │   └── ruc/
│   │       ├── sunat.normalizer.js  # Normalizador de datos SUNAT RUC
│   │       └── sunat.scraper.js     # Scraper SUNAT RUC
│   ├── services/
│   │   ├── dni.service.js           # Servicio DNI con Caché
│   │   └── ruc.service.js           # Servicio RUC con Caché
│   ├── utils/
│   │   ├── documentValidator.js     # Algoritmo RUC Módulo 11 y DNI dígito verificador
│   │   └── responseHandler.js       # Helper JSON response (success / error)
│   └── app.js                       # Express App, CORS y middlewares
├── .env.example
├── .env
├── .gitignore
├── package.json
├── README.md
└── server.js                        # Punto de arranque del servidor
```

---

## Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo (recarga automática)
npm run dev

# 3. Iniciar en producción
npm start
```

### Despliegue en cPanel / CloudLinux (Phusion Passenger)

1. En cPanel, ingresa a **Setup Node.js App**.
2. Configura los parámetros de la aplicación:
   - **Application root:** Directorio donde subiste los archivos (ej. `peru-consult` o `apis/peru-consult`).
   - **Application startup file:** `server.js` *(importante: no dejar en `app.js`)*.
3. Haz clic en **Run NPM Install** para instalar las dependencias en el entorno virtual.
4. Asegúrate de configurar las variables del archivo `.env`.
5. Haz clic en **Restart** para iniciar el servicio.


---

## Endpoints

### 1. Healthcheck
- **GET** `/api/v1/health`

### 2. Consulta RUC
- **GET** `/api/v1/ruc/:ruc`
- Ejemplo: `http://localhost:3000/api/v1/ruc/20609069377`

### 3. Consulta DNI
- **GET** `/api/v1/dni/:dni`
- Ejemplo: `http://localhost:3000/api/v1/dni/70817256`
- **Respuesta JSON:**
```json
{
  "success": true,
  "message": "Información de DNI recuperada correctamente",
  "data": {
    "dni": "70817256",
    "nombres": "SONIA LISBETH",
    "apellidoPaterno": "ALDANA",
    "apellidoMaterno": "FIESTAS",
    "nombreCompleto": "ALDANA FIESTAS SONIA LISBETH",
    "fechaNacimiento": null,
    "codVerifica": "7",
    "fuente": "SUNAT",
    "_fromCache": false
  }
}
```
