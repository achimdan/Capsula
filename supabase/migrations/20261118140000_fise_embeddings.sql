-- Căutare semantică peste fișele Capsulei (etapa 1 din „Căutare și profil personal”, docs/PLAN.md).
-- Vectorii vin de la Workers AI (@cf/baai/bge-m3: 1024 de dimensiuni, multilingv, bun pe română),
-- pe textul dat de textFisa() din shared/utils/cautare.ts. Îi scrie super adminul: butonul „Reindexează” din /admin
-- (POST /api/admin/reindex) sau, prima dată, `node scripts/index-fise.mjs` + SQL editor.

create extension if not exists vector with schema extensions;
create extension if not exists unaccent with schema extensions;

create table public.fise_embeddings (
  fisa_id text primary key references public.fise (id) on delete cascade,
  model text not null,
  -- sha256 (hex) pe textul indexat: reindexarea sare peste fișele care nu s-au schimbat
  content_hash text not null,
  embedding extensions.vector(1024) not null,
  updated_at timestamptz not null default now()
);

create index fise_embeddings_hnsw_idx on public.fise_embeddings
  using hnsw (embedding extensions.vector_cosine_ops);

revoke all on table public.fise_embeddings from anon, authenticated;
grant select, insert, update, delete on table public.fise_embeddings to authenticated;

alter table public.fise_embeddings enable row level security;

-- Doar super adminul vede și scrie vectorii; restul îi folosesc prin funcțiile de mai jos.
create policy "fise_embeddings: super admin" on public.fise_embeddings
  for all to authenticated
  using ((select public.is_super_admin()))
  with check ((select public.is_super_admin()));

-- unaccent nu e immutable; învelit așa, poate fi folosit în expresii fără să se recalculeze dicționarul.
create or replace function public.fara_diacritice(t text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$ select lower(extensions.unaccent('extensions.unaccent'::regdictionary, t)) $$;

-- Căutare hibridă: clasamentul pe text (cuvinte, fără diacritice) și cel pe vector, combinate prin
-- Reciprocal Rank Fusion. Fără vector (query_embedding null) rămâne doar căutarea pe text.
-- Doar fișele publicate.
create or replace function public.cauta_fise(
  q text,
  query_embedding extensions.vector(1024) default null,
  match_count int default 12
)
returns table (fisa_id text, scor float)
language sql
stable
security definer
set search_path = ''
as $$
  with
  publicate as (
    select f.id, f.titlu, f.nota, f.categorie, f.an, f.oras
    from public.fise f
    where f.publicat
  ),
  intrebare as (
    select websearch_to_tsquery('simple', public.fara_diacritice(left(coalesce(q, ''), 200))) as tsq
  ),
  text_rank as (
    select p.id, row_number() over (order by ts_rank(
      setweight(to_tsvector('simple', public.fara_diacritice(p.titlu)), 'A') ||
      to_tsvector('simple', public.fara_diacritice(p.nota || ' ' || p.categorie || ' ' || p.an || ' ' || coalesce(p.oras, ''))),
      i.tsq) desc) as r
    from publicate p, intrebare i
    where (setweight(to_tsvector('simple', public.fara_diacritice(p.titlu)), 'A') ||
      to_tsvector('simple', public.fara_diacritice(p.nota || ' ' || p.categorie || ' ' || p.an || ' ' || coalesce(p.oras, '')))) @@ i.tsq
    limit 50
  ),
  vector_rank as (
    select e.fisa_id as id, row_number() over (order by e.embedding operator(extensions.<=>) query_embedding) as r
    from public.fise_embeddings e
    join publicate p on p.id = e.fisa_id
    where query_embedding is not null
      and 1 - (e.embedding operator(extensions.<=>) query_embedding) >= 0.35
    order by e.embedding operator(extensions.<=>) query_embedding
    limit 50
  )
  select id as fisa_id, sum(1.0 / (60 + r))::float as scor
  from (select id, r from text_rank union all select id, r from vector_rank) t
  group by id
  order by scor desc
  limit least(greatest(match_count, 1), 50);
$$;

-- „Fișe asemănătoare”: vecinii unei fișe publicate, din vectorul ei deja salvat.
create or replace function public.fise_similare(p_fisa_id text, match_count int default 6)
returns table (fisa_id text, similarity float)
language sql
stable
security definer
set search_path = ''
as $$
  select e.fisa_id, 1 - (e.embedding operator(extensions.<=>) s.embedding) as similarity
  from public.fise_embeddings e
  join public.fise f on f.id = e.fisa_id and f.publicat
  cross join (select embedding from public.fise_embeddings where fisa_id = p_fisa_id) s
  where e.fisa_id <> p_fisa_id
  order by e.embedding operator(extensions.<=>) s.embedding
  limit least(greatest(match_count, 1), 24);
$$;

revoke execute on function public.fara_diacritice(text) from public;
revoke execute on function public.cauta_fise(text, extensions.vector, int) from public;
revoke execute on function public.fise_similare(text, int) from public;
grant execute on function public.fara_diacritice(text) to anon, authenticated;
grant execute on function public.cauta_fise(text, extensions.vector, int) to anon, authenticated;
grant execute on function public.fise_similare(text, int) to anon, authenticated;
