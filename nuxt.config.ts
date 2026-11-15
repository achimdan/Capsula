export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  // Faza locală: datele stau în browser, deci randăm doar pe client.
  // Când conectăm Supabase, revenim la SSR pentru SEO și carduri de share.
  ssr: false,
  css: ['~/assets/css/banda.css'],
  nitro: { preset: 'cloudflare_pages' },
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
