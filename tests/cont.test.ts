import { describe, expect, it } from 'vitest'
import { CHESTIONAR_GOL, STARE_GOALA, decideStare, difCaseta, randChestionar, randProfil, stareDinRanduri, type StareCont } from '../app/utils/cont'

const facut: StareCont = {
  profil: { anNastere: 1986, oras: 'Cluj-Napoca', localitate: 54975 },
  profilCitit: { id: 'arhivarul', trasaturi: { nostalgie: 4, social: 2 } },
  chestionar: { raspunsuri: { 'an-nastere': 1986 }, pas: 12, refacere: false },
  caseta: ['f1', 'f2']
}

describe('maparea rând ↔ stare', () => {
  it('fără rânduri: stare goală', () => {
    expect(stareDinRanduri(null, null, [])).toEqual(STARE_GOALA)
  })
  it('dus-întors păstrează profilul și chestionarul', () => {
    const p = randProfil(facut.profil, facut.profilCitit)
    const c = { ...randChestionar(facut.chestionar, false), completed_at: null }
    expect(stareDinRanduri(p, c, facut.caseta)).toEqual(facut)
  })
  it('ignoră valori stricate din jsonb', () => {
    const s = stareDinRanduri(
      { birth_year: 1990, city: null, locality_siruta: null, reader_profile_id: 'x', reader_traits: { a: 1, b: 'nu' } },
      { answers: [1, 2], step: -3, is_retake: true, completed_at: null },
      []
    )
    expect(s.profilCitit).toEqual({ id: 'x', trasaturi: { a: 1 } })
    expect(s.chestionar).toEqual({ raspunsuri: {}, pas: 0, refacere: true })
  })
  it('marchează finalul chestionarului doar la terminare', () => {
    expect(randChestionar(CHESTIONAR_GOL, false)).not.toHaveProperty('completed_at')
    expect(randChestionar(CHESTIONAR_GOL, true).completed_at).toMatch(/^\d{4}-/)
  })
})

describe('difCaseta', () => {
  it('adaugă și șterge doar diferențele', () => {
    expect(difCaseta(['a', 'b'], ['b', 'c'])).toEqual({ adauga: ['c'], sterge: ['a'] })
    expect(difCaseta(['a'], ['a'])).toEqual({ adauga: [], sterge: [] })
  })
})

describe('decideStare la login', () => {
  it('cont gol + date în browser de dinainte de cont: le urcă', () => {
    expect(decideStare(STARE_GOALA, facut, null, 'u1')).toEqual({ stare: facut, importa: true })
  })
  it('contul are date: contul câștigă', () => {
    const local = { ...facut, caseta: ['alta'] }
    expect(decideStare(facut, local, null, 'u1')).toEqual({ stare: facut, importa: false })
  })
  it('datele din browser sunt ale altui cont: nu se moștenesc', () => {
    expect(decideStare(STARE_GOALA, facut, 'u2', 'u1')).toEqual({ stare: STARE_GOALA, importa: false })
  })
  it('nimic nicăieri: stare goală, fără import', () => {
    expect(decideStare(STARE_GOALA, STARE_GOALA, null, 'u1')).toEqual({ stare: STARE_GOALA, importa: false })
  })
})
