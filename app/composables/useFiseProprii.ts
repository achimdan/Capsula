// „Amintirile tale”: fișele scrise de utilizatorul logat, din user_cards.
// O singură cerere pe sesiune (TanStack Query); adăugarea și ștergerea actualizează cache-ul direct, fără recitire.
// Fără cont nu există fișe proprii: formularul cere intrarea în cont.
import { fisaDinRand, idRand, type FisaNoua, type RandFisaProprie } from '~/utils/fiseProprii'
import type { Fisa } from '~/data/fise'

export function useFiseProprii() {
  const { userId } = useCont()
  const api = fiseProprii()
  const queryClient = useQueryClient()
  const cheie = computed(() => queryKeys.fiseProprii(userId.value ?? ''))

  const query = useQuery({
    queryKey: cheie,
    queryFn: () => api.listeaza(userId.value!),
    enabled: computed(() => import.meta.client && !!userId.value)
  })

  const fise = computed<Fisa[]>(() => (userId.value ? query.data.value ?? [] : [])
    .map(fisaDinRand).filter((f): f is Fisa => f !== null))

  const seteaza = (fn: (r: RandFisaProprie[]) => RandFisaProprie[]) =>
    queryClient.setQueryData<RandFisaProprie[]>(cheie.value, r => fn(r ?? []))

  const adaugare = useMutation({
    mutationFn: (f: FisaNoua) => api.adauga(userId.value!, f),
    onSuccess: rand => seteaza(r => [...r, rand].sort((a, b) => a.year - b.year))
  })

  const stergere = useMutation({
    mutationFn: (id: string) => api.sterge(id),
    onSuccess: (_, id) => seteaza(r => r.filter(x => x.id !== id))
  })

  async function adauga(f: FisaNoua) { await adaugare.mutateAsync(f) }
  async function sterge(fisa: Fisa) {
    const id = idRand(fisa.id)
    if (id) await stergere.mutateAsync(id)
  }

  return { userId, fise, seIncarca: query.isLoading, adauga, sterge, salveaza: adaugare.isPending }
}
