import type { Fisa } from '~/data/fise'

// Întrebarea curățată: fără spații în plus, cel mult 200 de caractere (cât acceptă și serverul).
export function curataIntrebarea(q: string): string {
  return q.trim().replace(/\s+/g, ' ').slice(0, 200)
}

// Id-urile întoarse de /api/search → fișele vizibile omului, în ordinea relevanței.
// Fișele din straturile de oraș pe care nu le-a deblocat sunt sărite, ca peste tot în Capsula.
export function fiseDinRezultate(ids: string[], vizibile: Fisa[]): Fisa[] {
  const dupaId = new Map(vizibile.map(f => [f.id, f]))
  return ids.flatMap(id => dupaId.get(id) ?? [])
}

const CUVINTE_DE_INTREBARE = ['ce', 'cum', 'cine', 'unde', 'cand', 'care', 'cat', 'cata', 'cati', 'cate', 'de ce', 'exista', 'era', 'erau']

// O întrebare (primește răspuns din fișe) sau doar cuvinte de căutat (primește fișe).
// Întrebare: se termină cu „?”, începe cu un cuvânt de întrebare și are cel puțin 3 cuvinte, sau are cel puțin 5 cuvinte.
export function esteIntrebare(q: string): boolean {
  const t = curataIntrebarea(q).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (t.length < 3) return false
  if (t.endsWith('?')) return true
  const cuvinte = t.split(' ')
  if (cuvinte.length >= 5) return true
  return cuvinte.length >= 3 && CUVINTE_DE_INTREBARE.some(c => t.startsWith(c + ' '))
}
