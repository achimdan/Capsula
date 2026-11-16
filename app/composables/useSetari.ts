// Setările site-ului (site_settings): cerute o dată pe încărcare și partajate prin TanStack Query.
// Le citește oricine; le scrie doar super adminul din /admin (RLS verifică rolul, nu doar clientul).
// Fiecare setare are un ref ținut și în localStorage, ca pagina să pornească direct cu ultima valoare văzută.
import { esteListaFise, type ListaFise, type SetariSite } from '~/utils/setari'

export function useListaFise() {
  const lista = useStocare<ListaFise>('lista-fise', 'grila')
  if (!esteListaFise(lista.value)) lista.value = 'grila'
  return lista
}

export function useSetari() {
  const nuxtApp = useNuxtApp()
  const valori = { fundal: useFundal(), listaFise: useListaFise() }
  const api = setariApi()
  const queryClient = () => nuxtApp.vueApp.runWithContext(() => useQueryClient())

  // La pornire: aduce setările și le aplică. Dacă cererea pică, rămân valorile din cache-ul local.
  async function incarca() {
    try {
      const s = await queryClient().ensureQueryData({ queryKey: queryKeys.setari, queryFn: api.citesteSetari })
      valori.fundal.value = s.fundal
      valori.listaFise.value = s.listaFise
    } catch {
      console.warn('[setari] nu am putut citi setările site-ului')
    }
  }

  // Din /admin: aplică imediat, salvează în DB, revine la valoarea veche dacă salvarea pică.
  async function salveaza<K extends keyof SetariSite>(cheie: K, nou: SetariSite[K]) {
    const camp = valori[cheie] as Ref<SetariSite[K]>
    const vechi = camp.value
    camp.value = nou
    try {
      await api.salveazaSetare(cheie, nou)
      queryClient().setQueryData<SetariSite>(queryKeys.setari, s => ({ ...SETARI_IMPLICITE, ...s, [cheie]: nou }))
    } catch (e) {
      camp.value = vechi
      throw e
    }
  }

  return { ...valori, incarca, salveaza }
}
