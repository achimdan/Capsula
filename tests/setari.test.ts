import { describe, expect, it } from 'vitest'
import { FUNDALURI } from '../app/composables/useFundal'
import { CHEI_DB, orasePornite, rutaPermisa, FUNDALURI_VALIDE, LISTE_FISE_VALIDE, SETARI_IMPLICITE, esteFundal, esteListaFise, setariDinRanduri } from '../app/utils/setari'

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
    expect(CHEI_DB).toMatchObject({ fundal: 'fundal', listaFise: 'lista_fise', modul_azi: 'modul_azi' })
    expect(LISTE_FISE_VALIDE.every(esteListaFise)).toBe(true)
    expect(esteListaFise('fundal')).toBe(false)
  })
  it('modulele pornesc oprite și citesc doar booleeni', () => {
    expect(SETARI_IMPLICITE.modul_tv).toBe(false)
    expect(setariDinRanduri([{ key: 'modul_tv', value: true }]).modul_tv).toBe(true)
    expect(setariDinRanduri([{ key: 'modul_tv', value: 'true' }]).modul_tv).toBe(false)
  })
  it('pagina unui modul oprit e blocată, dar nu pentru super admin', () => {
    expect(rutaPermisa('/tv', SETARI_IMPLICITE, false)).toBe(false)
    expect(rutaPermisa('/tv', SETARI_IMPLICITE, true)).toBe(true)
    expect(rutaPermisa('/tv', { ...SETARI_IMPLICITE, modul_tv: true }, false)).toBe(true)
    expect(rutaPermisa('/game', SETARI_IMPLICITE, false)).toBe(true)
  })
  it('București apare doar cu modulul pornit', () => {
    expect(orasePornite(['Cluj'], false)).toEqual(['Cluj'])
    expect(orasePornite(['Cluj'], true)).toEqual(['Cluj', 'București'])
  })
})
