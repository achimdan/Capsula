import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { cheiLocale, construiesteExport, numeFisierExport } from '../app/utils/datePersonale'

describe('cheiLocale', () => {
  it('păstrează doar cheile aplicației', () => {
    expect(cheiLocale(['capsula:profil', 'sb-abc-auth-token', 'capsula:caseta', 'altceva', 'xcapsula:y']))
      .toEqual(['capsula:profil', 'capsula:caseta'])
  })
})

describe('construiesteExport', () => {
  it('pune valori goale unde contul nu are date', () => {
    const acum = new Date('2026-11-16T10:00:00Z')
    const e = construiesteExport({ id: 'u1', email: 'a@b.ro', nume: null, avatar: null }, { profil: null, chestionar: null, caseta: null, amintiri: null }, acum)
    expect(e).toEqual({ exportat_la: '2026-11-16T10:00:00.000Z', cont: { id: 'u1', email: 'a@b.ro', nume: null, avatar: null }, profil: null, chestionar: null, caseta: [], amintiri: [] })
  })

  it('numește fișierul după zi', () => {
    expect(numeFisierExport(new Date(2026, 10, 17, 0, 30))).toBe('capsula-datele-mele-2026-11-17.json')
  })
})

describe('migrația delete_my_account', () => {
  const sql = readFileSync(new URL('../supabase/migrations/20261116190000_delete_my_account.sql', import.meta.url), 'utf8')
  it('e disponibilă doar conturilor conectate și șterge doar contul celui care o cheamă', () => {
    expect(sql).toMatch(/security definer/)
    expect(sql).toMatch(/set search_path = ''/)
    expect(sql).toMatch(/revoke execute on function public\.delete_my_account\(\) from public, anon;/)
    expect(sql).toMatch(/grant execute on function public\.delete_my_account\(\) to authenticated;/)
    expect(sql).toMatch(/delete from auth\.users where id = uid;/)
  })
})
