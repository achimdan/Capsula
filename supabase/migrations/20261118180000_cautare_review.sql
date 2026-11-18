-- Din review (PR #23):
-- - `cauta_fise`: clasamentul pe text se ordonează înainte de limita de 50, ca să nu piardă cele mai bune potriviri;
-- - `fise_similare`: fișa de pornire trebuie să fie și ea publicată, altfel un id ascuns ar dezvălui vecinii lui.

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
    select f.id,
      setweight(to_tsvector('simple', public.fara_diacritice(f.titlu)), 'A') ||
      to_tsvector('simple', public.fara_diacritice(f.nota || ' ' || f.categorie || ' ' || f.an || ' ' || coalesce(f.oras, ''))) as doc
    from public.fise f
    where f.publicat
  ),
  cuvinte as (
    select string_agg(c || ':*', ' & ') as expr
    from regexp_split_to_table(public.fara_diacritice(left(coalesce(q, ''), 200)), '[^a-z0-9]+') as c
    where length(c) >= 2
  ),
  intrebare as (
    select case when expr is null then null else to_tsquery('simple', expr) end as tsq from cuvinte
  ),
  text_rank as (
    select p.id, row_number() over (order by ts_rank(p.doc, i.tsq) desc) as r
    from publicate p, intrebare i
    where i.tsq is not null and p.doc @@ i.tsq
    order by r
    limit 50
  ),
  similaritati as (
    select e.fisa_id as id, 1 - (e.embedding operator(extensions.<=>) query_embedding) as sim
    from public.fise_embeddings e
    join publicate p on p.id = e.fisa_id
    where query_embedding is not null
  ),
  statistici as (
    select avg(sim) as medie, nullif(stddev_pop(sim), 0) as abatere from similaritati
  ),
  vector_rank as (
    select s.id, row_number() over (order by s.sim desc) as r
    from similaritati s, statistici st
    where (s.sim - st.medie) / st.abatere >= 2.5
    order by s.sim desc
    limit 20
  )
  select id as fisa_id, sum(pondere / (60 + r))::float as scor
  from (
    select id, r, 1.0 as pondere from text_rank
    union all
    select id, r, 0.8 as pondere from vector_rank
  ) t
  group by id
  order by scor desc
  limit least(greatest(match_count, 1), 50);
$$;

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
  cross join (
    select se.embedding
    from public.fise_embeddings se
    join public.fise sf on sf.id = se.fisa_id and sf.publicat
    where se.fisa_id = p_fisa_id
  ) s
  where e.fisa_id <> p_fisa_id
  order by e.embedding operator(extensions.<=>) s.embedding
  limit least(greatest(match_count, 1), 24);
$$;
