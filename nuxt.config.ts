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
      // previews: {} cerut de `wrangler preview`, pe care Workers Builds îl rulează pentru ramurile care nu sunt main (PR-uri).
      wrangler: { name: 'capsula', workers_dev: true, compatibility_flags: ['nodejs_compat'], observability: { enabled: true }, ai: { binding: 'AI' }, ...({ previews: {} } as object) }
    }
  },
  // Lista SIRUTA se schimbă de două ori pe an: cache lung în browser și la margine.
  routeRules: {
    // Pagina de login a fost înlocuită de fereastra de pe teaser; linkurile vechi ajung acasă.
    '/login': { redirect: '/' },
    '/data/**': { headers: { 'cache-control': 'public, max-age=86400, stale-while-revalidate=604800' } }
  },
  // Fonturile se descarcă la build și se servesc de pe domeniul nostru (/_fonts), nu de la Google:
  // vizitatorii nu mai trimit adresa IP la Google doar ca să vadă pagina. latin-ext pentru ă, â, î, ș, ț.
  fonts: {
    defaults: { subsets: ['latin', 'latin-ext'], styles: ['normal'] },
    families: [
      { name: 'Big Shoulders', provider: 'google', global: true, weights: [500, 800] },
      { name: 'Work Sans', provider: 'google', global: true, weights: [400, 500, 600] },
      { name: 'IBM Plex Mono', provider: 'google', global: true, weights: [400, 500] }
    ]
  },
  experimental: { viewTransition: true },
  app: {
    // Tranziție lină între pagini (View Transitions API); se oprește singură la prefers-reduced-motion.
    viewTransition: true,
    head: {
      htmlAttrs: { lang: 'ro' },
      title: 'Capsula',
      meta: [
        { name: 'description', content: 'Capsula timpului pentru cei care au crescut în România anilor 90–2000.' },
        { name: 'theme-color', content: '#14211B' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  }
})
