// Intrarea cu Google cerută la acțiune: ce a vrut omul să păstreze și unde se întoarce după /confirm.
// Funcții pure (fără auto-importuri Nuxt), testate în tests/intrare.test.ts.
// Plecarea spre Google reîncarcă pagina, așa că intenția stă în sessionStorage (doar în tab-ul curent).

export const CHEIE_INTRARE = 'capsula:intrare'

// Acțiunile care cer cont. `serie` = caseta zilei terminată azi, înainte de logare.
export type ActiuneAmanata
  = | { tip: 'caseta', id: string }
    | { tip: 'amavut', id: string }
    | { tip: 'serie', zi: string }

export interface Intrare { inapoi: string, actiune: ActiuneAmanata | null }

const RE_ID = /^[\w-]{1,64}$/
const RE_ZI = /^\d{4}-\d{2}-\d{2}$/

export function citesteActiune(v: unknown): ActiuneAmanata | null {
  if (!v || typeof v !== 'object') return null
  const a = v as Record<string, unknown>
  if ((a.tip === 'caseta' || a.tip === 'amavut') && typeof a.id === 'string' && RE_ID.test(a.id)) return { tip: a.tip, id: a.id }
  if (a.tip === 'serie' && typeof a.zi === 'string' && RE_ZI.test(a.zi)) return { tip: 'serie', zi: a.zi }
  return null
}

// Textul din sessionStorage → intrare validă (sau null). `inapoi` se validează separat, cu rutaDupaLogin.
export function citesteIntrare(text: string | null): Intrare | null {
  if (!text) return null
  let v: unknown
  try {
    v = JSON.parse(text)
  } catch {
    return null
  }
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  return { inapoi: typeof o.inapoi === 'string' ? o.inapoi : '/', actiune: citesteActiune(o.actiune) }
}

// Adaugă (nu comută): după logare, „În casetă” apăsat înainte trebuie să rămână în casetă.
export function adaugaUnic(lista: string[], id: string): string[] {
  return lista.includes(id) ? lista : [...lista, id]
}
