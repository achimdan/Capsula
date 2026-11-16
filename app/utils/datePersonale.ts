// Datele personale ale contului: export (dreptul de acces) și curățenia din browser după ștergere.

export const PREFIX_LOCAL = 'capsula:'

// Cheile din localStorage scrise de aplicație (useStocare). După ștergerea contului le scoatem pe toate,
// altfel la următoarea intrare cu Google datele vechi ar fi urcate în contul nou (vezi useCont.incarca).
export function cheiLocale(chei: Iterable<string>): string[] {
  return [...chei].filter(k => k.startsWith(PREFIX_LOCAL))
}

export interface ExportCont {
  exportat_la: string
  cont: { id: string, email: string | null, nume: string | null }
  profil: unknown
  chestionar: unknown
  caseta: unknown[]
  amintiri: unknown[]
}

export function construiesteExport(
  cont: ExportCont['cont'],
  date: { profil: unknown, chestionar: unknown, caseta: unknown[] | null, amintiri: unknown[] | null },
  acum: Date = new Date()
): ExportCont {
  return {
    exportat_la: acum.toISOString(),
    cont,
    profil: date.profil ?? null,
    chestionar: date.chestionar ?? null,
    caseta: date.caseta ?? [],
    amintiri: date.amintiri ?? []
  }
}

export function numeFisierExport(acum: Date = new Date()): string {
  return `capsula-datele-mele-${acum.toISOString().slice(0, 10)}.json`
}
