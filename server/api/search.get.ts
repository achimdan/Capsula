import { serverSupabaseClient } from '#supabase/server'

// Căutare hibridă în fișele publicate: text (fără diacritice) + sens (vector), într-un singur RPC.
// Fără legătura AI (în `nuxt dev`) rămâne doar căutarea pe text. Întoarce doar id-uri, în ordinea relevanței:
// fișele întregi le are deja clientul (useFise).
export default defineEventHandler(async (event) => {
  const q = String(getQuery(event).q ?? '').trim().slice(0, 200)
  if (q.length < 2) return { ids: [] as string[], semantic: false }

  const ai = legaturaAi(event)
  let embedding: number[] | null = null
  if (ai) {
    try {
      embedding = (await vectori(ai, [q]))[0] ?? null
    } catch (e) {
      console.error('search: embedding eșuat', e)
    }
  }

  const supabase = await serverSupabaseClient(event)
  const { data, error } = await supabase.rpc('cauta_fise', {
    q,
    query_embedding: embedding ? `[${embedding.join(',')}]` : null,
    match_count: 24
  })
  if (error) throw createError({ statusCode: 502, statusMessage: 'Căutarea nu a mers' })

  setHeader(event, 'cache-control', 'private, max-age=300')
  return { ids: ((data ?? []) as { fisa_id: string }[]).map(r => r.fisa_id), semantic: embedding !== null }
})
