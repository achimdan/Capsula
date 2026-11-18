import { describe, expect, it } from 'vitest'
import { anDeOprire, imparteProgres, pozitieAn, progresPentruAn, RAZA_GOALA, RAZA_PLINA, razeRole, rotireRole } from '../app/utils/caseta'

describe('razeRole', () => {
  it('la început toată banda e pe rola din stânga', () => {
    expect(razeRole(0)).toEqual({ stanga: RAZA_PLINA, dreapta: RAZA_GOALA })
  })
  it('la sfârșit toată banda e pe rola din dreapta', () => {
    const r = razeRole(1)
    expect(r.stanga).toBeCloseTo(RAZA_GOALA)
    expect(r.dreapta).toBeCloseTo(RAZA_PLINA)
  })
  it('păstrează aria benzii (razele se schimbă după radical)', () => {
    for (const p of [0.1, 0.37, 0.5, 0.9]) {
      const r = razeRole(p)
      expect(r.stanga ** 2 + r.dreapta ** 2).toBeCloseTo(RAZA_PLINA ** 2 + RAZA_GOALA ** 2)
    }
  })
  it('limitează progresul la 0..1', () => {
    expect(razeRole(-2)).toEqual(razeRole(0))
    expect(razeRole(5)).toEqual(razeRole(1))
  })
})

describe('rotireRole', () => {
  it('rola mai goală se învârte mai repede', () => {
    const r = rotireRole(1, 0.1)
    expect(r.dreapta).toBeGreaterThan(r.stanga)
  })
})

describe('pozitieAn și progresPentruAn', () => {
  it('sunt inverse una alteia', () => {
    for (const i of [0, 3, 21]) expect(pozitieAn(progresPentruAn(i, 22), 22)).toBeCloseTo(i)
  })
  it('un singur an stă mereu pe 0', () => {
    expect(pozitieAn(0.6, 1)).toBe(0)
    expect(progresPentruAn(0, 1)).toBe(0)
  })
})

describe('anDeOprire', () => {
  it('fără direcție, alege anul cel mai apropiat', () => {
    expect(anDeOprire(progresPentruAn(4.4, 11), 11, 0)).toBe(4)
    expect(anDeOprire(progresPentruAn(4.6, 11), 11, 0)).toBe(5)
  })
  it('împinge spre anul următor în sensul derulării', () => {
    expect(anDeOprire(progresPentruAn(4.4, 11), 11, 1)).toBe(5)
    expect(anDeOprire(progresPentruAn(4.6, 11), 11, -1)).toBe(4)
  })
  it('nu iese de pe bandă', () => {
    expect(anDeOprire(1, 11, 1)).toBe(10)
    expect(anDeOprire(0, 11, -1)).toBe(0)
  })
})

describe('imparteProgres', () => {
  it('primul ecran de scroll e intro-ul, restul e banda', () => {
    // pista de 5 ecrane: drumul e 4 ecrane, intro-ul e primul sfert
    expect(imparteProgres(0, 5000, 1000)).toEqual({ intro: 0, ani: 0, prag: 0.25 })
    expect(imparteProgres(0.125, 5000, 1000)).toEqual({ intro: 0.5, ani: 0, prag: 0.25 })
    expect(imparteProgres(0.25, 5000, 1000)).toEqual({ intro: 1, ani: 0, prag: 0.25 })
    expect(imparteProgres(0.625, 5000, 1000).ani).toBeCloseTo(0.5)
    expect(imparteProgres(1, 5000, 1000)).toEqual({ intro: 1, ani: 1, prag: 0.25 })
  })
  it('pe o pistă prea scurtă, totul e intro', () => {
    expect(imparteProgres(0.5, 1500, 1000)).toEqual({ intro: 0.5, ani: 0, prag: 1 })
  })
})
