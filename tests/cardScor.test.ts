import { describe, expect, it } from 'vitest'
import { continutCard, generatie, notaRunda, numeFisierCard, textShare } from '../app/utils/cardScor'

describe('cardul de scor', () => {
  it('notează fiecare rundă: exact sau cu cât ai greșit, cu semn', () => {
    expect(notaRunda({ an: 1999, ghicit: 1999, puncte: 100 })).toBe('exact')
    expect(notaRunda({ an: 1999, ghicit: 2000, puncte: 80 })).toBe('+1 an')
    expect(notaRunda({ an: 1999, ghicit: 1996, puncte: 45 })).toBe('−3 ani')
  })

  it('generația se scrie scurt, iar fără an de naștere lipsește', () => {
    expect(generatie(1985)).toBe('Generația ’85')
    expect(generatie(2001)).toBe('Generația ’01')
    expect(generatie(null)).toBeNull()
  })

  it('pune pe card scorul, titlul și toate rundele', () => {
    const c = continutCard({
      scor: 340, max: 500, titlu: 'Ureche bună de casetofon', anNastere: 1987, host: 'capsula.example',
      runde: [{ an: 1994, ghicit: 1994, puncte: 100 }, { an: 2001, ghicit: 1999, puncte: 60 }]
    })
    expect(c).toMatchObject({ scor: '340', din: '/500', titlu: 'Ureche bună de casetofon', generatie: 'Generația ’87', subsol: 'capsula.example', eticheta: 'Ghicește anul · 2 runde' })
    expect(c.runde).toEqual([{ an: '1994', nota: 'exact' }, { an: '2001', nota: '−2 ani' }])
  })

  it('textul și numele fișierului', () => {
    expect(textShare(340, 500)).toContain('340/500')
    expect(numeFisierCard(340)).toBe('capsula-ghiceste-anul-340.png')
  })
})
