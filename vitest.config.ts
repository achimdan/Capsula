import { defineConfig } from 'vitest/config'

// Testele sunt funcții pure, fără Nuxt. Nu lăsăm transformarea să caute un tsconfig: tsconfig.json din rădăcină
// nu include fișierele de test, așa că într-un worktree (.claude/worktrees/…) căutarea urca până la checkout-ul
// principal și cădea când acolo lipsea .nuxt/.
export default defineConfig({
  oxc: { tsconfig: false },
  test: { include: ['tests/**/*.test.ts'] }
})
