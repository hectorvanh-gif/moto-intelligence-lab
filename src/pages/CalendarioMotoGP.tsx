import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock, Flag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterBand from "@/components/NewsletterBand";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE_URL } from "@/lib/site";
import { useMeta } from "@/hooks/useMeta";

/**
 * Calendario de MotoGP con los horarios en hora de Mexico.
 *
 * Es la unica pagina del sitio con informacion que no sale de la prensa:
 * la hora a la que de verdad se ve cada carrera desde aqui. De las siete
 * que quedaban al crearla, cuatro no se corren en domingo en Mexico —Japon
 * y Australia caen en sabado, Indonesia y Malasia a la una de la manana—,
 * y eso no lo dice el calendario oficial, que publica en la hora del
 * circuito.
 *
 * Los datos salen de public/calendario-motogp.json, que actualiza cada dia
 * scripts/calendario_motogp.py leyendo la API oficial. Escrita a mano
 * quedaria vieja cada semana.
 */

interface Sesion {
  clave: string;
  iso: string;
  nombre: string;
  dia_semana: string;
  dia: number;
  mes: string;
  hora: string;
}

interface Carrera {
  ronda: number;
  nombre: string;
  pais: string;
  circuito: string;
  inicio: string;
  fin: string;
  corrida: boolean;
  carrera: Sesion | null;
  sprint: Sesion | null;
  sesiones: Sesion[];
}

interface Calendario {
  temporada: number;
  actualizado: string;
  proxima_ronda: number | null;
  carreras: Carrera[];
}

const cuando = (s: Sesion) => `${s.dia_semana} ${s.dia} de ${s.mes}, ${s.hora}`;

const CalendarioMotoGP = () => {
  const [datos, setDatos] = useState<Calendario | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/calendario-motogp.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setDatos)
      .catch(() => setError(true));
  }, []);

  const temporada = datos?.temporada ?? new Date().getFullYear();

  useMeta({
    title: `Calendario MotoGP ${temporada} en hora de México | Moto Lab 249`,
    description:
      "Todas las carreras de MotoGP con el horario convertido a la hora de México. Varias no se corren en domingo aquí: revisa antes de perdértelas.",
    canonical: `${SITE_URL}/calendario-motogp`,
  });

  const proxima = datos?.carreras.find((c) => c.ronda === datos.proxima_ronda);
  const faltan = datos?.carreras.filter((c) => !c.corrida && c.ronda !== datos.proxima_ronda) ?? [];
  const corridas = datos?.carreras.filter((c) => c.corrida) ?? [];

  return (
    <div className="min-h-screen bg-background pt-28 lg:pt-32">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">
        <div className="max-w-4xl mx-auto">
          <p className="font-display text-xs tracking-widest text-primary mb-3">
            HORA DE MÉXICO · CENTRO
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
            Calendario MotoGP {temporada}
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            El calendario oficial publica los horarios en la hora del circuito.
            Aquí están convertidos a la hora de México, que es la que necesitas
            para no perderte una carrera que se corre en sábado.
          </p>

          {error && (
            <p className="text-destructive font-medium py-8">
              No se pudo cargar el calendario. Intenta de nuevo más tarde.
            </p>
          )}

          {!datos && !error && (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {/* La proxima */}
          {proxima && (
            <section className="mb-12 rounded-lg border border-primary/40 bg-primary/5 p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Flag className="w-4 h-4 text-primary" />
                <span className="font-display text-xs tracking-widest text-primary">
                  LA PRÓXIMA · RONDA {proxima.ronda}
                </span>
              </div>

              <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1">
                {proxima.pais}
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-6">
                {proxima.circuito}
              </p>

              {proxima.carrera && (
                <div className="mb-6 pb-6 border-b border-border/50">
                  <p className="font-display text-xs tracking-widest text-muted-foreground mb-1">
                    CARRERA
                  </p>
                  <p className="font-display text-xl lg:text-2xl font-bold text-primary">
                    {cuando(proxima.carrera)}
                  </p>
                </div>
              )}

              <p className="font-display text-xs tracking-widest text-muted-foreground mb-3">
                FIN DE SEMANA COMPLETO
              </p>
              <ul className="space-y-1.5">
                {proxima.sesiones.map((s) => (
                  <li
                    key={s.clave + s.iso}
                    className="flex items-baseline justify-between gap-4 text-sm"
                  >
                    <span
                      className={`font-body ${
                        s.clave === "RAC" || s.clave === "SPR"
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.nombre}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums shrink-0">
                      {s.dia_semana} {s.hora}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Lo que falta */}
          {faltan.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground tracking-wide">
                  LO QUE FALTA DE LA TEMPORADA
                </h2>
              </div>

              <div className="space-y-3">
                {faltan.map((c) => (
                  <div
                    key={c.ronda}
                    className="rounded-sm border border-border/50 bg-card/50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6"
                  >
                    <div className="mb-3 sm:mb-0">
                      <p className="font-display text-sm text-foreground">
                        <span className="text-muted-foreground mr-2">
                          R{c.ronda}
                        </span>
                        {c.pais}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {c.circuito}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 sm:text-right shrink-0">
                      {c.sprint && (
                        <span className="font-mono text-xs text-muted-foreground">
                          Sprint · {cuando(c.sprint)}
                        </span>
                      )}
                      {c.carrera ? (
                        <span className="font-mono text-sm text-primary">
                          Carrera · {cuando(c.carrera)}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">
                          horario aún sin confirmar
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ya corridas */}
          {corridas.length > 0 && (
            <section className="mb-12">
              <h2 className="font-display text-sm text-muted-foreground tracking-widest mb-4">
                YA SE CORRIERON
              </h2>
              <div className="flex flex-wrap gap-2">
                {corridas.map((c) => (
                  <span
                    key={c.ronda}
                    className="px-2.5 py-1 rounded-sm border border-border/40 font-body text-xs text-muted-foreground"
                  >
                    R{c.ronda} {c.pais}
                  </span>
                ))}
              </div>
            </section>
          )}

          {datos && (
            <p className="font-body text-xs text-muted-foreground flex items-center gap-2 mb-10">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Horarios en hora del centro de México. Datos del calendario
              oficial de MotoGP, actualizados el{" "}
              {new Date(datos.actualizado).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
              })}
              .
            </p>
          )}

          <Link
            to="/motogp"
            className="group inline-flex items-center gap-2 font-display text-xs tracking-widest text-primary"
          >
            VER LAS NOTICIAS DE MOTOGP
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>

      <NewsletterBand />
      <Footer />
    </div>
  );
};

export default CalendarioMotoGP;
