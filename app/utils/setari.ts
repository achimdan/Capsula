// Setările site-ului (tabelul site_settings), alese din /admin și valabile pentru toți vizitatorii.
// Funcții pure: rândurile din DB → setări valide, cu valori implicite pentru ce lipsește sau e greșit.
// Listele de valori sunt aceleași ca în constrângerile din supabase/migrations (site_settings).
export const FUNDALURI_VALIDE = ['clasic', 'tapet', 'vhs', 'arhiva', 'ceata', 'bloc', 'pop', 'televizor', 'televizor-90'] as const
export type Fundal = typeof FUNDALURI_VALIDE[number]

// Cum se afișează „Ce era peste tot”: grila de polaroiduri sau cronologia pe bandă.
export const LISTE_FISE_VALIDE = ['grila', 'cronologie'] as const
export type ListaFise = typeof LISTE_FISE_VALIDE[number]

// Module care se pornesc din /admin. Pornesc oprite: conținutul lor intră nevrificat și apare public doar când îl pornește adminul.
export const MODULE = ['preturi', 'tv', 'azi', 'bucuresti'] as const
export type Modul = typeof MODULE[number]
export type ModulSetare = `modul_${Modul}`
export const cheieModul = (m: Modul): ModulSetare => `modul_${m}`

export type SetariSite = { fundal: Fundal, listaFise: ListaFise } & Record<ModulSetare, boolean>

export const SETARI_IMPLICITE: SetariSite = {
  fundal: 'clasic', listaFise: 'grila',
  modul_preturi: false, modul_tv: false, modul_azi: false, modul_bucuresti: false
}

// Numele setării în app → cheia rândului din DB (la module e aceeași).
export const CHEI_DB: Record<keyof SetariSite, string> = {
  fundal: 'fundal', listaFise: 'lista_fise',
  modul_preturi: 'modul_preturi', modul_tv: 'modul_tv', modul_azi: 'modul_azi', modul_bucuresti: 'modul_bucuresti'
}

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
    for (const m of MODULE) if (r.key === cheieModul(m) && typeof r.value === 'boolean') s[cheieModul(m)] = r.value
  }
  return s
}

// Ruta paginii fiecărui modul (orașul nu are pagină: e un strat pe Capsula).
export const RUTE_MODULE: Partial<Record<Modul, string>> = { preturi: '/prices', tv: '/tv', azi: '/on-this-day' }

// Pagina unui modul oprit nu există pentru vizitatori; super adminul o vede ca s-o poată verifica înainte de pornire.
export function rutaPermisa(path: string, setari: SetariSite, superAdmin: boolean): boolean {
  if (superAdmin) return true
  for (const m of MODULE) if (RUTE_MODULE[m] === path) return setari[cheieModul(m)]
  return true
}

// Orașele cu strat vizibil: cele deblocate din date + București, când modulul lui e pornit.
export function orasePornite(deblocate: readonly string[], bucuresti: boolean): string[] {
  return bucuresti && !deblocate.includes('București') ? [...deblocate, 'București'] : [...deblocate]
}
