<script setup lang="ts">
// Întoarcerea din Google. Clientul Supabase schimbă singur codul din URL pe o sesiune;
// aici doar așteptăm sesiunea și mergem mai departe.
const { autentificat } = useAuth()
const route = useRoute()
const { deschide, reia } = useIntrare()
const cont = useCont()
useHead({ title: 'Te conectăm · Capsula', meta: [{ name: 'robots', content: 'noindex' }] })

function parametru(nume: string): string | null {
  const dinQuery = route.query[nume]
  if (typeof dinQuery === 'string') return dinQuery
  // Unele erori vin în fragment (#error=…), nu în query.
  return new URLSearchParams(route.hash.replace(/^#/, '')).get(nume)
}

const eroare = ref(mesajEroareLogin(parametru('error_code') ?? parametru('error'), parametru('error_description')))
let limita: ReturnType<typeof setTimeout> | undefined

// Înapoi pe pagina de pe care a plecat spre Google. Întâi datele contului (profilul făcut fără cont se urcă
// acum, vezi decideStare), apoi acțiunea amânată („În casetă”, „Am avut asta”, seria), ca să nu fie suprascrisă.
// Dacă datele contului nu se încarcă, nu facem acțiunea doar în browser (s-ar pierde la următoarea încărcare):
// o lăsăm în sessionStorage și oferim reîncercarea.
let plecat = false
const contNeincarcat = ref(false)
// Butonul rămâne pe pagină cât reîncercăm (doar dezactivat), ca focusul de la tastatură să nu se piardă.
const seIncarca = ref(false)
async function continua() {
  seIncarca.value = true
  await cont.incarca()
  seIncarca.value = false
  if (cont.eroare.value) { contNeincarcat.value = true; return }
  navigateTo(reia(), { replace: true })
}
watch(autentificat, (da) => {
  if (!da || plecat) return
  plecat = true
  continua()
}, { immediate: true })

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
      <template v-else-if="contNeincarcat">
        <span class="k">Conectare</span>
        <h1 class="d2">Ești conectat, dar datele nu au venit</h1>
        <p class="lead" role="alert">Nu am putut încărca datele contului. Ce ai vrut să păstrezi te așteaptă; încearcă din nou.</p>
        <button type="button" class="btn semnal" :disabled="seIncarca" :aria-busy="seIncarca" @click="continua">{{ seIncarca ? 'Încercăm…' : 'Încearcă din nou' }}</button>
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
