-- Navigarea fără cont: vizitatorii (anon) citesc setările site-ului (module, fundal, lista de fișe), nimic altceva.
-- RLS blochează deja scrierile (politicile de insert/update cer super admin), dar anon păstra grant-urile implicite
-- de scriere ale Supabase pe tabelă: PATCH ca anon răspundea 200 cu 0 rânduri. Le scoatem, ca a doua barieră.
-- Ștergerea nu are politică pentru nimeni; o scoatem și de la authenticated.
revoke insert, update, delete, truncate, references, trigger on table public.site_settings from anon;
revoke delete, truncate, references, trigger on table public.site_settings from authenticated;
grant select on table public.site_settings to anon, authenticated;
