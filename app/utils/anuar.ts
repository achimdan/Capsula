// Fundalul „Anuar”: fișele naționale citite pe verticală, câte un capitol pe an.
// Funcții pure, ca să le putem testa fără pagină.
import type { Fisa } from '~/data/fise'

export type CapitolAnuar = { an: number, deschidere: Fisa, rest: Fisa[] }

// Capitolele, în ordinea anilor; doar anii care au fișe. Fișa de deschidere a capitolului e prima cu poză
// (în ordinea primită, deci în ordinea profilului citit); fără poze, prima fișă.
export function capitoleAnuar(fise: readonly Fisa[]): CapitolAnuar[] {
  const peAni = new Map<number, Fisa[]>()
  for (const f of fise) peAni.set(f.an, [...(peAni.get(f.an) ?? []), f])
  return [...peAni.entries()]
    .sort(([a], [b]) => a - b)
    .map(([an, lista]) => {
      const i = Math.max(0, lista.findIndex(f => !!f.poza))
      return { an, deschidere: lista[i]!, rest: lista.filter((_, j) => j !== i) }
    })
}

// Anii de pe riglă: tot intervalul, ca să se vadă și golurile; anul tău intră chiar dacă n-are fișe.
export function aniRigla(capitole: readonly CapitolAnuar[], anEu: number | null): { an: number, numar: number }[] {
  if (!capitole.length) return []
  const numar = new Map(capitole.map(c => [c.an, 1 + c.rest.length]))
  const extreme = [capitole[0]!.an, capitole[capitole.length - 1]!.an, ...(anEu === null ? [] : [anEu])]
  const min = Math.min(...extreme)
  const max = Math.max(...extreme)
  return Array.from({ length: max - min + 1 }, (_, i) => ({ an: min + i, numar: numar.get(min + i) ?? 0 }))
}

// Capitolul activ: ultimul al cărui început a trecut de linia de citire (de obicei mijlocul ecranului).
// `inceputuri` sunt pozițiile capitolelor față de marginea de sus a ecranului, în ordine.
export function capitolActiv(inceputuri: readonly number[], linie: number): number {
  let activ = 0
  for (let i = 0; i < inceputuri.length; i++) if (inceputuri[i]! <= linie) activ = i
  return activ
}
