import { describe, expect, it } from 'vitest'
import { anVecinCuFise, cateFise, catiAni, indexDinScroll, varstaInAn, varstaScurta } from '../app/utils/cronologie'

describe('cronologie', () => {
  it('acordă numărul cu „de” doar de la 20 în sus', () => {
    expect(catiAni(1)).toBe('un an')
    expect(catiAni(2)).toBe('2 ani')
    expect(catiAni(19)).toBe('19 ani')
    expect(catiAni(20)).toBe('20 de ani')
    expect(catiAni(100)).toBe('100 de ani')
    expect(catiAni(101)).toBe('101 ani')
    expect(cateFise(0)).toBe('0 fișe')
    expect(cateFise(1)).toBe('1 fișă')
    expect(cateFise(19)).toBe('19 fișe')
    expect(cateFise(20)).toBe('20 de fișe')
    expect(cateFise(3)).toBe('3 fișe')
    expect(cateFise(24)).toBe('24 de fișe')
  })

  it('spune câți ani aveai într-un an, pornind de la anul în care aveai 15', () => {
    expect(varstaInAn(1998, 1998)).toBe('Aveai 15 ani')
    expect(varstaInAn(1984, 1998)).toBe('Aveai un an')
    expect(varstaInAn(2008, 1998)).toBe('Aveai 25 de ani')
    expect(varstaInAn(1983, 1998)).toBe('Anul în care te-ai născut')
    expect(varstaInAn(1982, 1998)).toBe('Cu un an înainte să te naști')
    expect(varstaInAn(1960, 1998)).toBe('Cu 23 de ani înainte să te naști')
  })

  it('lasă gol sub anii dinainte să te naști', () => {
    expect(varstaScurta(1990, 1998)).toBe('7 ani')
    expect(varstaScurta(1983, 1998)).toBe('te naști')
    expect(varstaScurta(1970, 1998)).toBe('')
  })

  it('sare la următorul an cu fișe, în ambele direcții', () => {
    const ani = [1975, 1989, 1990, 1996]
    expect(anVecinCuFise(ani, 1989, 1)).toBe(1990)
    expect(anVecinCuFise(ani, 1989, -1)).toBe(1975)
    expect(anVecinCuFise(ani, 1992, 1)).toBe(1996)
    expect(anVecinCuFise(ani, 1996, 1)).toBeNull()
    expect(anVecinCuFise(ani, 1975, -1)).toBeNull()
  })

  it('află anul din mijlocul benzii din scroll', () => {
    expect(indexDinScroll(0, 180, 30)).toBe(0)
    expect(indexDinScroll(260, 180, 30)).toBe(1)
    expect(indexDinScroll(280, 180, 30)).toBe(2)
    expect(indexDinScroll(99999, 180, 30)).toBe(29)
    expect(indexDinScroll(-40, 180, 30)).toBe(0)
    expect(indexDinScroll(100, 0, 30)).toBe(0)
  })
})
