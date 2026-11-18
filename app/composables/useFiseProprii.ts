// „Amintirile tale”: fișele scrise de utilizatorul logat, din user_cards.
// O singură cerere pe sesiune (TanStack Query); adăugarea și ștergerea actualizează cache-ul direct, fără recitire.
// Fără cont nu există fișe proprii: formularul cere intrarea în cont.
import { caiPozaRand, fisaDinRand, idRand, type FisaNoua, type RandFisaProprie } from '~/utils/fiseProprii'
import type { PozaProprie } from '~/utils/pozeProprii'
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

  // Pozele fișelor: linkuri semnate, cerute o dată pentru toate căile (vezi useLinkuriPoze).
  const caiPoze = computed(() => (query.data.value ?? []).flatMap(r => caiPozaRand(r) ?? []))
  const linkuri = useLinkuriPoze(caiPoze)

  const fise = computed<Fisa[]>(() => (userId.value ? query.data.value ?? [] : [])
    .map(r => fisaDinRand(r, linkuri.value)).filter((f): f is Fisa => f !== null))

  const seteaza = (fn: (r: RandFisaProprie[]) => RandFisaProprie[]) =>
    queryClient.setQueryData<RandFisaProprie[]>(cheie.value, r => fn(r ?? []))

  const adaugare = useMutation({
    mutationFn: ({ f, poza }: { f: FisaNoua, poza: PozaProprie | null }) => api.adauga(userId.value!, f, poza),
    onSuccess: rand => seteaza(r => [...r, rand].sort((a, b) => a.year - b.year))
  })

  const stergere = useMutation({
    mutationFn: (id: string) => api.sterge(id),
    onSuccess: (_, id) => seteaza(r => r.filter(x => x.id !== id))
  })

  async function adauga(f: FisaNoua, poza: PozaProprie | null = null) { await adaugare.mutateAsync({ f, poza }) }
  async function sterge(fisa: Fisa) {
    const id = idRand(fisa.id)
    if (id) await stergere.mutateAsync(id)
  }

  return { userId, fise, seIncarca: query.isLoading, adauga, sterge, salveaza: adaugare.isPending }
}
