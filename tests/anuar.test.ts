import { describe, expect, it } from 'vitest'
import type { Fisa } from '../app/data/fise'
import { aniRigla, capitolActiv, capitoleAnuar } from '../app/utils/anuar'

const fisa = (id: string, an: number, poza = false) => ({
  id, an, titlu: id, nota: '', an_exact: true, categorie: 'Muzică', oras: null, verificat: true, culori: ['#000', '#fff'],
  ...(poza ? { poza: { autor: 'x', licenta: 'CC0' } } : {})
}) as unknown as Fisa

describe('capitoleAnuar', () => {
  it('grupează pe ani, crescător, doar anii cu fișe', () => {
    const c = capitoleAnuar([fisa('a', 1999), fisa('b', 1990), fisa('c', 1999)])
    expect(c.map(x => x.an)).toEqual([1990, 1999])
    expect(c[1]!.rest.map(f => f.id)).toEqual(['c'])
  })
  it('deschide capitolul cu prima fișă care are poză', () => {
    const c = capitoleAnuar([fisa('a', 1994), fisa('b', 1994, true), fisa('c', 1994, true)])
    expect(c[0]!.deschidere.id).toBe('b')
    expect(c[0]!.rest.map(f => f.id)).toEqual(['a', 'c'])
  })
  it('fără poze, deschide cu prima fișă', () => {
    expect(capitoleAnuar([fisa('a', 1994), fisa('b', 1994)])[0]!.deschidere.id).toBe('a')
  })
  it('listă goală → niciun capitol', () => {
    expect(capitoleAnuar([])).toEqual([])
  })
})

describe('aniRigla', () => {
  const cap = capitoleAnuar([fisa('a', 1990), fisa('b', 1990), fisa('c', 1993)])
  it('acoperă tot intervalul, cu golurile la zero', () => {
    expect(aniRigla(cap, null)).toEqual([{ an: 1990, numar: 2 }, { an: 1991, numar: 0 }, { an: 1992, numar: 0 }, { an: 1993, numar: 1 }])
  })
  it('include anul tău chiar în afara intervalului', () => {
    const r = aniRigla(cap, 1995)
    expect(r.at(-1)).toEqual({ an: 1995, numar: 0 })
  })
  it('fără capitole, rigla e goală', () => {
    expect(aniRigla([], 1994)).toEqual([])
  })
})

describe('capitolActiv', () => {
  it('ia ultimul capitol care a trecut de linie', () => {
    expect(capitolActiv([-900, -100, 300, 1200], 400)).toBe(2)
  })
  it('rămâne pe primul până trece vreunul', () => {
    expect(capitolActiv([500, 1500], 400)).toBe(0)
  })
})
