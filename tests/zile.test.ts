import { describe, expect, it } from 'vitest'
import { aniInUrma, celeMaiApropiate, celeMaiRecente, evenimenteAzi, peLuni } from '../app/utils/zile'
import { ZILE, type Zi } from '../app/data/zile'

const z = (id: string, data: string): Zi => ({ id, data, titlu: id, nota: '', categorie: 'Evenimente', sursa: '', url: '', verificat: false })
const lista = [z('a', '1990-05-20'), z('b', '1994-07-03'), z('c', '2007-01-01'), z('d', '1996-02-29'), z('e', '2004-12-12')]

describe('evenimenteAzi', () => {
  it('potrivește luna și ziua, indiferent de an', () => {
    expect(evenimenteAzi(lista, new Date(2026, 4, 20)).map(e => e.id)).toEqual(['a'])
  })
  it('întoarce gol când nu e nimic', () => {
    expect(evenimenteAzi(lista, new Date(2026, 4, 21))).toEqual([])
  })
  it('29 februarie se potrivește în an bisect', () => {
    expect(evenimenteAzi(lista, new Date(2028, 1, 29)).map(e => e.id)).toEqual(['d'])
  })
})

describe('celeMaiApropiate', () => {
  it('le ordonează după apropiere', () => {
    const r = celeMaiApropiate(lista, new Date(2026, 4, 21), 2)
    expect(r.map(e => e.zi.id)).toEqual(['b', 'e'])
    expect(r[0]!.peste).toBe(43)
  })
  it('trece peste sfârșitul anului', () => {
    const r = celeMaiApropiate(lista, new Date(2026, 11, 30), 2)
    expect(r.map(e => e.zi.id)).toEqual(['c', 'd'])
    expect(r[0]!.peste).toBe(2)
  })
  it('29 februarie într-un an nebisect e la o zi după 28 februarie', () => {
    const r = celeMaiApropiate(lista, new Date(2027, 1, 28), 1)
    expect(r[0]!.zi.id).toBe('d')
    expect(r[0]!.peste).toBe(1)
  })
  it('nu include ziua de azi', () => {
    expect(celeMaiApropiate(lista, new Date(2026, 4, 20), 5).map(e => e.zi.id)).not.toContain('a')
  })
})

describe('aniInUrma', () => {
  it('numără anii calendaristici', () => {
    expect(aniInUrma('1990-05-20', new Date(2026, 4, 20))).toBe(36)
  })
})

describe('date', () => {
  it('au format și id-uri valide', () => {
    expect(new Set(ZILE.map(e => e.id)).size).toBe(ZILE.length)
    for (const e of ZILE) {
      expect(e.data).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(typeof e.verificat).toBe("boolean")
      expect(e.url).toMatch(/^https:\/\//)
    }
  })
})

describe('celeMaiRecente și peLuni', () => {
  const L = [
    { id: 'a', data: '1999-12-30', titlu: '', nota: '', categorie: 'Evenimente', sursa: '', url: '', verificat: false },
    { id: 'b', data: '2004-01-03', titlu: '', nota: '', categorie: 'Evenimente', sursa: '', url: '', verificat: false },
    { id: 'c', data: '1994-01-05', titlu: '', nota: '', categorie: 'Evenimente', sursa: '', url: '', verificat: false }
  ] as const
  it('ia zilele trecute, cu trecere peste începutul anului, fără ziua de azi', () => {
    const r = celeMaiRecente(L as never, new Date(2026, 0, 5), 5)
    expect(r.map(x => [x.zi.id, x.peste])).toEqual([['b', 2], ['a', 6]])
  })
  it('grupează pe luni, sortat după zi', () => {
    expect(peLuni(L as never).map(g => [g.luna, g.zile.map(z => z.id)])).toEqual([[1, ['b', 'c']], [12, ['a']]])
  })
})

