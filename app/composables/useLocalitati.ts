import { indexeaza, type DateLocalitati, type IndexLocalitati } from '~/utils/localitati'

// Lista SIRUTA (~150 KB comprimat) se cere o singură dată, doar când e nevoie de ea, și se partajează.
// E fișier static din /public: nu trece prin Supabase.
let incarcare: Promise<IndexLocalitati> | null = null

export function useLocalitati() {
  const index = useState<IndexLocalitati | null>('localitati', () => null)
  const eroare = ref(false)
  const seIncarca = ref(false)

  async function incarca() {
    if (index.value) return index.value
    seIncarca.value = true
    eroare.value = false
    incarcare ??= $fetch<DateLocalitati>('/data/localitati.json').then(indexeaza)
    try {
      index.value = markRaw(await incarcare)
    } catch {
      incarcare = null
      eroare.value = true
    } finally {
      seIncarca.value = false
    }
    return index.value
  }

  return { index, eroare, seIncarca, incarca }
}
