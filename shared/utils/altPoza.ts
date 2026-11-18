// Textul alternativ pentru pozele fișelor: promptul pentru modelul de imagini și curățarea răspunsului.
// Folosit de scripts/alt-fise.mjs (Node rulează TypeScript direct), deci fără importuri de valori.
// Funcții pure, testate în tests/altPoza.test.ts.

// ş/ţ cu sedilă → ș/ț cu virgulă (ca diacriticeCorecte din intrebare.ts, copiat ca să nu importăm).
const virgula = (t: string) => t.replace(/ş/g, 'ș').replace(/Ş/g, 'Ș').replace(/ţ/g, 'ț').replace(/Ţ/g, 'Ț')

export const MODEL_ALT = '@cf/meta/llama-4-scout-17b-16e-instruct'
export const ALT_MAX = 160

// Titlul îl primește doar ca să numească obiectul corect; nume, locuri și ani vin numai din el.
export function promptAlt(titlu: string): string {
  return [
    `Fișa se numește „${titlu}”.`,
    'Descrie în română, într-o singură propoziție de cel mult 20 de cuvinte, doar ce se vede în imagine, pentru cineva care nu o vede.',
    'Nu începe cu „Imaginea arată” sau „În imagine”. Nu ghici nume de oameni, mărci, locuri sau ani: folosește-le doar dacă sunt în titlu.'
  ].join(' ')
}

const INCEPUTURI = /^(imaginea|fotografia|poza|ilustrația)\s+(arată|prezintă|înfățișează|surprinde)\s+/iu

// Răspunsul modelului → textul salvat, sau null dacă nu rămâne nimic folosibil.
export function curataAlt(raspuns: string): string | null {
  let t = virgula(raspuns).replace(/\s+/g, ' ').trim()
  t = t.replace(/^["„“”'«»]+|["„“”'«»]+$/gu, '').trim()
  t = t.replace(/^(în imagine|în fotografie|în poză)(,| se vede| se văd| apare| apar)?\s*/iu, '')
  t = t.replace(INCEPUTURI, '').trim()
  if (!t) return null
  t = t[0]!.toUpperCase() + t.slice(1)
  if (t.length > ALT_MAX) {
    const taiat = t.slice(0, ALT_MAX)
    t = taiat.slice(0, Math.max(taiat.lastIndexOf(' '), 1)).replace(/[,;:\s]+$/u, '') + '…'
  }
  return t
}
