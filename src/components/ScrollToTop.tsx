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
 * Con ancla: al elemento, y reintentando. El salto no se puede hacer una
 * sola vez porque la portada pide sus notas despues del primer pintado:
 * cuando el ancla se resolvia, la pagina medía una fraccion de su alto
 * final y el destino se movia para abajo en cuanto llegaban los datos. El
 * /#suscribete del boton del navbar llevaba anios cayendo en el vacio,
 * dejando el scroll en cero con el formulario 3400px mas abajo.
 *
 * Se usa el salto instantaneo y no "smooth" a proposito: Chrome cancela la
 * animacion suave cuando el layout cambia tanto mientras corre.
 */
const INTENTOS = 8;
const CADA_MS = 250;

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    let intento = 0;
    const id = window.setInterval(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ block: "start" });
      if (++intento >= INTENTOS) window.clearInterval(id);
    }, CADA_MS);

    return () => window.clearInterval(id);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
