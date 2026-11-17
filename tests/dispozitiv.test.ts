import { describe, expect, it } from 'vitest'
import { cadreSacadate, esteDispozitivSlab } from '../app/utils/dispozitiv'

describe('esteDispozitivSlab', () => {
  it('telefon modern: nu', () => {
    expect(esteDispozitivSlab({ nuclee: 8, memorieGb: 8, retea: '4g' })).toBe(false)
    expect(esteDispozitivSlab({ nuclee: 6 })).toBe(false) // iPhone: fără deviceMemory
    expect(esteDispozitivSlab({})).toBe(false)
  })
  it('memorie mică, puține nuclee sau combinație slabă: da', () => {
    expect(esteDispozitivSlab({ nuclee: 8, memorieGb: 2 })).toBe(true)
    expect(esteDispozitivSlab({ nuclee: 2 })).toBe(true)
    expect(esteDispozitivSlab({ nuclee: 4, memorieGb: 4 })).toBe(true)
    expect(esteDispozitivSlab({ nuclee: 4, memorieGb: 8 })).toBe(false)
  })
  it('economizor de date sau 2G: da', () => {
    expect(esteDispozitivSlab({ nuclee: 8, memorieGb: 8, economisireDate: true })).toBe(true)
    expect(esteDispozitivSlab({ nuclee: 8, retea: '2g' })).toBe(true)
  })
})

describe('cadreSacadate', () => {
  it('60 fps e fluid, 20 fps sacadează, prea puține cadre nu decid', () => {
    expect(cadreSacadate(Array(50).fill(16.7))).toBe(false)
    expect(cadreSacadate(Array(50).fill(50))).toBe(true)
    expect(cadreSacadate(Array(10).fill(50))).toBe(false)
  })
})
