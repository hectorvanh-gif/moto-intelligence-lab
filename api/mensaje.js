/**
 * Buzon de mensajes de los lectores.
 *
 * Guarda el mensaje en Supabase y te lo manda por correo, para no tener
 * que asomarse al panel. Si el correo falla, el mensaje ya quedo
 * guardado: primero se escribe y despues se avisa.
 *
 * No es una caja de comentarios: nada de esto se publica. Por eso la
 * tabla no tiene politica de lectura y aqui no hay endpoint que los
 * devuelva.
 *
 * Tres barreras contra el spam, de la mas barata a la mas cara:
 *   1. Un campo trampa que solo llenan los robots.
 *   2. Un tope por IP, con el mismo hash con sal que usan los votos.
 *   3. El propio `with check` de la base, que rechaza vacios y novelas.
 *
 * Variables de entorno en Vercel:
 *   SUPABASE_SERVICE_KEY  obligatoria
 *   RESEND_API_KEY        para el aviso; sin ella se guarda igual
 */

import { createHash } from "node:crypto";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://rbumxwchxgjbtxsxutbl.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const RESEND_KEY = process.env.RESEND_API_KEY || "";
const SAL = process.env.VOTE_SALT || "motolab249-votos";

const REMITENTE =
  process.env.NEWSLETTER_FROM || "Moto Lab 249 <boletin@motolab249.com>";
const BUZON = process.env.NEWSLETTER_REPLY_TO || "motolab249@gmail.com";

/** Cuantos mensajes puede mandar la misma IP en la ventana. */
const TOPE = 5;
const VENTANA_HORAS = 24;

const cabeceras = () => ({
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
});

function ipDe(req) {
  const cadena =
    req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "";
  return String(cadena).split(",")[0].trim() || "sin-ip";
}

const hashDe = (ip) =>
  createHash("sha256").update(`${SAL}:${ip}`).digest("hex").slice(0, 32);

const limpiar = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);

const escapar = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

async function yaMandoDemasiados(hash) {
  const desde = new Date(Date.now() - VENTANA_HORAS * 3600 * 1000).toISOString();
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/mensajes?select=id&ip_hash=eq.${hash}&created_at=gte.${desde}&limit=${TOPE}`,
    { headers: cabeceras() }
  );
  if (!r.ok) return false; // ante la duda, se deja pasar: mejor un mensaje de mas que perder uno real
  const filas = await r.json();
  return Array.isArray(filas) && filas.length >= TOPE;
}

async function avisar(m) {
  if (!RESEND_KEY) return;
  const cuerpo = `
    <p><strong>${escapar(m.nombre) || "Alguien"}</strong>${
    m.email ? ` &lt;${escapar(m.email)}&gt;` : " (sin correo)"
  } escribió desde motolab249.com:</p>
  <p style="white-space:pre-wrap;border-left:3px solid #ef4444;padding-left:12px;">${escapar(
    m.mensaje
  )}</p>
  ${m.nota_id ? `<p>Sobre la nota <a href="https://motolab249.com/noticias/${m.nota_id}">#${m.nota_id}</a></p>` : ""}`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: [BUZON],
        // Para poder contestarle al lector dandole a responder.
        reply_to: m.email || BUZON,
        subject: `Mensaje de ${m.nombre || "un lector"}`,
        html: cuerpo,
      }),
    });
  } catch (e) {
    console.error("mensaje: aviso por correo", e?.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "solo POST" });
  }
  if (!SERVICE_KEY) {
    console.error("mensaje: falta SUPABASE_SERVICE_KEY");
    return res.status(503).json({ error: "buzon no configurado" });
  }

  // El campo trampa. Se llama "web" porque los robots rellenan lo que
  // parece un formulario normal; una persona nunca lo ve.
  if (limpiar(req.body?.web, 10)) {
    // Se responde bien a proposito: si el robot ve un error, reintenta.
    return res.status(200).json({ ok: true });
  }

  const mensaje = limpiar(req.body?.mensaje, 2000);
  if (mensaje.length < 5) {
    return res.status(400).json({ error: "el mensaje está muy corto" });
  }

  const email = limpiar(req.body?.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: "ese correo no se ve bien" });
  }

  const hash = hashDe(ipDe(req));

  try {
    if (await yaMandoDemasiados(hash)) {
      return res
        .status(429)
        .json({ error: "ya mandaste varios mensajes hoy, inténtalo mañana" });
    }

    const nota = Number(req.body?.nota_id);
    const fila = {
      nombre: limpiar(req.body?.nombre, 80) || null,
      email: email || null,
      mensaje,
      nota_id: Number.isInteger(nota) && nota > 0 ? nota : null,
      ip_hash: hash,
    };

    const alta = await fetch(`${SUPABASE_URL}/rest/v1/mensajes`, {
      method: "POST",
      headers: cabeceras(),
      body: JSON.stringify(fila),
    });

    if (!alta.ok) {
      const detalle = await alta.text();
      console.error("mensaje: insert", alta.status, detalle.slice(0, 200));
      return res.status(502).json({ error: "no se pudo guardar" });
    }

    // El correo va despues de guardar y no bloquea la respuesta correcta.
    await avisar(fila);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("mensaje:", e?.message);
    return res.status(500).json({ error: "error inesperado" });
  }
}
