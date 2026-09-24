import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Medicion de navegacion para Google Tag Manager.
 *
 * El contenedor lo carga el snippet de index.html, y su etiqueta de GA4
 * manda la primera vista al cargar la pagina. Pero aqui la navegacion no
 * recarga nada: pasar de la portada a /motos-electricas no dispara nada por
 * si solo. Este componente empuja un evento propio en cada cambio de ruta.
 *
 * La primera vista se omite a proposito: de eso ya se encarga la etiqueta de
 * GA4 del contenedor al inicializarse. Si tambien la mandaramos desde aqui,
 * la pagina de entrada se contaria doble.
 *
 * En GTM hay que armar esto para que el evento llegue a Analytics:
 *   1. Activador -> Evento personalizado -> nombre: spa_pageview
 *   2. Etiqueta  -> GA4 Event -> nombre del evento: page_view
 *      con los parametros page_location, page_path y page_title tomados
 *      de variables de capa de datos con esos mismos nombres.
 */
const Analytics = () => {
  const { pathname, search } = useLocation();
  const primeraVista = useRef(true);

  useEffect(() => {
    if (primeraVista.current) {
      primeraVista.current = false;
      return;
    }

    // react-helmet actualiza el <title> despues de este efecto. Sin esta
    // pausa, GA recibiria el titulo de la pagina anterior en cada salto.
    const t = window.setTimeout(() => {
      // Si un bloqueador impidio cargar GTM, dataLayer no existe.
      if (!window.dataLayer) return;

      window.dataLayer.push({
        event: "spa_pageview",
        page_path: pathname + search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }, 300);

    return () => window.clearTimeout(t);
  }, [pathname, search]);

  return null;
};

export default Analytics;
