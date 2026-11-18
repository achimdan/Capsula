// Importul fișelor: supabase/seed/fise.json → SQL pentru tabelul public.fise (migrația 20261118120000_fise.sql).
// Copiază datele exact, nu schimbă și nu completează nimic. Idempotent: rulat din nou, aduce rândurile la valorile din JSON.
//
//   node scripts/seed-fise.mjs           → scrie SQL-ul de import (pentru SQL editorul Supabase)
//   node scripts/seed-fise.mjs --check   → scrie interogarea de verificare și suma de control așteptată
//
// Fără dependențe și fără API-uri de rețea: doar citește JSON-ul și scrie text.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
// Aceeași mapare ca aplicația (Node ≥ 23 rulează TypeScript direct).
import { randTabelDinFisa } from '../app/utils/fise.ts'

const fise = JSON.parse(readFileSync(new URL('../supabase/seed/fise.json', import.meta.url), 'utf8'))

const CAMPURI = new Set(['ordine', 'id', 'titlu', 'nota', 'an', 'an_exact', 'categorie', 'oras', 'verificat', 'sursa', 'culori', 'poza', 'video', 'scena', 'embed'])
for (const f of fise) for (const k of Object.keys(f)) if (!CAMPURI.has(k)) throw new Error(`${f.id}: câmp necunoscut „${k}”`)

const COLOANE = ['id', 'ordine', 'titlu', 'nota', 'an', 'an_exact', 'categorie', 'oras', 'verificat', 'publicat', 'sursa', 'culori',
  'poza_autor', 'poza_licenta', 'poza_url', 'poza_generata', 'video_autor', 'video_licenta', 'video_url', 'scena', 'embed_url']

// Același text canonic ca în interogarea de verificare: valorile ca text Postgres, null → \N, coloane separate cu U+001F.
function canonic(r) {
  return COLOANE.map((c) => {
    const v = r[c]
    if (v === null) return '\\N'
    if (Array.isArray(v)) return `{${v.join(',')}}`
    return String(v)
  }).join('\u001f')
}

const randuri = fise.map(randTabelDinFisa)
if (new Set(randuri.map(r => r.id)).size !== randuri.length) throw new Error('id-uri duplicate')
if (new Set(randuri.map(r => r.ordine)).size !== randuri.length) throw new Error('ordine duplicată')
randuri.sort((a, b) => a.ordine - b.ordine)
const suma = createHash('md5').update(randuri.map(canonic).join('\n'), 'utf8').digest('hex')

const json = JSON.stringify(randuri)
if (json.includes('$fise$')) throw new Error('delimitatorul $fise$ apare în date')

if (process.argv.includes('--check')) {
  const sel = COLOANE.map(c => c === 'culori' ? `culori::text` : `coalesce(${c}::text, '\\N')`).join(', ')
  console.log(`-- Așteptat: ${randuri.length} fișe, md5 ${suma}`)
  console.log(`select count(*) as fise, md5(string_agg(concat_ws(chr(31), ${sel}), chr(10) order by ordine)) as suma, '${suma}' as asteptat from public.fise;`)
} else {
  const set = COLOANE.filter(c => c !== 'id').map(c => `${c} = excluded.${c}`).join(', ')
  console.log(`-- Import fișe: ${randuri.length} rânduri din supabase/seed/fise.json (md5 ${suma}). Generat de scripts/seed-fise.mjs.`)
  console.log(`insert into public.fise (${COLOANE.join(', ')})`)
  console.log(`select ${COLOANE.join(', ')} from jsonb_populate_recordset(null::public.fise, $fise$${json}$fise$::jsonb)`)
  console.log(`on conflict (id) do update set ${set};`)
}
