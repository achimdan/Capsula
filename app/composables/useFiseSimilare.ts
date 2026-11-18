import type { Ref } from 'vue'
import type { Fisa } from '~/data/fise'
import { fiseDinRezultate } from '~/utils/cautare'

// Fișele asemănătoare cu cea deschisă, dintre cele vizibile omului. Nu pentru amintirile proprii (nu au vectori).
export function useFiseSimilare(fisa: Ref<Fisa>) {
  const { fiseVizibile } = useCapsula()
  const api = fiseApi()
  const id = computed(() => fisa.value.id)
  const cerere = useQuery({
    queryKey: computed(() => queryKeys.similare(id.value)),
    queryFn: () => api.similare(id.value),
    enabled: computed(() => import.meta.client && !fisa.value.proprie),
    staleTime: 60 * 60 * 1000
  })
  const similare = computed(() => fiseDinRezultate(cerere.data.value ?? [], fiseVizibile.value).slice(0, 4))
  return { similare }
}
