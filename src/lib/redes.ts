/**
 * Las redes del sitio, en un solo lugar.
 *
 * El enlace de Instagram apuntaba a instagram.com a secas —la portada de
 * Instagram, no la cuenta— desde que se creo el proyecto, hasta que
 * aparecio la cuenta real el 25-sep-2026. El pie solo pinta el icono si
 * hay direccion: un enlace que no lleva a tu cuenta es peor que ninguno.
 */
export const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61594973842217";

export const INSTAGRAM_URL = "https://www.instagram.com/motolab.249/";

/**
 * La agencia que hizo el sitio. Moto Lab es un proyecto propio de MAAT
 * House, no un encargo, y por eso el credito del pie dice "Un proyecto de"
 * y no "Sitio por".
 *
 * La misma direccion esta escrita en api/tarjeta.js, que arma el HTML que
 * reciben los rastreadores. Si cambia, hay que cambiarla alli tambien: el
 * vigia comprueba a diario que el enlace exista en los dos.
 */
export const MAAT_HOUSE_URL = "https://maathouse.com";
