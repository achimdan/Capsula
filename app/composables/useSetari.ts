// Setările site-ului (site_settings): cerute o dată pe încărcare și partajate prin TanStack Query.
// Le citește oricine; le scrie doar super adminul din /admin (RLS verifică rolul, nu doar clientul).
import type { Fundal, SetariSite } from '~/utils/setari'

export function useSetari() {
  const nuxtApp = useNuxtApp()
  const fundal = useFundal()
  const api = setariApi()
  const queryClient = () => nuxtApp.vueApp.runWithContext(() => useQueryClient())

  // La pornire: aduce setările și le aplică. Dacă cererea pică, rămâne fundalul din cache-ul local.
  async function incarca() {
    try {
      const s = await queryClient().ensureQueryData({ queryKey: queryKeys.setari, queryFn: api.citesteSetari })
      fundal.value = s.fundal
    } catch {
      console.warn('[setari] nu am putut citi setările site-ului')
    }
  }

  // Din /admin: aplică imediat, salvează în DB, revine la valoarea veche dacă salvarea pică.
  async function salveazaFundal(nou: Fundal) {
    const vechi = fundal.value
    fundal.value = nou
    try {
      await api.salveazaSetare('fundal', nou)
      queryClient().setQueryData<SetariSite>(queryKeys.setari, s => ({ ...SETARI_IMPLICITE, ...s, fundal: nou }))
    } catch (e) {
      fundal.value = vechi
      throw e
    }
  }

  return { fundal, incarca, salveazaFundal }
}
