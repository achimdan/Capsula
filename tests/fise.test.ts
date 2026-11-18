import { describe, expect, it } from 'vitest'
import { fisaDinTabel, fiseDinRanduri, randTabelDinFisa } from '../app/utils/fise'
import { FISE, SEED_FISE } from './fixtures/fise'

describe('maparea fișelor', () => {
  it('rând → Fisa → rând nu pierde și nu adaugă nimic', () => {
    for (const { ordine, ...f } of SEED_FISE) {
      expect(fisaDinTabel(randTabelDinFisa({ ...f, ordine }))).toStrictEqual(f)
    }
  })

  it('păstrează ordinea din importul inițial, oricum vin rândurile', () => {
    const inversate = [...SEED_FISE].reverse().map(randTabelDinFisa)
    expect(fiseDinRanduri(inversate).map(f => f.id)).toEqual(SEED_FISE.map(f => f.id))
    expect(FISE.length).toBe(117)
  })

  it('câmpurile opționale lipsă rămân absente, nu null', () => {
    const r = randTabelDinFisa({ ...SEED_FISE[0]!, ordine: 1 })
    const f = fisaDinTabel({ ...r, poza_autor: null, poza_licenta: null, poza_url: null, poza_generata: null, poza_alt: null })
    expect('poza' in f).toBe(false)
    expect('video' in f).toBe(false)
    expect('embed' in f).toBe(false)
  })

  it('pune textul alternativ doar când există', () => {
    const cuPoza = SEED_FISE.find(f => f.poza)!
    const r = randTabelDinFisa(cuPoza)
    expect('alt' in fisaDinTabel(r).poza!).toBe(false)
    expect(fisaDinTabel({ ...r, poza_alt: 'O casetă pe o masă.' }).poza!.alt).toBe('O casetă pe o masă.')
  })
})
