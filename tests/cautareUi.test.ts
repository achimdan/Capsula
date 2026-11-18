import { describe, expect, it } from 'vitest'
import { curataIntrebarea, fiseDinRezultate } from '../app/utils/cautare'
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
