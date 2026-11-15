import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  { ignores: ['.output/**', '.nuxt/**', 'dist/**', '*.html'] },
  {
    rules: {
      // Onboarding.vue e un nume intenționat de componentă.
      'vue/multi-word-component-names': 'off',
      // catch gol voit în useStocare (localStorage indisponibil).
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  }
)
