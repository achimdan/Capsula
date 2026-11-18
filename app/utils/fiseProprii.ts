// Fișele scrise de utilizator („amintirile tale”): validarea formularului și maparea rândurilor din user_cards în Fisa.
// Funcții pure, testate în tests/fiseProprii.test.ts. Limitele sunt aceleași ca în migrarea user_cards.
import type { Database } from '../types/database'
import type { Categorie, Fisa } from '../data/fise'
import { ORDINE_CATEGORII } from './personalizare'
import { diacriticeCorecte } from '../../shared/utils/intrebare'

export type RandFisaProprie = Pick<Database['public']['Tables']['user_cards']['Row'], 'id' | 'title' | 'note' | 'year' | 'category' | 'photo' | 'photo_ext'>

export const LIMITE_FISA = { titlu: 80, nota: 500, anMin: 1900, anMax: 2100, peCont: 200 } as const
export const PREFIX_PROPRIE = 'U-'

export interface FisaNoua { titlu: string, nota: string, an: number | null, categorie: Categorie | null }

// Culorile vin din categorie, ca fișele proprii să stea lângă cele din aceeași pistă.
const CULORI: Record<Categorie, [string, string]> = {
  'Evenimente': ['#7A2E3A', '#E2582F'],
  'Muzică': ['#5B3A7A', '#E07B4C'],
  'Filme & TV': ['#2B4036', '#5E7A62'],
  'Obiecte & Haine': ['#B9C6B6', '#F0B35A'],
  'Mâncare': ['#C98B3A', '#E8C27A'],
  'Locuri': ['#3A5A7A', '#9DB4C9']
}

export function esteCategorie(v: unknown): v is Categorie {
  return typeof v === 'string' && (ORDINE_CATEGORII as readonly string[]).includes(v)
}

// Mesajul primei probleme din formular, sau null dacă se poate salva.
// Anii: de la nașterea utilizatorului (dacă o știm) până în anul curent, ca banda să nu se întindă cu decenii goale.
export function valideazaFisa(f: FisaNoua, anMax = new Date().getFullYear(), anMin: number = LIMITE_FISA.anMin): string | null {
  const titlu = f.titlu.trim()
  if (!titlu) return 'Scrie un titlu.'
  if (titlu.length > LIMITE_FISA.titlu) return `Titlul are cel mult ${LIMITE_FISA.titlu} de caractere.`
  if (f.nota.length > LIMITE_FISA.nota) return `Nota are cel mult ${LIMITE_FISA.nota} de caractere.`
  if (f.an === null || !Number.isInteger(f.an)) return 'Alege anul.'
  const min = Math.max(anMin, LIMITE_FISA.anMin), max = Math.min(anMax, LIMITE_FISA.anMax)
  if (f.an < min || f.an > max) return `Anul e între ${min} și ${max}.`
  if (!esteCategorie(f.categorie)) return 'Alege categoria.'
  return null
}

export function randDinFormular(f: FisaNoua): { title: string, note: string, year: number, category: Categorie } {
  return { title: diacriticeCorecte(f.titlu.trim()), note: diacriticeCorecte(f.nota.trim()), year: f.an as number, category: f.categorie as Categorie }
}

// Rândurile cu o categorie necunoscută (n-ar trebui să existe, dar baza le-ar putea avea) sunt sărite.
// linkuri: căile variantelor → linkuri semnate; fără linkuri (încă necerute sau poza ștearsă), fișa e fără poză.
export function fisaDinRand(r: RandFisaProprie, linkuri: Record<string, string> = {}): Fisa | null {
  if (!esteCategorie(r.category)) return null
  return {
    id: PREFIX_PROPRIE + r.id,
    titlu: r.title,
    nota: r.note,
    an: r.year,
    // Anul îl știe cel care a trăit-o; oricum nu intră în „Ghicește anul” (nu e în FISE).
    an_exact: true,
    categorie: r.category,
    oras: null,
    verificat: false,
    culori: CULORI[r.category],
    proprie: true,
    ...pozaDinRand(r, linkuri)
  }
}

// Căile celor două variante ale pozei unei fișe proprii (vezi utils/pozeProprii.ts).
export function caiPozaRand(r: Pick<RandFisaProprie, 'photo' | 'photo_ext'>): [string, string] | null {
  if (!r.photo || (r.photo_ext !== 'webp' && r.photo_ext !== 'jpg')) return null
  return [`${r.photo}-480.${r.photo_ext}`, `${r.photo}-960.${r.photo_ext}`]
}

function pozaDinRand(r: RandFisaProprie, linkuri: Record<string, string>): Pick<Fisa, 'poza' | 'imagine'> {
  const cai = caiPozaRand(r)
  const mica = cai && linkuri[cai[0]]
  const mare = cai && linkuri[cai[1]]
  if (!mica || !mare) return {}
  return { poza: { autor: 'Poza ta', licenta: '', alt: r.title }, imagine: { mica, mare } }
}

export const idRand = (idFisa: string) => (idFisa.startsWith(PREFIX_PROPRIE) ? idFisa.slice(PREFIX_PROPRIE.length) : null)

// Adresa pozei unei fișe: linkul semnat al fișei proprii sau fișierul din public/fise.
export const srcPoza = (f: Pick<Fisa, 'id' | 'imagine'>, latime: 480 | 960) =>
  f.imagine ? (latime === 480 ? f.imagine.mica : f.imagine.mare) : `/fise/${f.id}-${latime}.webp`
export const srcsetPoza = (f: Pick<Fisa, 'id' | 'imagine'>) => `${srcPoza(f, 480)} 480w, ${srcPoza(f, 960)} 960w`
