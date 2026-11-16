import { PREFIX_LOCAL } from '~/utils/datePersonale'

// Stare în browser (useState + localStorage). Pentru contul conectat e cache local; sursa e Supabase (vezi useCont).
export function useStocare<T>(cheie: string, implicit: T) {
  const stare = useState<T>(cheie, () => implicit)
  const gata = useState<boolean>(cheie + ':gata', () => false)
  if (import.meta.client && !gata.value) {
    gata.value = true
    try {
      const v = localStorage.getItem(PREFIX_LOCAL + cheie)
      if (v) stare.value = JSON.parse(v)
    } catch {}
    watch(stare, (v) => {
      try { localStorage.setItem(PREFIX_LOCAL + cheie, JSON.stringify(v)) } catch {}
    }, { deep: true })
  }
  return stare
}
