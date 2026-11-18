import { describe, expect, it } from 'vitest'
import { textFisa } from '../shared/utils/cautare'

describe('textFisa', () => {
  const baza = { titlu: 'Eclipsa totală', nota: 'Ochelari speciali.', an: 1999, categorie: 'Evenimente', oras: null }

  it('pune anul exact și România pentru fișele naționale', () => {
    expect(textFisa({ ...baza, an_exact: true })).toBe('Eclipsa totală. Ochelari speciali. (Evenimente, 1999, România)')
  })

  it('marchează anul aproximativ și orașul', () => {
    expect(textFisa({ ...baza, an_exact: false, oras: 'Cluj' })).toContain('în jur de 1999, Cluj')
  })
})
