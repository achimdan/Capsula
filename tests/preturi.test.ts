import { describe, expect, it } from 'vitest'
import { PRETURI } from '../app/data/preturi'
import { etichetaAn, formatNumar, formatValoare, grupeazaPeAni, leiNoi } from '../app/utils/preturi'

describe('preturi', () => {
  it('formatează numerele în stil ro-RO', () => {
    expect(formatNumar(5037861)).toBe('5.037.861')
    expect(formatNumar(11.9)).toBe('11,9')
    expect(formatNumar(1.3, 2, 2)).toBe('1,30')
    expect(formatNumar(774)).toBe('774')
  })

  it('distinge leii vechi de cei noi', () => {
    expect(formatValoare({ valoare: 2900, moneda: 'ROL' })).toBe('2.900 lei vechi')
    expect(formatValoare({ valoare: 1.3, moneda: 'RON' })).toBe('1,30 lei')
    expect(formatValoare({ valoare: 774, moneda: 'RON' })).toBe('774 lei')
    expect(formatValoare({ valoare: 11.9, moneda: 'ROL' })).toBe('11,90 lei vechi')
  })

  it('transformă în lei noi doar valorile ROL (÷10000)', () => {
    expect(leiNoi({ valoare: 2900, moneda: 'ROL' })).toBe('≈ 0,29 lei noi')
    expect(leiNoi({ valoare: 5037861, moneda: 'ROL' })).toBe('≈ 503,79 lei noi')
    expect(leiNoi({ valoare: 32, moneda: 'ROL' })).toBe('≈ 0,0032 lei noi')
    expect(leiNoi({ valoare: 774, moneda: 'RON' })).toBeNull()
  })

  it('grupează pe ani crescător, fără să piardă înregistrări', () => {
    const grupe = grupeazaPeAni(PRETURI)
    const ani = grupe.map(g => g.an)
    expect(ani).toEqual([...ani].sort((a, b) => a - b))
    expect(grupe.reduce((n, g) => n + g.preturi.length, 0)).toBe(PRETURI.length)
    expect(grupe.every(g => g.preturi.every(p => p.an === g.an))).toBe(true)
  })

  it('marchează anul aproximativ', () => {
    expect(etichetaAn(1993, false)).toBe('~1993')
    expect(etichetaAn(1998, true)).toBe('1998')
  })

  it('datele respectă regulile: sursă cu URL, ROL înainte de 2005', () => {
    const ids = new Set(PRETURI.map(p => p.id))
    expect(ids.size).toBe(PRETURI.length)
    for (const p of PRETURI) {
      expect(p.url).toMatch(/^https:\/\//)
      expect(p.sursa.length).toBeGreaterThan(5)
      expect(typeof p.verificat).toBe("boolean")
      if (p.an < 2005) expect(p.moneda).toBe('ROL')
      if (p.an > 2005) expect(p.moneda).toBe('RON')
    }
  })
})
