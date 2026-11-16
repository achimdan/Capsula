import { describe, expect, it } from 'vitest'
import { categoriiPreferate, eDinScena, ordineCategorii, ordoneazaFise, ORDINE_CATEGORII } from '../app/utils/personalizare'
import { FISE, type Categorie } from '../app/data/fise'
import { PROFILURI } from '../app/data/profiluri'
import { SCENE } from '../app/data/chestionar'

const f = (an: number, categorie: Categorie, id = `${an}-${categorie}`) => ({ id, an, categorie })

describe('ordineCategorii', () => {
  it('fără profil păstrează ordinea obișnuită', () => {
    expect(ordineCategorii()).toEqual(ORDINE_CATEGORII)
  })
  it('pune categoriile cu pondere mare primele, iar la egalitate ține ordinea obișnuită', () => {
    expect(ordineCategorii({ 'Mâncare': 3, 'Muzică': 3, 'Evenimente': 1 }))
      .toEqual(['Muzică', 'Mâncare', 'Evenimente', 'Filme & TV', 'Obiecte & Haine', 'Locuri'])
  })
  it('ordonează doar categoriile primite', () => {
    expect(ordineCategorii({ 'Locuri': 3 }, ['Evenimente', 'Locuri'])).toEqual(['Locuri', 'Evenimente'])
  })
})

describe('ordoneazaFise', () => {
  const lista = [f(1991, 'Evenimente'), f(1990, 'Evenimente'), f(1990, 'Mâncare'), f(1990, 'Muzică')]
  it('fără profil sortează doar după an, stabil', () => {
    expect(ordoneazaFise(lista).map(x => x.id)).toEqual(['1990-Evenimente', '1990-Mâncare', '1990-Muzică', '1991-Evenimente'])
  })
  it('în același an pune întâi categoriile preferate', () => {
    expect(ordoneazaFise(lista, { 'Mâncare': 3, 'Evenimente': 1 }).map(x => x.id))
      .toEqual(['1990-Mâncare', '1990-Evenimente', '1990-Muzică', '1991-Evenimente'])
  })
  it('nu modifică lista primită', () => {
    const copie = [...lista]
    ordoneazaFise(lista, { 'Mâncare': 3 })
    expect(lista).toEqual(copie)
  })
  it('profiluri diferite dau ordini diferite pe fișele reale', () => {
    const ordini = new Set(PROFILURI.map(p => ordoneazaFise(FISE, p.config.ponderiCategorii).map(x => x.id).join()))
    expect(ordini.size).toBeGreaterThan(1)
  })
  it('nicio categorie nu e prima pistă pe bandă (ordineCategorii) la majoritatea profilurilor', () => {
    const prima = new Map<string, number>()
    for (const p of PROFILURI) {
      const c = ordineCategorii(p.config.ponderiCategorii)[0]!
      prima.set(c, (prima.get(c) ?? 0) + 1)
    }
    expect(Math.max(...prima.values())).toBeLessThanOrEqual(PROFILURI.length / 2)
    expect(prima.size).toBeGreaterThanOrEqual(4)
  })
})

describe('categoriiPreferate', () => {
  it('întoarce categoriile cu ponderea maximă', () => {
    expect(categoriiPreferate({ 'Evenimente': 1, 'Muzică': 3, 'Filme & TV': 3, 'Obiecte & Haine': 2, 'Mâncare': 1, 'Locuri': 2 }))
      .toEqual(['Muzică', 'Filme & TV'])
  })
  it('nimic când nu e profil sau ponderile sunt egale', () => {
    expect(categoriiPreferate()).toEqual([])
    expect(categoriiPreferate({})).toEqual([])
  })
})

describe('scena fișelor', () => {
  it('doar fișele de muzică au scenă, și doar una validă', () => {
    for (const x of FISE.filter(x => x.scena)) {
      expect(x.categorie).toBe('Muzică')
      expect(SCENE).toContain(x.scena)
    }
  })
  it('eDinScena cere scena profilului', () => {
    expect(eDinScena({ scena: 'rock' }, 'rock')).toBe(true)
    expect(eDinScena({ scena: 'rock' }, 'pop')).toBe(false)
    expect(eDinScena({}, 'rock')).toBe(false)
    expect(eDinScena({ scena: 'rock' }, null)).toBe(false)
  })
})
