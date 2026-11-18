import { describe, expect, it } from 'vitest'
import { fisaVizibila, contextFise, citari, faraCitariInventate, diacriticeCorecte } from '../shared/utils/intrebare'

describe('fisaVizibila', () => {
  it('arată fișele naționale oricui', () => {
    expect(fisaVizibila({ oras: null }, [])).toBe(true)
  })
  it('arată straturile orașelor deblocate, oricare ar fi orașul omului', () => {
    expect(fisaVizibila({ oras: 'Cluj' }, ['Cluj'])).toBe(true)
    expect(fisaVizibila({ oras: 'Iași' }, ['Cluj', 'București'])).toBe(false)
  })
})

describe('contextFise', () => {
  const baza = { id: 'RO-0001', titlu: 'Eclipsa', nota: 'Ochelari.', an: 1999, categorie: 'Evenimente', oras: null }
  it('marchează anul nesigur și fișa neverificată', () => {
    const t = contextFise([{ ...baza, an_exact: false, verificat: false }])
    expect(t).toContain('[RO-0001] [NEVERIFICATĂ]')
    expect(t).toContain('cca 1999')
  })
  it('lasă anul exact și fișa verificată fără marcaje', () => {
    const t = contextFise([{ ...baza, an_exact: true, verificat: true }])
    expect(t).toBe('[RO-0001] Eclipsa — 1999, Evenimente, România\nOchelari.')
  })
})

describe('citări', () => {
  const text = 'Casete [RO-0002], walkman [RO-0009] și iar [RO-0002].'
  it('păstrează doar id-urile din context, o dată, în ordine', () => {
    expect(citari(text, ['RO-0002', 'RO-0005'])).toEqual(['RO-0002'])
  })
  it('scoate din text id-urile inventate', () => {
    expect(faraCitariInventate(text, ['RO-0002'])).toBe('Casete [RO-0002], walkman și iar [RO-0002].')
  })
})

describe('diacriticeCorecte', () => {
  it('înlocuiește sedila cu virgula', () => {
    expect(diacriticeCorecte('Şcoala ţine aşa Ţara')).toBe('Școala ține așa Țara')
  })
})
