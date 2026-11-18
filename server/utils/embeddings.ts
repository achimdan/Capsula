import type { H3Event } from 'h3'
import { MODEL_EMBEDDING } from '#shared/utils/cautare'

interface LegaturaAi {
  run: (model: string, input: { text: string[] }) => Promise<{ data: number[][] }>
}

// Workers AI: pe Worker prin legătura `AI` din wrangler. În `nuxt dev` legătura lipsește, așa că folosim
// API-ul REST, dacă .env are NUXT_CLOUDFLARE_ACCOUNT_ID și NUXT_CLOUDFLARE_AI_TOKEN. Altfel întoarce null.
export function legaturaAi(event: H3Event): LegaturaAi | null {
  const env = (event.context as { cloudflare?: { env?: { AI?: LegaturaAi } } }).cloudflare?.env
  if (env?.AI) return env.AI
  const { cloudflareAccountId: cont, cloudflareAiToken: token } = useRuntimeConfig(event)
  if (!cont || !token) return null
  return {
    async run(model, input) {
      const r = await $fetch<{ success: boolean, result: { data: number[][] } }>(
        `https://api.cloudflare.com/client/v4/accounts/${cont}/ai/run/${model}`,
        { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: input }
      )
      if (!r.success) throw new Error('Workers AI REST a răspuns cu eroare')
      return r.result
    }
  }
}

// Vectorii pentru mai multe texte, în loturi de câte 50 (limita modelului e 100).
export async function vectori(ai: LegaturaAi, texte: string[]): Promise<number[][]> {
  const rezultat: number[][] = []
  for (let i = 0; i < texte.length; i += 50) {
    const { data } = await ai.run(MODEL_EMBEDDING, { text: texte.slice(i, i + 50) })
    rezultat.push(...data)
  }
  return rezultat
}

export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}
