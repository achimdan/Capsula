// PROVIZORIU: se înlocuiește cu Supabase Auth (@nuxtjs/supabase).
// Fără parolă, doar email, salvat în browser. Păstrează aceeași formă (utilizator, autentificat, intra, iese).
export interface Utilizator { email: string }

export function useAuth() {
  const utilizator = useStocare<Utilizator | null>('auth', null)
  const autentificat = computed(() => !!utilizator.value?.email)

  function intra(email: string) {
    utilizator.value = { email: email.trim().toLowerCase() }
  }
  function iese() {
    utilizator.value = null
  }

  return { utilizator, autentificat, intra, iese }
}
