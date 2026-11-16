// Singurul loc care vorbește cu Supabase pentru datele contului. RLS limitează totul la utilizatorul curent.
import type { Json } from '../types/database'
import { randChestionar, randProfil, stareDinRanduri, type ChestionarApp, type StareCont } from './cont'

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
