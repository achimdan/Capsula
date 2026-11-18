// Fișele Capsulei stau în Supabase (tabelul public.fise). Aici e doar maparea rând ↔ Fisa, pură și testată.
// Importat și de scripts/seed-fise.mjs (Node rulează TypeScript direct), deci fără importuri de valori.
import type { Categorie, Fisa } from '../data/fise'
import type { Scena } from '../data/chestionar'

export interface RandFisa {
  id: string
  ordine: number
  titlu: string
  nota: string
  an: number
  an_exact: boolean
  categorie: string
  oras: string | null
  verificat: boolean
  publicat: boolean
  sursa: string | null
  culori: string[]
  poza_autor: string | null
  poza_licenta: string | null
  poza_url: string | null
  poza_generata: boolean | null
  poza_alt: string | null
  video_autor: string | null
  video_licenta: string | null
  video_url: string | null
  scena: string | null
  embed_url: string | null
}

// Coloanele citite de aplicație (fără `publicat`, `created_at`, `updated_at`: RLS arată oricum doar fișele publicate).
export const COLOANE_FISE = 'id, ordine, titlu, nota, an, an_exact, categorie, oras, verificat, sursa, culori, poza_autor, poza_licenta, poza_url, poza_generata, poza_alt, video_autor, video_licenta, video_url, scena, embed_url'

export type RandFisaCitit = Omit<RandFisa, 'publicat'>

// Rândul din tabel → Fisa. Câmpurile opționale lipsă rămân absente (nu null), exact ca în fostul tablou FISE.
export function fisaDinTabel(r: RandFisaCitit): Fisa {
  const f: Fisa = {
    id: r.id,
    titlu: r.titlu,
    nota: r.nota,
    an: r.an,
    an_exact: r.an_exact,
    categorie: r.categorie as Categorie,
    oras: r.oras,
    verificat: r.verificat,
    culori: [r.culori[0] ?? '', r.culori[1] ?? '']
  }
  if (r.poza_autor !== null && r.poza_licenta !== null) {
    f.poza = { autor: r.poza_autor, licenta: r.poza_licenta }
    if (r.poza_url !== null) f.poza.url = r.poza_url
    if (r.poza_generata !== null) f.poza.generata = r.poza_generata
    if (r.poza_alt !== null) f.poza.alt = r.poza_alt
  }
  if (r.sursa !== null) f.sursa = r.sursa
  if (r.scena !== null) f.scena = r.scena as Scena
  if (r.embed_url !== null) f.embed = { url: r.embed_url }
  if (r.video_autor !== null && r.video_licenta !== null) {
    f.video = { autor: r.video_autor, licenta: r.video_licenta }
    if (r.video_url !== null) f.video.url = r.video_url
  }
  return f
}

// Fisa (cu poziția ei în listă) → rândul din tabel. Folosit de importul din supabase/seed/fise.json.
export function randTabelDinFisa(f: Fisa & { ordine: number }): RandFisa {
  return {
    id: f.id,
    ordine: f.ordine,
    titlu: f.titlu,
    nota: f.nota,
    an: f.an,
    an_exact: f.an_exact,
    categorie: f.categorie,
    oras: f.oras ?? null,
    verificat: f.verificat,
    publicat: true,
    sursa: f.sursa ?? null,
    culori: [...f.culori],
    poza_autor: f.poza?.autor ?? null,
    poza_licenta: f.poza?.licenta ?? null,
    poza_url: f.poza?.url ?? null,
    poza_generata: f.poza?.generata ?? null,
    poza_alt: f.poza?.alt ?? null,
    video_autor: f.video?.autor ?? null,
    video_licenta: f.video?.licenta ?? null,
    video_url: f.video?.url ?? null,
    scena: f.scena ?? null,
    embed_url: f.embed?.url ?? null
  }
}

// Rândurile vin ordonate din cerere; sortăm și aici, ca ordinea să nu depindă de rețea.
export function fiseDinRanduri(randuri: readonly RandFisaCitit[]): Fisa[] {
  return [...randuri].sort((a, b) => a.ordine - b.ordine).map(fisaDinTabel)
}
