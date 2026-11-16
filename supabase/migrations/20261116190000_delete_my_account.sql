-- Ștergerea contului de către utilizator (GDPR, dreptul la ștergere), fără service role key în aplicație.
-- Șterge rândul din auth.users al celui care cheamă funcția; restul pleacă prin cascade:
-- profiles, questionnaire_responses, tape_items și user_cards au `on delete cascade`,
-- iar site_settings.updated_by devine null. Identitățile și sesiunile Google pleacă odată cu contul.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
