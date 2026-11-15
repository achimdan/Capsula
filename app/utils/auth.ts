// Funcții pure pentru autentificare (fără auto-importuri Nuxt), testate în tests/auth.test.ts.

export const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function normalizeazaEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function emailValid(email: string): boolean {
  return RE_EMAIL.test(normalizeazaEmail(email))
}

// Payload-ul unui JWT, citit local (fără verificarea semnăturii).
// Doar pentru UI: autorizarea reală o face RLS în baza de date.
export function decodeazaJwt<T = Record<string, unknown>>(token: string): T | null {
  const payload = token.split('.')[1]
  if (!payload) return null
  let base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  try {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    const json: unknown = JSON.parse(new TextDecoder().decode(bytes))
    return json && typeof json === 'object' && !Array.isArray(json) ? json as T : null
  } catch {
    return null
  }
}

// Unde trimitem utilizatorul după /confirm: la test dacă nu are încă profil.
export function rutaDupaLogin(areProfil: boolean): string {
  return areProfil ? '/' : '/start'
}

// Mesaj pentru erorile din URL-ul de întoarcere (link expirat, folosit deja, deschis în alt browser).
export function mesajEroareLogin(cod: string | null, descriere: string | null): string | null {
  if (!cod && !descriere) return null
  if (cod === 'otp_expired' || /expired/i.test(descriere ?? '')) {
    return 'Linkul a expirat sau a fost folosit deja. Cere unul nou.'
  }
  return 'Nu te-am putut conecta cu linkul acesta. Cere unul nou, din același browser.'
}

// Numele și poza din metadatele contului (Google le pune în user_metadata; linkul magic nu).
export function dateProfilCont(meta: Record<string, unknown> | undefined): { nume: string | null, avatar: string | null } {
  const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  const avatar = text(meta?.avatar_url) ?? text(meta?.picture)
  return {
    nume: text(meta?.full_name) ?? text(meta?.name),
    avatar: avatar && avatar.startsWith('https://') ? avatar : null
  }
}

// Inițialele pentru avatarul fără poză: din nume, altfel prima literă din email.
export function initiale(nume: string | null | undefined, email: string): string {
  const parti = (nume ?? '').trim().split(/\s+/).filter(Boolean)
  if (parti.length) return parti.slice(0, 2).map(p => p[0]!.toUpperCase()).join('')
  return (email.trim()[0] ?? '?').toUpperCase()
}
