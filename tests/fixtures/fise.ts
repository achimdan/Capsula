// Fișele din importul inițial (supabase/seed/fise.json), trecute prin aceeași mapare ca rândurile din Supabase.
import SEED from '../../supabase/seed/fise.json'
import type { Fisa } from '../../app/data/fise'
import { fiseDinRanduri, randTabelDinFisa } from '../../app/utils/fise'

export const SEED_FISE = SEED as (Fisa & { ordine: number })[]
export const FISE: Fisa[] = fiseDinRanduri(SEED_FISE.map(randTabelDinFisa))
