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
