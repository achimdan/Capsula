import { FISE, ORASE_DEBLOCATE, type Fisa } from '~/data/fise'

export interface Profil { anNastere: number | null; oras: string | null }

export function useCapsula() {
  const profil = useStocare<Profil>('profil', { anNastere: null, oras: null })
  const caseta = useStocare<string[]>('caseta', [])
  const amAvut = useStocare<string[]>('amavut', [])
  const voturi = useStocare<string[]>('voturi', [])

  const areProfil = computed(() => !!profil.value.anNastere && !!profil.value.oras)
  const orasDeblocat = computed(() => !!profil.value.oras && ORASE_DEBLOCATE.includes(profil.value.oras))
  const an15 = computed(() => (profil.value.anNastere ?? 1984) + 15)

  // Fișele vizibile: toate cele naționale + stratul orașului ales
  const fiseVizibile = computed<Fisa[]>(() =>
    FISE.filter(f => f.oras === null || f.oras === profil.value.oras))

  function varsta(f: Fisa) { return f.an - (profil.value.anNastere ?? 1984) }

  // Random Hit ponderat pe vârstă: 10–20 de ani contează de 3 ori mai mult
  function randomHit(exclude?: string): Fisa {
    const lista = fiseVizibile.value.filter(f => f.id !== exclude)
    const ponderi = lista.map(f => { const v = varsta(f); return v >= 10 && v <= 20 ? 3 : 1 })
    let r = Math.random() * ponderi.reduce((a, b) => a + b, 0)
    for (let i = 0; i < lista.length; i++) { r -= ponderi[i]!; if (r <= 0) return lista[i]! }
    return lista[lista.length - 1]!
  }

  function comuta(lista: Ref<string[]>, id: string) {
    lista.value = lista.value.includes(id) ? lista.value.filter(x => x !== id) : [...lista.value, id]
  }

  return { profil, caseta, amAvut, voturi, areProfil, orasDeblocat, an15, fiseVizibile, varsta, randomHit, comuta }
}
