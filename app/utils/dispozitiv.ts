// Dispozitive slabe: telefoane vechi, puțină memorie, „Economizor de date” sau rețea lentă.
// Pe ele site-ul intră în modul „lite”: fără animații grele, ca la mișcare redusă (html.lite în banda.css).

export interface InfoDispozitiv {
  nuclee?: number
  memorieGb?: number
  economisireDate?: boolean
  retea?: string
}

export function esteDispozitivSlab(i: InfoDispozitiv): boolean {
  if (i.economisireDate) return true
  if (i.retea === 'slow-2g' || i.retea === '2g') return true
  if (i.memorieGb !== undefined && i.memorieGb <= 2) return true
  if (i.nuclee !== undefined && i.nuclee <= 2) return true
  if (i.nuclee !== undefined && i.nuclee <= 4 && i.memorieGb !== undefined && i.memorieGb <= 4) return true
  return false
}

// Cadre măsurate (ms între cadre): dacă mediana trece de ~28 ms (sub ~35 fps), animațiile sacadează.
export function cadreSacadate(intervale: number[]): boolean {
  if (intervale.length < 20) return false
  const s = [...intervale].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]! > 28
}

// Folosit în loc de matchMedia('(prefers-reduced-motion: reduce)') în componente: lite contează ca mișcare redusă.
export function miscareRedusa(): boolean {
  if (typeof window === 'undefined') return false
  return document.documentElement.classList.contains('lite') || matchMedia('(prefers-reduced-motion: reduce)').matches
}
