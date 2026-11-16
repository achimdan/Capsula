import type { Emisiune, TipEmisiune } from '../data/tv'

export interface GrupDecada { decada: number; eticheta: string; emisiuni: Emisiune[] }

export function filtreazaTv(lista: Emisiune[], tip: TipEmisiune | null): Emisiune[] {
  return tip ? lista.filter(e => e.tip === tip) : lista.slice()
}

export function eticheteAni(e: Pick<Emisiune, 'an_start' | 'an_sfarsit' | 'an_exact'>): string {
  const a = e.an_sfarsit == null ? `din ${e.an_start}` : e.an_sfarsit === e.an_start ? `${e.an_start}` : `${e.an_start}–${e.an_sfarsit}`
  return e.an_exact ? a : `~${a}`
}

export function grupeazaPeDecade(lista: Emisiune[]): GrupDecada[] {
  const harta = new Map<number, Emisiune[]>()
  for (const e of lista) {
    const d = Math.floor(e.an_start / 10) * 10
    harta.set(d, [...(harta.get(d) ?? []), e])
  }
  return [...harta.entries()].sort((a, b) => a[0] - b[0]).map(([decada, emisiuni]) => ({
    decada, eticheta: `Anii ${decada}`,
    emisiuni: emisiuni.sort((x, y) => x.an_start - y.an_start || x.titlu.localeCompare(y.titlu, 'ro')),
  }))
}
