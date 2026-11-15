export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/supabase'],
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  // Deocamdată randăm doar pe client. Revenirea la SSR (SEO, carduri de share) vine cu
  // cache la margine, robots.txt și preset-ul cloudflare_module, ca pas separat.
  ssr: false,
  css: ['~/assets/css/ui.css', '~/assets/css/banda.css'],
  // Temele vin din banda.css (fundaluri + prefers-color-scheme), nu din color mode-ul Nuxt UI.
  ui: { colorMode: false },
  supabase: {
    // URL-ul și cheia publishable vin din NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_KEY (.env).
    // Rutele protejate le decide middleware-ul nostru (auth.global.ts), nu modulul.
    redirect: false,
    types: '~/types/database.ts'
  },
  runtimeConfig: {
    // Butonul Google apare doar după ce providerul e activat în Supabase (NUXT_PUBLIC_AUTH_GOOGLE=true).
    public: { authGoogle: false }
  },
  nitro: { preset: 'cloudflare_pages' },
  // Lista SIRUTA se schimbă de două ori pe an: cache lung în browser și la margine.
  routeRules: {
    '/data/**': { headers: { 'cache-control': 'public, max-age=86400, stale-while-revalidate=604800' } }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ro' },
      title: 'Capsula',
      meta: [
        { name: 'description', content: 'Capsula timpului pentru cei care au crescut în România anilor 90–2000.' },
        { name: 'theme-color', content: '#14211B' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@500;800&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap' }
      ]
    }
  }
})
