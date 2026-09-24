import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { GA_MEASUREMENT_ID } from "@/lib/site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 para una SPA.
 *
 * El snippet que da Google manda la visita solo al cargar la pagina. Aqui
 * la navegacion no recarga nada, asi que se configura con send_page_view en
 * false y se dispara un page_view propio en cada cambio de ruta. Sin esto,
 * GA registraria la primera pantalla y nada mas: cero navegacion interna y
 * un rebote altisimo que no es real.
 *
 * Si GA_MEASUREMENT_ID esta vacio, este componente no hace nada y no carga
 * ningun script.
 */
const Analytics = () => {
  const { pathname, search } = useLocation();
  const cargado = useRef(false);

  // Carga del script, una sola vez.
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || cargado.current) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

    cargado.current = true;
  }, []);

  // Una visita por cambio de ruta, incluida la primera.
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

    window.gtag("event", "page_view", {
      page_path: pathname + search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search]);

  return null;
};

export default Analytics;
