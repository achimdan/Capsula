-- Capsula: fișele scrise de fiecare utilizator („amintirile tale”), vizibile doar lui.
-- Nu intră în „Ghicește anul”, Caseta zilei sau Random Hit: sunt amintiri, nu fapte verificate.
-- Categoriile sunt aceleași ca tipul Categorie din app/data/fise.ts.

create table public.user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  note text not null default '' check (char_length(note) <= 500),
  year smallint not null check (year between 1900 and 2100),
  category text not null check (category in ('Evenimente', 'Muzică', 'Filme & TV', 'Obiecte & Haine', 'Mâncare', 'Locuri')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Toate citirile sunt „ale mele, în ordinea anilor”.
create index user_cards_user_year_idx on public.user_cards (user_id, year);

create trigger user_cards_set_updated_at
  before update on public.user_cards
  for each row execute function public.set_updated_at();

-- Cel mult 200 de fișe pe cont, ca un client stricat să nu umple tabelul.
-- security invoker: numără doar ce vede utilizatorul prin RLS, adică rândurile lui.
create or replace function public.user_cards_limit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select count(*) from public.user_cards where user_id = new.user_id) >= 200 then
    raise exception 'Ai atins limita de 200 de fișe.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

revoke execute on function public.user_cards_limit() from public, anon;

create trigger user_cards_limit_before_insert
  before insert on public.user_cards
  for each row execute function public.user_cards_limit();

-- Acces: doar utilizatorii autentificați, doar pe rândurile lor. anon nu vede nimic.
revoke all on table public.user_cards from anon;
grant select, insert, update, delete on table public.user_cards to authenticated;
-- Drepturile implicite din Supabase dau și TRUNCATE (care ocolește RLS), REFERENCES și TRIGGER: le scoatem.
revoke truncate, references, trigger on table public.user_cards from authenticated;

alter table public.user_cards enable row level security;

create policy "user_cards: read own" on public.user_cards
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_cards: insert own" on public.user_cards
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_cards: update own" on public.user_cards
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_cards: delete own" on public.user_cards
  for delete to authenticated
  using ((select auth.uid()) = user_id);
