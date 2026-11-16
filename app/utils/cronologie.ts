// Logica cronologiei pe bandă: texte cu numere (acordul cu „de”), vârsta într-un an și poziția pe bandă.

// „un an”, „12 ani”, „20 de ani”, „101 ani”: „de” apare de la 20 în sus, când ultimele două cifre sunt 00 sau 20–99.
function cuNumar(n: number, unu: string, multe: string): string {
  if (n === 1) return unu
  const r = n % 100
  return n >= 20 && (r === 0 || r >= 20) ? `${n} de ${multe}` : `${n} ${multe}`
}

export const catiAni = (n: number) => cuNumar(n, 'un an', 'ani')
export const cateFise = (n: number) => (n === 0 ? 'nicio fișă' : cuNumar(n, 'o fișă', 'fișe'))

// anEu = anul în care aveai 15 ani.
const varsta = (an: number, anEu: number) => 15 + an - anEu

export function varstaInAn(an: number, anEu: number): string {
  const v = varsta(an, anEu)
  if (v > 0) return 'Aveai ' + catiAni(v)
  if (v === 0) return 'Anul în care te-ai născut'
  return `Cu ${catiAni(-v)} înainte să te naști`
}

// Sub fiecare an de pe bandă: gol pentru anii dinainte să te naști.
export function varstaScurta(an: number, anEu: number): string {
  const v = varsta(an, anEu)
  return v > 0 ? catiAni(v) : v === 0 ? 'te naști' : ''
}

// Următorul an cu fișe în direcția dată; null când nu mai e niciunul.
export function anVecinCuFise(aniCuFise: number[], an: number, directie: -1 | 1): number | null {
  const candidati = aniCuFise.filter(a => (directie === 1 ? a > an : a < an))
  if (!candidati.length) return null
  return directie === 1 ? Math.min(...candidati) : Math.max(...candidati)
}

// Banda are un gol de jumătate de ecran la capete, deci anul i stă la mijloc când scrollLeft = i × lățimea coloanei.
export function indexDinScroll(scrollLeft: number, latimeColoana: number, nrAni: number): number {
  if (nrAni <= 0 || latimeColoana <= 0) return 0
  return Math.min(nrAni - 1, Math.max(0, Math.round(scrollLeft / latimeColoana)))
}
