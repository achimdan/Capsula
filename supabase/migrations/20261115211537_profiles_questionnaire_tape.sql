-- Capsula: profilul, chestionarul și caseta fiecărui utilizator.
-- Fiecare rând aparține unui singur utilizator; RLS lasă pe fiecare să-și vadă și să-și modifice doar datele lui.

-- updated_at ținut la zi de baza de date, nu de client.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: anul nașterii, orașul copilăriei și profilul „Capsula te citește”.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  birth_year smallint check (birth_year between 1930 and 2020),
  -- null intenționat pentru „La sat” și „Prefer să nu spun”.
  city text check (char_length(city) <= 40),
  -- Localitatea copilăriei, din SIRUTA (public/data/localitati.json). Restul coloanelor sunt o copie
  -- a datelor din listă la momentul alegerii, ca profilul să poată fi interogat fără fișier.
  locality_siruta integer check (locality_siruta > 0),
  locality_name text check (char_length(locality_name) <= 80),
  locality_county text check (char_length(locality_county) <= 40),
  locality_province text check (locality_province in
    ('Transilvania', 'Banat', 'Crișana', 'Maramureș', 'Moldova', 'Bucovina', 'Muntenia', 'Oltenia', 'Dobrogea')),
  locality_development_region text check (char_length(locality_development_region) <= 40),
  locality_is_urban boolean,
  -- id-ul profilului din app/data/profiluri.ts
  reader_profile_id text check (char_length(reader_profile_id) <= 40),
  -- scorurile pe trăsături: { "<trasatura>": number }
  reader_traits jsonb check (reader_traits is null or jsonb_typeof(reader_traits) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- questionnaire_responses: răspunsurile și pasul curent, ca testul să poată fi reluat pe alt dispozitiv.
-- ---------------------------------------------------------------------------
create table public.questionnaire_responses (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- { "<id intrebare>": string | string[] | number | null }
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  step smallint not null default 0 check (step >= 0),
  is_retake boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger questionnaire_responses_set_updated_at
  before update on public.questionnaire_responses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- tape_items: fișele salvate în „caseta ta”.
-- ---------------------------------------------------------------------------
create table public.tape_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- id-ul fișei din app/data/fise.ts
  card_id text not null check (char_length(card_id) between 1 and 80),
  added_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

-- ---------------------------------------------------------------------------
-- Profil gol la crearea contului (magic link sau Google).
-- security definer: rulează ca owner ca să poată scrie în public.profiles din schema auth.
-- Nu e apelabil prin API (funcție de trigger, fără EXECUTE pentru roluri publice).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Acces: doar utilizatorii autentificați, doar pe rândurile lor. anon nu vede nimic.
-- ---------------------------------------------------------------------------
revoke all on table public.profiles, public.questionnaire_responses, public.tape_items from anon;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.questionnaire_responses to authenticated;
grant select, insert, delete on table public.tape_items to authenticated;

alter table public.profiles enable row level security;
alter table public.questionnaire_responses enable row level security;
alter table public.tape_items enable row level security;

-- profiles (rândul se șterge doar odată cu contul, prin cascade)
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: insert own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- questionnaire_responses
create policy "questionnaire: read own" on public.questionnaire_responses
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "questionnaire: insert own" on public.questionnaire_responses
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "questionnaire: update own" on public.questionnaire_responses
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "questionnaire: delete own" on public.questionnaire_responses
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- tape_items
create policy "tape: read own" on public.tape_items
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "tape: insert own" on public.tape_items
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "tape: delete own" on public.tape_items
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Conturile create înainte de această migrație (de ex. la un test de login) primesc și ele profil.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
