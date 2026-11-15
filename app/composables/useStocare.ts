// Stare salvată în browser până conectăm Supabase.
export function useStocare<T>(cheie: string, implicit: T) {
  const stare = useState<T>(cheie, () => implicit)
  const gata = useState<boolean>(cheie + ':gata', () => false)
  if (import.meta.client && !gata.value) {
    gata.value = true
    try {
      const v = localStorage.getItem('capsula:' + cheie)
      if (v) stare.value = JSON.parse(v)
    } catch {}
    watch(stare, (v) => {
      try { localStorage.setItem('capsula:' + cheie, JSON.stringify(v)) } catch {}
    }, { deep: true })
  }
  return stare
}
