import { describe, expect, it } from 'vitest'
import { INTREBARI, PREFER } from '../app/data/chestionar'
import { construiestePasi, esteRaspuns, numarIntrebare, pondereFisa, profilDinRaspunsuri } from '../app/composables/useProfilCitit'

describe('pași chestionar', () => {
  const pasi = construiestePasi()
  it('pune o carte de capitol înaintea întrebărilor lui', () => {
    expect(pasi[0]!.tip).toBe('capitol')
    expect(pasi.filter(p => p.tip === 'capitol')).toHaveLength(6)
    expect(pasi.filter(p => p.tip === 'intrebare')).toHaveLength(INTREBARI.length)
    expect(pasi.at(-1)!.tip).toBe('intrebare')
  })
  it('numără întrebările', () => {
    expect(numarIntrebare(pasi, 0)).toEqual({ curenta: 0, total: INTREBARI.length })
    expect(numarIntrebare(pasi, pasi.length - 1).curenta).toBe(INTREBARI.length)
  })
})

describe('esteRaspuns', () => {
  const q = (id: string) => INTREBARI.find(x => x.id === id)!
  it('validează anul în interval', () => {
    expect(esteRaspuns(q('an-nastere'), 1984)).toBe(true)
    expect(esteRaspuns(q('an-nastere'), 1960)).toBe(false)
    expect(esteRaspuns(q('an-nastere'), null)).toBe(false)
  })
  it('respectă max la alegere multiplă și acceptă prefer', () => {
    expect(esteRaspuns(q('comori'), ['x', 'y', 'z'])).toBe(false)
    expect(esteRaspuns(q('comori'), [])).toBe(false)
    expect(esteRaspuns(q('comori'), [PREFER])).toBe(true)
  })
  it('scala: neutru doar dacă e permis', () => {
    expect(esteRaspuns(q('volum'), 4)).toBe(true)
    expect(esteRaspuns(q('volum'), PREFER)).toBe(false)
    expect(esteRaspuns(q('suni-acasa'), PREFER)).toBe(true)
  })
  it('opțiune unică: doar id existent', () => {
    expect(esteRaspuns(q('oras'), 'Cluj')).toBe(true)
    expect(esteRaspuns(q('oras'), 'Marte')).toBe(false)
  })
})

describe('profilDinRaspunsuri', () => {
  it('ia anul și orașul', () => {
    expect(profilDinRaspunsuri({ 'an-nastere': 1985, 'oras': 'Cluj' })).toEqual({ anNastere: 1985, oras: 'Cluj' })
  })
  it('La sat și Prefer lasă orașul null', () => {
    expect(profilDinRaspunsuri({ 'an-nastere': 1985, 'oras': 'sat' }).oras).toBeNull()
    expect(profilDinRaspunsuri({ 'an-nastere': 1985, 'oras': PREFER }).oras).toBeNull()
  })
})

describe('pondereFisa', () => {
  it('înmulțește greutatea de vârstă cu cea a categoriei', () => {
    expect(pondereFisa(15, 'Muzică', { 'Muzică': 3 })).toBe(9)
    expect(pondereFisa(30, 'Muzică', { 'Muzică': 3 })).toBe(3)
    expect(pondereFisa(15, 'Muzică')).toBe(3)
  })
})
