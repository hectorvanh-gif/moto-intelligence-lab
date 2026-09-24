/**
 * Un voto para una nota.
 *
 * Vive en el servidor porque la regla de "un voto por persona" necesita la
 * IP, y el navegador no la conoce. Tampoco se puede dejar que el navegador
 * sume el contador directo: cualquiera abriria la consola y se pondria mil.
 *
 * De la IP se guarda solo un hash con sal. Sirve para saber que dos votos
 * vienen del mismo sitio sin guardar de donde vienen.
 *
 * Variables de entorno en Vercel:
 *   SUPABASE_SERVICE_KEY  obligatoria (votes_log no es accesible con la anonima)
 *   VOTE_SALT             opcional, para el hash de la IP
 *
 * El esquema que usa esta en supabase/votos.sql.
 */

import { createHash } from "node:crypto";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://rbumxwchxgjbtxsxutbl.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const SAL = process.env.VOTE_SALT || "motolab249-votos";

const cabeceras = () => ({
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
});

function ipDe(req) {
  // Vercel pone la IP real del visitante en x-forwarded-for; el primer
  // valor de la lista es el cliente, los siguientes son los proxys.
  const cadena =
    req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "";
  return String(cadena).split(",")[0].trim() || "sin-ip";
}

const hashDe = (ip) =>
  createHash("sha256").update(`${SAL}:${ip}`).digest("hex").slice(0, 32);

async function totalDe(id) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/moto_news?select=votes&id=eq.${id}&limit=1`,
    { headers: cabeceras() }
  );
  if (!r.ok) return null;
  const filas = await r.json();
  return filas?.[0]?.votes ?? null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "solo POST" });
  }
  if (!SERVICE_KEY) {
    console.error("votar: falta SUPABASE_SERVICE_KEY");
    return res.status(503).json({ error: "votos no configurados" });
  }

  const id = Number(req.body?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "id invalido" });
  }

  try {
    const alta = await fetch(`${SUPABASE_URL}/rest/v1/votes_log`, {
      method: "POST",
      headers: cabeceras(),
      body: JSON.stringify({ news_id: id, ip_hash: hashDe(ipDe(req)) }),
    });

    if (!alta.ok) {
      const detalle = await alta.text();

      // PostgREST responde 409 tanto al voto repetido (23505) como a una
      // nota que no existe (23503), asi que hay que mirar el codigo y no
      // el estado: si no, votar por una nota inexistente se reportaba como
      // "ya votaste" y la interfaz marcaba el boton.
      if (detalle.includes("23503")) {
        return res.status(404).json({ error: "esa nota no existe" });
      }

      if (detalle.includes("23505")) {
        // Ya voto esta nota desde aqui. No es un error del visitante: se
        // le devuelve el total para que la interfaz quede igual que si
        // acabara de votar.
        return res
          .status(200)
          .json({ total: await totalDe(id), yaVotado: true });
      }

      console.error("votar: votes_log", alta.status, detalle.slice(0, 200));
      return res.status(502).json({ error: "no se pudo registrar el voto" });
    }

    const suma = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sumar_voto`, {
      method: "POST",
      headers: cabeceras(),
      body: JSON.stringify({ nid: id }),
    });

    if (!suma.ok) {
      const detalle = await suma.text();
      console.error("votar: sumar_voto", suma.status, detalle.slice(0, 200));
      return res.status(502).json({ error: "no se pudo sumar el voto" });
    }

    const total = await suma.json();
    return res.status(200).json({ total, yaVotado: false });
  } catch (e) {
    console.error("votar:", e?.message);
    return res.status(500).json({ error: "error inesperado" });
  }
}
