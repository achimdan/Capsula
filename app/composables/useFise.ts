// Fișele Capsulei, din Supabase (public.fise). Cerute o dată pe încărcare (plugins/fise.client.ts) și partajate:
// TanStack Query ține cererea, starea Nuxt (`useState`) ține lista, ca orice composable sau plugin s-o poată citi sincron.
// Până ajung datele lista e goală; paginile care aleg ceva din ea (joc, Random Hit) așteaptă `incarca()`.
import type { Fisa } from '~/data/fise'

// Fișele se schimbă doar din SQL/admin: nu le cerem din nou în aceeași sesiune.
const PROASPETE_MS = 60 * 60 * 1000

export function useFise() {
  const nuxtApp = useNuxtApp()
  const toate = useState<Fisa[]>('fise', () => [])
  const stare = useState<'astept' | 'gata' | 'eroare'>('fise-stare', () => 'astept')
  const api = fiseApi()

  async function incarca(): Promise<Fisa[]> {
    if (stare.value === 'gata') return toate.value
    try {
      const queryClient = nuxtApp.vueApp.runWithContext(() => useQueryClient())
      toate.value = await queryClient.ensureQueryData({ queryKey: queryKeys.fise, queryFn: api.toate, staleTime: PROASPETE_MS })
      stare.value = 'gata'
    } catch {
      stare.value = 'eroare'
      console.warn('[fise] nu am putut citi fișele')
    }
    return toate.value
  }

  return { toate, stare, incarca }
}
