import type { Zi } from '../data/zile'

// Ziua din an într-un an bisect de referință (2000), ca 29 februarie să aibă loc fix.
const REF = 2000
const ZI_MS = 86_400_000

function ziDinAn(luna: number, zi: number): number {
  return Math.round((Date.UTC(REF, luna - 1, zi) - Date.UTC(REF, 0, 1)) / ZI_MS)
}

function lunaZi(data: string): [number, number] {
  const [, l, z] = data.split('-').map(Number)
  return [l as number, z as number]
}

export interface ZiApropiata {
  zi: Zi
  /** Câte zile până la următoarea aniversare (0 = azi). */
  peste: number
}

/** Evenimentele cu aceeași lună și zi ca `date` (ora locală). */
export function evenimenteAzi(lista: readonly Zi[], date: Date): Zi[] {
  const l = date.getMonth() + 1
  const z = date.getDate()
  return lista.filter((e) => {
    const [el, ez] = lunaZi(e.data)
    return el === l && ez === z
  })
}

/** Cele mai apropiate `limita` aniversări care urmează (cu trecere peste sfârșitul anului). */
export function celeMaiApropiate(lista: readonly Zi[], date: Date, limita = 3): ZiApropiata[] {
  const azi = ziDinAn(date.getMonth() + 1, date.getDate())
  return lista
    .map((zi) => {
      const [l, z] = lunaZi(zi.data)
      return { zi, peste: (ziDinAn(l, z) - azi + 366) % 366 }
    })
    .filter(e => e.peste > 0)
    .sort((a, b) => a.peste - b.peste || a.zi.data.localeCompare(b.zi.data))
    .slice(0, limita)
}

/** Cele mai recente `limita` aniversări trecute (înainte de azi, cu trecere peste începutul anului). `peste` = câte zile au trecut. */
export function celeMaiRecente(lista: readonly Zi[], date: Date, limita = 4): ZiApropiata[] {
  const azi = ziDinAn(date.getMonth() + 1, date.getDate())
  return lista
    .map((zi) => {
      const [l, z] = lunaZi(zi.data)
      return { zi, peste: (azi - ziDinAn(l, z) + 366) % 366 }
    })
    .filter(e => e.peste > 0)
    .sort((a, b) => a.peste - b.peste || a.zi.data.localeCompare(b.zi.data))
    .slice(0, limita)
}

/** Tot calendarul, pe luni (1–12), fiecare lună sortată după zi. Lunile fără intrări lipsesc. */
export function peLuni(lista: readonly Zi[]): { luna: number, zile: Zi[] }[] {
  const m = new Map<number, Zi[]>()
  for (const zi of lista) {
    const [l] = lunaZi(zi.data)
    m.set(l, [...(m.get(l) ?? []), zi])
  }
  return [...m.entries()].sort((a, b) => a[0] - b[0])
    .map(([luna, zile]) => ({ luna, zile: zile.sort((a, b) => lunaZi(a.data)[1] - lunaZi(b.data)[1] || a.data.localeCompare(b.data)) }))
}

/** Ani împliniți de la `data` până la `azi`, după anul calendaristic. */
export function aniInUrma(data: string, azi: Date): number {
  return azi.getFullYear() - Number(data.slice(0, 4))
}
