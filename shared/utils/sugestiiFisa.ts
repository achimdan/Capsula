// Ajutorul pentru fișele scrise de om: categoria propusă din vecinii după sens.
// Fără model de text: doar vectorul fișei noi și fișele Capsulei care îi seamănă.

export const VECINI_PENTRU_CATEGORIE = 8
export const FISE_CARE_SEAMANA = 3

// Votul vecinilor, cu greutate mai mare pentru cei mai apropiați (1, 1/2, 1/3…).
// Propune o categorie doar când are cel puțin jumătate din greutate: altfel mai bine nimic decât o ghicitoare.
export function categorieSugerata(vecini: readonly { categorie: string }[]): string | null {
  if (!vecini.length) return null
  const voturi = new Map<string, number>()
  let total = 0
  vecini.forEach((v, i) => {
    const g = 1 / (i + 1)
    voturi.set(v.categorie, (voturi.get(v.categorie) ?? 0) + g)
    total += g
  })
  const [categorie, greutate] = [...voturi].sort((a, b) => b[1] - a[1])[0]!
  return greutate / total >= 0.5 ? categorie : null
}

// Titlul pentru comparat: fără diacritice, majuscule, punctuație și spații în plus.
export function titluComparabil(titlu: string): string {
  return titlu.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

// Fișele tale cu același titlu: amintirile proprii n-au vectori, așa că le prindem după text, în browser.
export function fiseProprieCuAcelasiTitlu<T extends { titlu: string }>(titlu: string, proprii: readonly T[]): T[] {
  const cheie = titluComparabil(titlu)
  return cheie.length < 3 ? [] : proprii.filter(f => titluComparabil(f.titlu) === cheie)
}
