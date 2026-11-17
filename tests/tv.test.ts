import { describe, expect, it } from 'vitest'
import { EMISIUNI } from '../app/data/tv'
import { eticheteAni, filtreazaTv, grupeazaPeDecade } from '../app/utils/tv'

describe('date La TV', () => {
  it('toate fișele au sursă și id unic', () => {
    expect(EMISIUNI.length).toBeGreaterThanOrEqual(14)
    expect(new Set(EMISIUNI.map(e => e.id)).size).toBe(EMISIUNI.length)
    for (const e of EMISIUNI) {
      expect(typeof e.verificat).toBe("boolean")
      expect(e.url).toMatch(/^https:\/\//)
    }
  })
})

describe('filtreazaTv', () => {
  it('fără tip întoarce tot, cu tip doar tipul cerut', () => {
    expect(filtreazaTv(EMISIUNI, null)).toHaveLength(EMISIUNI.length)
    expect(filtreazaTv(EMISIUNI, 'Desene').every(e => e.tip === 'Desene')).toBe(true)
  })
})

describe('grupeazaPeDecade', () => {
  it('grupează crescător și sortează în grup', () => {
    const g = grupeazaPeDecade(EMISIUNI)
    expect(g.map(x => x.decada)).toEqual([...g.map(x => x.decada)].sort((a, b) => a - b))
    for (const x of g) for (const e of x.emisiuni) expect(Math.floor(e.an_start / 10) * 10).toBe(x.decada)
    expect(g[0]!.eticheta).toBe('Anii 1990')
  })
  it('listă goală dă niciun grup', () => expect(grupeazaPeDecade([])).toEqual([]))
})

describe('eticheteAni', () => {
  it('formatează intervalul și marchează nesiguranța', () => {
    expect(eticheteAni({ an_start: 1996, an_sfarsit: 2000, an_exact: true })).toBe('1996–2000')
    expect(eticheteAni({ an_start: 1999, an_sfarsit: null, an_exact: false })).toBe('~din 1999')
  })
})
