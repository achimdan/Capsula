// Fundalul paginii, ales din /admin și salvat în browser până conectăm conturile.
export type Fundal = 'clasic' | 'tapet' | 'vhs' | 'arhiva'

export const FUNDALURI: { id: Fundal; nume: string; descriere: string }[] = [
  { id: 'clasic', nume: 'Clasic', descriere: 'Banda verde, ca la început.' },
  { id: 'tapet', nume: 'Tapet de bloc', descriere: 'Perete cald, lampă de living.' },
  { id: 'vhs', nume: 'Sufragerie VHS', descriere: 'Ecran CRT, linii și zgomot.' },
  { id: 'arhiva', nume: 'Hârtie de arhivă', descriere: 'Carton crem, fișe și bandă adezivă.' }
]

export function useFundal() {
  const fundal = useStocare<Fundal>('fundal', 'clasic')
  if (!FUNDALURI.some(f => f.id === fundal.value)) fundal.value = 'clasic'
  useHead({ htmlAttrs: { 'data-fundal': computed(() => fundal.value) } })
  return fundal
}
