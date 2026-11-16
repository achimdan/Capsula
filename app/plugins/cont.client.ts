// Scrierile în cont: pleacă doar după ce datele contului au fost încărcate (useCont().incarcat),
// ca valorile goale de la pornire să nu suprascrie ce e salvat. Chestionarul se salvează cu debounce.
import { difCaseta } from '~/utils/cont'

const ASTEAPTA_CHESTIONAR = 1000
const ASTEAPTA_PROFIL = 500
// Sincron: încărcarea contului setează refs-urile cât `incarcat` e încă null, deci nu pleacă nicio scriere înapoi.
const SINCRON = { flush: 'sync' } as const

export default defineNuxtPlugin({
  name: 'cont',
  dependsOn: ['supabase', 'nuxt-query:plugin'],
  setup() {
    const { profil, caseta } = useCapsula()
    const { userId, incarcat, profilCitit, chestionar, reseteaza, actualizeazaCache } = useCont()
    const api = contApi()

    function activ(): string | null {
      return incarcat.value && incarcat.value === userId.value ? incarcat.value : null
    }
    async function trimite(ce: string, fn: () => Promise<void>) {
      try {
        await fn()
        actualizeazaCache()
      } catch (e) {
        console.warn(`[cont] nu am putut salva ${ce}`, e)
      }
    }

    let tProfil: ReturnType<typeof setTimeout> | undefined
    watch([profil, profilCitit], () => {
      const id = activ()
      if (!id) return
      clearTimeout(tProfil)
      tProfil = setTimeout(() => trimite('profilul', () =>
        api.salveazaProfil(id, { profil: profil.value, profilCitit: profilCitit.value })), ASTEAPTA_PROFIL)
    }, SINCRON)

    let tChestionar: ReturnType<typeof setTimeout> | undefined
    watch(chestionar, () => {
      const id = activ()
      if (!id) return
      clearTimeout(tChestionar)
      // Profil citit și fără refacere = test terminat (vezi useProfilCitit().aplica).
      const terminat = !!profilCitit.value && !chestionar.value.refacere
      tChestionar = setTimeout(() => trimite('chestionarul', () =>
        api.salveazaChestionar(id, chestionar.value, terminat)), terminat ? 0 : ASTEAPTA_CHESTIONAR)
    }, SINCRON)

    watch(caseta, (nou, vechi) => {
      const id = activ()
      if (!id) return
      const { adauga, sterge } = difCaseta(vechi ?? [], nou)
      if (adauga.length || sterge.length) trimite('caseta', () => api.modificaCaseta(id, adauga, sterge))
    }, SINCRON)

    // Ieșire (și din alt tab): golim starea contului din browser.
    watch(userId, (nou, vechi) => {
      if (vechi && nou !== vechi) {
        clearTimeout(tProfil)
        clearTimeout(tChestionar)
        reseteaza()
      }
    })
  }
})
