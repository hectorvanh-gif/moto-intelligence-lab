/**
 * Identidad del sitio en un solo lugar.
 * Si el dominio cambia, se cambia aqui y en el canonical de index.html
 * (ese no puede importar TypeScript) y en SITE_URL de scripts/generate-sitemap.js.
 */
export const SITE_URL = "https://motolab249.com";
export const SITE_NAME = "Moto Lab 249";

/**
 * Contenedor de Google Tag Manager. El snippet que lo carga vive en
 * index.html, como lo pide Google. Esta constante queda como referencia:
 * la medicion de rutas la hace src/components/Analytics.tsx empujando al
 * dataLayer que crea ese snippet.
 */
export const GTM_CONTAINER_ID = "GTM-TFG89RFD";
