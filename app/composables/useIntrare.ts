// Fereastra de intrare (Google), deschisă de oriunde: antet, acțiunile care păstrează ceva, /confirm după o eroare.
// Navigarea e liberă; contul se cere doar când omul vrea să păstreze ceva (caseta, adică „Am avut asta”, seria, amintirile).
import { CHEIE_INTRARE, adaugaUnic, citesteIntrare, type ActiuneAmanata } from '~/utils/intrare'
import { actualizeazaSerie } from '~/utils/casetaZilei'

export const TEXT_PASTREAZA = 'Ca să păstrezi ce ai ales, intră cu Google.'

export function useIntrare() {
  const deschis = useState('intrare-deschis', () => false)
  // true = deschisă de o acțiune care salvează ceva (textul „Ca să păstrezi caseta…”).
  const pastreaza = useState('intrare-pastreaza', () => false)
  const actiune = useState<ActiuneAmanata | null>('intrare-actiune', () => null)
  const { autentificat, intraCuGoogle } = useAuth()
  // Luate la setup: pleaca() și reia() rulează după await, în afara contextului Nuxt.
  const router = useRouter()
  const caseta = useStocare<string[]>('caseta', [])
  const serie = useStocare<{ ultima: string, zile: number }>('serie', { ultima: '', zile: 0 })

  function deschide() {
    pastreaza.value = false
    actiune.value = null
    deschis.value = true
  }

  // Poarta acțiunilor care păstrează ceva: cu cont, true (fă acțiunea); fără, deschide fereastra și ține minte acțiunea.
  function cereCont(a: ActiuneAmanata | null = null): boolean {
    if (autentificat.value) return true
    pastreaza.value = true
    actiune.value = a
    deschis.value = true
    return false
  }

  // Pleacă spre Google; după /confirm, omul se întoarce pe aceeași pagină și acțiunea se face o dată.
  async function pleaca() {
    try {
      const inapoi = router.currentRoute.value.fullPath
      // Reîncercare din /confirm: păstrăm pagina și acțiunea de la prima plecare.
      if (normalizeazaCale(router.currentRoute.value.path) === '/confirm' && sessionStorage.getItem(CHEIE_INTRARE)) throw 0
      sessionStorage.setItem(CHEIE_INTRARE, JSON.stringify({ inapoi, actiune: actiune.value }))
    } catch {}
    await intraCuGoogle()
  }

  // Chemat din /confirm, după ce datele contului s-au încărcat (altfel contul le-ar suprascrie).
  function reia(): string {
    let intrare = null
    try {
      intrare = citesteIntrare(sessionStorage.getItem(CHEIE_INTRARE))
      sessionStorage.removeItem(CHEIE_INTRARE)
    } catch {}
    const a = intrare?.actiune
    // „amavut” vine din sesiuni pornite înainte ca „Am avut asta” să devină caseta.
    if (a?.tip === 'caseta' || a?.tip === 'amavut') {
      caseta.value = adaugaUnic(caseta.value, a.id)
    } else if (a?.tip === 'serie' && a.zi === cheieZi(new Date())) {
      if (serie.value.ultima !== a.zi) serie.value = actualizeazaSerie(serie.value, a.zi, cheieIeri(Date.now()))
    }
    return rutaDupaLogin(intrare?.inapoi)
  }

  return { deschis, pastreaza, deschide, cereCont, pleaca, reia }
}
