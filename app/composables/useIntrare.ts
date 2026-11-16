// Fereastra de intrare (Google), deschisă de oriunde: teaser, /confirm după o eroare.
export function useIntrare() {
  const deschis = useState('intrare-deschis', () => false)
  return { deschis, deschide: () => { deschis.value = true } }
}
