// „Ghicește anul”: ce fișe intră și cum se punctează (vezi docs/PLAN.md, Etapa 3).
import type { Fisa } from '~/data/fise'

export const RUNDE = 5
export const PUNCTE_MAX = 100
export const MINUS_PE_AN = 25

// Doar fișe cu an exact: la un an aproximativ, răspunsul „corect” n-ar fi verificabil.
// Fișele de oraș intră doar pentru orașul din profil.
export function fiseJoc(fise: readonly Fisa[], oras: string | null): Fisa[] {
  return fise.filter(f => f.an_exact && (f.oras === null || f.oras === oras))
}

export function puncteRunda(ghicit: number, an: number): number {
  return Math.max(0, PUNCTE_MAX - MINUS_PE_AN * Math.abs(ghicit - an))
}

// Fisher–Yates: fiecare ordine e la fel de probabilă (sort cu Math.random nu e).
export function amestecate<T>(lista: readonly T[], rnd: () => number = Math.random): T[] {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function alegeRunde(fise: readonly Fisa[], oras: string | null, rnd: () => number = Math.random): Fisa[] {
  return amestecate(fiseJoc(fise, oras), rnd).slice(0, RUNDE)
}
