import { describe, expect, it } from 'vitest'
import { adaugaUnic, citesteActiune, citesteIntrare } from '../app/utils/intrare'

describe('acțiunea amânată până după logare', () => {
  it('păstrează doar acțiunile cunoscute, cu date valide', () => {
    expect(citesteActiune({ tip: 'caseta', id: 'RO-0101' })).toEqual({ tip: 'caseta', id: 'RO-0101' })
    expect(citesteActiune({ tip: 'amavut', id: 'RO-0102' })).toEqual({ tip: 'amavut', id: 'RO-0102' })
    expect(citesteActiune({ tip: 'serie', zi: '2026-11-17' })).toEqual({ tip: 'serie', zi: '2026-11-17' })
    expect(citesteActiune({ tip: 'sterge', id: 'RO-0101' })).toBeNull()
    expect(citesteActiune({ tip: 'caseta', id: '<script>' })).toBeNull()
    expect(citesteActiune({ tip: 'serie', zi: 'azi' })).toBeNull()
    expect(citesteActiune(null)).toBeNull()
  })
  it('citește intrarea din sessionStorage fără să cadă pe text stricat', () => {
    expect(citesteIntrare(null)).toBeNull()
    expect(citesteIntrare('{nu e json')).toBeNull()
    expect(citesteIntrare('"text"')).toBeNull()
    expect(citesteIntrare(JSON.stringify({ inapoi: '/random', actiune: { tip: 'caseta', id: 'RO-0101' } })))
      .toEqual({ inapoi: '/random', actiune: { tip: 'caseta', id: 'RO-0101' } })
    expect(citesteIntrare(JSON.stringify({ actiune: { tip: 'x' } }))).toEqual({ inapoi: '/', actiune: null })
  })
  it('adaugă în casetă fără să comute ce era deja acolo', () => {
    expect(adaugaUnic(['a'], 'b')).toEqual(['a', 'b'])
    expect(adaugaUnic(['a', 'b'], 'b')).toEqual(['a', 'b'])
  })
})
