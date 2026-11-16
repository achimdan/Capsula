-- Module din /admin: Prețuri de atunci, La TV, Azi demult, stratul București.
-- Câte un rând boolean pe modul (aceleași chei ca MODULE din app/utils/setari.ts). Toate pornesc oprite.

alter table public.site_settings drop constraint site_settings_known_key;
alter table public.site_settings add constraint site_settings_known_key
  check (key in ('fundal', 'lista_fise', 'modul_preturi', 'modul_tv', 'modul_azi', 'modul_bucuresti'));

alter table public.site_settings add constraint site_settings_modul_value
  check (key not like 'modul\_%' or jsonb_typeof(value) = 'boolean');

insert into public.site_settings (key, value) values
  ('modul_preturi', 'false'),
  ('modul_tv', 'false'),
  ('modul_azi', 'false'),
  ('modul_bucuresti', 'false')
on conflict (key) do nothing;
