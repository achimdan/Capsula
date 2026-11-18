// Fișele Capsulei vin din Supabase la fiecare încărcare a aplicației (o singură cerere, vezi composables/useFise.ts).
export default defineNuxtPlugin({
  name: 'fise',
  dependsOn: ['supabase', 'nuxt-query:plugin'],
  setup() {
    // Fără await: pagina pornește imediat; listele se umplu când ajung datele.
    void useFise().incarca()
  }
})
