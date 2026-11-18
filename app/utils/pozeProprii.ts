// Pozele de la „Pune și tu o fișă”: bucket privat `amintiri`, câte un folder pe utilizator (migrarea 20261119090000_amintiri_poze.sql).
// O poză = două variante redimensionate în browser: <user>/<poză>-480.<ext> și -960.<ext>. Funcții pure, testate în tests/pozeProprii.test.ts.

export const BUCKET_AMINTIRI = 'amintiri'
export const LATIMI_POZA = [480, 960] as const
export type LatimePoza = typeof LATIMI_POZA[number]
export type ExtPoza = 'webp' | 'jpg'
// Fișierul ales din telefon: cel mult 20 MB înainte de micșorare; urcăm doar variantele mici.
export const MARIME_MAX_SURSA = 20 * 1024 * 1024
export const POZE_PE_CONT = 100

export interface PozaProprie { cale: string, ext: ExtPoza, creata: string | null }

const RE_UUID = '[0-9a-f-]{36}'
const RE_FISIER = new RegExp(`^(${RE_UUID})-(480|960)\\.(webp|jpg)$`)

export const caleVarianta = (cale: string, latime: LatimePoza, ext: ExtPoza) => `${cale}-${latime}.${ext}`
export const toateVariantele = (p: Pick<PozaProprie, 'cale' | 'ext'>) => LATIMI_POZA.map(l => caleVarianta(p.cale, l, p.ext))

// Mesajul problemei cu fișierul ales, sau null.
export function valideazaSursa(f: { type: string, size: number }): string | null {
  if (!f.type.startsWith('image/')) return 'Alege o imagine (JPG, PNG, WebP sau HEIC).'
  if (f.size > MARIME_MAX_SURSA) return 'Poza are peste 20 MB. Alege una mai mică.'
  return null
}

// Fișierele dintr-un folder → pozele întregi (cu ambele variante), cele mai noi primele.
export function pozeDinFisiere(folder: string, fisiere: { name: string, created_at?: string | null }[]): PozaProprie[] {
  const grup = new Map<string, { latimi: Set<string>, ext: ExtPoza, creata: string | null }>()
  for (const f of fisiere) {
    const m = RE_FISIER.exec(f.name)
    if (!m) continue
    const g = grup.get(m[1]!) ?? { latimi: new Set<string>(), ext: m[3] as ExtPoza, creata: f.created_at ?? null }
    g.latimi.add(m[2]!)
    grup.set(m[1]!, g)
  }
  return [...grup].filter(([, g]) => g.latimi.size === LATIMI_POZA.length)
    .map(([id, g]) => ({ cale: `${folder}/${id}`, ext: g.ext, creata: g.creata }))
    .sort((a, b) => (b.creata ?? '').localeCompare(a.creata ?? ''))
}

// Mărimea unei variante: lățimea țintă, fără mărire peste original, cu raportul păstrat.
export function marimeVarianta(latime: number, inaltime: number, tinta: number) {
  const w = Math.min(tinta, latime)
  return { width: w, height: Math.max(1, Math.round(inaltime * w / latime)) }
}
