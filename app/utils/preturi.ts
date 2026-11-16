import type { Pret } from '../data/preturi'

/** 1 leu nou = 10.000 lei vechi (redenominarea din 1 iulie 2005). */
export const RAPORT_REDENOMINARE = 10000

/** Număr în stil ro-RO, determinist: punct la mii, virgulă la zecimale. */
export function formatNumar(v: number, minZec = 0, maxZec = 2): string {
  const fix = Math.abs(v).toFixed(maxZec)
  let [intreg = '0', zec = ''] = fix.split('.')
  while (zec.length > minZec && zec.endsWith('0')) zec = zec.slice(0, -1)
  intreg = intreg.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return (v < 0 ? '-' : '') + (zec ? `${intreg},${zec}` : intreg)
}

/** Valoarea afișată: „2.900 lei vechi” sau „1,30 lei”. */
export function formatValoare(p: Pick<Pret, 'valoare' | 'moneda'>): string {
  const nr = Number.isInteger(p.valoare) ? formatNumar(p.valoare) : formatNumar(p.valoare, 2, 2)
  return p.moneda === 'ROL' ? `${nr} lei vechi` : `${nr} lei`
}

/** Echivalentul în lei noi, doar pentru ROL (altfel null). Păstrează cel puțin 2 cifre semnificative. */
export function leiNoi(p: Pick<Pret, 'valoare' | 'moneda'>): string | null {
  if (p.moneda !== 'ROL') return null
  const v = p.valoare / RAPORT_REDENOMINARE
  if (v <= 0) return null
  const zec = v >= 0.1 ? 2 : Math.min(6, Math.ceil(-Math.log10(v)) + 1)
  return `≈ ${formatNumar(v, 2, zec)} lei noi`
}

export interface GrupAn { an: number, preturi: Pret[] }

/** Grupează pe ani, crescător; în an, după produs. Anii nesiguri sunt marcați la afișare, nu aici. */
export function grupeazaPeAni(preturi: readonly Pret[]): GrupAn[] {
  const harta = new Map<number, Pret[]>()
  for (const p of preturi) {
    const lista = harta.get(p.an)
    if (lista) lista.push(p)
    else harta.set(p.an, [p])
  }
  return [...harta.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([an, lista]) => ({ an, preturi: [...lista].sort((a, b) => a.produs.localeCompare(b.produs, 'ro')) }))
}

/** Eticheta anului: „~1993” când anul nu e exact. */
export function etichetaAn(an: number, exact: boolean): string {
  return exact ? String(an) : `~${an}`
}
