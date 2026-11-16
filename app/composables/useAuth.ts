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
  // Rolul confirmat de serverul de Auth (getUser validează token-ul), o dată pe token. Claims-urile de mai sus
  // sunt citite local, fără semnătură: ajung pentru a ascunde, nu și pentru a arăta ceva de admin.
  const confirmat = useState<{ token: string, ok: boolean } | null>('auth:admin-confirmat', () => null)
  const superAdminConfirmat = computed(() => superAdmin.value && confirmat.value?.token === sesiune.value?.access_token && confirmat.value.ok)
  async function confirmaSuperAdmin(): Promise<boolean> {
    const token = sesiune.value?.access_token
    if (!superAdmin.value || !token) return false
    if (confirmat.value?.token !== token) {
      let ok = false
      try {
        const { data, error } = await client.auth.getUser()
        ok = !error && data.user?.app_metadata?.role === 'super_admin'
      } catch {}
      confirmat.value = { token, ok }
    }
    return confirmat.value.ok
  }

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

  return { utilizator, autentificat, superAdmin, superAdminConfirmat, confirmaSuperAdmin, intraCuGoogle, iese }
}
