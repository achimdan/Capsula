// Logica pură a jocului „Ghicește anul”, testată în tests/ghicesteAnul.test.ts.
import type { Fisa } from '../data/fise'

// Anii scriși întreg (1999, 2000) și prescurtați (’94, '90). Alte numere rămân: „11 septembrie”, „19:00”, „10.000”.
const ANI = /\b(?:19|20)\d{2}\b/g
const ANI_SCURTI = /[’'‘]\d{2}\b/g

export function mascheazaAni(text: string): string {
  return text.replace(ANI, '____').replace(ANI_SCURTI, '’__')
}

// Fișa așa cum apare în timpul rundei: fără anul din titlu, notă sau sursă. După dezvăluire se arată fișa întreagă.
export function fisaFaraAn(f: Fisa): Fisa {
  return { ...f, titlu: mascheazaAni(f.titlu), nota: mascheazaAni(f.nota), sursa: f.sursa ? mascheazaAni(f.sursa) : undefined }
}

// Puncte după câți ani ai greșit: exact = 100, apoi scade treptat; de la 7 ani distanță, 0.
const PUNCTE = [100, 80, 60, 45, 30, 20, 10]
export function puncteDupaDistanta(ani: number): number {
  return PUNCTE[Math.abs(Math.round(ani))] ?? 0
}

export const RUNDE = 5
// Unde stă cursorul la începutul fiecărei runde: un an neutru, nu răspunsul de dinainte.
export const AN_START = 1997

// Doar fișe cu an exact: la un an aproximativ, răspunsul „corect” n-ar fi verificabil.
// Fișele de oraș intră doar pentru orașul din profil.
export function fiseJoc(fise: readonly Fisa[], oras: string | null): Fisa[] {
  return fise.filter(f => f.an_exact && (f.oras === null || f.oras === oras))
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
