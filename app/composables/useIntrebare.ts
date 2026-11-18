import { fiseDinRezultate } from '~/utils/cautare'

// „Întreabă-mi capsula”: un răspuns scurt din fișe, cu sursele lui. Nu se ține în cache: fiecare întrebare costă un apel la model.
export function useIntrebare() {
  const { profil, orasDeblocat, fiseVizibile } = useCapsula()
  const cerere = useMutation({
    mutationFn: (q: string) => $fetch<{ raspuns: string, surse: string[] }>('/api/ask', {
      method: 'POST',
      body: { q, oras: orasDeblocat.value ? profil.value.oras : null }
    }),
    retry: 0
  })
  // Textul fără id-urile dintre paranteze (sursele apar ca fișe dedesubt).
  const text = computed(() => cerere.data.value?.raspuns.replace(/\s?\[[A-Z]{2}-\d{4}\]/g, '').trim() ?? '')
  const surse = computed(() => fiseDinRezultate(cerere.data.value?.surse ?? [], fiseVizibile.value))
  return { cerere, text, surse }
}
