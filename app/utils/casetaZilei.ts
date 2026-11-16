// Logica pură a casetei zilei: cheia zilei, generatorul determinist, alegerea fișelor, seria.

export interface StareSerie { ultima: string, zile: number }

// Ziua locală, ca „azi” să se schimbe la miezul nopții utilizatorului.
export function cheieZi(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function cheieIeri(acum: number): string {
  return cheieZi(new Date(acum - 864e5))
}

export function seed(s: string): number {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}

export function rng(a: number): () => number {
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Partea casetei: A și B pe rând, o zi una, o zi cealaltă („Partea B vine mâine” e chiar adevărat).
export function parteaZilei(zi: string): 'A' | 'B' {
  const [a, l, z] = zi.split('-').map(Number)
  const nrZi = Math.round(Date.UTC(a!, l! - 1, z!) / 864e5)
  return nrZi % 2 === 0 ? 'A' : 'B'
}

export function generatieDinAn(anNastere: number | null | undefined): number {
  return Math.floor((anNastere ?? 1984) / 10) * 10
}

// Aceeași zi + aceeași generație (deceniul nașterii) = aceeași casetă.
export function alegeFise<T>(lista: readonly T[], zi: string, generatie: number, nr = 5): T[] {
  const r = rng(seed(zi + ':' + generatie))
  const pool = [...lista]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }
  return pool.slice(0, nr)
}

// Seria crește doar la a 5-a fișă deschisă, o singură dată pe zi.
export function actualizeazaSerie(serie: StareSerie, azi: string, ieri: string): StareSerie {
  if (serie.ultima === azi) return serie
  return { ultima: azi, zile: serie.ultima === ieri ? serie.zile + 1 : 1 }
}
