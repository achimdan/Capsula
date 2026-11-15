// Decizie pe client: sesiunea Supabase e citită local de pluginul modulului înainte de middleware.
const LIBERE = ['/', '/login', '/confirm', '/admin']
// Autentificat fără profil: doar aici are voie (testul, login-ul, întoarcerea din link și admin-ul).
const FARA_PROFIL = ['/start', '/login', '/confirm', '/admin']

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const { autentificat } = useAuth()
  if (!autentificat.value) {
    if (!LIBERE.includes(to.path)) return navigateTo('/')
    return
  }
  const { areProfil } = useCapsula()
  if (!areProfil.value && !FARA_PROFIL.includes(to.path)) return navigateTo('/start')
})
