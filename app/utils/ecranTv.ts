// Ce rulează pe ecranul televizorului din fundal: o buclă scurtă de „programe” desenate în cod, fără clipuri.
// Epoca vine din anul vizitatorului (anul în care avea 15 ani); fără an, bucla color de anii '90.
export type ProgramTv = 'mira' | 'purici' | 'vhs' | 'stingere'
export type EpocaTv = 'alb-negru' | 'color' | 'digital'

export interface SegmentTv { program: ProgramTv; durata: number } // durata în secunde

const BUCLA: SegmentTv[] = [
  { program: 'mira', durata: 6 },
  { program: 'purici', durata: 1.4 },
  { program: 'vhs', durata: 7 },
  { program: 'stingere', durata: 1.2 },
  { program: 'purici', durata: 0.8 }
]

export function epocaPentruAn(an: number | null | undefined): EpocaTv {
  if (an == null || !Number.isFinite(an)) return 'color'
  if (an < 1990) return 'alb-negru'
  if (an < 2000) return 'color'
  return 'digital'
}

export function buclaTv(): SegmentTv[] {
  return BUCLA
}

export function durataBucla(bucla: SegmentTv[] = BUCLA): number {
  return bucla.reduce((s, x) => s + x.durata, 0)
}

// Segmentul activ la secunda `t` și cât s-a scurs din el (0–1). Bucla se reia la nesfârșit.
export function programLa(t: number, bucla: SegmentTv[] = BUCLA): { program: ProgramTv; progres: number } {
  const total = durataBucla(bucla)
  if (!bucla.length || total <= 0) return { program: 'mira', progres: 0 }
  let r = ((t % total) + total) % total
  for (const s of bucla) {
    if (r < s.durata) return { program: s.program, progres: r / s.durata }
    r -= s.durata
  }
  return { program: bucla[0]!.program, progres: 0 }
}

// Intro-ul fixat de pe prima pagină: cât s-a derulat din pista de pin (0–1). Fără pistă, televizorul stă direct retras.
export function progresPin(top: number, inaltime: number, vh: number): number {
  const drum = inaltime - vh
  if (drum <= 0) return 1
  return Math.min(1, Math.max(0, -top / drum))
}

// Unde e centrul ecranului în carcasă (fracții din lățimea și înălțimea televizorului) și cât ocupă ecranul.
export const ECRAN_TV = {
  'televizor': { cx: 0.3889, cy: 0.5594, w: 0.5667, h: 0.5188 },
  'televizor-90': { cx: 0.5, cy: 0.4532, w: 0.7889, h: 0.5438 }
} as const

// Camera: la p=0 ecranul umple fereastra, la p=1 se vede tot televizorul, centrat. Ease-out, ca o retragere care încetinește.
export function camera(p: number, tv: { w: number; h: number }, ecran: { cx: number; cy: number; w: number; h: number }, vp: { w: number; h: number }) {
  const e = 1 - (1 - Math.min(1, Math.max(0, p))) ** 3
  const mare = Math.max(vp.w / (tv.w * ecran.w), vp.h / (tv.h * ecran.h)) * 1.04
  const scara = mare + (1 - mare) * e
  const rest = 1 - e
  return { scara, x: -(ecran.cx - 0.5) * tv.w * scara * rest, y: -(ecran.cy - 0.5) * tv.h * scara * rest }
}
