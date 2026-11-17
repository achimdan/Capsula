import { describe, expect, it } from 'vitest'
import { dateProfilCont, decodeazaJwt, emailValid, esteSuperAdmin, initiale, mesajEroareLogin, normalizeazaEmail, rutaDupaLogin } from '../app/utils/auth'

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
  it('întoarce pe pagina de plecare, fără să forțeze testul', () => {
    expect(rutaDupaLogin('/game?an=1998#scor')).toBe('/game?an=1998#scor')
    expect(rutaDupaLogin('/daily')).toBe('/daily')
    expect(rutaDupaLogin('/start')).toBe('/start')
  })
  it('acceptă doar căi interne', () => {
    for (const rau of [null, undefined, 42, '', 'game', 'https://rau.ro', '//rau.ro', '/\\rau.ro', '/\trau', 'javascript:alert(1)', '/confirm', '/confirm?x=1', '/' + 'a'.repeat(600)]) {
      expect(rutaDupaLogin(rau)).toBe('/')
    }
  })
  it('explică conectările expirate separat de celelalte erori', () => {
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

describe('esteSuperAdmin', () => {
  const google = [{ method: 'oauth', timestamp: 1 }]
  it('cere rolul din app_metadata și o sesiune Google', () => {
    expect(esteSuperAdmin({ app_metadata: { role: 'super_admin' }, amr: google })).toBe(true)
  })
  it('refuză fără rol, fără Google sau fără claims', () => {
    expect(esteSuperAdmin({ app_metadata: {}, amr: google })).toBe(false)
    expect(esteSuperAdmin({ app_metadata: { role: 'super_admin' }, amr: [{ method: 'otp' }] })).toBe(false)
    expect(esteSuperAdmin({ app_metadata: { role: 'super_admin' } })).toBe(false)
    expect(esteSuperAdmin(null)).toBe(false)
  })
})
