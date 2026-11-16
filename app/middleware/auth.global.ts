// Decizie pe client: sesiunea Supabase e citită local de pluginul modulului înainte de middleware.
const LIBERE = ['/', '/confirm', '/privacy']
// Autentificat fără profil: doar aici are voie (testul, întoarcerea din Google, admin-ul și confidențialitatea).
const FARA_PROFIL = ['/start', '/confirm', '/admin', '/privacy']

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const { autentificat, superAdmin, confirmaSuperAdmin } = useAuth()
  // /admin: doar super adminul (rolul din JWT + sesiune Google); altfel pare că nu există.
  if (to.path === '/admin' && !superAdmin.value) return navigateTo('/')
  // JWT-ul de mai sus e citit local, fără semnătură. Înainte de pagină întrebăm și serverul de Auth,
  // care validează token-ul și dă rolul pus de baza de date (scrierile le păzește oricum RLS).
  if (to.path === '/admin' && !(await confirmaSuperAdmin())) return navigateTo('/')
  if (!autentificat.value) {
    if (!LIBERE.includes(to.path)) return navigateTo('/')
    return
  }
  // Datele contului înainte de decizie: altfel, la reîncărcare, oricine ar fi trimis la /start.
  await useCont().incarca()
  const { areProfil } = useCapsula()
  if (!areProfil.value && !FARA_PROFIL.includes(to.path)) return navigateTo('/start')
  // Paginile modulelor oprite din /admin: pentru vizitatori nu există (adminul le vede ca să le verifice).
  if (Object.values(RUTE_MODULE).includes(to.path) && !rutaPermisa(to.path, await useSetari().citeste(), superAdmin.value)) return navigateTo('/')
})
