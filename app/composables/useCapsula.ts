import { ORASE_DEBLOCATE, type Fisa } from '~/data/fise'

// localitate: codul SIRUTA, când a fost căutată în chestionar (vezi utils/localitati.ts)
export interface Profil { anNastere: number | null; oras: string | null; localitate?: number | null }

export function useCapsula() {
  const profil = useStocare<Profil>('profil', { anNastere: null, oras: null })
  const caseta = useStocare<string[]>('caseta', [])
  const amAvut = useStocare<string[]>('amavut', [])
  const voturi = useStocare<string[]>('voturi', [])

  // Toate fișele (din Supabase, vezi useFise); goale până ajung datele.
  const { toate: fise } = useFise()

  const profilCitit = useStocare<{ id: string } | null>('profilcitit', null)

  // Orașul poate rămâne null („La sat”, „Prefer să nu spun”): contează că testul a fost făcut.
  const areProfil = computed(() => !!profil.value.anNastere && (!!profil.value.oras || !!profilCitit.value))
  const { modul_bucuresti } = useModule()
  // București se deblochează din /admin (modulul „bucuresti”); până atunci fișele lui stau ascunse.
  const deblocate = computed(() => orasePornite(ORASE_DEBLOCATE, modul_bucuresti.value))
  const orasDeblocat = computed(() => !!profil.value.oras && deblocate.value.includes(profil.value.oras))
  const an15 = computed(() => (profil.value.anNastere ?? 1984) + 15)

  // Fișele vizibile: toate cele naționale + stratul orașului ales
  const fiseVizibile = computed<Fisa[]>(() =>
    fise.value.filter(f => f.oras === null || (f.oras === profil.value.oras && deblocate.value.includes(f.oras))))

  function varsta(f: Fisa) { return f.an - (profil.value.anNastere ?? 1984) }

  // Random Hit ponderat pe vârstă (10–20 de ani ×3) și pe categoriile profilului. null doar cât fișele nu au ajuns.
  function randomHit(exclude?: string): Fisa | null {
    const lista = fiseVizibile.value.filter(f => f.id !== exclude)
    if (!lista.length) return null
    const cat = profilDupaId(profilCitit.value?.id ?? '')?.config.ponderiCategorii
    const ponderi = lista.map(f => pondereFisa(varsta(f), f.categorie, cat))
    let r = Math.random() * ponderi.reduce((a, b) => a + b, 0)
    for (let i = 0; i < lista.length; i++) { r -= ponderi[i]!; if (r <= 0) return lista[i]! }
    return lista[lista.length - 1]!
  }

  function comuta(lista: Ref<string[]>, id: string) {
    lista.value = lista.value.includes(id) ? lista.value.filter(x => x !== id) : [...lista.value, id]
  }

  return { profil, caseta, amAvut, voturi, areProfil, orasDeblocat, an15, fise, fiseVizibile, varsta, randomHit, comuta }
}
