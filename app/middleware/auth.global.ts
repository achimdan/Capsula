// Decizie pe client: sesiunea Supabase e citită local de pluginul modulului înainte de middleware.
const LIBERE = ['/', '/confirm']
// Autentificat fără profil: doar aici are voie (testul, întoarcerea din Google și admin-ul).
const FARA_PROFIL = ['/start', '/confirm', '/admin']

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const { autentificat, superAdmin } = useAuth()
  // /admin: doar super adminul (rolul din JWT + sesiune Google); altfel pare că nu există.
  if (to.path === '/admin' && !superAdmin.value) return navigateTo('/')
  if (!autentificat.value) {
    if (!LIBERE.includes(to.path)) return navigateTo('/')
    return
  }
  // Datele contului înainte de decizie: altfel, la reîncărcare, oricine ar fi trimis la /start.
  await useCont().incarca()
  const { areProfil } = useCapsula()
  if (!areProfil.value && !FARA_PROFIL.includes(to.path)) return navigateTo('/start')
})
