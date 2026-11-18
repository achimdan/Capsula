-- Textul alternativ al pozei: ce se vede în imagine, pentru cititoarele de ecran. Îl propune Workers AI
-- (scripts/alt-fise.mjs) și îl poate corecta super adminul. Descrie poza, nu fapte despre fișă.
-- Grantul pe tabel (select pentru anon și authenticated) acoperă și coloana nouă.
alter table public.fise add column poza_alt text
  check (poza_alt is null or char_length(poza_alt) between 1 and 200);
