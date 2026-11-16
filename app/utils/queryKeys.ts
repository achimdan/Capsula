// Toate cheile de query într-un singur loc.
export const queryKeys = {
  cont: (userId: string) => ['cont', userId] as const,
  conturi: ['cont'] as const,
  setari: ['setari'] as const
}
