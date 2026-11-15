import type { JwtPayload } from '@supabase/supabase-js'

// @nuxtjs/supabase cheamă auth.getClaims() la fiecare navigare (page:start). Pentru token-uri HS256
// asta devine o cerere /auth/v1/user pe pagină. Citim claims-urile local din access token, cu cache pe token.
// Autorizarea reală rămâne în RLS; claims-urile de aici sunt doar pentru UI.
export default defineNuxtPlugin({
  name: 'supabase-auth-cache',
  dependsOn: ['supabase'],
  setup() {
    const client = useSupabaseClient()
    const original = client.auth.getClaims.bind(client.auth)
    let cache: { token: string, claims: JwtPayload } | null = null

    client.auth.getClaims = (async (...args: Parameters<typeof original>) => {
      const { data } = await client.auth.getSession()
      const token = data.session?.access_token
      if (!token) {
        cache = null
        return { data: null, error: null }
      }
      if (cache?.token !== token) {
        const claims = decodeazaJwt<JwtPayload>(token)
        if (!claims) return original(...args)
        cache = { token, claims }
      }
      return { data: { claims: cache.claims, header: { alg: 'none' }, signature: new Uint8Array() }, error: null }
    }) as typeof client.auth.getClaims

    // Contul provizoriu din browser (înainte de Supabase) nu mai e folosit.
    try { localStorage.removeItem('capsula:auth') } catch {}
  }
})
