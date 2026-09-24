/**
 * Identidad del sitio en un solo lugar.
 * Si el dominio cambia, se cambia aqui y en el canonical de index.html
 * (ese no puede importar TypeScript) y en SITE_URL de scripts/generate-sitemap.js.
 */
export const SITE_URL = "https://motolab249.com";
export const SITE_NAME = "Moto Lab 249";

/**
 * ID de medicion de Google Analytics 4, con forma G-XXXXXXXXXX.
 * Se saca en analytics.google.com: Administrar -> Flujos de datos -> web.
 * Vacio = no se carga ningun script de analitica.
 */
export const GA_MEASUREMENT_ID = "";
