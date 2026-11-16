-- Intrarea cu Google e deschisă oricui. Scoatem allowlist-ul; rolul de super admin rămâne
-- doar pentru contul proprietarului (trigger-ul on_auth_user_super_admin, neschimbat).

drop trigger if exists enforce_auth_allowlist on auth.users;
drop function if exists public.enforce_auth_allowlist();
drop function if exists public.is_allowed_email(text);
drop function if exists public.normalize_email(text);
