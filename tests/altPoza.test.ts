import { describe, expect, it } from 'vitest'
import { ALT_MAX, curataAlt, promptAlt } from '../shared/utils/altPoza'

describe('curataAlt', () => {
  it('scoate începuturile de tip „Imaginea arată” și ghilimelele', () => {
    expect(curataAlt('„Imaginea arată o casetă neagră pe o masă.”')).toBe('O casetă neagră pe o masă.')
    expect(curataAlt('În imagine se vede un grup de tineri.')).toBe('Un grup de tineri.')
  })

  it('scrie ș și ț cu virgulă și strânge spațiile', () => {
    expect(curataAlt('  O  maşină   pe  şosea ')).toBe('O mașină pe șosea')
  })

  it('taie textele prea lungi la un cuvânt întreg', () => {
    const t = curataAlt('cuvânt '.repeat(60))!
    expect(t.length).toBeLessThanOrEqual(ALT_MAX + 1)
    expect(t.endsWith('…')).toBe(true)
    expect(t).not.toMatch(/\s…$/u)
  })

  it('întoarce null când nu rămâne nimic', () => {
    expect(curataAlt('  „” ')).toBeNull()
  })
})

describe('promptAlt', () => {
  it('pune titlul fișei în prompt', () => {
    expect(promptAlt('Prima pizza din oraș')).toContain('„Prima pizza din oraș”')
  })
})
