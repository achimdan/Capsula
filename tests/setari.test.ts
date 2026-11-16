import { describe, expect, it } from 'vitest'
import { FUNDALURI } from '../app/composables/useFundal'
import { CHEI_DB, FUNDALURI_VALIDE, LISTE_FISE_VALIDE, SETARI_IMPLICITE, esteFundal, esteListaFise, setariDinRanduri } from '../app/utils/setari'

describe('setările site-ului', () => {
  it('fără rânduri: valorile implicite', () => {
    expect(setariDinRanduri([])).toEqual(SETARI_IMPLICITE)
  })
  it('ia fundalul din rândul lui', () => {
    expect(setariDinRanduri([{ key: 'fundal', value: 'vhs' }]).fundal).toBe('vhs')
  })
  it('ignoră valori și chei necunoscute', () => {
    expect(setariDinRanduri([{ key: 'fundal', value: 'neon' }]).fundal).toBe('clasic')
    expect(setariDinRanduri([{ key: 'fundal', value: 3 }]).fundal).toBe('clasic')
    expect(setariDinRanduri([{ key: 'altceva', value: 'vhs' }])).toEqual(SETARI_IMPLICITE)
  })
  it('lista din admin are exact fundalurile valide (aceleași ca în constrângerea din DB)', () => {
    expect(FUNDALURI.map(f => f.id)).toEqual([...FUNDALURI_VALIDE])
    expect(FUNDALURI_VALIDE.every(esteFundal)).toBe(true)
  })
  it('ia tipul listei din rândul lista_fise', () => {
    expect(setariDinRanduri([{ key: 'lista_fise', value: 'cronologie' }]).listaFise).toBe('cronologie')
    expect(setariDinRanduri([{ key: 'lista_fise', value: 'carusel' }]).listaFise).toBe('grila')
    expect(setariDinRanduri([{ key: 'listaFise', value: 'cronologie' }]).listaFise).toBe('grila')
  })
  it('cheile din DB și valorile valide', () => {
    expect(CHEI_DB).toEqual({ fundal: 'fundal', listaFise: 'lista_fise' })
    expect(LISTE_FISE_VALIDE.every(esteListaFise)).toBe(true)
    expect(esteListaFise('fundal')).toBe(false)
  })
})
