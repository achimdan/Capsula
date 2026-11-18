import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { categorieSugerata, FISE_CARE_SEAMANA, VECINI_PENTRU_CATEGORIE } from '#shared/utils/sugestiiFisa'

// Ajutor la „Pune și tu o fișă”: fișele din Capsulă care seamănă cu cea scrisă (poate există deja)
// și categoria propusă din vecinii ei. Doar pentru cei logați: doar ei pot scrie fișe.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Intră în cont' })

  const body = await readBody<{ titlu?: unknown, nota?: unknown }>(event)
  const titlu = String(body?.titlu ?? '').trim().replace(/\s+/g, ' ').slice(0, 120)
  const nota = String(body?.nota ?? '').trim().replace(/\s+/g, ' ').slice(0, 600)
  setHeader(event, 'cache-control', 'no-store')
  if (titlu.length < 3) return { categorie: null, seamana: [] as string[] }

  const ai = legaturaAi(event)
  if (!ai) return { categorie: null, seamana: [] as string[] }
  const [embedding] = await vectori(ai, [nota ? `${titlu}. ${nota}` : titlu])
  const vector = `[${embedding!.join(',')}]`

  const supabase = await serverSupabaseClient(event)
  // Cele care seamănă: aceeași căutare hibridă ca pe pagina de căutare (prag statistic, nu absolut),
  // cu textul doar din titlu. Vecinii pentru categorie: cei mai apropiați după sens.
  const [cautare, vecini] = await Promise.all([
    supabase.rpc('cauta_fise', { q: titlu, query_embedding: vector, match_count: FISE_CARE_SEAMANA }),
    supabase.rpc('fise_pentru_intrebare', { query_embedding: vector, match_count: VECINI_PENTRU_CATEGORIE })
  ])
  if (cautare.error || vecini.error) throw createError({ statusCode: 502, statusMessage: 'Căutarea nu a mers' })

  const idsVecini = ((vecini.data ?? []) as { fisa_id: string }[]).map(r => r.fisa_id)
  let categorie: string | null = null
  if (idsVecini.length) {
    const { data, error } = await supabase.from('fise').select('id,categorie').in('id', idsVecini).eq('publicat', true)
    if (error) throw createError({ statusCode: 502, statusMessage: 'Fișele nu s-au încărcat' })
    const dupaId = new Map((data ?? []).map(f => [f.id, f]))
    categorie = categorieSugerata(idsVecini.flatMap(id => dupaId.get(id) ?? []))
  }

  return {
    categorie,
    seamana: ((cautare.data ?? []) as { fisa_id: string }[]).map(r => r.fisa_id).slice(0, FISE_CARE_SEAMANA)
  }
})
