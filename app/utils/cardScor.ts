// Cardul de share de la finalul „Ghicește anul”: ce scrie pe el și textul care îl însoțește.
// Desenul (canvas) e în composables/useCardScor.ts; aici doar conținutul, ca să poată fi testat.

export interface RundaJucata { an: number, ghicit: number, puncte: number }

export interface ContinutCard {
  eticheta: string
  scor: string
  din: string
  titlu: string
  generatie: string | null
  runde: { an: string, nota: string }[]
  subsol: string
}

export const CARD = { latime: 1080, inaltime: 1350 } as const

// ’85, nu 1985: așa își spune generația.
export function generatie(anNastere: number | null): string | null {
  if (!anNastere) return null
  return `Generația ’${String(anNastere).slice(2)}`
}

// Sub fiecare an: „exact” sau cu cât ai greșit, cu semn (−2 = ai zis mai devreme).
export function notaRunda(r: RundaJucata): string {
  const d = r.ghicit - r.an
  if (d === 0) return 'exact'
  return `${d > 0 ? '+' : '−'}${Math.abs(d)} ${Math.abs(d) === 1 ? 'an' : 'ani'}`
}

export function continutCard(o: { scor: number, max: number, titlu: string, runde: RundaJucata[], anNastere: number | null, host: string }): ContinutCard {
  return {
    eticheta: `Ghicește anul · ${o.runde.length} runde`,
    scor: String(o.scor),
    din: `/${o.max}`,
    titlu: o.titlu,
    generatie: generatie(o.anNastere),
    runde: o.runde.map(r => ({ an: String(r.an), nota: notaRunda(r) })),
    subsol: o.host
  }
}

export function textShare(scor: number, max: number): string {
  return `Am făcut ${scor}/${max} la „Ghicește anul” pe Capsula. Tu în ce an erai?`
}

export function numeFisierCard(scor: number): string {
  return `capsula-ghiceste-anul-${scor}.png`
}
