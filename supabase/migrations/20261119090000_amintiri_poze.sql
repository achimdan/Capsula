-- Capsula: pozele de la „Pune și tu o fișă”. Bucket privat `amintiri`, câte un folder pe utilizator: <user_id>/<poza>-480.webp și -960.webp.
-- Browserul urcă doar variantele redimensionate (fără original și fără EXIF, deci fără locația GPS din telefon).
-- Pozele se văd prin linkuri semnate, temporare. Le vede proprietarul și super adminul (managerul de fișiere din /admin).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('amintiri', 'amintiri', false, 2097152, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Numele fișierelor: <uuid utilizator>/<uuid poză>-<480|960>.webp (sau .jpg pe Safari fără encoder WebP).
create or replace function public.amintiri_cale_valida(nume text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select nume ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}-(480|960)\.(webp|jpg)$'
$$;

revoke execute on function public.amintiri_cale_valida(text) from public, anon;
grant execute on function public.amintiri_cale_valida(text) to authenticated;

create policy "amintiri: read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'amintiri' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "amintiri: insert own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'amintiri'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.amintiri_cale_valida(name)
  );

create policy "amintiri: delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'amintiri' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Super adminul vede și șterge toate pozele (managerul de fișiere din /admin). Nu urcă în numele altora.
create policy "amintiri: super admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'amintiri' and (select public.is_super_admin()));

create policy "amintiri: super admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'amintiri' and (select public.is_super_admin()));

-- Fișa ține calea comună a variantelor, fără lățime și extensie: <user_id>/<uuid poză>.
alter table public.user_cards
  add column photo text check (photo ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}$'),
  add column photo_ext text check (photo_ext in ('webp', 'jpg')),
  add constraint user_cards_photo_own check (photo is null or split_part(photo, '/', 1) = user_id::text),
  add constraint user_cards_photo_ext check ((photo is null) = (photo_ext is null));
