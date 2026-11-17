import { describe, expect, it } from 'vitest'
import { buclaTv, camera, durataBucla, ECRAN_TV, epocaPentruAn, progresPin, programLa } from '../app/utils/ecranTv'

describe('epocaPentruAn', () => {
  it('alege epoca după an', () => {
    expect(epocaPentruAn(1988)).toBe('alb-negru')
    expect(epocaPentruAn(1990)).toBe('color')
    expect(epocaPentruAn(1999)).toBe('color')
    expect(epocaPentruAn(2000)).toBe('digital')
    expect(epocaPentruAn(2008)).toBe('digital')
  })
  it('fără an, rămâne color', () => {
    expect(epocaPentruAn(null)).toBe('color')
    expect(epocaPentruAn(undefined)).toBe('color')
    expect(epocaPentruAn(Number.NaN)).toBe('color')
  })
})

describe('programLa', () => {
  it('începe cu mira', () => {
    expect(programLa(0)).toEqual({ program: 'mira', progres: 0 })
  })
  it('trece la purici după mira', () => {
    expect(programLa(6.7).program).toBe('purici')
    expect(programLa(6.7).progres).toBeCloseTo(0.5)
  })
  it('se reia după o buclă întreagă', () => {
    const total = durataBucla()
    expect(programLa(total + 1)).toEqual(programLa(1))
  })
  it('suportă timp negativ', () => {
    expect(programLa(-0.5).program).toBe('purici')
  })
  it('bucla are toate programele', () => {
    expect(new Set(buclaTv().map(s => s.program))).toEqual(new Set(['mira', 'purici', 'vhs', 'stingere']))
  })
  it('o buclă goală dă mira', () => {
    expect(programLa(3, [])).toEqual({ program: 'mira', progres: 0 })
  })
})

describe('pin și cameră', () => {
  it('progresPin urmează pista și se oprește la capete', () => {
    expect(progresPin(0, 2400, 1000)).toBe(0)
    expect(progresPin(-700, 2400, 1000)).toBe(0.5)
    expect(progresPin(-5000, 2400, 1000)).toBe(1)
    expect(progresPin(200, 2400, 1000)).toBe(0)
    expect(progresPin(0, 800, 1000)).toBe(1)
  })
  it('camera pornește cu ecranul pe toată fereastra și ajunge la televizorul întreg', () => {
    const tv = { w: 400, h: 356 }
    const vp = { w: 1280, h: 800 }
    const s = camera(0, tv, ECRAN_TV.televizor, vp)
    expect(tv.w * ECRAN_TV.televizor.w * s.scara).toBeGreaterThanOrEqual(vp.w)
    expect(tv.h * ECRAN_TV.televizor.h * s.scara).toBeGreaterThanOrEqual(vp.h)
    expect(camera(1, tv, ECRAN_TV.televizor, vp)).toMatchObject({ scara: 1 })
  })
})
