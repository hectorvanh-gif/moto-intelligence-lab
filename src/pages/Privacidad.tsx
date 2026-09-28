import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";
import { useMeta } from "@/hooks/useMeta";

/**
 * Aviso de privacidad.
 *
 * Todo lo que dice es comprobable contra el codigo: las tablas que
 * existen, los servicios que se usan y lo que se guarda de cada visita.
 * Si algun dia se agrega otra cosa que recoja datos, esta pagina se
 * actualiza en el mismo commit.
 *
 * No es un documento redactado por abogado. Describe con honestidad lo
 * que el sitio hace; para cumplimiento formal de la ley mexicana de
 * proteccion de datos hace falta revision profesional.
 */
const Privacidad = () => {
  useMeta({
    title: "Aviso de privacidad | Moto Lab 249",
    description:
      "Qué datos guarda Moto Lab 249, para qué, quién los procesa y cómo pedir que se borren.",
    canonical: `${SITE_URL}/privacidad`,
  });

  return (
    <div className="min-h-screen bg-background pt-28 lg:pt-32">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <article className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Aviso de privacidad
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-10">
            Última actualización: 27 de septiembre de 2026
          </p>

          <div className="space-y-8 font-body text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-display text-xl text-foreground mb-3">
                Qué guardamos
              </h2>
              <p className="mb-3">
                Solo lo que tú nos das, y nada más:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-foreground">Tu correo</strong>, si te
                  suscribes al boletín. Nada más: no pedimos nombre, teléfono ni
                  fecha de nacimiento.
                </li>
                <li>
                  <strong className="text-foreground">
                    Lo que escribes en el buzón
                  </strong>
                  : tu mensaje, y el nombre y correo solo si decides ponerlos.
                  Los dos son opcionales.
                </li>
                <li>
                  <strong className="text-foreground">
                    Una huella de tu conexión
                  </strong>{" "}
                  cuando votas una nota o mandas un mensaje. No guardamos tu
                  dirección IP: guardamos un código irreversible calculado a
                  partir de ella, que sirve para saber que dos votos vienen del
                  mismo lugar sin saber de dónde vienen.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">
                Para qué
              </h2>
              <p>
                El correo, para mandarte el boletín los lunes. El mensaje, para
                leerlo y contestarte. La huella de conexión, para que nadie
                pueda votar mil veces la misma nota ni llenar el buzón de spam.
                No usamos tus datos para nada más, no los vendemos y no hay
                publicidad en el sitio.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">
                Quién los procesa
              </h2>
              <p className="mb-3">
                No tenemos servidores propios. Estos servicios sí ven tus datos,
                cada uno para una cosa:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-foreground">Supabase</strong> guarda la
                  base de datos donde viven los correos y los mensajes.
                </li>
                <li>
                  <strong className="text-foreground">Resend</strong> manda los
                  correos, así que ve tu dirección para poder entregarlos.
                </li>
                <li>
                  <strong className="text-foreground">Vercel</strong> aloja el
                  sitio y registra las peticiones, como cualquier servidor web.
                </li>
                <li>
                  <strong className="text-foreground">Google Analytics</strong>{" "}
                  mide el tráfico con cookies: qué páginas se ven y desde qué
                  país, sin identificarte por nombre.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">
                Cómo te sales
              </h2>
              <p>
                Responde <strong className="text-foreground">BAJA</strong> a
                cualquier correo del boletín y te quitamos de la lista. Si
                quieres que borremos todo lo que tengamos tuyo —el correo, los
                mensajes o ambos— escríbenos a{" "}
                <a
                  href="mailto:motolab249@gmail.com"
                  className="text-primary hover:underline"
                >
                  motolab249@gmail.com
                </a>{" "}
                y lo hacemos. No hay que dar explicaciones.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">
                Lo que no hacemos
              </h2>
              <p>
                No vendemos ni compartimos tus datos con nadie más que los
                servicios de arriba. No tenemos publicidad ni rastreadores de
                terceros además de Google Analytics. Y no te vamos a escribir
                para venderte nada: el boletín es el boletín.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Privacidad;
