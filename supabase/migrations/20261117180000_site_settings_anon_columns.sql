-- Vizitatorii (anon) citesc doar cheia și valoarea setărilor, nu și cine/când le-a schimbat (updated_by e UUID-ul super adminului).
-- Aplicația citește oricum doar `key, value` (app/utils/api.ts).
revoke select on table public.site_settings from anon;
grant select (key, value) on table public.site_settings to anon;
