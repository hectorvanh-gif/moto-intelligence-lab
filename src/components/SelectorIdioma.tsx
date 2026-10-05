import { OTRO, rutaEnOtroIdioma } from "@/lib/i18n";

/**
 * ES | EN.
 *
 * Usa <a> y no <Link> a proposito: el idioma lo define el basename del
 * router, que se fija al cargar la pagina, asi que cambiarlo necesita una
 * carga completa. Un <Link> navegaria por dentro del router actual y
 * dejaria la URL en /en con la interfaz todavia en español.
 *
 * El enlace se queda en la misma pagina del otro idioma, salvo en las notas
 * sueltas: las anteriores al 5 de octubre de 2026 no existen en ingles, asi
 * que desde una nota el selector manda a la portada en vez de a un 404.
 */
const SelectorIdioma = () => {
  const enUnaNota = /^\/(en\/)?noticias\/\d+/.test(
    typeof window === "undefined" ? "" : window.location.pathname
  );

  // El idioma al que se puede ir va en rojo con el neon de la casa, no en
  // gris: es el enlace en el que se quiere que la gente repare. El idioma
  // actual no se pinta, porque ya se esta viendo.
  return (
    <a
      href={rutaEnOtroIdioma(enUnaNota)}
      hrefLang={OTRO}
      aria-label={OTRO === "en" ? "Read in English" : "Leer en español"}
      className="neon-glow shrink-0 rounded-sm border border-primary bg-primary/10 px-2.5 py-1.5 font-display text-xs font-bold tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {OTRO.toUpperCase()}
    </a>
  );
};

export default SelectorIdioma;
