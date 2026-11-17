import { describe, expect, it } from 'vitest'
import { CAPITOLE, INTREBARI, PREFER, SCENE, TRASATURI, type Intrebare, type Optiune, type Raspunsuri, type Scena } from '../app/data/chestionar'
import { ARHETIPURI, PROFILURI, type Arhetip } from '../app/data/profiluri'
import type { Categorie } from '../app/data/fise'
import { citesteProfil, intrebariRaspunse, nuantaLoc, pickProfile, scoreAnswers } from '../app/utils/profilare'
import { rng, seed } from '../app/utils/casetaZilei'

const CATEGORII_TOATE: Categorie[] = ['Evenimente', 'Muzică', 'Filme & TV', 'Obiecte & Haine', 'Mâncare', 'Locuri']

const cuOptiuni = (q: Intrebare): q is Extract<Intrebare, { optiuni: Optiune[] }> => 'optiuni' in q

// Construiește răspunsuri care împing spre o celulă arhetip × scenă.
function construieste(a: Arhetip, s: Scena): Raspunsuri {
  const alte = [...ARHETIPURI.filter(x => x !== a), ...SCENE.filter(x => x !== s)]
  const net = (p: Optiune['ponderi']) => 10 * (p[a] ?? 0) + 10 * (p[s] ?? 0) - alte.reduce((t, k) => t + Math.max(0, p[k] ?? 0), 0)
  const r: Raspunsuri = {}
  for (const q of INTREBARI) {
    if (q.tip === 'an') r[q.id] = 1985
    else if (q.tip === 'scala') { const n = net(q.ponderi); r[q.id] = n > 0 ? 5 : n < 0 ? 1 : 3 }
    else {
      const best = [...q.optiuni].sort((x, y) => net(y.ponderi) - net(x.ponderi))[0]!
      const id = net(best.ponderi) > 0 ? best.id : (q.optiuni.find(o => o.neutra)?.id ?? best.id)
      r[q.id] = q.tip === 'multiplu' ? [id] : id
    }
  }
  return r
}

function aleatoriu(next: () => number): Raspunsuri {
  const r: Raspunsuri = {}
  for (const q of INTREBARI) {
    if (q.tip === 'an') r[q.id] = q.min + Math.floor(next() * (q.max - q.min + 1))
    else if (q.tip === 'scala') r[q.id] = 1 + Math.floor(next() * 5)
    else if (q.tip === 'multiplu') r[q.id] = q.optiuni.filter(() => next() < 0.35).map(o => o.id).slice(0, q.max)
    else r[q.id] = q.optiuni[Math.floor(next() * q.optiuni.length)]!.id
  }
  return r
}

describe('chestionar', () => {
  it('are în jur de 24 de întrebări în 6 capitole, cu id-uri unice', () => {
    expect(INTREBARI.length).toBeGreaterThanOrEqual(22)
    expect(new Set(INTREBARI.map(q => q.id)).size).toBe(INTREBARI.length)
    expect(new Set(INTREBARI.map(q => q.capitol))).toEqual(new Set(CAPITOLE.map(c => c.id)))
  })
  it('amestecă tipurile de întrebări', () => {
    expect(new Set(INTREBARI.map(q => q.tip))).toEqual(new Set(['an', 'unic', 'multiplu', 'asta-sau-aia', 'scala']))
  })
  it('întrebările sensibile au „Prefer să nu spun” cu ponderi zero', () => {
    for (const id of ['dupa-liceu', 'acasa-acum', 'casa', 'oras']) {
      const q = INTREBARI.find(x => x.id === id)!
      expect(cuOptiuni(q)).toBe(true)
      const p = cuOptiuni(q) ? q.optiuni.find(o => o.id === PREFER) : undefined
      expect(p?.neutra).toBe(true)
      expect(Object.keys(p!.ponderi)).toHaveLength(0)
    }
  })
  it('folosesc doar trăsături și scene cunoscute', () => {
    const chei = new Set<string>([...TRASATURI, ...SCENE])
    for (const q of INTREBARI) {
      const liste = q.tip === 'scala' ? [q.ponderi] : cuOptiuni(q) ? q.optiuni.map(o => o.ponderi) : []
      for (const p of liste) for (const k of Object.keys(p)) expect(chei.has(k)).toBe(true)
    }
  })
})

describe('scoreAnswers', () => {
  it('fără răspunsuri, totul e zero', () => {
    const s = scoreAnswers({})
    expect(Object.values(s.trasaturi).every(v => v === 0)).toBe(true)
    expect(Object.values(s.scene).every(v => v === 0)).toBe(true)
  })
  it('o alegere unică mută trăsătura ei', () => {
    expect(scoreAnswers({ 'fata-blocului': 'liniste' }).trasaturi.cerebral).toBeGreaterThan(0)
    expect(scoreAnswers({ 'prima-caseta': 'rock' }).scene.rock).toBeGreaterThan(0)
  })
  it('scala: mijlocul e neutru, capetele sunt simetrice', () => {
    expect(scoreAnswers({ volum: 3 }).trasaturi.rebel).toBe(0)
    expect(scoreAnswers({ volum: 5 }).trasaturi.rebel).toBe(-scoreAnswers({ volum: 1 }).trasaturi.rebel)
    expect(scoreAnswers({ volum: 9 })).toEqual(scoreAnswers({}))
  })
  it('multiplu: media alegerilor, peste max se taie, duplicatele nu contează', () => {
    const una = scoreAnswers({ comori: ['carti'] }).trasaturi.cerebral
    expect(scoreAnswers({ comori: ['carti', 'carti'] }).trasaturi.cerebral).toBe(una)
    expect(scoreAnswers({ comori: ['carti', 'surprize'] }).trasaturi.cerebral).toBe(una / 2)
    expect(scoreAnswers({ comori: ['carti', 'surprize', 'pegasus'] })).toEqual(scoreAnswers({ comori: ['carti', 'surprize'] }))
  })
  it('răspunsurile necunoscute sunt ignorate', () => {
    expect(scoreAnswers({ 'fata-blocului': 'nu-exista', comori: 'carti', volum: '5' as unknown as number })).toEqual(scoreAnswers({}))
  })
  it('anul nașterii nu influențează profilul', () => {
    expect(scoreAnswers({ 'an-nastere': 1980 })).toEqual(scoreAnswers({ 'an-nastere': 1995 }))
  })
})

describe('„Prefer să nu spun” e neutru', () => {
  const baza = construieste('cerebral', 'rock')
  for (const q of INTREBARI.filter(cuOptiuni).filter(q => q.optiuni.some(o => o.neutra))) {
    it(`la „${q.id}” e totuna cu a nu răspunde`, () => {
      const cuPrefer = { ...baza, [q.id]: PREFER }
      const fara = { ...baza, [q.id]: undefined }
      expect(scoreAnswers(cuPrefer)).toEqual(scoreAnswers(fara))
      expect(citesteProfil(cuPrefer).id).toBe(citesteProfil(fara).id)
    })
  }
  it('în multiplu, „prefer” anulează celelalte bife', () => {
    const q = { id: 'x', capitol: 'gusturi', tip: 'multiplu', max: 2, text: '', optiuni: [{ id: 'a', text: '', ponderi: { umor: 2 } }, { id: PREFER, text: '', ponderi: {}, neutra: true }] } as Intrebare
    expect(scoreAnswers({ x: ['a', PREFER] }, [q])).toEqual(scoreAnswers({}, [q]))
  })
})

describe('profiluri', () => {
  it('sunt cel puțin 36, cu id, nume și citire unice', () => {
    expect(PROFILURI.length).toBeGreaterThanOrEqual(36)
    for (const cheie of ['id', 'nume', 'citire'] as const) expect(new Set(PROFILURI.map(p => p[cheie])).size).toBe(PROFILURI.length)
    expect(new Set(PROFILURI.map(p => p.config.intro)).size).toBe(PROFILURI.length)
  })
  it('au config complet', () => {
    for (const p of PROFILURI) {
      expect(['clasic', 'tapet', 'vhs', 'arhiva']).toContain(p.config.fundal)
      expect(['cald', 'ironic', 'documentar']).toContain(p.config.ton)
      expect(Object.keys(p.config.ponderiCategorii).sort()).toEqual([...CATEGORII_TOATE].sort())
      expect(Object.values(p.config.ponderiCategorii).every(v => v > 0)).toBe(true)
    }
  })
  it('accentul are contrast ≥ 3:1 pe toate fundalurile, deschise și închise', () => {
    const lum = (h: string) => {
      const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
    }
    const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x! + 0.05) / (y! + 0.05) }
    // --paper și --card din banda.css, pentru tema clară, tema închisă și fundalurile alese din /admin.
    const fundaluri = ['#DCE3DA', '#F4F6F1', '#111A15', '#1C2721', '#1E1A12', '#2B251A', '#08090A', '#131617', '#EFE6D0', '#FBF6E8', '#F3E3C8', '#FBF1DE', '#FFF1CF', '#FFFAEA', '#0B0A10', '#16141D']
    for (const p of PROFILURI) {
      expect(p.config.accent).toMatch(/^#[0-9A-F]{6}$/i)
      for (const f of fundaluri) expect(contrast(p.config.accent!, f)).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('pickProfile', () => {
  it('fiecare profil se poate obține din răspunsuri', () => {
    for (const p of PROFILURI) expect(citesteProfil(construieste(p.arhetip, p.scena)).id).toBe(p.id)
  })
  it('e determinist și rupe egalitățile stabil (primul din listă)', () => {
    const r = construieste('social', 'dance')
    expect(citesteProfil(r)).toBe(citesteProfil(r))
    expect(citesteProfil({}).id).toBe(`${ARHETIPURI[0]}-${SCENE[0]}`)
    const egal = scoreAnswers({})
    egal.trasaturi.umor = 0.5
    egal.trasaturi.rebel = 0.5
    egal.scene.manele = 0.5
    egal.scene.rock = 0.5
    expect(pickProfile(egal).id).toBe('rebel-rock')
  })
  it('răspunsuri aleatorii ating multe profiluri, mereu același rezultat pentru același seed', () => {
    const next = rng(seed('capsula'))
    const vazute = new Set<string>()
    for (let i = 0; i < 4000; i++) vazute.add(citesteProfil(aleatoriu(next)).id)
    expect(vazute.size).toBeGreaterThanOrEqual(30)
    const a = rng(seed('x'))
    const b = rng(seed('x'))
    expect(citesteProfil(aleatoriu(a)).id).toBe(citesteProfil(aleatoriu(b)).id)
  })
})

describe('ajutoare', () => {
  it('nuantaLoc citește diaspora, orașul și satul', () => {
    expect(nuantaLoc(scoreAnswers({ 'acasa-acum': 'afara', 'dupa-liceu': 'afara' }))).toBe('diaspora')
    expect(nuantaLoc(scoreAnswers({ oras: 'Cluj', 'acasa-acum': 'alt-oras', 'dupa-liceu': 'facultate' }))).toBe('oras')
    expect(nuantaLoc(scoreAnswers({ oras: 'sat', 'acasa-acum': 'sat' }))).toBe('sat')
    expect(nuantaLoc(scoreAnswers({}))).toBeNull()
  })
  it('intrebariRaspunse numără și „prefer”, dar nu listele goale', () => {
    expect(intrebariRaspunse({ casa: PREFER, comori: [], volum: 3 })).toBe(2)
  })
})
