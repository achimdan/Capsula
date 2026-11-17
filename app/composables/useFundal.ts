// Fundalul paginii: unul pentru tot site-ul, ales din /admin și ținut în site_settings (vezi useSetari).
// localStorage e doar cache, ca pagina să pornească direct cu ultimul fundal văzut.
import { esteFundal, type Fundal } from '../utils/setari'

export const FUNDALURI: { id: Fundal; nume: string; descriere: string }[] = [
  { id: 'clasic', nume: 'Clasic', descriere: 'Banda verde, ca la început.' },
  { id: 'tapet', nume: 'Tapet de bloc', descriere: 'Perete cald, lampă de living.' },
  { id: 'vhs', nume: 'Sufragerie VHS', descriere: 'Ecran CRT, linii și zgomot.' },
  { id: 'arhiva', nume: 'Hârtie de arhivă', descriere: 'Carton crem, fișe și bandă adezivă.' },
  { id: 'ceata', nume: 'Fișe în ceață', descriere: 'Fișele plutesc încet, ca înainte de intrare.' },
  { id: 'bloc', nume: 'Bloc la apus', descriere: 'Blocuri de pe vremuri, soare jos, ferestre aprinse.' },
  { id: 'pop', nume: 'Pop anii \'90', descriere: 'Casetă, Tamagotchi, telefon cu fir și dischetă.' },
  { id: 'televizor', nume: 'Televizor anii \'80', descriere: 'Televizor de lemn, cu clape și antenă, într-o cameră întunecată.' },
  { id: 'televizor-90', nume: 'Televizor anii \'90', descriere: 'Televizor gri, cu mileu, vază și telecomandă deasupra.' }
]

export function useFundal() {
  const fundal = useStocare<Fundal>('fundal', 'clasic')
  if (!esteFundal(fundal.value)) fundal.value = 'clasic'
  useHead({ htmlAttrs: { 'data-fundal': computed(() => fundal.value) } })
  return fundal
}
