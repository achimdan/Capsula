// Transformă nomenclatorul SIRUTA (INS, data.gov.ro) în public/data/localitati.json.
// Sursa: https://data.gov.ro/dataset/siruta_s1-2026 (CSV, UTF-8, separator „;”).
// Rulare: node scripts/build-localitati.mjs <cale/siruta.csv> "SIRUTA S1 2026"
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const [cale, versiune = 'SIRUTA'] = process.argv.slice(2)
if (!cale) {
  console.error('Folosire: node scripts/build-localitati.mjs <siruta.csv> [versiune]')
  process.exit(1)
}

// Diacriticele cu sedilă din INS devin cele corecte, cu virgulă.
const virgula = s => s.replace(/Ş/g, 'Ș').replace(/ş/g, 'ș').replace(/Ţ/g, 'Ț').replace(/ţ/g, 'ț')
const MICI = new Set(['de', 'din', 'lui', 'la', 'pe', 'cu', 'sub', 'și', 'în'])
function titlu(s) {
  return virgula(s).toLocaleLowerCase('ro')
    .replace(/(^|[\s\-'.(])(\p{L})/gu, (m, sep, l) => sep + l.toLocaleUpperCase('ro'))
    .replace(/(?<=\s)(\p{Lu}\p{Ll}*)(?=\s)/gu, w => (MICI.has(w.toLocaleLowerCase('ro')) ? w.toLocaleLowerCase('ro') : w))
}
const faraPrefix = s => s.replace(/^(MUNICIPIUL|ORAŞ|ORAȘ|ORAŞUL|ORAȘUL|JUDEŢUL|JUDEȚUL)\s+/, '')

const linii = readFileSync(cale, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
const cap = linii.shift().split(';')
const col = Object.fromEntries(cap.map((c, i) => [c, i]))
const randuri = linii.map(l => l.split(';')).map(r => ({
  siruta: Number(r[col.SIRUTA]), nume: r[col.DENLOC], jud: Number(r[col.JUD]), sup: Number(r[col.SIRSUP]),
  tip: Number(r[col.TIP]), niv: Number(r[col.NIV]), med: Number(r[col.MED]), regiune: Number(r[col.REGIUNE])
}))

// Județe: [cod, nume, regiune de dezvoltare]
const judete = randuri.filter(r => r.niv === 1)
  .map(r => [r.jud, r.jud === 40 ? 'București' : titlu(faraPrefix(r.nume)), r.regiune])
  .sort((a, b) => a[0] - b[0])

// UAT-uri (municipii, orașe, comune, sectoare): [siruta, nume, tip, jud]
const uatRanduri = randuri.filter(r => r.niv === 2)
const uatIndex = new Map(uatRanduri.map((r, i) => [r.siruta, i]))
const uat = uatRanduri.map(r => [r.siruta, titlu(faraPrefix(r.nume)), r.tip, r.jud])

// Localități: [siruta, nume, index UAT, tip, urban 1/0]
// București: municipiul e UAT (nivel 2), sectoarele sunt nivel 3. Adăugăm orașul ca localitate,
// cu codul municipiului, iar sectoarele apar ca „Sectorul N”.
const loc = randuri.filter(r => r.niv === 3).map(r => [
  r.siruta,
  r.jud === 40 ? titlu(r.nume.replace(/^BUCUREŞTI\s+/, '')) : titlu(r.nume),
  uatIndex.get(r.sup) ?? -1,
  r.tip,
  r.med === 1 ? 1 : 0
])
const bucuresti = uatRanduri.find(r => r.jud === 40)
if (bucuresti) loc.push([bucuresti.siruta, 'București', uatIndex.get(bucuresti.siruta), 9, 1])
if (loc.some(l => l[2] < 0)) throw new Error('Localități fără UAT')

// Scurtăturile din chestionar (app/data/fise.ts → ORASE) legate de localitatea-reședință.
const SCURTATURI = {
  'Cluj': 'Cluj-Napoca', 'București': 'București', 'Iași': 'Iași', 'Timișoara': 'Timișoara', 'Brașov': 'Brașov',
  'Constanța': 'Constanța', 'Craiova': 'Craiova', 'Oradea': 'Oradea', 'Sibiu': 'Sibiu', 'Galați': 'Galați'
}
const scurtaturi = {}
for (const [oras, numeLoc] of Object.entries(SCURTATURI)) {
  const gasit = loc.find(l => l[1] === numeLoc && l[3] === 9 && [1, 9].includes(uat[l[2]][2]))
  if (!gasit) throw new Error(`Nu găsesc reședința pentru ${oras}`)
  scurtaturi[gasit[0]] = oras
}

mkdirSync('public/data', { recursive: true })
writeFileSync('public/data/localitati.json', JSON.stringify({ versiune, judete, uat, loc, scurtaturi }))
console.log(`${loc.length} localități, ${uat.length} UAT, ${judete.length} județe → public/data/localitati.json`)
