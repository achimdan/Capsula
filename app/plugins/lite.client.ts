import { cadreSacadate, esteDispozitivSlab } from '~/utils/dispozitiv'

// Pune html.lite pe dispozitivele slabe, înainte de montarea paginii.
// localStorage „capsula:lite” = '1' / '0' forțează modul (pentru teste).
export default defineNuxtPlugin(() => {
  const html = document.documentElement
  let fortat: string | null = null
  try { fortat = localStorage.getItem('capsula:lite') } catch { /* stocare blocată */ }
  if (fortat === '0') return
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } }
  if (fortat === '1' || esteDispozitivSlab({
    nuclee: nav.hardwareConcurrency,
    memorieGb: nav.deviceMemory,
    economisireDate: nav.connection?.saveData,
    retea: nav.connection?.effectiveType
  })) {
    html.classList.add('lite')
    return
  }
  // Al doilea filtru: după încărcare, măsurăm o secundă de cadre; dacă sacadează, trecem pe lite.
  addEventListener('load', () => setTimeout(() => {
    if (document.hidden) return
    const t: number[] = []
    let prev = performance.now()
    const pas = (now: number) => {
      t.push(now - prev)
      prev = now
      if (t.length < 60) requestAnimationFrame(pas)
      else if (cadreSacadate(t.slice(5))) html.classList.add('lite')
    }
    requestAnimationFrame(pas)
  }, 1500), { once: true })
})
