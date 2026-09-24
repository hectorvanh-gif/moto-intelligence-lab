import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Todo el manejo del scroll al navegar, en un solo lugar.
 *
 * Sin ancla: arriba. React Router no lo hace solo, asi que al dar clic en
 * un enlace la pagina nueva se dibujaba pero la posicion se quedaba donde
 * estaba: "COMO TRABAJAMOS" vive al final de la portada y aterrizabas en
 * el pie de /nosotros.
 *
 * Con ancla: al elemento. El /#suscribete del boton del navbar nunca
 * funciono; se comprobo en produccion antes de tocar nada, dejaba el
 * scroll en cero con el formulario 3400px mas abajo.
 *
 * Las dos cosas fallaban por lo mismo: la pagina no mide lo mismo cuando
 * se navega que un segundo despues. La portada pide sus notas despues del
 * primer pintado y luego cargan las imagenes, asi que crece por partes; y
 * el navegador, por su cuenta, restaura la posicion del scroll del
 * historial y pisa lo que uno acaba de poner.
 *
 * Por eso aqui no se coloca el scroll una vez, se insiste hasta que la
 * pagina deja de moverse: dos lecturas iguales seguidas y se para. Con
 * tope de tiempo, para no quedarse peleando con una pagina que no se
 * asienta nunca.
 */
const CADA_MS = 150;
const TOPE_MS = 4000;

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Sin esto el navegador reaplica la posicion guardada del historial
    // despues de que nosotros ya la pusimos.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const destino = () => {
      if (!hash) return 0;
      const el = document.querySelector(hash);
      if (!el) return null;
      return Math.max(0, window.scrollY + el.getBoundingClientRect().top);
    };

    let anterior: number | null = null;
    let transcurrido = 0;

    const colocar = () => {
      const y = destino();
      if (y === null) return false;

      window.scrollTo(0, y);

      // Dos veces el mismo destino: la pagina ya no crece.
      const estable = anterior !== null && Math.abs(anterior - y) < 2;
      anterior = y;
      return estable;
    };

    colocar();

    const id = window.setInterval(() => {
      transcurrido += CADA_MS;
      if (colocar() || transcurrido >= TOPE_MS) window.clearInterval(id);
    }, CADA_MS);

    // Si el lector se mueve por su cuenta, se le deja en paz: insistir
    // seria jalarlo de vuelta mientras intenta leer.
    const rendirse = () => window.clearInterval(id);
    const gestos = ["wheel", "touchstart", "keydown"] as const;
    gestos.forEach((g) => window.addEventListener(g, rendirse, { passive: true }));

    return () => {
      window.clearInterval(id);
      gestos.forEach((g) => window.removeEventListener(g, rendirse));
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
