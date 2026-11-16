// Datele contului: maparea dintre rândurile din Supabase și starea din app, plus regulile de import.
// Funcții pure (fără auto-importuri Nuxt), testate în tests/cont.test.ts.
import type { Database, Json } from '../types/database'

type Tabele = Database['public']['Tables']
export type RandProfil = Pick<Tabele['profiles']['Row'], 'birth_year' | 'city' | 'locality_siruta' | 'reader_profile_id' | 'reader_traits'>
export type RandChestionar = Pick<Tabele['questionnaire_responses']['Row'], 'answers' | 'step' | 'is_retake' | 'completed_at'>

export interface ProfilApp { anNastere: number | null, oras: string | null, localitate?: number | null }
export interface ProfilCititApp { id: string, trasaturi: Record<string, number> }
export interface ChestionarApp { raspunsuri: Record<string, unknown>, pas: number, refacere: boolean }

// Tot ce ține de cont, în forma folosită de useCapsula / useProfilCitit.
export interface StareCont {
  profil: ProfilApp
  profilCitit: ProfilCititApp | null
  chestionar: ChestionarApp
  caseta: string[]
}

export const PROFIL_GOL: ProfilApp = { anNastere: null, oras: null, localitate: null }
export const CHESTIONAR_GOL: ChestionarApp = { raspunsuri: {}, pas: 0, refacere: false }
export const STARE_GOALA: StareCont = { profil: PROFIL_GOL, profilCitit: null, chestionar: CHESTIONAR_GOL, caseta: [] }

function esteObiect(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function trasaturiDin(v: Json | null): Record<string, number> {
  if (!esteObiect(v)) return {}
  return Object.fromEntries(Object.entries(v).filter((e): e is [string, number] => typeof e[1] === 'number'))
}

export function stareDinRanduri(p: RandProfil | null, c: RandChestionar | null, caseta: string[]): StareCont {
  return {
    profil: { anNastere: p?.birth_year ?? null, oras: p?.city ?? null, localitate: p?.locality_siruta ?? null },
    profilCitit: p?.reader_profile_id ? { id: p.reader_profile_id, trasaturi: trasaturiDin(p.reader_traits) } : null,
    chestionar: c
      ? { raspunsuri: esteObiect(c.answers) ? c.answers : {}, pas: Math.max(0, c.step), refacere: c.is_retake }
      : CHESTIONAR_GOL,
    caseta: [...caseta]
  }
}

export function randProfil(profil: ProfilApp, citit: ProfilCititApp | null): RandProfil {
  return {
    birth_year: profil.anNastere,
    city: profil.oras,
    locality_siruta: profil.localitate ?? null,
    reader_profile_id: citit?.id ?? null,
    reader_traits: citit ? citit.trasaturi : null
  }
}

export function randChestionar(c: ChestionarApp, terminat: boolean): Omit<RandChestionar, 'completed_at'> & { completed_at?: string } {
  const rand = { answers: c.raspunsuri as Json, step: Math.max(0, Math.trunc(c.pas)), is_retake: c.refacere }
  return terminat ? { ...rand, completed_at: new Date().toISOString() } : rand
}

// Ce fișe trebuie adăugate și șterse ca să ajungem de la `vechi` la `nou` (un rând per fișă, fără rescrieri).
export function difCaseta(vechi: string[], nou: string[]): { adauga: string[], sterge: string[] } {
  const v = new Set(vechi)
  const n = new Set(nou)
  return { adauga: [...n].filter(id => !v.has(id)), sterge: [...v].filter(id => !n.has(id)) }
}

export function areDate(s: StareCont): boolean {
  return !!s.profil.anNastere || !!s.profilCitit || Object.keys(s.chestionar.raspunsuri).length > 0 || s.caseta.length > 0
}

// La login: ce stare folosim și dacă urcăm datele din browser.
// - Datele din browser sunt ale altui cont → le ignorăm (nu se moștenesc între oameni).
// - Contul are deja date → contul câștigă.
// - Contul e gol și browserul are date (de dinainte de cont sau ale acestui cont) → le urcăm.
export function decideStare(
  cont: StareCont,
  local: StareCont,
  proprietarLocal: string | null,
  userId: string
): { stare: StareCont, importa: boolean } {
  const localAlAltcuiva = proprietarLocal !== null && proprietarLocal !== userId
  if (localAlAltcuiva || areDate(cont) || !areDate(local)) return { stare: cont, importa: false }
  return { stare: local, importa: true }
}
