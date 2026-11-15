// Logica pură a profilării: scorul răspunsurilor, alegerea profilului, mici ajutoare.
// Totul e determinist: aceleași răspunsuri dau mereu același profil.
import {
  INTREBARI, SCENE, TRASATURI, SCALA_MAX, SCALA_MIJLOC, SCALA_MIN,
  type Intrebare, type Optiune, type Ponderi, type Raspuns, type Raspunsuri, type Scena, type Trasatura
} from '../data/chestionar'
import { ARHETIPURI, PROFILURI, type Arhetip, type ProfilCititor } from '../data/profiluri'

export interface ScoruriProfil { trasaturi: Record<Trasatura, number>, scene: Record<Scena, number> }

type Cheie = Trasatura | Scena
const CHEI: readonly Cheie[] = [...TRASATURI, ...SCENE]

function zero(): Record<Cheie, number> {
  return Object.fromEntries(CHEI.map(k => [k, 0])) as Record<Cheie, number>
}

function gasesteOptiune(q: { optiuni: Optiune[] }, id: unknown): Optiune | undefined {
  return typeof id === 'string' ? q.optiuni.find(o => o.id === id) : undefined
}

// Ce adaugă un răspuns la scoruri: o listă de ponderi și factorul fiecăreia.
// Un răspuns invalid, lipsă sau „Prefer să nu spun” întoarce o listă goală.
export function contributiiRaspuns(q: Intrebare, r: Raspuns | undefined): { ponderi: Ponderi, factor: number }[] {
  if (r === null || r === undefined) return []
  switch (q.tip) {
    case 'an':
      return []
    case 'unic':
    case 'asta-sau-aia': {
      const o = gasesteOptiune(q, r)
      return o && !o.neutra ? [{ ponderi: o.ponderi, factor: 1 }] : []
    }
    case 'multiplu': {
      if (!Array.isArray(r)) return []
      const alese = [...new Set(r)].map(id => gasesteOptiune(q, id)).filter((o): o is Optiune => !!o)
      // „Prefer să nu spun” e exclusiv; peste max se taie, în ordinea alegerii.
      if (alese.some(o => o.neutra)) return []
      const taiate = alese.slice(0, q.max)
      // Media, ca trei bife să nu cântărească mai mult decât o alegere unică.
      return taiate.map(o => ({ ponderi: o.ponderi, factor: 1 / taiate.length }))
    }
    case 'scala': {
      if (typeof r !== 'number' || !Number.isInteger(r) || r < SCALA_MIN || r > SCALA_MAX) return []
      return [{ ponderi: q.ponderi, factor: r - SCALA_MIJLOC }]
    }
  }
}

// Maximul pozitiv pe care îl poate aduce fiecare întrebare pe fiecare cheie.
// Normalizăm cu el, ca o trăsătură cu multe întrebări să nu le înghită pe celelalte.
function maximPosibil(intrebari: Intrebare[]): Record<Cheie, number> {
  const max = zero()
  for (const q of intrebari) {
    for (const k of CHEI) {
      let m = 0
      if (q.tip === 'scala') m = Math.max(0, (q.ponderi[k] ?? 0) * (SCALA_MAX - SCALA_MIJLOC))
      else if (q.tip !== 'an') m = Math.max(0, ...q.optiuni.map(o => o.ponderi[k] ?? 0))
      max[k] += m
    }
  }
  return max
}

const MAXIM = maximPosibil(INTREBARI)

// Răspunsuri → scoruri normalizate (aprox. între -1 și 1) pe trăsături și scene.
export function scoreAnswers(raspunsuri: Raspunsuri, intrebari: Intrebare[] = INTREBARI): ScoruriProfil {
  const brut = zero()
  for (const q of intrebari) {
    for (const { ponderi, factor } of contributiiRaspuns(q, raspunsuri[q.id])) {
      for (const k of CHEI) brut[k] += (ponderi[k] ?? 0) * factor
    }
  }
  const max = intrebari === INTREBARI ? MAXIM : maximPosibil(intrebari)
  const norm = (k: Cheie) => (max[k] > 0 ? brut[k] / max[k] : 0)
  return {
    trasaturi: Object.fromEntries(TRASATURI.map(k => [k, norm(k)])) as Record<Trasatura, number>,
    scene: Object.fromEntries(SCENE.map(k => [k, norm(k)])) as Record<Scena, number>
  }
}

// Cel mai mare scor; la egalitate câștigă primul din listă (ordine fixă, deci stabil).
function primulMaxim<T extends string>(chei: readonly T[], scor: Record<T, number>): T {
  let best = chei[0]!
  for (const k of chei) if (scor[k] > scor[best]) best = k
  return best
}

export function arhetipDin(s: ScoruriProfil): Arhetip { return primulMaxim(ARHETIPURI, s.trasaturi) }
export function scenaDin(s: ScoruriProfil): Scena { return primulMaxim(SCENE, s.scene) }

export function pickProfile(s: ScoruriProfil): ProfilCititor {
  return profilDupaId(`${arhetipDin(s)}-${scenaDin(s)}`)!
}

export function profilDupaId(id: string): ProfilCititor | undefined {
  return PROFILURI.find(p => p.id === id)
}

export function citesteProfil(raspunsuri: Raspunsuri): ProfilCititor {
  return pickProfile(scoreAnswers(raspunsuri))
}

// Nuanța de loc, separată de profil: o folosim pentru stratul de oraș și pentru texte.
export type NuantaLoc = 'diaspora' | 'oras' | 'sat'
export function nuantaLoc(s: ScoruriProfil): NuantaLoc | null {
  if (s.trasaturi.diaspora >= 0.4) return 'diaspora'
  if (s.trasaturi.urban >= 0.3) return 'oras'
  if (s.trasaturi.urban <= -0.3) return 'sat'
  return null
}

// Câte întrebări au primit un răspuns (inclusiv „Prefer să nu spun”).
export function intrebariRaspunse(raspunsuri: Raspunsuri, intrebari: Intrebare[] = INTREBARI): number {
  return intrebari.filter((q) => {
    const r = raspunsuri[q.id]
    return r !== undefined && r !== null && !(Array.isArray(r) && r.length === 0)
  }).length
}
