import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";
import { useMeta } from "@/hooks/useMeta";
import { urlCanonica } from "@/lib/i18n";

/**
 * Terminos de uso.
 *
 * Lo importante de esta pagina no son las clausulas, es lo que admite:
 * que el contenido lo redacta un agente, que puede equivocarse y que la
 * nota original siempre esta enlazada. Eso es lo que un lector necesita
 * saber para decidir cuanto confiar.
 */
const Terminos = () => {
  useMeta({
    title: "Términos de uso | Moto Lab 249",
    description:
      "Cómo se produce el contenido de Moto Lab 249, de quién son las notas originales y qué esperar de un sitio escrito con ayuda de IA.",
    canonical: urlCanonica("/terminos"),
  });

  return (
    <div className="min-h-screen bg-background pt-28 lg:pt-32">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <article className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Términos de uso
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-10">
            Última actualización: 27 de septiembre de 2026
          </p>

          <div className="space-y-8 font-body text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-display text-xl text-foreground mb-3">
                De dónde sale lo que lees
              </h2>
              <p>
                Las notas de este sitio son resúmenes de lo que publica la
                prensa especializada. No hacemos reportería propia: filtramos,
                resumimos, clasificamos y{" "}
                <strong className="text-foreground">
                  siempre enlazamos a la nota original
                </strong>
                , que es de su medio y de su autor. Si quieres la versión
                completa, ese enlace está al final de cada nota.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">
                El contenido se redacta con inteligencia artificial
              </h2>
              <p className="mb-3">
                Lo decimos de frente porque cambia cómo deberías leerlo: un
                agente automático redacta los resúmenes y asigna las
                categorías. Las decisiones de qué fuentes leer y qué secciones
                existen son humanas, pero el texto de cada nota no lo escribió
                una persona.
              </p>
              <p>
                Eso significa que{" "}
                <strong className="text-foreground">
                  puede haber errores
                </strong>
                : un dato mal interpretado, un nombre confundido, un matiz
                perdido. Por eso el enlace a la fuente está siempre a la vista, y
                por eso existe el{" "}
                <Link to="/contacto" className="text-primary hover:underline">
                  buzón
                </Link>
                : si ves algo mal, escríbenos y lo corregimos.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">
                No tomes decisiones de compra solo con esto
              </h2>
              <p>
                Precios, disponibilidad, fechas y especificaciones cambian, y
                aquí llegan a través de un resumen. Antes de comprar una moto o
                de viajar a una carrera, confirma con la marca, el distribuidor o
                el organizador. Este sitio te dice qué está pasando; no sustituye
                a la fuente oficial.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">
                Los votos y el buzón
              </h2>
              <p>
                Puedes votar las notas y escribirnos sin registrarte. Lo único
                que pedimos es que no lo abuses: hay límites automáticos para
                votos repetidos y para mensajes en serie, y no son negociables
                porque no los opera nadie.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">
                Los datos
              </h2>
              <p>
                Qué guardamos y cómo pedir que se borre está en el{" "}
                <Link to="/privacidad" className="text-primary hover:underline">
                  aviso de privacidad
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Terminos;
