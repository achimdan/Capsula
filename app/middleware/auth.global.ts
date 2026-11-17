// Navigarea e liberă: arhiva, cronologia, Random Hit, „Ghicește anul”, caseta zilei și modulele pornite merg fără cont.
// Contul se cere doar la acțiunile care păstrează ceva (useIntrare().cereCont), iar testul de profil e opțional.
// Aici rămân doar două opriri: /admin și modulele oprite din /admin.
// Decizie pe client: sesiunea Supabase e citită local de pluginul modulului înainte de middleware.
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const { autentificat, superAdmin, confirmaSuperAdmin } = useAuth()
  // /admin: doar super adminul (rolul din JWT + sesiune Google); altfel pare că nu există.
  if (to.path === '/admin' && !superAdmin.value) return navigateTo('/')
  // JWT-ul de mai sus e citit local, fără semnătură. Înainte de pagină întrebăm și serverul de Auth,
  // care validează token-ul și dă rolul pus de baza de date (scrierile le păzește oricum RLS).
  if (to.path === '/admin' && !(await confirmaSuperAdmin())) return navigateTo('/')
  // Paginile modulelor oprite din /admin: pentru nimeni, logat sau nu (adminul le vede ca să le verifice).
  if (Object.values(RUTE_MODULE).includes(to.path) && !rutaPermisa(to.path, await useSetari().citeste(), superAdmin.value)) return navigateTo('/')
  // Cu cont: datele lui (profil, test, casetă) înainte de pagină, ca să nu apară o clipă cele din browser.
  if (autentificat.value) await useCont().incarca()
})
