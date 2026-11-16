// Profilurile „Capsula te citește”: 6 arhetipuri × 6 scene muzicale = 36 de profiluri.
// Arhetipul vine din trăsătura dominantă (din cele 6 de mai jos), scena din gustul muzical.
// Numele sunt obiecte sau locuri și citirile sunt la persoana a doua, ca să nu marcheze genul.
// Regula: o scenă muzicală e un gust, nu o etichetă socială. Detalii în docs/profilare.md.
import type { Categorie } from './fise'
import type { Fundal } from '../utils/setari'
import { SCENE, type Scena, type Trasatura } from './chestionar'

export const ARHETIPURI = ['nostalgie', 'rebel', 'cerebral', 'social', 'familist', 'umor'] as const satisfies readonly Trasatura[]
export type Arhetip = typeof ARHETIPURI[number]

export type Ton = 'cald' | 'ironic' | 'documentar'

export interface ConfigProfil {
  fundal: Fundal
  ponderiCategorii: Record<Categorie, number>
  ton: Ton
  // Accent de UI: contrast ≥ 3:1 pe toate fundalurile (vezi testele). Nu e pentru text mic.
  accent?: string
  intro: string
}

export interface ProfilCititor { id: string, arhetip: Arhetip, scena: Scena, nume: string, citire: string, config: ConfigProfil }

type Ponderi6 = Record<Categorie, number>

const DATE_ARHETIP: Record<Arhetip, { fundal: Fundal, ton: Ton, intro: string, categorii: Ponderi6 }> = {
  nostalgie: { fundal: 'tapet', ton: 'cald', intro: 'Am pus deoparte fișele cu cele mai multe amintiri.', categorii: { 'Evenimente': 2, 'Muzică': 2, 'Filme & TV': 2, 'Obiecte & Haine': 3, 'Mâncare': 3, 'Locuri': 2 } },
  rebel: { fundal: 'vhs', ton: 'ironic', intro: 'Am scos din sertar ce nu se dădea la TVR.', categorii: { 'Evenimente': 1, 'Muzică': 3, 'Filme & TV': 3, 'Obiecte & Haine': 2, 'Mâncare': 1, 'Locuri': 2 } },
  cerebral: { fundal: 'arhiva', ton: 'documentar', intro: 'Am adus fișele cu ani exacți și surse.', categorii: { 'Evenimente': 3, 'Muzică': 2, 'Filme & TV': 2, 'Obiecte & Haine': 1, 'Mâncare': 1, 'Locuri': 2 } },
  social: { fundal: 'clasic', ton: 'cald', intro: 'Am adunat fișele pe care le-ai trăit cu alții.', categorii: { 'Evenimente': 2, 'Muzică': 3, 'Filme & TV': 2, 'Obiecte & Haine': 2, 'Mâncare': 2, 'Locuri': 3 } },
  familist: { fundal: 'tapet', ton: 'cald', intro: 'Am pus pe masă fișele de acasă.', categorii: { 'Evenimente': 2, 'Muzică': 1, 'Filme & TV': 2, 'Obiecte & Haine': 2, 'Mâncare': 3, 'Locuri': 2 } },
  umor: { fundal: 'vhs', ton: 'ironic', intro: 'Am ales fișele care încă te fac să râzi.', categorii: { 'Evenimente': 1, 'Muzică': 2, 'Filme & TV': 3, 'Obiecte & Haine': 2, 'Mâncare': 2, 'Locuri': 1 } }
}

const DATE_SCENA: Record<Scena, { accent: string, intro: string, plus: Partial<Ponderi6> }> = {
  pop: { accent: '#B5651D', intro: 'Începem cu refrenele pe care le știe toată lumea.', plus: { 'Filme & TV': 1 } },
  rock: { accent: '#CF4F2F', intro: 'Pe fundal, un solo de chitară.', plus: { 'Obiecte & Haine': 1 } },
  hiphop: { accent: '#3E7CB1', intro: 'Pe fundal, un beat de la sfârșitul anilor 90.', plus: { 'Obiecte & Haine': 1 } },
  dance: { accent: '#8E6BBF', intro: 'Pe fundal, hiturile verii.', plus: { 'Locuri': 1 } },
  manele: { accent: '#C04A7A', intro: 'Pe fundal, muzica de la petrecerile tale.', plus: { 'Evenimente': 1 } },
  alternativ: { accent: '#2E7D6B', intro: 'Pe fundal, piesele care nu intrau în top.', plus: { 'Filme & TV': 1 } }
}

// [nume, citire] pentru fiecare celulă arhetip × scenă.
const TEXTE: Record<Arhetip, Record<Scena, [string, string]>> = {
  nostalgie: {
    pop: ['Refrenul din albumul cu poze', 'Ții minte refrenele mai bine decât numerele de telefon, și fiecare vine cu o poză în minte.'],
    rock: ['Chitara de pe dulap', 'Pentru tine, un solo de chitară e o mașină a timpului care pornește din prima.'],
    hiphop: ['Walkman-ul din buzunarul gecii', 'Știi versurile de atunci pe de rost și încă te trec fiorii când pornește beat-ul.'],
    dance: ['Lumina stroboscopică din ’99', 'Un refren dance și ești din nou în sala aia mică, cu inima cât un difuzor.'],
    manele: ['Lista de melodii de la nuntă', 'O piesă bună și-ți apar în minte mesele lungi, oamenii dragi și dansul de la miezul nopții.'],
    alternativ: ['Caseta fără copertă', 'Păstrezi piesele care au contat pentru tine, chiar dacă nu le mai știe nimeni.']
  },
  rebel: {
    pop: ['Refrenul cântat în pauza mare', 'Cântai hiturile prea tare, exact unde nu trebuia, și încă ai impresia că a meritat.'],
    rock: ['Geaca de piele din cuier', 'Ai învățat devreme că un riff bun e și argument, și protest.'],
    hiphop: ['Versul scris pe ultima bancă', 'Ai ascultat versurile despre ce nu spunea nimeni la știri și ai ținut minte fiecare rimă.'],
    dance: ['Discoteca până la închidere', 'Ziceai că vii acasă la zece și te întorceai odată cu primul autobuz.'],
    manele: ['Boxa adusă la chef', 'Tu alegeai muzica la petrecere și nu-ți cereai voie nimănui.'],
    alternativ: ['Concertul din subsol', 'Ai găsit trupele bune înaintea tuturor și le-ai apărat în fața întregului oraș.']
  },
  cerebral: {
    pop: ['Topul notat în caiet', 'Notai topurile săptămânale în caiet, cu poziții, săgeți și comentarii pe margine.'],
    rock: ['Coperta citită de zece ori', 'Știi cine cânta la bas pe fiecare album și în ce an a ieșit.'],
    hiphop: ['Versurile copiate de mână', 'Pentru tine, rimele erau literatură, și le citeai printre rânduri.'],
    dance: ['Remixul ascultat cu căștile', 'Puteai să spui din trei secunde ce sample era în hitul verii.'],
    manele: ['Povestea din spatele melodiei', 'Te interesează cine a cântat primul piesa și cum a ajuns la toate petrecerile din țară.'],
    alternativ: ['Fanzinul xeroxat', 'Ai citit tot ce s-a scris despre trupele tale și ai păstrat fiecare foaie.']
  },
  social: {
    pop: ['Banchetul cu toată clasa', 'Știi refrenele, numele colegilor și cine cu cine a dansat. Tu ții minte pentru toată lumea.'],
    rock: ['Cortul de la festival', 'Cele mai bune amintiri le ai în mulțime, cu brațul pe umărul cuiva, la un concert.'],
    hiphop: ['Banca din spatele blocului', 'Ai crescut cu gașca, cu un casetofon pe bancă și cu versuri pe care le știa tot cartierul.'],
    dance: ['Ringul de dans de sâmbătă', 'Tu trăgeai lumea pe ring, și nimeni nu-ți putea spune nu.'],
    manele: ['Hora de la miezul nopții', 'La orice petrecere, tu pornești hora și știi pe toată lumea pe nume.'],
    alternativ: ['Clubul cu zece oameni', 'Puțini, dar ai voștri: la concertele mici îți găseai oamenii.']
  },
  familist: {
    pop: ['Radioul din bucătărie', 'Hiturile tale vin cu miros de mâncare de duminică și cu vocea cuiva drag care fredona.'],
    rock: ['Pick-up-ul din sufragerie', 'Ai moștenit muzica bună de la cei de acasă și o dai mai departe.'],
    hiphop: ['Caseta împrumutată de la cei mari', 'Primele versuri le-ai auzit de la cei mai mari din familie, și ți-au rămas.'],
    dance: ['Petrecerea din sufragerie', 'Covorul strâns, masa trasă la perete și toată familia dansând pe hiturile verii.'],
    manele: ['Masa lungă din curte', 'Muzica ta înseamnă oamenii adunați la aceeași masă, de la cei mici la bunici.'],
    alternativ: ['Piesa dată mai departe', 'Ai piesele tale speciale și le arăți cu grijă celor dragi, ca pe niște poze vechi.']
  },
  umor: {
    pop: ['Karaoke-ul din sufragerie', 'Știi toate versurile puțin greșit, cu încredere totală, și asta e jumătate din farmec.'],
    rock: ['Chitara invizibilă din oglindă', 'Ai dat cele mai bune concerte din istorie în fața oglinzii, cu peria pe post de microfon.'],
    hiphop: ['Freestyle-ul de la colțul blocului', 'Rimele tale erau mai mult glume, dar râdea tot cartierul.'],
    dance: ['Coregrafia de pe „Dragostea din tei”', 'Știi coregrafia, o faci la orice nuntă și o faci bine, cu un zâmbet strâmb.'],
    manele: ['Dedicația de la chef', 'Dedicațiile tale sunt legendare: lungi, pline de nume și toate cu poantă.'],
    alternativ: ['Gluma pe care o prind trei oameni', 'Umorul tău e ca muzica ta: nu pentru oricine, dar cine îl prinde nu-l mai uită.']
  }
}

function ponderiPentru(a: Arhetip, s: Scena): Ponderi6 {
  const baza = { ...DATE_ARHETIP[a].categorii }
  for (const [c, v] of Object.entries(DATE_SCENA[s].plus) as [Categorie, number][]) baza[c] += v
  return baza
}

export const PROFILURI: ProfilCititor[] = ARHETIPURI.flatMap(a => SCENE.map((s) => {
  const [nume, citire] = TEXTE[a][s]
  return {
    id: `${a}-${s}`,
    arhetip: a,
    scena: s,
    nume,
    citire,
    config: {
      fundal: DATE_ARHETIP[a].fundal,
      ponderiCategorii: ponderiPentru(a, s),
      ton: DATE_ARHETIP[a].ton,
      accent: DATE_SCENA[s].accent,
      intro: `${DATE_ARHETIP[a].intro} ${DATE_SCENA[s].intro}`
    }
  }
}))
