// Setările site-ului (site_settings): cerute o dată pe încărcare și partajate prin TanStack Query.
// Le citește oricine; le scrie doar super adminul din /admin (RLS verifică rolul, nu doar clientul).
// Fiecare setare are un ref ținut și în localStorage, ca pagina să pornească direct cu ultima valoare văzută.
import { MODULE, cheieModul, esteListaFise, type ListaFise, type ModulSetare, type SetariSite, SETARI_IMPLICITE } from '~/utils/setari'

export function useListaFise() {
  const lista = useStocare<ListaFise>('lista-fise', 'grila')
  if (!esteListaFise(lista.value)) lista.value = 'grila'
  return lista
}

// Modulele pornite din /admin. Cache local ca nav-ul să nu clipească; oprite până confirmă DB-ul.
export function useModule() {
  return Object.fromEntries(MODULE.map(m => [cheieModul(m), useStocare<boolean>(cheieModul(m), false)])) as Record<ModulSetare, Ref<boolean>>
}

export function useSetari() {
  const nuxtApp = useNuxtApp()
  const valori = { fundal: useFundal(), listaFise: useListaFise(), ...useModule() }
  const api = setariApi()
  const queryClient = () => nuxtApp.vueApp.runWithContext(() => useQueryClient())

  // La pornire: aduce setările și le aplică. Dacă cererea pică, rămân valorile din cache-ul local.
  async function incarca() {
    try {
      const s = await queryClient().ensureQueryData({ queryKey: queryKeys.setari, queryFn: api.citesteSetari })
      valori.fundal.value = s.fundal
      valori.listaFise.value = s.listaFise
      for (const m of MODULE) valori[cheieModul(m)].value = s[cheieModul(m)]
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

  // Pentru middleware: setările din DB (cache TanStack), nu doar ce știe browserul.
  async function citeste(): Promise<SetariSite> {
    try {
      return await queryClient().ensureQueryData({ queryKey: queryKeys.setari, queryFn: api.citesteSetari })
    } catch {
      return { ...SETARI_IMPLICITE, ...Object.fromEntries(MODULE.map(m => [cheieModul(m), valori[cheieModul(m)].value])) }
    }
  }

  return { ...valori, incarca, salveaza, citeste }
}
