import { serverSupabaseClient } from '#supabase/server'
import {
  MODEL_RASPUNS, FISE_IN_CONTEXT, RASPUNS_FARA_FISE, PROMPT_SISTEM,
  fisaVizibila, contextFise, citari, faraCitariInventate, diacriticeCorecte, type FisaContext
} from '#shared/utils/intrebare'

// „Întreabă-mi capsula”: caută fișele apropiate de întrebare (după sens), păstrează naționalele și orașele deblocate
// și cere modelului un răspuns scurt, doar din ele, cu citare. Fără fișe nu chemăm modelul deloc.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ q?: unknown, orase?: unknown }>(event)
  const q = String(body?.q ?? '').trim().replace(/\s+/g, ' ').slice(0, 200)
  const orase = (Array.isArray(body?.orase) ? body.orase : []).filter((o): o is string => typeof o === 'string').slice(0, 12)
  if (q.length < 3) throw createError({ statusCode: 400, statusMessage: 'Întrebarea e prea scurtă' })

  const ai = legaturaAi(event)
  if (!ai) throw createError({ statusCode: 503, statusMessage: 'Răspunsurile nu sunt disponibile acum' })

  const [embedding] = await vectori(ai, [q])
  const supabase = await serverSupabaseClient(event)
  const { data: apropiate, error } = await supabase.rpc('fise_pentru_intrebare', {
    query_embedding: `[${embedding!.join(',')}]`,
    match_count: 20
  })
  if (error) throw createError({ statusCode: 502, statusMessage: 'Căutarea nu a mers' })

  const ids = ((apropiate ?? []) as { fisa_id: string }[]).map(r => r.fisa_id)
  let fise: FisaContext[] = []
  if (ids.length) {
    const { data, error: e } = await supabase.from('fise')
      .select('id,titlu,nota,an,an_exact,categorie,oras,verificat')
      .in('id', ids).eq('publicat', true)
    if (e) throw createError({ statusCode: 502, statusMessage: 'Fișele nu s-au încărcat' })
    const dupaId = new Map((data as FisaContext[]).map(f => [f.id, f]))
    fise = ids.flatMap(id => dupaId.get(id) ?? []).filter(f => fisaVizibila(f, orase)).slice(0, FISE_IN_CONTEXT)
  }

  setHeader(event, 'cache-control', 'no-store')
  if (!fise.length) return { raspuns: RASPUNS_FARA_FISE, surse: [] as string[] }

  const permise = fise.map(f => f.id)
  const brut = await raspuns(ai, MODEL_RASPUNS, [
    { role: 'system', content: `${PROMPT_SISTEM}\n\nFișe:\n${contextFise(fise)}` },
    { role: 'user', content: q }
  ], 400)
  const text = diacriticeCorecte(faraCitariInventate(brut, permise)) || RASPUNS_FARA_FISE
  return { raspuns: text, surse: citari(text, permise) }
})
