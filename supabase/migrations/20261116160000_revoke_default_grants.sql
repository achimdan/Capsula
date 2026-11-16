-- Drepturile implicite din Supabase dau rolurilor anon și authenticated și TRUNCATE (care ocolește RLS), REFERENCES și TRIGGER
-- pe orice tabel nou din public. Nu ne trebuie niciunul: accesul trece doar prin select/insert/update/delete, cu RLS.

revoke truncate, references, trigger on table
  public.profiles,
  public.questionnaire_responses,
  public.tape_items,
  public.site_settings,
  public.user_cards
from anon, authenticated;
