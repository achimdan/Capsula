import { describe, expect, it } from 'vitest'
import { PALETE, STILURI, stilEticheta } from '../app/three/etichete'
import { CASETE_RO } from '../app/data/caseteRo'

describe('stilEticheta', () => {
  it('nicio etichetă nu se repetă în primele 84 de înregistrări', () => {
    const vazute = new Set<string>()
    for (let k = 0; k < 84; k++) {
      const { stil, paleta } = stilEticheta(k)
      const cheie = `${stil}|${PALETE.indexOf(paleta)}`
      expect(vazute.has(cheie)).toBe(false)
      vazute.add(cheie)
    }
  })
  it('două înregistrări la rând au stil și paletă diferite', () => {
    for (let k = 0; k < 60; k++) {
      expect(stilEticheta(k).stil).not.toBe(stilEticheta(k + 1).stil)
      expect(stilEticheta(k).paleta).not.toBe(stilEticheta(k + 1).paleta)
    }
  })
  it('acoperă toate stilurile', () => {
    expect(new Set(Array.from({ length: 12 }, (_, k) => stilEticheta(k).stil)).size).toBe(STILURI.length)
  })
})

describe('CASETE_RO', () => {
  it('are sursă, an valid și muzică nevrificată până la verificare', () => {
    for (const c of CASETE_RO) {
      expect(c.sursa).toMatch(/^https:\/\//)
      expect(c.an).toBeGreaterThanOrEqual(1988)
      expect(c.an).toBeLessThanOrEqual(2008)
      expect(c.verificat).toBe(false)
    }
  })
  it('încape pe etichete diferite', () => {
    expect(CASETE_RO.length).toBeLessThanOrEqual(84)
  })
})
