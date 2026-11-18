import { describe, expect, it } from 'vitest'
import { curataIntrebarea, esteIntrebare, fiseDinRezultate } from '../app/utils/cautare'
import type { Fisa } from '../app/data/fise'

const fisa = (id: string) => ({ id }) as Fisa

describe('curataIntrebarea', () => {
  it('strânge spațiile și taie la 200', () => {
    expect(curataIntrebarea('  vara   la  mare ')).toBe('vara la mare')
    expect(curataIntrebarea('a'.repeat(300))).toHaveLength(200)
  })
})

describe('fiseDinRezultate', () => {
  it('păstrează ordinea relevanței și sare fișele nevizibile', () => {
    expect(fiseDinRezultate(['B', 'X', 'A'], [fisa('A'), fisa('B')]).map(f => f.id)).toEqual(['B', 'A'])
  })
})

describe('esteIntrebare', () => {
  it('recunoaște întrebările', () => {
    expect(esteIntrebare('Ce se mânca la școală?')).toBe(true)
    expect(esteIntrebare('cum era vara la mare')).toBe(true)
    expect(esteIntrebare('Cluj?')).toBe(true)
    expect(esteIntrebare('muzica pe care o ascultam la discotecă')).toBe(true)
  })
  it('lasă cuvintele simple pe căutare', () => {
    expect(esteIntrebare('cluj')).toBe(false)
    expect(esteIntrebare('vara la mare')).toBe(false)
    expect(esteIntrebare('casete')).toBe(false)
    expect(esteIntrebare('ce')).toBe(false)
  })
})
