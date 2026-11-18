import type { H3Event } from 'h3'
import { MODEL_EMBEDDING } from '#shared/utils/cautare'

interface LegaturaAi {
  run: (model: string, input: { text: string[] }) => Promise<{ data: number[][] }>
}

// Workers AI prin legătura `AI` din wrangler (doar pe Worker; în `nuxt dev` lipsește și întoarce null).
export function legaturaAi(event: H3Event): LegaturaAi | null {
  const env = (event.context as { cloudflare?: { env?: { AI?: LegaturaAi } } }).cloudflare?.env
  return env?.AI ?? null
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
