// Prima indexare (sau una completă, fără Worker): citește fișele publicate din Supabase cu cheia publishable,
// face vectorii cu Workers AI prin `cf` și scrie în tmp/fise_embeddings.sql un upsert de rulat în SQL editor.
// În producție, reindexarea obișnuită e butonul din /admin (POST /api/admin/reindex), care sare peste fișele neschimbate.
//
//   node --env-file=.env scripts/index-fise.mjs
//
// Cere `cf` autentificat (cf auth login) și Node ≥ 23 (rulează TypeScript direct).
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { MODEL_EMBEDDING, textFisa } from '../shared/utils/cautare.ts'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL
const cheie = process.env.NUXT_PUBLIC_SUPABASE_KEY
if (!url || !cheie) throw new Error('Lipsesc NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_KEY (rulează cu --env-file=.env)')

const raspuns = await fetch(`${url}/rest/v1/fise?select=id,titlu,nota,an,an_exact,categorie,oras&order=ordine`, {
  headers: { apikey: cheie, authorization: `Bearer ${cheie}` }
})
if (!raspuns.ok) throw new Error(`Supabase: ${raspuns.status} ${await raspuns.text()}`)
const fise = await raspuns.json()

const tmp = fileURLToPath(new URL('../tmp', import.meta.url))
mkdirSync(tmp, { recursive: true })

const texte = fise.map(f => ({ id: f.id, text: textFisa(f) }))
const vectori = []
for (let i = 0; i < texte.length; i += 50) {
  const lot = texte.slice(i, i + 50)
  const corp = `${tmp}/embed-body.json`
  writeFileSync(corp, JSON.stringify({ text: lot.map(t => t.text) }))
  const iesire = execFileSync('cf', ['ai', 'run', MODEL_EMBEDDING, '--body', `@${corp}`, '-q'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const { data } = JSON.parse(iesire.slice(iesire.indexOf('{')))
  if (!Array.isArray(data) || data.length !== lot.length || data.some(v => v.length !== 1024)) throw new Error(`Răspuns neașteptat pentru lotul ${i}`)
  vectori.push(...data)
  console.error(`${Math.min(i + 50, texte.length)}/${texte.length}`)
}

const sqlText = s => `'${s.replaceAll('\'', '\'\'')}'`
const randuri = texte.map((t, i) => {
  const hash = createHash('sha256').update(t.text).digest('hex')
  return `(${sqlText(t.id)}, ${sqlText(MODEL_EMBEDDING)}, '${hash}', '[${vectori[i].join(',')}]')`
})
writeFileSync(`${tmp}/fise_embeddings.sql`, `-- Generat de scripts/index-fise.mjs, ${new Date().toISOString()}
insert into public.fise_embeddings (fisa_id, model, content_hash, embedding) values
${randuri.join(',\n')}
on conflict (fisa_id) do update set model = excluded.model, content_hash = excluded.content_hash,
  embedding = excluded.embedding, updated_at = now();
select count(*) as indexate from public.fise_embeddings;
`)
console.error(`Scris tmp/fise_embeddings.sql (${texte.length} fișe)`)
