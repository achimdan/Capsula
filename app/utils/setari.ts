// Setările site-ului (tabelul site_settings), alese din /admin și valabile pentru toți vizitatorii.
// Funcții pure: rândurile din DB → setări valide, cu valori implicite pentru ce lipsește sau e greșit.
// Listele de valori sunt aceleași ca în constrângerile din supabase/migrations (site_settings).
export const FUNDALURI_VALIDE = ['clasic', 'tapet', 'vhs', 'arhiva'] as const
export type Fundal = typeof FUNDALURI_VALIDE[number]

// Cum se afișează „Ce era peste tot”: grila de polaroiduri sau cronologia pe bandă.
export const LISTE_FISE_VALIDE = ['grila', 'cronologie'] as const
export type ListaFise = typeof LISTE_FISE_VALIDE[number]

export type SetariSite = { fundal: Fundal, listaFise: ListaFise }

export const SETARI_IMPLICITE: SetariSite = { fundal: 'clasic', listaFise: 'grila' }

// Numele setării în app → cheia rândului din DB.
export const CHEI_DB: Record<keyof SetariSite, string> = { fundal: 'fundal', listaFise: 'lista_fise' }

function dinLista<T extends string>(lista: readonly T[]) {
  return (v: unknown): v is T => typeof v === 'string' && (lista as readonly string[]).includes(v)
}
export const esteFundal = dinLista(FUNDALURI_VALIDE)
export const esteListaFise = dinLista(LISTE_FISE_VALIDE)

export function setariDinRanduri(randuri: { key: string, value: unknown }[]): SetariSite {
  const s: SetariSite = { ...SETARI_IMPLICITE }
  for (const r of randuri) {
    if (r.key === CHEI_DB.fundal && esteFundal(r.value)) s.fundal = r.value
    if (r.key === CHEI_DB.listaFise && esteListaFise(r.value)) s.listaFise = r.value
  }
  return s
}
