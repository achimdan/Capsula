// Setările site-ului (fundalul ales în /admin) vin din Supabase la fiecare încărcare a aplicației.
export default defineNuxtPlugin({
  name: 'setari',
  dependsOn: ['supabase', 'nuxt-query:plugin'],
  setup() {
    // Fără await: pagina pornește cu fundalul din cache, iar cel din DB îl înlocuiește când ajunge.
    void useSetari().incarca()
  }
})
