# Moto Lab 249

Portal de noticias de moto para México: **[motolab249.com](https://motolab249.com)**

Un agente junta cada mañana lo que publicó la prensa especializada, Claude lo
reescribe y lo clasifica, y el sitio lo publica. Los lectores votan las notas y
cada lunes sale un boletín con lo mejor de la semana.

## Cómo está armado

| Pieza | Qué es |
|---|---|
| Sitio | React + Vite + Tailwind, SPA servida en Vercel |
| Datos | Supabase (`moto_news`, `subscribers`, `votes_log`) |
| Agente | Python en GitHub Actions, 9:00 CST |
| Redacción | Claude Haiku |
| Imágenes | Pillow, 1080x1080 para Instagram |
| Correo | Resend, desde `boletin@motolab249.com` |
| Analítica | GTM `GTM-TFG89RFD` → GA4 `G-SBLMWDNHDC` |

## Los scripts

```bash
# El agente diario: NewsAPI + RSS -> Claude -> Supabase
python scripts/news_agent.py

# Reprocesa notas viejas y normaliza categorías inválidas
python scripts/backfill.py --limit 0 --dry-run

# El boletín. Sin --enviar solo escribe boletin.html
python scripts/newsletter.py --dias 7
```

El boletín **se manda a mano**, por decisión: `gh workflow run newsletter.yml -f enviar=true`.
El cron está comentado en el workflow hasta llevar varios lunes revisados.

## Cosas que hay que saber antes de tocar esto

**La categoría se valida contra un catálogo.** Claude inventa categorías si le
dejas (devolvió `MOTO3` y `TECNOLOGIA`), y una categoría fuera de
`src/lib/categories.ts` hace que la nota no aparezca en ninguna sección. Eso lo
resuelve `categoria_valida()` en `scripts/news_agent.py`.

**Claude envuelve el JSON en markdown.** El agente falló en silencio durante
meses porque `json.loads` no podía con ```json ... ```, y el fallback copiaba el
texto crudo de la fuente. La firma de ese fallo es `ig_title == title[:55].upper()`.

**El mismo suceso entra varias veces.** La deduplicación del agente es por URL,
así que una noticia entra tantas veces como medios la publiquen. El boletín la
detecta comparando titulares (`misma_historia()` en `scripts/newsletter.py`); el
sitio todavía no.

**Los votos se cuentan en el servidor.** `api/votar.js`, nunca desde el
navegador. El esquema está en `supabase/votos.sql`, y ahí queda anotado el
`revoke ... from public` que es fácil de olvidar: sin él, cualquiera puede
inflar el contador llamando al RPC.

**El sitemap se regenera en cada build** (`npm run build` lo corre antes de
Vite). Si pasan días sin desplegar, las notas nuevas no están en el sitemap.

**El rewrite de `vercel.json` excluye `/api`** para que la SPA no se trague las
funciones. Ese mismo rewrite hace que cualquier URL inventada responda 200 con
la app, lo que Google reporta como soft 404: es un pendiente conocido.

## Secretos

En GitHub Actions: `ANTHROPIC_API_KEY`, `NEWSAPI_KEY`, `SUPABASE_URL`,
`SUPABASE_SERVICE_KEY`, `RESEND_API_KEY`. La variable `NEWSLETTER_FROM` es
pública.

En Vercel: `SUPABASE_SERVICE_KEY` y `RESEND_API_KEY`, que usan las funciones de
`api/`. Cambiarlas **exige un redespliegue**: Vercel las inyecta al desplegar,
no en caliente.

La llave publicable de Supabase sí vive en el código del sitio, y está bien: las
tablas sensibles están cerradas por RLS. `subscribers` acepta inserciones y no
permite lecturas, así que la lista de correos no se puede descargar desde el
navegador.
