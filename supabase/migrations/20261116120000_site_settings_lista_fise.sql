-- A doua setare din /admin: cum se afișează „Ce era peste tot” (grila de polaroiduri sau cronologia pe bandă).
-- Aceleași valori ca LISTE_FISE_VALIDE din app/utils/setari.ts.

alter table public.site_settings drop constraint site_settings_known_key;
alter table public.site_settings add constraint site_settings_known_key
  check (key in ('fundal', 'lista_fise'));

alter table public.site_settings add constraint site_settings_lista_fise_value
  check (key <> 'lista_fise' or value #>> '{}' in ('grila', 'cronologie'));

insert into public.site_settings (key, value) values ('lista_fise', '"grila"')
on conflict (key) do nothing;
