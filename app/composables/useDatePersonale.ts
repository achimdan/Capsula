import { cheiLocale, construiesteExport, numeFisierExport } from '~/utils/datePersonale'

// Descărcarea datelor contului și ștergerea lui, pentru pagina /privacy.
export function useDatePersonale() {
  const { utilizator } = useAuth()
  const api = datePersonaleApi()

  async function descarca() {
    const u = utilizator.value
    if (!u) return
    const date = await api.citesteTot(u.id)
    const exp = construiesteExport({ id: u.id, email: u.email, nume: u.nume }, date)
    const blob = new Blob([JSON.stringify(exp, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = numeFisierExport()
    a.click()
    URL.revokeObjectURL(url)
  }

  async function stergeCont() {
    await api.stergeCont()
    try {
      for (const k of cheiLocale(Object.keys(localStorage))) localStorage.removeItem(k)
    } catch {}
    // Reîncărcare completă: golește useState și cache-ul de query-uri, ca nimic din contul vechi să nu rămână în memorie.
    window.location.replace('/')
  }

  return { descarca, stergeCont }
}
