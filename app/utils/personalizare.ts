// Capsula după profilul citit: aceleași fișe pentru toți, dar în altă ordine și cu altele puse în față.
// Funcții pure, testate în tests/personalizare.test.ts.
import type { Scena } from '../data/chestionar'
import type { Categorie, Fisa } from '../data/fise'

export const ORDINE_CATEGORII: readonly Categorie[] = ['Evenimente', 'Muzică', 'Filme & TV', 'Obiecte & Haine', 'Mâncare', 'Locuri']

export type PonderiCategorii = Partial<Record<Categorie, number>>

// Categoriile preferate de profil primele; la egalitate rămâne ordinea obișnuită. Fără profil: ordinea obișnuită.
export function ordineCategorii(ponderi?: PonderiCategorii, categorii: readonly Categorie[] = ORDINE_CATEGORII): Categorie[] {
  const baza = (c: Categorie) => ORDINE_CATEGORII.indexOf(c)
  if (!ponderi) return [...categorii].sort((a, b) => baza(a) - baza(b))
  return [...categorii].sort((a, b) => (ponderi[b] ?? 1) - (ponderi[a] ?? 1) || baza(a) - baza(b))
}

// Fișele în ordinea anilor; în același an, cele din categoriile preferate primele.
// Fără profil rezultatul e identic cu sortarea doar după an (sortarea e stabilă).
export function ordoneazaFise<T extends Pick<Fisa, 'an' | 'categorie'>>(fise: readonly T[], ponderi?: PonderiCategorii): T[] {
  const rang = new Map(ordineCategorii(ponderi).map((c, i) => [c, i]))
  return [...fise].sort((a, b) => a.an - b.an || (ponderi ? rang.get(a.categorie)! - rang.get(b.categorie)! : 0))
}

// Categoriile cu ponderea cea mai mare (doar dacă profilul chiar preferă ceva).
export function categoriiPreferate(ponderi?: PonderiCategorii): Categorie[] {
  if (!ponderi) return []
  const valori = ORDINE_CATEGORII.map(c => ponderi[c] ?? 1)
  const max = Math.max(...valori)
  if (max <= Math.min(...valori)) return []
  return ORDINE_CATEGORII.filter(c => (ponderi[c] ?? 1) === max)
}

// Fișa e din scena muzicală a profilului.
export function eDinScena(f: Pick<Fisa, 'scena'>, scena?: Scena | null): boolean {
  return !!scena && f.scena === scena
}
