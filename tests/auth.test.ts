import { describe, expect, it } from 'vitest'
import { dateProfilCont, decodeazaJwt, emailValid, initiale, mesajEroareLogin, normalizeazaEmail, rutaDupaLogin } from '../app/utils/auth'

function jwt(payload: object): string {
  const b64 = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  return [b64('{"alg":"ES256"}'), b64(String.fromCharCode(...bytes)), 'semnatura'].join('.')
}

describe('email', () => {
  it('normalizează spațiile și majusculele', () => {
    expect(normalizeazaEmail('  Ion@Exemplu.RO ')).toBe('ion@exemplu.ro')
  })
  it('acceptă adrese valide și refuză restul', () => {
    expect(emailValid(' ana@exemplu.ro ')).toBe(true)
    expect(emailValid('ana@exemplu')).toBe(false)
    expect(emailValid('ana exemplu.ro')).toBe(false)
    expect(emailValid('')).toBe(false)
  })
})

describe('decodeazaJwt', () => {
  it('citește payload-ul, inclusiv diacritice', () => {
    const t = jwt({ sub: 'u1', email: 'ana@exemplu.ro', nume: 'Ștefănescu' })
    expect(decodeazaJwt(t)).toEqual({ sub: 'u1', email: 'ana@exemplu.ro', nume: 'Ștefănescu' })
  })
  it('întoarce null pentru token-uri stricate', () => {
    expect(decodeazaJwt('')).toBeNull()
    expect(decodeazaJwt('doar-o-parte')).toBeNull()
    expect(decodeazaJwt('a.!!!.c')).toBeNull()
    expect(decodeazaJwt(jwt([1, 2] as unknown as object))).toBeNull()
  })
})

describe('după login', () => {
  it('trimite la test doar dacă lipsește profilul', () => {
    expect(rutaDupaLogin(false)).toBe('/start')
    expect(rutaDupaLogin(true)).toBe('/')
  })
  it('explică linkurile expirate separat de celelalte erori', () => {
    expect(mesajEroareLogin(null, null)).toBeNull()
    expect(mesajEroareLogin('otp_expired', 'Email link is invalid or has expired')).toMatch(/expirat/)
    expect(mesajEroareLogin('access_denied', null)).toMatch(/același browser/)
  })
})

describe('profilul contului', () => {
  it('ia numele și poza de la Google', () => {
    expect(dateProfilCont({ full_name: ' Ana Pop ', avatar_url: 'https://lh3.googleusercontent.com/a/x' }))
      .toEqual({ nume: 'Ana Pop', avatar: 'https://lh3.googleusercontent.com/a/x' })
    expect(dateProfilCont({ name: 'Ion', picture: 'https://lh3.googleusercontent.com/a/y' }).avatar).toMatch(/^https:/)
  })
  it('fără metadate sau cu URL nesigur: nimic', () => {
    expect(dateProfilCont(undefined)).toEqual({ nume: null, avatar: null })
    expect(dateProfilCont({ avatar_url: 'javascript:alert(1)' }).avatar).toBeNull()
  })
  it('inițialele vin din nume, altfel din email', () => {
    expect(initiale('ana maria pop', 'a@b.ro')).toBe('AM')
    expect(initiale(null, ' ion@exemplu.ro')).toBe('I')
  })
})
