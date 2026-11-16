// Supabase Auth: doar Google. superAdmin vine din claims (vezi esteSuperAdmin în utils/auth.ts).
// Sesiunea vine din @nuxtjs/supabase, citită local; nu facem cereri la Auth la fiecare navigare.
export interface Utilizator { id: string, email: string, nume: string | null, avatar: string | null }

export function useAuth() {
  const client = useSupabaseClient()
  const sesiune = useSupabaseSession()
  // Claims-urile din JWT, citite local (vezi plugins/supabase-auth.client.ts).
  const claims = useSupabaseUser()

  const utilizator = computed<Utilizator | null>(() => {
    const c = claims.value
    if (!sesiune.value || !c?.sub) return null
    return { id: c.sub, email: c.email ?? '', ...dateProfilCont(c.user_metadata) }
  })
  const autentificat = computed(() => !!sesiune.value)
  const superAdmin = computed(() => !!sesiune.value && esteSuperAdmin(claims.value))

  function adresaConfirmare() {
    return new URL('/confirm', window.location.origin).toString()
  }

  // Pleacă spre Google și se întoarce pe /confirm.
  async function intraCuGoogle() {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: adresaConfirmare() }
    })
    if (error) throw error
  }

  async function iese() {
    await client.auth.signOut()
    sesiune.value = null
    claims.value = null
  }

  return { utilizator, autentificat, superAdmin, intraCuGoogle, iese }
}
