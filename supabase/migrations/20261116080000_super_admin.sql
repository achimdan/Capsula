-- Super admin: un singur cont, cel de Google al proprietarului.
-- Rolul stă în app_metadata (ajunge în JWT, nu poate fi schimbat de utilizator) și e derivat aici,
-- la fiecare scriere în auth.users: îl primește doar adresa de mai jos, și doar după ce a intrat cu Google.
-- Oricui altcuiva i se scoate, chiar dacă cineva l-ar pune manual.

create or replace function public.sync_super_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
begin
  if lower(new.email) = 'carlospacu@gmail.com'
     and coalesce(meta -> 'providers', '[]'::jsonb) ? 'google' then
    new.raw_app_meta_data := meta || '{"role":"super_admin"}'::jsonb;
  elsif meta ->> 'role' = 'super_admin' then
    new.raw_app_meta_data := meta - 'role';
  end if;
  return new;
end;
$$;

revoke execute on function public.sync_super_admin() from public, anon, authenticated;

create trigger on_auth_user_super_admin
  before insert or update of email, raw_app_meta_data on auth.users
  for each row execute function public.sync_super_admin();

-- Pentru politici RLS viitoare: rolul din JWT și o sesiune deschisă cu Google (amr = oauth).
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin'
     and exists (
       select 1 from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) as m
       where m ->> 'method' = 'oauth'
     );
$$;

-- Contul existent, dacă e deja legat de Google: trigger-ul de mai sus pune rolul.
update auth.users set raw_app_meta_data = raw_app_meta_data
where lower(email) = 'carlospacu@gmail.com';
