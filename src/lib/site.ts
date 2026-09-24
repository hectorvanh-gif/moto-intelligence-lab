/**
 * Identidad del sitio en un solo lugar.
 * Si el dominio cambia, se cambia aqui y en el canonical de index.html
 * (ese no puede importar TypeScript) y en SITE_URL de scripts/generate-sitemap.js.
 */
export const SITE_URL = "https://motolab249.com";
export const SITE_NAME = "Moto Lab 249";

/**
 * Analitica. Solo hay UN cargador: el snippet de Google Tag Manager que
 * vive en index.html. La medicion de rutas la hace
 * src/components/Analytics.tsx empujando al dataLayer que ese snippet crea.
 *
 * El ID de GA4 NO va en el codigo: vive dentro de una etiqueta "Google tag"
 * configurada en GTM. Si alguna vez se pega tambien el snippet de gtag.js
 * en index.html, cada visita se cuenta dos veces.
 *
 * Estas dos constantes son referencia, no las lee nadie.
 */
export const GTM_CONTAINER_ID = "GTM-TFG89RFD";
export const GA4_MEASUREMENT_ID = "G-SBLMWDNHDC";
