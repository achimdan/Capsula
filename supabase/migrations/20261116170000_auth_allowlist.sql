-- Doar conturile din listă pot intra (cont nou sau login nou). Lista a fost creată întâi direct în baza de date;
-- aici intră în repo, cu o reparație: Gmail ignoră punctele și ce e după „+” în partea dinaintea lui @,
-- iar Google trimite adresa așa cum a scris-o omul (ex. achim.dan84@gmail.com). Comparăm forma normalizată.

create or replace function public.normalize_email(email text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when split_part(e, '@', 2) in ('gmail.com', 'googlemail.com')
      then replace(split_part(split_part(e, '@', 1), '+', 1), '.', '') || '@gmail.com'
    else e
  end
  from (select lower(btrim(coalesce(email, ''))) as e) as x;
$$;

create or replace function public.is_allowed_email(email text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select public.normalize_email(email) = any (array[
    'carlospacu@gmail.com',
    'achimdan84@gmail.com'
  ]);
$$;

create or replace function public.enforce_auth_allowlist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Cont nou, sau un cont existent care intră din nou (last_sign_in_at se schimbă).
  if (tg_op = 'INSERT' or new.last_sign_in_at is distinct from old.last_sign_in_at)
     and not public.is_allowed_email(new.email) then
    raise exception 'sign-in not allowed for this account'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_auth_allowlist on auth.users;
create trigger enforce_auth_allowlist
  before insert or update on auth.users
  for each row execute function public.enforce_auth_allowlist();

-- Nimeni nu le apelează prin API (altfel oricine ar putea verifica ce adrese sunt în listă).
revoke execute on function public.normalize_email(text) from public, anon, authenticated;
revoke execute on function public.is_allowed_email(text) from public, anon, authenticated;
revoke execute on function public.enforce_auth_allowlist() from public, anon, authenticated;
