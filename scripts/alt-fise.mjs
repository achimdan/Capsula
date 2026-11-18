// Texte alternative pentru pozele fișelor: citește din Supabase fișele publicate cu poză și fără `poza_alt`,
// descrie fiecare poză (public/fise/<id>-480.webp) cu un model de imagini din Workers AI, prin `cf`,
// și scrie în tmp/fise_alt.sql update-urile de rulat în SQL editor. Rulat din nou, sare peste fișele care au deja text.
//
//   node --env-file=.env scripts/alt-fise.mjs
//
// Cere `cf` autentificat (cf auth login) și Node 22.18+ (rulează TypeScript direct).
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { MODEL_ALT, curataAlt, promptAlt } from '../shared/utils/altPoza.ts'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL
const cheie = process.env.NUXT_PUBLIC_SUPABASE_KEY
if (!url || !cheie) throw new Error('Lipsesc NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_KEY (rulează cu --env-file=.env)')

const raspuns = await fetch(`${url}/rest/v1/fise?select=id,titlu&poza_autor=not.is.null&poza_alt=is.null&order=ordine`, {
  headers: { apikey: cheie, authorization: `Bearer ${cheie}` }
})
if (!raspuns.ok) throw new Error(`Supabase: ${raspuns.status} ${await raspuns.text()}`)
const fise = await raspuns.json()

const radacina = fileURLToPath(new URL('..', import.meta.url))
const tmp = `${radacina}tmp`
mkdirSync(tmp, { recursive: true })
const corp = `${tmp}/alt-body.json`

const rezultate = []
for (const [i, f] of fise.entries()) {
  const poza = `${radacina}public/fise/${f.id}-480.webp`
  if (!existsSync(poza)) {
    console.error(`${f.id}: lipsește ${poza}, sar peste`)
    continue
  }
  const imagine = `data:image/webp;base64,${readFileSync(poza).toString('base64')}`
  writeFileSync(corp, JSON.stringify({
    messages: [{ role: 'user', content: [{ type: 'text', text: promptAlt(f.titlu) }, { type: 'image_url', image_url: { url: imagine } }] }],
    max_tokens: 120,
    temperature: 0.2
  }))
  const iesire = execFileSync('cf', ['ai', 'run', MODEL_ALT, '--body', `@${corp}`, '-q'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  const d = JSON.parse(iesire.slice(iesire.indexOf('{')))
  const alt = curataAlt(d.choices?.[0]?.message?.content ?? d.response ?? '')
  console.error(`${i + 1}/${fise.length} ${f.id}: ${alt ?? '(gol)'}`)
  if (alt) rezultate.push({ id: f.id, alt })
}

const sqlText = s => `'${s.replaceAll('\'', '\'\'')}'`
const sql = rezultate.map(r => `update public.fise set poza_alt = ${sqlText(r.alt)} where id = ${sqlText(r.id)} and poza_alt is null;`).join('\n')
writeFileSync(`${tmp}/fise_alt.sql`, sql + '\n')
writeFileSync(`${tmp}/fise_alt.json`, JSON.stringify(rezultate, null, 2))
console.error(`Gata: ${rezultate.length} texte în tmp/fise_alt.sql`)
