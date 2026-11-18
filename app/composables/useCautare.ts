import type { Ref } from 'vue'
import { curataIntrebarea, fiseDinRezultate } from '~/utils/cautare'

// Căutarea în fișe: /api/search dă id-urile (după cuvinte și după sens), fișele întregi le avem deja (useFise).
export function useCautare(intrebare: Ref<string>) {
  const { fiseVizibile } = useCapsula()
  const { incarca } = useFise()
  const q = computed(() => curataIntrebarea(intrebare.value))

  const cerere = useQuery({
    queryKey: computed(() => queryKeys.cautare(q.value)),
    queryFn: async () => {
      const [r, fise] = await Promise.all([
        $fetch<{ ids: string[], semantic: boolean }>('/api/search', { query: { q: q.value } }),
        incarca()
      ])
      // Fără lista de fișe, orice rezultat ar părea „din alt oraș”: mai bine eroare.
      if (!fise.length) throw new Error('Fișele nu s-au încărcat')
      return r
    },
    enabled: computed(() => import.meta.client && q.value.length >= 2)
  })

  const rezultate = computed(() => fiseDinRezultate(cerere.data.value?.ids ?? [], fiseVizibile.value))
  // Găsite, dar din straturi de oraș pe care omul nu le-a deschis.
  const ascunse = computed(() => (cerere.data.value?.ids.length ?? 0) - rezultate.value.length)
  return { q, rezultate, ascunse, cerere }
}
