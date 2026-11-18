-- „Întreabă-mi capsula”: cele mai apropiate fișe publicate după sens, pentru o întrebare întreagă.
-- Spre deosebire de cauta_fise (calibrată pe cuvinte scurte), aici nu tăiem după z-scor:
-- întoarcem top-k cu similaritatea, iar serverul păstrează doar ce trece pragul și e vizibil omului.
create or replace function public.fise_pentru_intrebare(
  query_embedding extensions.vector(1024),
  match_count int default 12
)
returns table (fisa_id text, sim float)
language sql
stable
security definer
set search_path = ''
as $$
  select e.fisa_id, (1 - (e.embedding operator(extensions.<=>) query_embedding))::float as sim
  from public.fise_embeddings e
  join public.fise f on f.id = e.fisa_id
  where f.publicat
  order by e.embedding operator(extensions.<=>) query_embedding
  limit least(greatest(match_count, 1), 30);
$$;

revoke all on function public.fise_pentru_intrebare(extensions.vector, int) from public;
grant execute on function public.fise_pentru_intrebare(extensions.vector, int) to anon, authenticated;
