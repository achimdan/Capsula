import { describe, expect, it } from 'vitest'
import { fisaDinRand, idRand, randDinFormular, valideazaFisa, type FisaNoua } from '../app/utils/fiseProprii'

const buna: FisaNoua = { titlu: '  Primul walkman  ', nota: 'De la mătușa din Germania.', an: 1994, categorie: 'Obiecte & Haine' }

describe('valideazaFisa', () => {
  it('acceptă o fișă completă', () => {
    expect(valideazaFisa(buna, 2026)).toBeNull()
  })
  it('cere titlu, an și categorie', () => {
    expect(valideazaFisa({ ...buna, titlu: '   ' }, 2026)).toBe('Scrie un titlu.')
    expect(valideazaFisa({ ...buna, an: null }, 2026)).toBe('Alege anul.')
    expect(valideazaFisa({ ...buna, categorie: null }, 2026)).toBe('Alege categoria.')
  })
  it('respectă limitele din baza de date', () => {
    expect(valideazaFisa({ ...buna, titlu: 'x'.repeat(81) }, 2026)).toMatch(/80/)
    expect(valideazaFisa({ ...buna, nota: 'x'.repeat(501) }, 2026)).toMatch(/500/)
    expect(valideazaFisa({ ...buna, an: 1899 }, 2026)).toMatch(/1900/)
    expect(valideazaFisa({ ...buna, an: 2027 }, 2026)).toMatch(/2026/)
    expect(valideazaFisa({ ...buna, an: 1994.5 }, 2026)).toBe('Alege anul.')
  })
  it('nu primește ani dinainte de nașterea utilizatorului', () => {
    expect(valideazaFisa({ ...buna, an: 1979 }, 2026, 1980)).toBe('Anul e între 1980 și 2026.')
    expect(valideazaFisa({ ...buna, an: 1980 }, 2026, 1980)).toBeNull()
  })
})

describe('randDinFormular', () => {
  it('taie spațiile și păstrează câmpurile', () => {
    expect(randDinFormular(buna)).toEqual({ title: 'Primul walkman', note: 'De la mătușa din Germania.', year: 1994, category: 'Obiecte & Haine' })
  })
})

describe('fisaDinRand', () => {
  const rand = { id: 'a1b2', title: 'Primul walkman', note: '', year: 1994, category: 'Obiecte & Haine' }
  it('face o fișă proprie, neverificată, cu id prefixat', () => {
    const f = fisaDinRand(rand)!
    expect(f).toMatchObject({ id: 'U-a1b2', titlu: 'Primul walkman', an: 1994, oras: null, verificat: false, proprie: true })
    expect(f.culori).toHaveLength(2)
  })
  it('sare peste categoriile necunoscute', () => {
    expect(fisaDinRand({ ...rand, category: 'Altceva' })).toBeNull()
  })
  it('idRand întoarce id-ul din baza de date doar pentru fișele proprii', () => {
    expect(idRand('U-a1b2')).toBe('a1b2')
    expect(idRand('RO-0102')).toBeNull()
  })
})
