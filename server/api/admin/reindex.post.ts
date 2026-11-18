import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { MODEL_EMBEDDING, textFisa } from '#shared/utils/cautare'

// Reface vectorii fișelor schimbate de la ultima indexare. Doar super adminul: verificat aici, ca să nu
// cheltuim Workers AI degeaba, și din nou de RLS la scriere. Rulează cu sesiunea lui, fără chei secrete.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (user?.app_metadata?.role !== 'super_admin') throw createError({ statusCode: 403, statusMessage: 'Doar pentru admin' })

  const ai = legaturaAi(event)
  if (!ai) throw createError({ statusCode: 503, statusMessage: 'Workers AI lipsește (merge doar pe Worker)' })

  const supabase = await serverSupabaseClient(event)
  const [fise, existente] = await Promise.all([
    supabase.from('fise').select('id, titlu, nota, an, an_exact, categorie, oras'),
    supabase.from('fise_embeddings').select('fisa_id, content_hash, model')
  ])
  if (fise.error || existente.error) throw createError({ statusCode: 502, statusMessage: 'Nu am putut citi fișele' })

  const vechi = new Map(existente.data.map(e => [e.fisa_id, e]))
  const deFacut: { id: string, text: string, hash: string }[] = []
  for (const f of fise.data) {
    const text = textFisa(f)
    const hash = await sha256(text)
    const e = vechi.get(f.id)
    if (!e || e.content_hash !== hash || e.model !== MODEL_EMBEDDING) deFacut.push({ id: f.id, text, hash })
  }

  if (deFacut.length) {
    const v = await vectori(ai, deFacut.map(d => d.text))
    const { error } = await supabase.from('fise_embeddings').upsert(deFacut.map((d, i) => ({
      fisa_id: d.id,
      model: MODEL_EMBEDDING,
      content_hash: d.hash,
      embedding: `[${v[i]!.join(',')}]`,
      updated_at: new Date().toISOString()
    })))
    if (error) throw createError({ statusCode: 502, statusMessage: 'Nu am putut salva vectorii' })
  }

  return { total: fise.data.length, reindexate: deFacut.length }
})
