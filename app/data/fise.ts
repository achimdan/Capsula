// Tipul fișelor Capsulei. Datele stau în Supabase (tabelul public.fise, vezi app/utils/fise.ts și composables/useFise.ts);
// importul inițial e în supabase/seed/fise.json. Regula: nu inventăm fapte.
// - an_exact: true  → anul e verificabil public (doar acestea intră în „Ghicește anul”)
// - an_exact: false → an aproximativ, afișat cu „≈”
// - verificat: false → trebuie confirmat de curator înainte de lansare
// - oras: null → fișă națională; altfel apare doar în stratul orașului

import type { Scena } from './chestionar'

export type Categorie = 'Evenimente' | 'Muzică' | 'Filme & TV' | 'Obiecte & Haine' | 'Mâncare' | 'Locuri'

export interface Fisa {
  id: string
  titlu: string
  nota: string
  an: number
  an_exact: boolean
  categorie: Categorie
  oras: string | null
  verificat: boolean
  sursa?: string
  culori: [string, string]
  poza?: Poza
  // Film scurt în loc de poză, doar în fișa deschisă: public/fise/<id>.mp4 (poza rămâne afiș și miniatură)
  video?: Video
  // Scena muzicală, doar la fișele de muzică unde genul e evident (alegere editorială, nu fapt de arhivă)
  scena?: Scena
  // Postare de pe Facebook afișată prin pluginul oficial (imaginea rămâne găzduită de Facebook), doar în fișa deschisă, la click
  embed?: { url: string }
  // Fișă scrisă de utilizator (tabelul user_cards): doar a lui, niciodată în FISE, joc sau Random Hit
  proprie?: boolean
  // Poza unei fișe proprii: linkuri semnate din bucketul privat `amintiri`, în loc de public/fise/<id>-*.webp
  imagine?: { mica: string, mare: string }
}

// Imaginea fișei: fișierele sunt în public/fise/<id>-480.webp și <id>-960.webp.
// Doar licențe libere (PD, CC0, CC BY, CC BY-SA) sau ilustrații generate pentru Capsula.
export interface Poza {
  autor: string // „Ilustrație Capsula” pentru cele generate
  licenta: string // ex. „CC BY-SA 4.0”, „Domeniu public”
  url?: string // pagina fișierului pe Wikimedia Commons
  generata?: boolean
  alt?: string // ce se vede în poză, pentru cititoarele de ecran (propus de Workers AI, scripts/alt-fise.mjs)
}

// Filmul fișei: aceleași reguli de licență ca la poze. MP4 (H.264), scurt, sub 25 MB (limita Workers pe fișier).
export interface Video {
  autor: string
  licenta: string
  url?: string // pagina sursei
}

export const ORASE_DEBLOCATE = ['Cluj']
export const ORASE = ['Cluj', 'București', 'Iași', 'Timișoara', 'Brașov', 'Constanța', 'Craiova', 'Oradea', 'Sibiu', 'Galați', 'Alt oraș']
export const AN_MIN = 1988
export const AN_MAX = 2008
