<script setup lang="ts">
// Întoarcerea din Google. Clientul Supabase schimbă singur codul din URL pe o sesiune;
// aici doar așteptăm sesiunea și mergem mai departe.
const { autentificat } = useAuth()
const { areProfil } = useCapsula()
const route = useRoute()
const { deschide } = useIntrare()
useHead({ title: 'Te conectăm · Capsula', meta: [{ name: 'robots', content: 'noindex' }] })

function parametru(nume: string): string | null {
  const dinQuery = route.query[nume]
  if (typeof dinQuery === 'string') return dinQuery
  // Unele erori vin în fragment (#error=…), nu în query.
  return new URLSearchParams(route.hash.replace(/^#/, '')).get(nume)
}

const eroare = ref(mesajEroareLogin(parametru('error_code') ?? parametru('error'), parametru('error_description')))
let limita: ReturnType<typeof setTimeout> | undefined

watchEffect(() => {
  if (autentificat.value) navigateTo(rutaDupaLogin(areProfil.value), { replace: true })
})

onMounted(() => {
  // Fără sesiune după câteva secunde: întoarcere deschisă în alt browser sau deja folosită.
  limita = setTimeout(() => {
    if (!autentificat.value && !eroare.value) eroare.value = mesajEroareLogin('access_denied', null)
  }, 8000)
})
onBeforeUnmount(() => clearTimeout(limita))
</script>

<template>
  <main class="confirm">
    <section class="cutie" aria-live="polite">
      <template v-if="eroare">
        <span class="k">Conectare</span>
        <h1 class="d2">Conectarea nu a mers</h1>
        <p class="lead" role="alert">{{ eroare }}</p>
        <button type="button" class="btn semnal" aria-haspopup="dialog" @click="deschide">Încearcă din nou</button>
      </template>
      <template v-else>
        <span class="k">Conectare</span>
        <h1 class="d2">Derulăm banda…</h1>
        <p class="lead">Te conectăm. Durează o clipă.</p>
      </template>
    </section>
  </main>
</template>

<style scoped>
.confirm{display:grid;place-items:center;min-height:calc(100svh - 70px);padding:32px 16px}
.cutie{display:grid;gap:12px;width:100%;max-width:420px;min-width:0}
.lead{margin:0}
.btn{min-height:44px;justify-content:center;transition:transform .15s var(--ease-ff)}
.btn:hover{transform:translateY(-2px)}
.btn:active{transform:translateY(1px)}
.btn:focus-visible{outline:3px solid var(--signal);outline-offset:3px}
@media (prefers-reduced-motion:reduce){.btn{transition:none}}
</style>
