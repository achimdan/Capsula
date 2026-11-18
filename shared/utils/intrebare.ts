// „Întreabă-mi capsula”: părțile pure ale răspunsului (folosite de /api/ask și de teste).
// Regula de bază: răspunsul vine doar din fișele trimise modelului, cu citare; nimic din afara lor.

export const MODEL_RASPUNS = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
export const FISE_IN_CONTEXT = 8
export const RASPUNS_FARA_FISE = 'N-am găsit în capsulă fișe despre asta. Încearcă să întrebi altfel sau caută după un cuvânt.'

export interface FisaContext {
  id: string
  titlu: string
  nota: string
  an: number
  an_exact: boolean
  categorie: string
  oras: string | null
  verificat: boolean
}

// Aceeași regulă ca fiseVizibile din useCapsula: fișele naționale plus stratul orașului deblocat al omului.
// `oras` vine de la client doar când orașul lui e deblocat; altfel e null și rămân doar fișele naționale.
export function fisaVizibila(f: { oras: string | null }, oras: string | null): boolean {
  return f.oras === null || (oras !== null && f.oras === oras)
}

// Blocul de fișe pentru model. Anii nesiguri apar ca „cca”, fișele neverificate sunt marcate,
// ca modelul să nu le prezinte drept fapte sigure.
export function contextFise(fise: FisaContext[]): string {
  return fise.map((f) => {
    const an = f.an_exact ? String(f.an) : `cca ${f.an} (an nesigur)`
    const stare = f.verificat ? '' : ' [NEVERIFICATĂ]'
    return `[${f.id}]${stare} ${f.titlu} — ${an}, ${f.categorie}, ${f.oras ?? 'România'}\n${f.nota}`
  }).join('\n\n')
}

export const PROMPT_SISTEM = `Ești „Capsula”, o arhivă de amintiri românești. Răspunzi în română, cu diacritice corecte, pe scurt (2–5 propoziții), cald dar sobru.
Reguli stricte:
- Folosește DOAR informațiile din fișele de mai jos. Nu adăuga fapte, nume, ani sau detalii care nu sunt scrise în fișe.
- După fiecare afirmație pune id-ul fișei între paranteze drepte, exact cum apare, de ex. [RO-0012].
- Dacă fișa e marcată [NEVERIFICATĂ], spune că e o amintire încă neverificată.
- Dacă anul e „cca”, nu-l prezenta ca an exact.
- Dacă fișele nu răspund la întrebare, spune simplu că nu ai găsit asta în capsulă. Nu ghici.`

// Id-urile citate în răspuns, păstrate doar dacă erau în context, în ordinea primei apariții.
export function citari(text: string, permise: string[]): string[] {
  const ok = new Set(permise)
  const gasite: string[] = []
  for (const m of text.matchAll(/\[([A-Z]{2}-\d{4})\]/g)) {
    const id = m[1]!
    if (ok.has(id) && !gasite.includes(id)) gasite.push(id)
  }
  return gasite
}

// Scoate citările inventate (id-uri care nu erau în context) din text.
export function faraCitariInventate(text: string, permise: string[]): string {
  const ok = new Set(permise)
  return text.replace(/\s?\[([A-Z]{2}-\d{4})\]/g, (tot, id: string) => ok.has(id) ? tot : '')
}

// Modelele scriu des ş/ţ cu sedilă; în Capsula se scrie cu virgulă (ș, ț).
export function diacriticeCorecte(text: string): string {
  return text.replace(/ş/g, 'ș').replace(/Ş/g, 'Ș').replace(/ţ/g, 'ț').replace(/Ţ/g, 'Ț')
}
