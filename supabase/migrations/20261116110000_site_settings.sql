-- Setările din /admin: valabile pentru tot site-ul, citite de oricine, scrise doar de super admin.
-- O setare = un rând (cheie, valoare jsonb). Prima: fundalul paginii.

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  -- Doar chei cunoscute, cu valori valide (aceeași listă ca FUNDALURI_VALIDE din app/utils/setari.ts).
  constraint site_settings_known_key check (key in ('fundal')),
  constraint site_settings_fundal_value check (
    key <> 'fundal' or value #>> '{}' in ('clasic', 'tapet', 'vhs', 'arhiva')
  )
);

-- Cine și când a schimbat setarea: puse de baza de date, nu de client.
create or replace function public.site_settings_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

revoke execute on function public.site_settings_stamp() from public, anon, authenticated;

create trigger site_settings_stamp
  before insert or update on public.site_settings
  for each row execute function public.site_settings_stamp();

grant select on table public.site_settings to anon, authenticated;
grant insert, update on table public.site_settings to authenticated;

alter table public.site_settings enable row level security;

create policy "site_settings: read all" on public.site_settings
  for select to anon, authenticated
  using (true);

create policy "site_settings: insert super admin" on public.site_settings
  for insert to authenticated
  with check ((select public.is_super_admin()));

create policy "site_settings: update super admin" on public.site_settings
  for update to authenticated
  using ((select public.is_super_admin()))
  with check ((select public.is_super_admin()));

insert into public.site_settings (key, value, updated_by) values ('fundal', '"clasic"', null)
on conflict (key) do nothing;
