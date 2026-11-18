import { fiseDinRezultate } from '~/utils/cautare'
import { ORDINE_CATEGORII } from '~/utils/personalizare'
import type { Categorie } from '~/data/fise'

// Ajutorul la „Pune și tu o fișă”: fișe din Capsulă care seamănă cu ce scrii și o categorie propusă.
// Doar sugestii: formularul nu se schimbă singur. Textul trece prin Workers AI; e spus în /privacy. Fiecare cerere costă un vector, deci nu repetăm același text.
export function useSugestiiFisa() {
  const { fiseVizibile } = useCapsula()
  const api = fiseProprii()
  let ultima = ''
  const cerere = useMutation({
    mutationFn: ({ titlu, nota }: { titlu: string, nota: string }) => api.sugestii(titlu, nota),
    retry: 0
  })

  function cere(titlu: string, nota: string) {
    titlu = titlu.trim()
    nota = nota.trim()
    const cheie = titlu + '|' + nota
    if (titlu.length < 3 || cheie === ultima) return
    ultima = cheie
    cerere.mutate({ titlu, nota })
  }

  function goleste() {
    ultima = ''
    cerere.reset()
  }

  const categorie = computed<Categorie | null>(() => {
    const c = cerere.data.value?.categorie
    return ORDINE_CATEGORII.includes(c as Categorie) ? c as Categorie : null
  })
  const seamana = computed(() => fiseDinRezultate(cerere.data.value?.seamana ?? [], fiseVizibile.value).filter(f => !f.proprie))
  const seCauta = computed(() => cerere.isPending.value)
  return { cere, goleste, categorie, seamana, seCauta }
}
