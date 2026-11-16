// Datele contului (profil, chestionar, casetă) legate de starea din app.
// - La login: o singură încărcare pe sesiune (TanStack Query), apoi refs-urile din useCapsula / useProfilCitit primesc datele contului.
// - Datele din browser de dinainte de cont se urcă o dată (vezi decideStare în utils/cont.ts).
// - Scrierile pleacă din plugins/cont.client.ts, doar după încărcare: nu suprascriem contul cu valori goale.
// localStorage rămâne cache local; `cont-local` ține minte al cui e, ca să nu se moștenească între conturi.
import { CHESTIONAR_GOL, PROFIL_GOL, decideStare, type StareCont } from '~/utils/cont'
import type { ProfilCitit, StareChestionar } from './useProfilCitit'

export function useCont() {
  const nuxtApp = useNuxtApp()
  const sesiune = useSupabaseSession()
  const { profil, caseta } = useCapsula()
  const profilCitit = useStocare<ProfilCitit | null>('profilcitit', null)
  const chestionar = useStocare<StareChestionar>('chestionar', { raspunsuri: {}, pas: 0, refacere: false })
  const proprietar = useStocare<string | null>('cont-local', null)
  // id-ul contului ale cărui date sunt încărcate în refs; null = nimic încărcat, scrierile stau.
  const incarcat = useState<string | null>('cont:incarcat', () => null)
  const eroare = useState<boolean>('cont:eroare', () => false)

  const userId = computed(() => {
    const token = sesiune.value?.access_token
    return token ? decodeazaJwt<{ sub?: string }>(token)?.sub ?? null : null
  })

  const queryClient = () => nuxtApp.vueApp.runWithContext(() => useQueryClient())

  function stareLocala(): StareCont {
    return {
      profil: profil.value,
      profilCitit: profilCitit.value,
      chestionar: chestionar.value as StareCont['chestionar'],
      caseta: caseta.value
    }
  }

  function aplica(s: StareCont) {
    profil.value = { ...s.profil }
    profilCitit.value = s.profilCitit as ProfilCitit | null
    chestionar.value = s.chestionar as StareChestionar
    caseta.value = [...s.caseta]
  }

  function actualizeazaCache() {
    if (incarcat.value) queryClient().setQueryData(queryKeys.cont(incarcat.value), stareLocala())
  }

  // Chemat din middleware înainte de orice decizie pe profil.
  async function incarca() {
    const id = userId.value
    if (!id || incarcat.value === id) return
    const api = contApi()
    let cont: StareCont
    try {
      cont = await queryClient().ensureQueryData({ queryKey: queryKeys.cont(id), queryFn: () => api.citesteCont(id) })
    } catch (e) {
      // Tabele lipsă sau rețea: rămânem pe datele din browser și nu scriem nimic.
      console.warn('[cont] nu am putut încărca datele contului', e)
      eroare.value = true
      return
    }
    eroare.value = false
    const { stare, importa } = decideStare(cont, stareLocala(), proprietar.value, id)
    aplica(stare)
    proprietar.value = id
    if (importa) {
      try {
        await api.importa(id, stare)
      } catch (e) {
        console.warn('[cont] nu am putut urca datele din browser', e)
      }
    }
    incarcat.value = id
    actualizeazaCache()
  }

  // Ieșire din cont: golim starea, ca următorul om de pe același browser să nu o moștenească.
  // Dacă datele nu au ajuns niciodată în cont (de ex. tabele lipsă), nu ștergem singura lor copie.
  function reseteaza() {
    queryClient().removeQueries({ queryKey: queryKeys.conturi })
    queryClient().removeQueries({ queryKey: queryKeys.toateFiseleProprii })
    if (!incarcat.value) return
    incarcat.value = null
    proprietar.value = null
    aplica({ profil: PROFIL_GOL, profilCitit: null, chestionar: CHESTIONAR_GOL, caseta: [] })
  }

  return { userId, incarcat, eroare, profilCitit, chestionar, incarca, reseteaza, actualizeazaCache }
}
