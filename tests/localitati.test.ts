import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { INTREBARI, PREFER, type Intrebare } from '../app/data/chestionar'
import { esteRaspuns, profilDinRaspunsuri } from '../app/composables/useProfilCitit'
import { scoreAnswers } from '../app/utils/profilare'
import {
  cauta, citesteRaspunsLocalitate, descrie, eticheta, indexeaza, normalizeaza, provincieJudet, raspunsLocalitate,
  type DateLocalitati
} from '../app/utils/localitati'

// Fișierul real, generat din SIRUTA: testele prind și o regenerare greșită.
const date = JSON.parse(readFileSync(new URL('../public/data/localitati.json', import.meta.url), 'utf8')) as DateLocalitati
const idx = indexeaza(date)
const nume = (siruta: number) => descrie(idx, siruta)!

describe('lista SIRUTA', () => {
  it('are toate județele și scurtăturile din chestionar', () => {
    expect(date.judete).toHaveLength(42)
    expect(Object.values(date.scurtaturi).sort()).toEqual(
      ['Brașov', 'București', 'Cluj', 'Constanța', 'Craiova', 'Galați', 'Iași', 'Oradea', 'Sibiu', 'Timișoara'])
    expect(date.loc.length).toBeGreaterThan(13000)
  })
  it('folosește diacriticele cu virgulă și cuvintele mici cu literă mică', () => {
    expect(date.loc.some(l => /[ŞşŢţ]/.test(l[1]))).toBe(false)
    expect(date.loc.some(l => l[1] === 'Aiudul de Sus')).toBe(true)
  })
})

describe('normalizeaza', () => {
  it('scoate diacriticele, inclusiv cele cu sedilă', () => {
    expect(normalizeaza('  Bistrița-Năsăud ')).toBe('bistrita-nasaud')
    expect(normalizeaza('ŞTEFĂNEŞTI')).toBe('stefanesti')
  })
})

describe('cauta', () => {
  it('pune municipiul înaintea satelor cu același nume', () => {
    const [primul] = cauta(idx, 'tecuci')
    expect(nume(primul!)).toMatchObject({ nume: 'Tecuci', urban: true, judet: { nume: 'Galați' } })
    expect(cauta(idx, 'tecuci').length).toBeGreaterThan(1)
  })
  it('găsește fără diacritice și după început', () => {
    expect(nume(cauta(idx, 'bistrit')[0]!).nume).toBe('Bistrița')
    expect(nume(cauta(idx, 'Cluj')[0]!).nume).toBe('Cluj-Napoca')
  })
  it('restrânge după comună sau județ', () => {
    const rez = cauta(idx, 'floresti cluj').map(nume)
    expect(rez[0]).toMatchObject({ nume: 'Florești', judet: { nume: 'Cluj' } })
    expect(rez.every(l => l.judet.nume === 'Cluj' || l.uat.nume.includes('Cluj'))).toBe(true)
  })
  it('nu caută sub două litere', () => {
    expect(cauta(idx, 'a')).toEqual([])
  })
})

describe('descrie și eticheta', () => {
  it('Bucureștiul și sectoarele', () => {
    const b = nume(cauta(idx, 'bucuresti')[0]!)
    expect(b).toMatchObject({ nume: 'București', urban: true, regiuneDezvoltare: 'București-Ilfov', provincie: 'Muntenia' })
    expect(eticheta(b)).toBe('Capitala')
  })
  it('satele spun comuna și județul', () => {
    const sat = cauta(idx, 'tecuci').map(nume).find(l => !l.urban)!
    expect(eticheta(sat)).toBe('sat, com. Balaci, jud. Teleorman')
    expect(eticheta(nume(cauta(idx, 'tecuci')[0]!))).toBe('municipiu, jud. Galați')
  })
  it('provincia istorică după județ', () => {
    expect(provincieJudet(12)).toBe('Transilvania')
    expect(provincieJudet(33)).toBe('Bucovina')
    expect(provincieJudet(13)).toBe('Dobrogea')
  })
})

describe('răspunsul din chestionar', () => {
  const oras = INTREBARI.find(q => q.id === 'oras') as Intrebare
  const tecuci = nume(cauta(idx, 'tecuci')[0]!)
  const sat = cauta(idx, 'tecuci').map(nume).find(l => !l.urban)!

  it('se codează și se citește înapoi', () => {
    expect(citesteRaspunsLocalitate(raspunsLocalitate(tecuci))).toEqual({ siruta: tecuci.siruta, urban: true })
    expect(citesteRaspunsLocalitate('loc:abc:u')).toBeNull()
    expect(citesteRaspunsLocalitate('Cluj')).toBeNull()
  })
  it('e un răspuns valid doar la întrebarea cu localitate', () => {
    expect(esteRaspuns(oras, raspunsLocalitate(tecuci))).toBe(true)
    const alta = INTREBARI.find(q => q.tip === 'unic' && q.id !== 'oras')!
    expect(esteRaspuns(alta, raspunsLocalitate(tecuci))).toBe(false)
  })
  it('urban cântărește ca „Alt oraș”, rural ca „La sat”', () => {
    const urban = scoreAnswers({ oras: raspunsLocalitate(tecuci) }).trasaturi.urban
    expect(urban).toBeCloseTo(scoreAnswers({ oras: 'Alt oraș' }).trasaturi.urban)
    const rural = scoreAnswers({ oras: raspunsLocalitate(sat) }).trasaturi
    expect(rural).toEqual(scoreAnswers({ oras: 'sat' }).trasaturi)
  })
  it('profilul păstrează codul SIRUTA', () => {
    expect(profilDinRaspunsuri({ 'an-nastere': 1984, 'oras': raspunsLocalitate(tecuci) }))
      .toEqual({ anNastere: 1984, oras: 'Alt oraș', localitate: tecuci.siruta })
    expect(profilDinRaspunsuri({ oras: raspunsLocalitate(sat) })).toMatchObject({ oras: null, localitate: sat.siruta })
    expect(profilDinRaspunsuri({ oras: PREFER }).localitate).toBeNull()
  })
})
