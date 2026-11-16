import { describe, expect, it } from 'vitest'
import { actualizeazaSerie, alegeFise, cheieZi, parteaZilei } from '../app/utils/casetaZilei'

const lista = Array.from({ length: 40 }, (_, i) => ({ id: `f${i}` }))
const ids = (l: { id: string }[]) => l.map(f => f.id)

describe('alegeFise', () => {
  it('aceeași zi + generație dau aceleași 5 fișe', () => {
    expect(ids(alegeFise(lista, '2026-11-15', 1980))).toEqual(ids(alegeFise(lista, '2026-11-15', 1980)))
  })
  it('generație sau zi diferite schimbă alegerea', () => {
    const baza = ids(alegeFise(lista, '2026-11-15', 1980))
    expect(ids(alegeFise(lista, '2026-11-15', 1990))).not.toEqual(baza)
    expect(ids(alegeFise(lista, '2026-11-16', 1980))).not.toEqual(baza)
  })
  it('întoarce 5 fișe distincte', () => {
    const r = ids(alegeFise(lista, '2026-11-15', 1980))
    expect(r).toHaveLength(5)
    expect(new Set(r).size).toBe(5)
  })
})

describe('actualizeazaSerie', () => {
  const azi = '2026-11-15'
  const ieri = '2026-11-14'
  it('prima zi = 1', () => {
    expect(actualizeazaSerie({ ultima: '', zile: 0 }, azi, ieri)).toEqual({ ultima: azi, zile: 1 })
  })
  it('zi consecutivă +1', () => {
    expect(actualizeazaSerie({ ultima: ieri, zile: 3 }, azi, ieri)).toEqual({ ultima: azi, zile: 4 })
  })
  it('pauza resetează la 1', () => {
    expect(actualizeazaSerie({ ultima: '2026-11-10', zile: 7 }, azi, ieri)).toEqual({ ultima: azi, zile: 1 })
  })
  it('a doua oară în aceeași zi nu dublează', () => {
    const o = actualizeazaSerie({ ultima: ieri, zile: 3 }, azi, ieri)
    expect(actualizeazaSerie(o, azi, ieri)).toEqual({ ultima: azi, zile: 4 })
  })
})

describe('cheieZi', () => {
  it('formatează cu zero-padding', () => {
    expect(cheieZi(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('parteaZilei', () => {
  it('alternează A și B de la o zi la alta, și peste granița de lună sau an', () => {
    expect(parteaZilei('2026-11-16')).not.toBe(parteaZilei('2026-11-17'))
    expect(parteaZilei('2026-11-30')).not.toBe(parteaZilei('2026-12-01'))
    expect(parteaZilei('2026-12-31')).not.toBe(parteaZilei('2027-01-01'))
    expect(parteaZilei('2026-11-16')).toBe(parteaZilei('2026-11-18'))
  })
})
