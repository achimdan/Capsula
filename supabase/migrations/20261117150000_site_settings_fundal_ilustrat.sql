-- Fundaluri ilustrate alese din /admin: bloc la apus, pop anii '90, televizor în întuneric.
-- Aceeași listă ca FUNDALURI_VALIDE din app/utils/setari.ts.
-- Un fundal care nu mai există în cod revine la „clasic”, altfel constrângerea nouă nu se poate pune.
update public.site_settings set value = '"clasic"'::jsonb
  where key = 'fundal' and value #>> '{}' not in ('clasic', 'tapet', 'vhs', 'arhiva', 'ceata', 'bloc', 'pop', 'televizor');
alter table public.site_settings drop constraint site_settings_fundal_value;
alter table public.site_settings add constraint site_settings_fundal_value check (
  key <> 'fundal' or value #>> '{}' in ('clasic', 'tapet', 'vhs', 'arhiva', 'ceata', 'bloc', 'pop', 'televizor')
);
