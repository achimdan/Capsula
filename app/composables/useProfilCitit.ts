// Profilul „Capsula te citește”: răspunsurile la chestionar, profilul ales și efectele lui în UI.
// Funcțiile pure (fără auto-importuri Nuxt) sunt testate în tests/start.test.ts.
import { CAPITOLE, INTREBARI, PREFER, type Intrebare, type Raspuns, type Raspunsuri, type Trasatura } from '../data/chestionar'
import type { Categorie } from '../data/fise'
import { pickProfile, profilDupaId, scoreAnswers } from '../utils/profilare'
import type { Ton } from '../data/profiluri'

type Capitol_ = typeof CAPITOLE[number]

export interface StareChestionar { raspunsuri: Raspunsuri, pas: number, refacere: boolean }
export interface ProfilCitit { id: string, trasaturi: Record<Trasatura, number> }

export type Pas =
  | { tip: 'capitol', capitol: Capitol_, nr: number }
  | { tip: 'intrebare', intrebare: Intrebare }

// Lista liniară a ecranelor: o carte de capitol înaintea întrebărilor lui.
export function construiestePasi(intrebari: Intrebare[] = INTREBARI): Pas[] {
  const pasi: Pas[] = []
  CAPITOLE.forEach((capitol, i) => {
    const ale = intrebari.filter(q => q.capitol === capitol.id)
    if (!ale.length) return
    pasi.push({ tip: 'capitol', capitol, nr: i + 1 })
    for (const intrebare of ale) pasi.push({ tip: 'intrebare', intrebare })
  })
  return pasi
}

// Câte întrebări au rămas până la un pas (pentru contorul de bandă).
export function numarIntrebare(pasi: Pas[], pas: number): { curenta: number, total: number } {
  const total = pasi.filter(p => p.tip === 'intrebare').length
  const curenta = pasi.slice(0, pas + 1).filter(p => p.tip === 'intrebare').length
  return { curenta, total }
}

// Poate merge mai departe doar dacă întrebarea are un răspuns valid.
export function esteRaspuns(q: Intrebare, r: Raspuns | undefined): boolean {
  if (r === undefined || r === null) return false
  if (q.tip === 'an') return typeof r === 'number' && Number.isInteger(r) && r >= q.min && r <= q.max
  if (q.tip === 'multiplu') return Array.isArray(r) && r.length > 0 && (r.includes(PREFER) || r.length <= q.max)
  if (q.tip === 'scala') return r === PREFER ? !!q.permiteNeutru : typeof r === 'number' && r >= 1 && r <= 5
  return typeof r === 'string' && q.optiuni.some(o => o.id === r)
}

// An + oraș pentru useCapsula. „La sat” și „Prefer să nu spun” păstrează orașul null.
export function profilDinRaspunsuri(r: Raspunsuri): { anNastere: number | null, oras: string | null } {
  const an = r['an-nastere']
  const oras = r['oras']
  return {
    anNastere: typeof an === 'number' ? an : null,
    oras: typeof oras === 'string' && oras !== 'sat' && oras !== PREFER ? oras : null
  }
}

// Greutatea unei fișe la Random Hit: vârsta (10–20 de ani ×3) înmulțită cu categoria profilului.
export function pondereFisa(varstaLaFisa: number, categorie: Categorie, ponderiCategorii?: Partial<Record<Categorie, number>>): number {
  const dupaVarsta = varstaLaFisa >= 10 && varstaLaFisa <= 20 ? 3 : 1
  return dupaVarsta * (ponderiCategorii?.[categorie] ?? 1)
}

export const LINII_TON: Record<Ton, string> = {
  cald: 'Hai înapoi, la lumina aceea de bec din sufragerie.',
  ironic: 'Nu, nu era mai bine atunci. Dar era al nostru.',
  documentar: 'Dosar deschis: anul în care aveai 15 ani.'
}

export function useProfilCitit() {
  const stare = useStocare<StareChestionar>('chestionar', { raspunsuri: {}, pas: 0, refacere: false })
  const profilCitit = useStocare<ProfilCitit | null>('profilcitit', null)
  const { profil } = useCapsula()
  const fundal = useFundal()

  const profilCititor = computed(() => (profilCitit.value ? profilDupaId(profilCitit.value.id) ?? null : null))
  const ton = computed<Ton | null>(() => profilCititor.value?.config.ton ?? null)
  const accent = computed(() => profilCititor.value?.config.accent ?? null)
  const ponderiCategorii = computed(() => profilCititor.value?.config.ponderiCategorii)

  // La final: profilul, anul/orașul și fundalul. /admin poate suprascrie fundalul ulterior.
  function aplica() {
    const r = stare.value.raspunsuri
    const scoruri = scoreAnswers(r)
    const alesul = pickProfile(scoruri)
    profilCitit.value = { id: alesul.id, trasaturi: scoruri.trasaturi }
    profil.value = profilDinRaspunsuri(r)
    fundal.value = alesul.config.fundal
    stare.value = { ...stare.value, refacere: false }
    return alesul
  }

  function refa() {
    stare.value = { raspunsuri: {}, pas: 0, refacere: true }
  }

  return { stare, profilCitit, profilCititor, ton, accent, ponderiCategorii, aplica, refa }
}

// Accentul profilului ca variabilă CSS pe <html>; doar pentru UI mare, --signal rămâne neatins.
export function aplicaAccent() {
  const { accent } = useProfilCitit()
  useHead({ htmlAttrs: { style: computed(() => (accent.value ? `--accent:${accent.value}` : undefined)) } })
}
