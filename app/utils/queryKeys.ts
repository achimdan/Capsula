// Toate cheile de query într-un singur loc.
export const queryKeys = {
  cont: (userId: string) => ['cont', userId] as const,
  conturi: ['cont'] as const,
  setari: ['setari'] as const,
  fise: ['fise'] as const,
  cautare: (q: string) => ['cautare', q] as const,
  similare: (id: string) => ['fise-similare', id] as const,
  fiseProprii: (userId: string) => ['fise-proprii', userId] as const,
  toateFiseleProprii: ['fise-proprii'] as const
}
