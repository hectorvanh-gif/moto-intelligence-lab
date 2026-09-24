-- Votos por nota. Corrido a mano en el SQL Editor de Supabase el
-- 24-sep-2026. Este proyecto no tiene migraciones, asi que el esquema que
-- se toca a mano queda anotado aqui.

-- 1. El contador vive en la propia nota: el sitio ya consulta moto_news
--    completa, asi que no hace falta ninguna vista ni union nueva.
alter table public.moto_news
  add column if not exists votes integer not null default 0;

-- 2. Un registro por voto, para que nadie vote dos veces la misma nota.
--    Se guarda el hash de la IP, nunca la IP.
create table if not exists public.votes_log (
  id bigserial primary key,
  news_id bigint not null references public.moto_news(id) on delete cascade,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  unique (news_id, ip_hash)
);

-- Sin politicas: nadie toca esta tabla desde el navegador. Solo el
-- endpoint api/votar.js, que usa la llave de servicio.
alter table public.votes_log enable row level security;

-- 3. Suma atomica. Sin esto habria que leer y escribir por separado y dos
--    votos simultaneos se pisarian.
create or replace function public.sumar_voto(nid bigint)
returns integer
language sql
security definer
as $$
  update public.moto_news
     set votes = votes + 1
   where id = nid
  returning votes;
$$;

-- Que no se pueda llamar desde el navegador: solo el endpoint, que si
-- comprueba que no hayas votado antes.
--
-- El revoke a PUBLIC es el que importa y es facil de olvidar: Postgres
-- concede EXECUTE a PUBLIC en cada funcion nueva, y anon hereda de ahi.
-- Revocarsela solo a anon deja la funcion abierta, y se comprobo: con la
-- llave publicable se le sumaron votos a una nota desde fuera, saltandose
-- la regla de un voto por persona.
revoke execute on function public.sumar_voto(bigint) from public;
revoke execute on function public.sumar_voto(bigint) from anon, authenticated;
