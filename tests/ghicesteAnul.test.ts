import { describe, expect, it } from 'vitest'
import { FISE } from '../app/data/fise'
import { fisaFaraAn, mascheazaAni, puncteDupaDistanta } from '../app/utils/ghicesteAnul'

describe('mascheazaAni', () => {
  it('ascunde anii întregi și prescurtați', () => {
    expect(mascheazaAni('Revelionul 2000')).toBe('Revelionul ____')
    expect(mascheazaAni('Din ianuarie 2002 puteai pleca')).toBe('Din ianuarie ____ puteai pleca')
    expect(mascheazaAni('Vara lui ’94.')).toBe('Vara lui ’__.')
    expect(mascheazaAni('Italia \'90')).toBe('Italia ’__')
  })
  it('lasă în pace numerele care nu sunt ani', () => {
    expect(mascheazaAni('11 septembrie')).toBe('11 septembrie')
    expect(mascheazaAni('știri la 19:00')).toBe('știri la 19:00')
    expect(mascheazaAni('10.000 de lei vechi')).toBe('10.000 de lei vechi')
  })
})

describe('fișele din joc', () => {
  it('nicio fișă cu an exact nu mai arată un an în titlu, notă sau sursă', () => {
    for (const f of FISE.filter(f => f.an_exact)) {
      const m = fisaFaraAn(f)
      const text = [m.titlu, m.nota, m.sursa ?? ''].join(' ')
      expect(text, f.id).not.toMatch(/\b(?:19|20)\d{2}\b|[’'‘]\d{2}\b/)
      expect(text, f.id).not.toContain(String(f.an))
    }
  })
  it('fiecare fișă din joc are un indiciu și fără an', () => {
    for (const f of FISE.filter(f => f.an_exact)) {
      const cuvinte = mascheazaAni(f.nota).split(/\s+/).filter(w => /\p{L}{3,}/u.test(w))
      expect(cuvinte.length, f.id).toBeGreaterThanOrEqual(4)
    }
  })
})

describe('puncteDupaDistanta', () => {
  it('dă puncte parțiale și la câțiva ani distanță', () => {
    expect(puncteDupaDistanta(0)).toBe(100)
    expect(puncteDupaDistanta(1)).toBe(80)
    expect(puncteDupaDistanta(4)).toBeGreaterThan(0)
    expect(puncteDupaDistanta(-4)).toBe(puncteDupaDistanta(4))
    expect(puncteDupaDistanta(7)).toBe(0)
    expect(puncteDupaDistanta(20)).toBe(0)
  })
  it('scade la fiecare an în plus', () => {
    for (let d = 0; d < 7; d++) expect(puncteDupaDistanta(d)).toBeGreaterThan(puncteDupaDistanta(d + 1))
  })
})
