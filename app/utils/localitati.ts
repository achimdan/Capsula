// Localitățile din SIRUTA (public/data/localitati.json, generat de scripts/build-localitati.mjs).
// Funcții pure, fără auto-importuri Nuxt; testate în tests/localitati.test.ts.

// Formatul compact din JSON
export type JudetBrut = [cod: number, nume: string, regiune: number]
export type UatBrut = [siruta: number, nume: string, tip: number, jud: number]
export type LocBrut = [siruta: number, nume: string, uat: number, tip: number, urban: 0 | 1]
export interface DateLocalitati {
  versiune: string
  judete: JudetBrut[]
  uat: UatBrut[]
  loc: LocBrut[]
  scurtaturi: Record<string, string>
}

export type TipUat = 'municipiu' | 'oras' | 'comuna' | 'sector'
export type Provincie = 'Transilvania' | 'Banat' | 'Crișana' | 'Maramureș' | 'Moldova' | 'Bucovina' | 'Muntenia' | 'Oltenia' | 'Dobrogea'

export interface Localitate {
  siruta: number
  nume: string
  urban: boolean
  // reședința UAT-ului (orașul propriu-zis, satul de reședință) sau localitate componentă / sat
  resedinta: boolean
  uat: { siruta: number, nume: string, tip: TipUat, resedintaJudet: boolean }
  judet: { cod: number, nume: string }
  regiuneDezvoltare: string
  // aproximativ, după județ
  provincie: Provincie
}

// Regiunile de dezvoltare (coloana REGIUNE din SIRUTA)
export const REGIUNI: Record<number, string> = {
  1: 'Nord-Est', 2: 'Sud-Est', 3: 'Sud-Muntenia', 4: 'Sud-Vest Oltenia',
  5: 'Vest', 6: 'Nord-Vest', 7: 'Centru', 8: 'București-Ilfov'
}

// Provincia istorică după codul județului. Aproximare: unele județe se întind pe două provincii.
const PROVINCII: Record<Provincie, number[]> = {
  Transilvania: [1, 6, 8, 12, 14, 19, 20, 26, 31, 32],
  Banat: [11, 35],
  Crișana: [2, 5],
  Maramureș: [24, 30],
  Moldova: [4, 7, 17, 22, 27, 37, 39],
  Bucovina: [33],
  Muntenia: [3, 9, 10, 15, 21, 23, 29, 34, 40, 51, 52],
  Oltenia: [16, 18, 25, 28, 38],
  Dobrogea: [13, 36]
}
export function provincieJudet(cod: number): Provincie {
  for (const [p, coduri] of Object.entries(PROVINCII)) if (coduri.includes(cod)) return p as Provincie
  return 'Muntenia'
}

function tipUat(tip: number): TipUat {
  if (tip === 1 || tip === 4 || tip === 9) return 'municipiu'
  if (tip === 2 || tip === 5) return 'oras'
  if (tip === 6) return 'sector'
  return 'comuna'
}
// Tipurile SIRUTA pentru localitatea-reședință a unui municipiu, oraș sau comune
const TIP_RESEDINTA = new Set([9, 17, 22])

// Fără diacritice, litere mici, spații simple: „Bistrița-Năsăud” → „bistrita-nasaud”.
export function normalizeaza(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').replace(/[şș]/gi, 's').replace(/[ţț]/gi, 't')
    .toLowerCase().replace(/\s+/g, ' ').trim()
}

export interface IndexLocalitati {
  date: DateLocalitati
  dupaSiruta: Map<number, number>
  // nume normalizat; nume + UAT + județ pentru potrivirea cuvintelor în plus („florești cluj”)
  nume: string[]
  context: string[]
  importanta: Uint8Array
}

export function indexeaza(date: DateLocalitati): IndexLocalitati {
  const judete = new Map(date.judete.map(j => [j[0], j[1]]))
  const nume: string[] = []
  const context: string[] = []
  const importanta = new Uint8Array(date.loc.length)
  const dupaSiruta = new Map<number, number>()
  date.loc.forEach((l, i) => {
    const u = date.uat[l[2]]!
    dupaSiruta.set(l[0], i)
    nume.push(normalizeaza(l[1]))
    context.push(normalizeaza(`${l[1]} ${u[1]} ${judete.get(u[3]) ?? ''}`))
    // 0 = cel mai important: reședință de județ, apoi municipii, orașe, reședințe de comună, sate
    const resedinta = TIP_RESEDINTA.has(l[3])
    const t = tipUat(u[2])
    importanta[i] = !resedinta ? 5 : u[2] === 1 || u[3] === 40 ? 0 : t === 'municipiu' ? 1 : t === 'oras' ? 2 : 3
  })
  return { date, dupaSiruta, nume, context, importanta }
}

export function descrie(idx: IndexLocalitati, siruta: number): Localitate | null {
  const i = idx.dupaSiruta.get(siruta)
  if (i === undefined) return null
  const l = idx.date.loc[i]!
  const u = idx.date.uat[l[2]]!
  const j = idx.date.judete.find(x => x[0] === u[3])
  return {
    siruta: l[0],
    nume: l[1],
    urban: l[4] === 1,
    resedinta: TIP_RESEDINTA.has(l[3]),
    uat: { siruta: u[0], nume: u[1], tip: tipUat(u[2]), resedintaJudet: u[2] === 1 },
    judet: { cod: u[3], nume: j?.[1] ?? '' },
    regiuneDezvoltare: REGIUNI[j?.[2] ?? 0] ?? '',
    provincie: provincieJudet(u[3])
  }
}

// Rândul al doilea din sugestie: „sat, com. Balaci, jud. Teleorman” / „municipiu, jud. Galați”.
export function eticheta(l: Localitate): string {
  const jud = l.judet.cod === 40 ? '' : `jud. ${l.judet.nume}`
  const uat = l.uat.tip === 'municipiu' ? 'mun.' : l.uat.tip === 'oras' ? 'oraș' : l.uat.tip === 'sector' ? '' : 'com.'
  let parte: string
  if (l.judet.cod === 40) parte = l.nume === 'București' ? 'Capitala' : 'București'
  else if (l.resedinta && l.uat.tip === 'municipiu') parte = l.uat.resedintaJudet ? 'municipiu, reședință de județ' : 'municipiu'
  else if (l.resedinta && l.uat.tip === 'oras') parte = 'oraș'
  else if (l.resedinta) parte = `sat, reședința comunei ${l.uat.nume}`
  else parte = `${l.urban ? 'localitate' : 'sat'}, ${uat} ${l.uat.nume}`
  return [parte, jud].filter(Boolean).join(', ')
}

// Căutare: întâi după cât de bine se potrivește numele (exact, început, început de cuvânt, oriunde),
// apoi după importanță. Cuvintele în plus pot numi comuna sau județul („florești cluj”).
export function cauta(idx: IndexLocalitati, text: string, limita = 8): number[] {
  const q = normalizeaza(text)
  if (q.length < 2) return []
  const cuvinte = q.split(' ')
  const primul = cuvinte[0]!
  const rest = cuvinte.slice(1)
  const potriviri: { i: number, scor: number }[] = []
  for (let i = 0; i < idx.nume.length; i++) {
    const n = idx.nume[i]!
    let potrivire: number
    if (n === q) potrivire = 0
    else if (n.startsWith(q)) potrivire = 1
    else if (n.includes(' ' + q) || n.includes('-' + q)) potrivire = 2
    else if (rest.length && (n === primul || n.startsWith(primul))) {
      const ctx = idx.context[i]!
      if (!rest.every(c => ctx.includes(' ' + c) || ctx.startsWith(c))) continue
      potrivire = n === primul ? 0 : 1
    } else if (q.length >= 4 && n.includes(q)) potrivire = 3
    else continue
    potriviri.push({ i, scor: potrivire * 10 + idx.importanta[i]! })
  }
  potriviri.sort((a, b) => a.scor - b.scor || idx.nume[a.i]!.localeCompare(idx.nume[b.i]!))
  return potriviri.slice(0, limita).map(p => idx.date.loc[p.i]![0])
}

// ── Răspunsul din chestionar: „loc:<siruta>:<u|r>”.
// Mediul e în răspuns, ca scorul să nu depindă de încărcarea listei.
const RE_RASPUNS = /^loc:(\d{1,7}):([ur])$/

export function raspunsLocalitate(l: Pick<Localitate, 'siruta' | 'urban'>): string {
  return `loc:${l.siruta}:${l.urban ? 'u' : 'r'}`
}

export function citesteRaspunsLocalitate(r: unknown): { siruta: number, urban: boolean } | null {
  if (typeof r !== 'string') return null
  const m = RE_RASPUNS.exec(r)
  return m ? { siruta: Number(m[1]), urban: m[2] === 'u' } : null
}
