// Pozele utilizatorului (galeria de la „Pune și tu o fișă”) și linkurile semnate pentru afișare.
// Lista se cere o dată pe sesiune; urcarea și ștergerea actualizează cache-ul direct.
import { toateVariantele, type PozaProprie } from '~/utils/pozeProprii'

// Linkuri semnate pentru o listă de căi. Cheia e lista sortată, ca aceleași poze să refolosească aceleași linkuri (și cache-ul browserului).
export function useLinkuriPoze(cai: Ref<string[]> | ComputedRef<string[]>) {
  const api = pozeApi()
  const cheie = computed(() => [...new Set(cai.value)].sort().join('|'))
  const query = useQuery({
    queryKey: computed(() => queryKeys.linkuriPoze(cheie.value)),
    queryFn: () => api.semneaza(cheie.value ? cheie.value.split('|') : []),
    enabled: computed(() => import.meta.client && !!cheie.value),
    // Linkurile țin o săptămână; le refacem după o zi.
    staleTime: 24 * 3600 * 1000,
    placeholderData: prev => prev
  })
  return computed<Record<string, string>>(() => query.data.value ?? {})
}

export function usePozeProprii() {
  const { userId } = useCont()
  const api = pozeApi()
  const queryClient = useQueryClient()
  const cheie = computed(() => queryKeys.pozeProprii(userId.value ?? ''))

  const query = useQuery({
    queryKey: cheie,
    queryFn: () => api.listeaza(userId.value!),
    enabled: computed(() => import.meta.client && !!userId.value)
  })
  const poze = computed<PozaProprie[]>(() => (userId.value ? query.data.value ?? [] : []))
  const linkuri = useLinkuriPoze(computed(() => poze.value.flatMap(toateVariantele)))

  const seteaza = (fn: (l: PozaProprie[]) => PozaProprie[]) => queryClient.setQueryData<PozaProprie[]>(cheie.value, l => fn(l ?? []))

  const urcare = useMutation({
    mutationFn: (f: Blob) => api.urca(userId.value!, f),
    onSuccess: p => seteaza(l => [p, ...l])
  })
  const stergere = useMutation({
    mutationFn: (p: PozaProprie) => api.sterge(p),
    onSuccess: (_, p) => {
      seteaza(l => l.filter(x => x.cale !== p.cale))
      // Fișele care o foloseau au rămas fără poză.
      queryClient.invalidateQueries({ queryKey: queryKeys.toateFiseleProprii })
    }
  })

  return {
    poze,
    linkuri,
    seIncarca: query.isLoading,
    urca: (f: Blob) => urcare.mutateAsync(f),
    seUrca: urcare.isPending,
    sterge: (p: PozaProprie) => stergere.mutateAsync(p)
  }
}
