-- Fundalul „Casetă 3D”, ales din /admin.
-- Aceeași listă ca FUNDALURI_VALIDE din app/utils/setari.ts.
alter table public.site_settings drop constraint site_settings_fundal_value;
alter table public.site_settings add constraint site_settings_fundal_value check (
  key <> 'fundal' or value #>> '{}' in ('clasic', 'tapet', 'vhs', 'arhiva', 'ceata', 'bloc', 'pop', 'televizor', 'televizor-90', 'caseta')
);
