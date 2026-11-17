// Fundalul paginii: unul pentru tot site-ul, ales din /admin și ținut în site_settings (vezi useSetari).
// localStorage e doar cache, ca pagina să pornească direct cu ultimul fundal văzut.
import { esteFundal, type Fundal } from '../utils/setari'

export const FUNDALURI: { id: Fundal; nume: string; descriere: string }[] = [
  { id: 'clasic', nume: 'Clasic', descriere: 'Banda verde, ca la început.' },
  { id: 'tapet', nume: 'Tapet de bloc', descriere: 'Perete cald, lampă de living.' },
  { id: 'vhs', nume: 'Sufragerie VHS', descriere: 'Ecran CRT, linii și zgomot.' },
  { id: 'arhiva', nume: 'Hârtie de arhivă', descriere: 'Carton crem, fișe și bandă adezivă.' },
  { id: 'ceata', nume: 'Fișe în ceață', descriere: 'Fișele plutesc încet, ca înainte de intrare.' }
]

export function useFundal() {
  const fundal = useStocare<Fundal>('fundal', 'clasic')
  if (!esteFundal(fundal.value)) fundal.value = 'clasic'
  useHead({ htmlAttrs: { 'data-fundal': computed(() => fundal.value) } })
  return fundal
}
