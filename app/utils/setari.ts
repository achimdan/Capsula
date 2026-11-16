// Setările site-ului (tabelul site_settings), alese din /admin și valabile pentru toți vizitatorii.
// Funcții pure: rândurile din DB → setări valide, cu valori implicite pentru ce lipsește sau e greșit.
export const FUNDALURI_VALIDE = ['clasic', 'tapet', 'vhs', 'arhiva'] as const
export type Fundal = typeof FUNDALURI_VALIDE[number]

export type SetariSite = { fundal: Fundal }

export const SETARI_IMPLICITE: SetariSite = { fundal: 'clasic' }

export function esteFundal(v: unknown): v is Fundal {
  return typeof v === 'string' && (FUNDALURI_VALIDE as readonly string[]).includes(v)
}

export function setariDinRanduri(randuri: { key: string, value: unknown }[]): SetariSite {
  const s: SetariSite = { ...SETARI_IMPLICITE }
  for (const r of randuri) {
    if (r.key === 'fundal' && esteFundal(r.value)) s.fundal = r.value
  }
  return s
}
