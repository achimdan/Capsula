-- Fișele Capsulei, mutate din app/data/fise.ts. Citite de oricine (doar cele publicate), scrise doar de super admin.
-- Coloanele urmează tipul Fisa din app/data/fise.ts; maparea rând → Fisa e în app/utils/fise.ts.
-- Datele inițiale: supabase/seed/fise.json → `node scripts/seed-fise.mjs` (SQL de import, idempotent).
-- `publicat` nu e `verificat`: fișele neverificate se văd și azi; `publicat = false` le ascunde de tot.

create table public.fise (
  id text primary key,
  -- Ordinea din fostul tablou FISE: o folosesc banda anilor, Caseta zilei, grila și ceața fișelor.
  ordine integer not null unique,
  titlu text not null,
  nota text not null,
  an smallint not null,
  an_exact boolean not null,
  categorie text not null,
  oras text,
  verificat boolean not null default false,
  publicat boolean not null default true,
  sursa text,
  culori text[] not null,
  poza_autor text,
  poza_licenta text,
  poza_url text,
  poza_generata boolean,
  video_autor text,
  video_licenta text,
  video_url text,
  scena text,
  embed_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fise_id_format check (id ~ '^[A-Z]{2}-[0-9]{4}$'),
  constraint fise_an_range check (an between 1980 and 2010),
  constraint fise_titlu_len check (char_length(titlu) between 1 and 200),
  constraint fise_nota_len check (char_length(nota) between 1 and 2000),
  -- Aceeași listă ca tipul Categorie din app/data/fise.ts.
  constraint fise_categorie_valid check (categorie in ('Evenimente', 'Muzică', 'Filme & TV', 'Obiecte & Haine', 'Mâncare', 'Locuri')),
  -- Aceeași listă ca SCENE din app/data/chestionar.ts.
  constraint fise_scena_valid check (scena is null or scena in ('pop', 'rock', 'hiphop', 'dance', 'manele', 'alternativ')),
  constraint fise_culori_valid check (
    array_length(culori, 1) = 2 and culori[1] ~ '^#[0-9A-Fa-f]{6}$' and culori[2] ~ '^#[0-9A-Fa-f]{6}$'
  ),
  -- Poza și filmul au mereu autor și licență, sau deloc.
  constraint fise_poza_completa check ((poza_autor is null) = (poza_licenta is null)
    and (poza_autor is not null or (poza_url is null and poza_generata is null))),
  constraint fise_video_completa check ((video_autor is null) = (video_licenta is null)
    and (video_autor is not null or video_url is null))
);

create index fise_an_idx on public.fise (an);
create index fise_categorie_idx on public.fise (categorie);

create or replace function public.fise_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.fise_stamp() from public, anon, authenticated;

create trigger fise_stamp
  before update on public.fise
  for each row execute function public.fise_stamp();

revoke all on table public.fise from anon, authenticated;
grant select on table public.fise to anon, authenticated;
grant insert, update, delete on table public.fise to authenticated;

alter table public.fise enable row level security;

create policy "fise: read published" on public.fise
  for select to anon, authenticated
  using (publicat or (select public.is_super_admin()));

create policy "fise: insert super admin" on public.fise
  for insert to authenticated
  with check ((select public.is_super_admin()));

create policy "fise: update super admin" on public.fise
  for update to authenticated
  using ((select public.is_super_admin()))
  with check ((select public.is_super_admin()));

create policy "fise: delete super admin" on public.fise
  for delete to authenticated
  using ((select public.is_super_admin()));
