// PROVIZORIU: decizie doar pe client (localStorage). Vezi useAuth.
const LIBERE = ['/', '/login', '/admin']
// Autentificat fără profil: doar aici are voie (testul, login-ul și admin-ul).
const FARA_PROFIL = ['/start', '/login', '/admin']

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
