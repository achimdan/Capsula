import { describe, expect, it } from 'vitest'
import { categorieSugerata, fiseProprieCuAcelasiTitlu } from '../shared/utils/sugestiiFisa'

const v = (...c: string[]) => c.map(categorie => ({ categorie }))

describe('categorieSugerata', () => {
  it('nu propune nimic fără vecini', () => {
    expect(categorieSugerata([])).toBeNull()
  })

  it('propune categoria care are majoritatea, cu cei apropiați cântărind mai mult', () => {
    expect(categorieSugerata(v('Muzică', 'Muzică', 'Obiecte & Haine', 'Muzică'))).toBe('Muzică')
    expect(categorieSugerata(v('Mâncare', 'Locuri', 'Locuri', 'Locuri'))).toBe('Locuri')
  })

  it('tace când vecinii nu se înțeleg', () => {
    expect(categorieSugerata(v('Muzică', 'Locuri', 'Mâncare', 'Evenimente', 'Filme & TV'))).toBeNull()
  })
})

describe('fiseProprieCuAcelasiTitlu', () => {
  const proprii = [{ titlu: 'Primul Platan' }, { titlu: 'Prima bicicletă' }]

  it('găsește titlul scris altfel: majuscule, diacritice, spații', () => {
    expect(fiseProprieCuAcelasiTitlu('  primul   platan ', proprii)).toEqual([{ titlu: 'Primul Platan' }])
    expect(fiseProprieCuAcelasiTitlu('Prima bicicleta!', proprii)).toEqual([{ titlu: 'Prima bicicletă' }])
  })

  it('nu se leagă de titluri doar asemănătoare sau prea scurte', () => {
    expect(fiseProprieCuAcelasiTitlu('Primul platan din curte', proprii)).toEqual([])
    expect(fiseProprieCuAcelasiTitlu('pr', [{ titlu: 'Pr' }])).toEqual([])
  })
})
