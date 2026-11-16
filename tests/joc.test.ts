import { describe, expect, it } from 'vitest'
import { FISE } from '../app/data/fise'
import { RUNDE, alegeRunde, amestecate, fiseJoc, puncteRunda } from '../app/utils/joc'

describe('fiseJoc', () => {
  it('lasă doar fișele cu an exact', () => {
    for (const oras of [null, 'Cluj']) {
      const f = fiseJoc(FISE, oras)
      expect(f.length).toBeGreaterThan(0)
      expect(f.every(x => x.an_exact)).toBe(true)
    }
  })

  it('fișele de oraș intră doar pentru orașul din profil', () => {
    expect(fiseJoc(FISE, null).every(f => f.oras === null)).toBe(true)
    expect(fiseJoc(FISE, 'Cluj').every(f => f.oras === null || f.oras === 'Cluj')).toBe(true)
  })

  it('are destule fișe pentru un joc întreg și fără oraș', () => {
    expect(fiseJoc(FISE, null).length).toBeGreaterThanOrEqual(RUNDE)
  })
})

describe('puncteRunda', () => {
  it('100 la an exact, minus 25 pe fiecare an diferență, niciodată sub 0', () => {
    expect(puncteRunda(1999, 1999)).toBe(100)
    expect(puncteRunda(1998, 1999)).toBe(75)
    expect(puncteRunda(2001, 1999)).toBe(50)
    expect(puncteRunda(1996, 1999)).toBe(25)
    expect(puncteRunda(1995, 1999)).toBe(0)
    expect(puncteRunda(1980, 1999)).toBe(0)
  })
})

describe('alegeRunde', () => {
  it('alege RUNDE fișe diferite, toate cu an exact', () => {
    const r = alegeRunde(FISE, 'Cluj')
    expect(r).toHaveLength(RUNDE)
    expect(new Set(r.map(f => f.id)).size).toBe(RUNDE)
    expect(r.every(f => f.an_exact)).toBe(true)
  })

  it('amestecarea păstrează elementele', () => {
    const l = [1, 2, 3, 4, 5, 6]
    expect(amestecate(l).sort()).toEqual(l)
    expect(l).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('cu un generator fix dă mereu aceeași ordine', () => {
    expect(amestecate([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1])
  })
})
