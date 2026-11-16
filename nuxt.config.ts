import { queryDefaults } from './app/utils/queryDefaults'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/supabase', '@peterbud/nuxt-query'],
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  devServer: { host: '127.0.0.1' },
  // Deocamdată randăm doar pe client. Revenirea la SSR (SEO, carduri de share) vine cu
  // cache la margine pentru HTML, ca pas separat.
  ssr: false,
  css: ['~/assets/css/ui.css', '~/assets/css/banda.css'],
  // Temele vin din banda.css (fundaluri + prefers-color-scheme), nu din color mode-ul Nuxt UI.
  ui: { colorMode: false },
  nuxtQuery: {
    autoImports: ['useQuery', 'useMutation', 'useQueryClient'],
    devtools: false,
    queryClientOptions: queryDefaults
  },
  supabase: {
    // URL-ul și cheia publishable vin din NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_KEY (.env).
    // Rutele protejate le decide middleware-ul nostru (auth.global.ts), nu modulul.
    redirect: false,
    types: '~/types/database.ts'
  },
  // Worker cu assets statice (Workers Builds rulează `npx wrangler deploy`). Nitro scrie configurația
  // pentru wrangler; numele trebuie să fie cel al Worker-ului conectat la repo.
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: { name: 'capsula', workers_dev: true, compatibility_flags: ['nodejs_compat'], observability: { enabled: true } }
    }
  },
  // Lista SIRUTA se schimbă de două ori pe an: cache lung în browser și la margine.
  routeRules: {
    // Pagina de login a fost înlocuită de fereastra de pe teaser; linkurile vechi ajung acasă.
    '/login': { redirect: '/' },
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
