import { describe, expect, it } from 'vitest'
import { caleVarianta, marimeVarianta, pozeDinFisiere, toateVariantele, valideazaSursa } from '../app/utils/pozeProprii'
import { caiPozaRand, fisaDinRand, srcPoza } from '../app/utils/fiseProprii'

const U = '11111111-1111-1111-1111-111111111111'
const P = '22222222-2222-2222-2222-222222222222'
const Q = '33333333-3333-3333-3333-333333333333'

describe('pozeDinFisiere', () => {
  it('păstrează doar pozele cu ambele variante, cele mai noi primele', () => {
    const l = pozeDinFisiere(U, [
      { name: `${P}-480.webp`, created_at: '2026-11-01' },
      { name: `${P}-960.webp`, created_at: '2026-11-01' },
      { name: `${Q}-480.jpg`, created_at: '2026-11-02' },
      { name: `${Q}-960.jpg`, created_at: '2026-11-02' },
      { name: 'alt.png' },
      { name: `${U}-480.webp` }
    ])
    expect(l).toEqual([
      { cale: `${U}/${Q}`, ext: 'jpg', creata: '2026-11-02' },
      { cale: `${U}/${P}`, ext: 'webp', creata: '2026-11-01' }
    ])
  })
})

describe('variante', () => {
  it('numește variantele', () => {
    expect(caleVarianta(`${U}/${P}`, 480, 'webp')).toBe(`${U}/${P}-480.webp`)
    expect(toateVariantele({ cale: 'a', ext: 'jpg' })).toEqual(['a-480.jpg', 'a-960.jpg'])
  })
  it('nu mărește peste original și păstrează raportul', () => {
    expect(marimeVarianta(4000, 3000, 960)).toEqual({ width: 960, height: 720 })
    expect(marimeVarianta(300, 600, 480)).toEqual({ width: 300, height: 600 })
  })
  it('validează fișierul ales', () => {
    expect(valideazaSursa({ type: 'image/heic', size: 1000 })).toBeNull()
    expect(valideazaSursa({ type: 'application/pdf', size: 1000 })).toMatch(/imagine/)
    expect(valideazaSursa({ type: 'image/jpeg', size: 30 * 1024 * 1024 })).toMatch(/20 MB/)
  })
})

describe('poza fișei proprii', () => {
  const rand = { id: 'x', title: 'Walkman', note: '', year: 1995, category: 'Obiecte & Haine', photo: `${U}/${P}`, photo_ext: 'webp' }
  it('pune linkurile semnate pe fișă', () => {
    const [m, M] = caiPozaRand(rand)!
    const f = fisaDinRand(rand, { [m]: 'https://s/m', [M]: 'https://s/M' })!
    expect(f.imagine).toEqual({ mica: 'https://s/m', mare: 'https://s/M' })
    expect(f.poza?.alt).toBe('Walkman')
    expect(srcPoza(f, 960)).toBe('https://s/M')
  })
  it('fără link (poza ștearsă) fișa rămâne fără poză', () => {
    const f = fisaDinRand(rand, {})!
    expect(f.poza).toBeUndefined()
    expect(srcPoza({ id: 'RO-0001' }, 480)).toBe('/fise/RO-0001-480.webp')
  })
})
