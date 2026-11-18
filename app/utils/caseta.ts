// Fundalul „Casetă 3D”: calcule pure pentru caseta din spate și banda de ani de pe prima pagină.
// Scena (Three.js) e în components/CasetaScena.client.vue; aici e doar matematica, ca s-o putem testa.

// Raza rolelor de bandă (în unități de scenă): goală = doar butucul, plină = toată banda pe o rolă.
export const RAZA_GOALA = 0.62
export const RAZA_PLINA = 1.5

// Cât de plină e fiecare rolă când ai derulat fracțiunea p din bandă (0 = început, 1 = sfârșit).
// Aria benzii se mută de pe o rolă pe alta, deci razele cresc și scad după radical, nu liniar.
export function razeRole(p: number): { stanga: number, dreapta: number } {
  const t = Math.min(1, Math.max(0, p))
  const a0 = RAZA_GOALA ** 2
  const a = RAZA_PLINA ** 2 - a0
  return { stanga: Math.sqrt(a0 + a * (1 - t)), dreapta: Math.sqrt(a0 + a * t) }
}

// Banda merge cu viteză constantă, deci o rolă mică se învârte mai repede decât una plină.
// Întoarce cu cât se rotește fiecare butuc (radiani) când banda avansează cu `lungime` unități.
export function rotireRole(lungime: number, p: number): { stanga: number, dreapta: number } {
  const r = razeRole(p)
  return { stanga: lungime / r.stanga, dreapta: lungime / r.dreapta }
}

// Anul din dreptul capului de citire: progresul pistei (0..1) → poziția pe banda de ani (0..n-1, cu zecimale).
export function pozitieAn(p: number, n: number): number {
  if (n <= 1) return 0
  return Math.min(1, Math.max(0, p)) * (n - 1)
}

// Progresul pistei la care anul cu indexul i stă exact sub cap (inversul lui pozitieAn).
export function progresPentruAn(i: number, n: number): number {
  if (n <= 1) return 0
  return Math.min(1, Math.max(0, i / (n - 1)))
}

// Unde se așază pagina când scroll-ul se oprește pe bandă: pe cel mai apropiat an, ușor împins în sensul derulării.
export function anDeOprire(p: number, n: number, directie: number): number {
  const x = pozitieAn(p, n)
  const i = directie > 0 ? Math.floor(x + 0.7) : directie < 0 ? Math.ceil(x - 0.7) : Math.round(x)
  return Math.min(n - 1, Math.max(0, i))
}

// Pista are la început un ecran de intro (caseta văzută de foarte aproape, care se retrage), apoi anii.
// Din progresul total (0..1) scoatem cât s-a parcurs din intro și cât din bandă. `inaltime` și `vh` în pixeli.
export function imparteProgres(p: number, inaltime: number, vh: number): { intro: number, ani: number, prag: number } {
  const drum = inaltime - vh
  const prag = drum > 0 ? Math.min(1, vh / drum) : 1
  const t = Math.min(1, Math.max(0, p))
  if (prag >= 1) return { intro: t, ani: 0, prag: 1 }
  return { intro: Math.min(1, t / prag), ani: Math.max(0, (t - prag) / (1 - prag)), prag }
}
