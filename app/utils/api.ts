// Singurul loc care vorbește cu Supabase pentru datele contului și setările site-ului. RLS limitează contul la utilizatorul curent.
import type { Json } from '../types/database'
import { randChestionar, randProfil, stareDinRanduri, type ChestionarApp, type StareCont } from './cont'
import { CHEI_DB, setariDinRanduri, type SetariSite } from './setari'
import { COLOANE_FISE, fiseDinRanduri } from './fise'
import type { Fisa } from '../data/fise'
import { LIMITE_FISA, randDinFormular, type FisaNoua, type RandFisaProprie } from './fiseProprii'

export function contApi() {
  const client = useSupabaseClient()

  // Profil, chestionar și casetă: o dată pe sesiune (vezi composables/useCont.ts).
  async function citesteCont(userId: string): Promise<StareCont> {
    const [p, c, t] = await Promise.all([
      client.from('profiles').select('birth_year, city, locality_siruta, reader_profile_id, reader_traits').eq('id', userId).maybeSingle(),
      client.from('questionnaire_responses').select('answers, step, is_retake, completed_at').eq('user_id', userId).maybeSingle(),
      client.from('tape_items').select('card_id').eq('user_id', userId).order('added_at').limit(500)
    ])
    const eroare = p.error ?? c.error ?? t.error
    if (eroare) throw eroare
    return stareDinRanduri(p.data, c.data, (t.data ?? []).map(r => r.card_id))
  }

  async function salveazaProfil(userId: string, s: Pick<StareCont, 'profil' | 'profilCitit'>) {
    const { error } = await client.from('profiles').upsert({ id: userId, ...randProfil(s.profil, s.profilCitit) }, { onConflict: 'id' })
    if (error) throw error
  }

  async function salveazaChestionar(userId: string, c: ChestionarApp, terminat = false) {
    const rand = randChestionar(c, terminat)
    const { error } = await client.from('questionnaire_responses')
      .upsert({ user_id: userId, ...rand, answers: rand.answers as Json }, { onConflict: 'user_id' })
    if (error) throw error
  }

  async function modificaCaseta(userId: string, adauga: string[], sterge: string[]) {
    if (adauga.length) {
      const { error } = await client.from('tape_items')
        .upsert(adauga.map(card_id => ({ user_id: userId, card_id })), { onConflict: 'user_id,card_id', ignoreDuplicates: true })
      if (error) throw error
    }
    if (sterge.length) {
      const { error } = await client.from('tape_items').delete().eq('user_id', userId).in('card_id', sterge)
      if (error) throw error
    }
  }

  // Primul login cu date din browser: le urcă pe toate.
  async function importa(userId: string, s: StareCont) {
    await salveazaProfil(userId, s)
    if (Object.keys(s.chestionar.raspunsuri).length) await salveazaChestionar(userId, s.chestionar, !!s.profilCitit)
    await modificaCaseta(userId, s.caseta, [])
  }

  return { citesteCont, salveazaProfil, salveazaChestionar, modificaCaseta, importa }
}

// Datele personale: tot ce ține de cont, pentru export, și ștergerea contului (funcția delete_my_account din baza de date).
export function datePersonaleApi() {
  const client = useSupabaseClient()

  // Caseta întreagă, pe pagini: exportul nu are voie să taie nimic.
  async function toataCaseta(userId: string) {
    const PAGINA = 500
    const tot: { card_id: string, added_at: string }[] = []
    for (let de = 0; ; de += PAGINA) {
      const { data, error } = await client.from('tape_items').select('card_id, added_at')
        .eq('user_id', userId).order('added_at').order('card_id').range(de, de + PAGINA - 1)
      if (error) throw error
      tot.push(...(data ?? []))
      if (!data || data.length < PAGINA) return tot
    }
  }

  async function citesteTot(userId: string) {
    const [p, c, t, u] = await Promise.all([
      client.from('profiles').select('*').eq('id', userId).maybeSingle(),
      client.from('questionnaire_responses').select('*').eq('user_id', userId).maybeSingle(),
      toataCaseta(userId),
      client.from('user_cards').select('title, note, year, category, created_at').eq('user_id', userId).order('year').limit(LIMITE_FISA.peCont)
    ])
    const eroare = p.error ?? c.error ?? u.error
    if (eroare) throw eroare
    return { profil: p.data, chestionar: c.data, caseta: t, amintiri: u.data }
  }

  async function stergeCont() {
    const { error } = await client.rpc('delete_my_account')
    if (error) throw error
    // Contul nu mai există: doar sesiunea locală (o deconectare globală ar cere API-ul pentru un cont șters).
    await client.auth.signOut({ scope: 'local' })
  }

  return { citesteTot, stergeCont }
}

// Setările site-ului: citite de oricine, scrise doar de super admin (RLS cu is_super_admin()).
export function setariApi() {
  const client = useSupabaseClient()

  async function citesteSetari(): Promise<SetariSite> {
    const { data, error } = await client.from('site_settings').select('key, value').limit(50)
    if (error) throw error
    return setariDinRanduri(data ?? [])
  }

  async function salveazaSetare<K extends keyof SetariSite>(key: K, value: SetariSite[K]) {
    const { error } = await client.from('site_settings').upsert({ key: CHEI_DB[key], value: value as Json }, { onConflict: 'key' })
    if (error) throw error
  }

  return { citesteSetari, salveazaSetare }
}

// Fișele scrise de utilizator (user_cards). RLS: fiecare vede și modifică doar rândurile lui.
export function fiseProprii() {
  const client = useSupabaseClient()

  // Ajutor la scris (server/api/card-hint.post.ts): fișe din Capsulă care seamănă și categoria propusă.
  async function sugestii(titlu: string, nota: string) {
    return await $fetch<{ categorie: string | null, seamana: string[] }>('/api/card-hint', { method: 'POST', body: { titlu, nota } })
  }

  async function listeaza(userId: string): Promise<RandFisaProprie[]> {
    const { data, error } = await client.from('user_cards').select('id, title, note, year, category')
      .eq('user_id', userId).order('year').order('created_at').limit(LIMITE_FISA.peCont)
    if (error) throw error
    return data ?? []
  }

  async function adauga(userId: string, f: FisaNoua): Promise<RandFisaProprie> {
    const { data, error } = await client.from('user_cards').insert({ user_id: userId, ...randDinFormular(f) })
      .select('id, title, note, year, category').single()
    if (error) throw error
    return data
  }

  async function sterge(id: string) {
    const { error } = await client.from('user_cards').delete().eq('id', id)
    if (error) throw error
  }

  return { listeaza, adauga, sterge, sugestii }
}

// Fișele Capsulei (public.fise): citite de oricine, doar cele publicate (RLS); scrise doar de super admin.
// Și super adminul primește aici doar fișele publicate, ca paginile publice să fie la fel pentru toți.
// Lista e mică și se schimbă rar: o cerere pe încărcare, partajată prin TanStack Query (composables/useFise.ts).
export function fiseApi() {
  const client = useSupabaseClient()

  async function toate(): Promise<Fisa[]> {
    const { data, error } = await client.from('fise').select(COLOANE_FISE).eq('publicat', true).order('ordine').limit(1000)
    if (error) throw error
    return fiseDinRanduri(data ?? [])
  }

  // „Fișe asemănătoare”: vecinii după sens (pgvector), doar fișe publicate. Întoarce id-uri, în ordine.
  // Cerem toți cei 24 de candidați: cei din orașe blocate se filtrează abia în client.
  async function similare(id: string): Promise<string[]> {
    const { data, error } = await client.rpc('fise_similare', { p_fisa_id: id, match_count: 24 })
    if (error) throw error
    return ((data ?? []) as { fisa_id: string }[]).map(r => r.fisa_id)
  }

  return { toate, similare }
}
