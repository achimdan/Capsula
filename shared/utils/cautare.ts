// Căutarea în fișe: textul din care se face vectorul fiecărei fișe. Folosit de server și de scripts/index-fise.mjs.
// Potrivirea pe cuvinte și combinarea clasamentelor sunt în Postgres (public.cauta_fise).

export const MODEL_EMBEDDING = '@cf/baai/bge-m3'

interface FisaIndexabila {
  titlu: string
  nota: string
  an: number
  an_exact: boolean
  categorie: string
  oras: string | null
}

// Textul din care se face vectorul fișei. Dacă se schimbă, se schimbă hash-ul și scriptul reindexează tot.
export function textFisa(f: FisaIndexabila): string {
  const an = f.an_exact ? String(f.an) : `în jur de ${f.an}`
  const loc = f.oras ?? 'România'
  return `${f.titlu}. ${f.nota} (${f.categorie}, ${an}, ${loc})`
}
