<script setup lang="ts">
// Supabase Auth: link magic pe email, opțional Google. Întoarcerea se face pe /confirm.
const { intra, intraCuGoogle, autentificat } = useAuth()
const { areProfil } = useCapsula()
const cuGoogle = !!useRuntimeConfig().public.authGoogle
useHead({ title: 'Intră · Capsula' })

const email = ref('')
const eroare = ref('')
const stare = ref<'formular' | 'trimite' | 'trimis' | 'google'>('formular')
const ocupat = computed(() => stare.value === 'trimite' || stare.value === 'google')

// Deja conectat (de ex. revine pe /login din istoric): mai departe.
watchEffect(() => {
  if (autentificat.value) navigateTo(rutaDupaLogin(areProfil.value), { replace: true })
})

function mesajDinEroare(e: unknown): string {
  const status = (e as { status?: number })?.status
  if (status === 429) return 'Ai cerut prea multe linkuri într-un timp scurt. Mai încearcă peste câteva minute.'
  return 'Nu am putut trimite linkul. Verifică adresa și încearcă din nou.'
}

async function trimite() {
  if (!emailValid(email.value)) {
    eroare.value = 'Scrie o adresă de email validă, de forma nume@exemplu.ro.'
    return
  }
  eroare.value = ''
  stare.value = 'trimite'
  try {
    await intra(email.value)
    stare.value = 'trimis'
  } catch (e) {
    eroare.value = mesajDinEroare(e)
    stare.value = 'formular'
  }
}

async function google() {
  eroare.value = ''
  stare.value = 'google'
  try {
    await intraCuGoogle()
  } catch {
    eroare.value = 'Nu am putut porni conectarea cu Google. Încearcă din nou sau folosește emailul.'
    stare.value = 'formular'
  }
}

function altEmail() {
  stare.value = 'formular'
}
</script>

<template>
  <main class="login">
    <section v-if="stare === 'trimis'" class="cutie" aria-live="polite">
      <span class="k">Link trimis</span>
      <h1 class="d2">Verifică emailul</h1>
      <p class="lead">
        Ți-am trimis un link pe <strong>{{ normalizeazaEmail(email) }}</strong>. Deschide-l din acest browser și intri direct în capsulă.
      </p>
      <p class="nota">Nu apare în câteva minute? Uită-te și în Spam sau Promoții.</p>
      <div class="actiuni">
        <button type="button" class="btn ghost" @click="trimite">Trimite din nou</button>
        <button type="button" class="link" @click="altEmail">Alt email</button>
      </div>
    </section>

    <form v-else class="cutie" novalidate @submit.prevent="trimite">
      <span class="k">Intrare</span>
      <h1 class="d2">Intră în capsulă</h1>
      <label class="k" for="email">Emailul tău</label>
      <input
        id="email"
        v-model="email"
        type="email"
        inputmode="email"
        autocomplete="email"
        placeholder="nume@exemplu.ro"
        :disabled="ocupat"
        :aria-invalid="!!eroare"
        :aria-describedby="eroare ? 'email-eroare email-nota' : 'email-nota'"
        @input="eroare = ''"
      >
      <p v-if="eroare" id="email-eroare" class="eroare" role="alert">{{ eroare }}</p>
      <button type="submit" class="btn semnal" :disabled="ocupat" :aria-busy="stare === 'trimite'">
        {{ stare === 'trimite' ? 'Trimitem…' : 'Trimite-mi linkul' }}
      </button>
      <p id="email-nota" class="nota">Fără parolă: primești pe email un link care te conectează.</p>

      <template v-if="cuGoogle">
        <p class="sau" aria-hidden="true"><span>sau</span></p>
        <button type="button" class="btn ghost" :disabled="ocupat" :aria-busy="stare === 'google'" @click="google">
          {{ stare === 'google' ? 'Te ducem la Google…' : 'Continuă cu Google' }}
        </button>
      </template>
    </form>
  </main>
</template>

<style scoped>
.login{display:grid;place-items:center;min-height:calc(100svh - 70px);padding:32px 16px}
.cutie{display:grid;gap:12px;width:100%;max-width:420px;min-width:0}
.lead{margin:0;overflow-wrap:anywhere}
input{font:inherit;font-size:16px;min-height:44px;padding:10px 12px;background:var(--card);color:var(--ink);border:2px solid var(--ink);border-radius:2px;transition:box-shadow .15s}
input:hover{box-shadow:4px 4px 0 var(--line)}
input[aria-invalid="true"]{border-color:var(--signal)}
.btn{min-height:44px;justify-content:center;transition:transform .15s var(--ease-ff)}
.btn:not(:disabled):hover{transform:translateY(-2px)}
.btn:not(:disabled):active{transform:translateY(1px)}
.btn:focus-visible,.link:focus-visible{outline:3px solid var(--signal);outline-offset:3px}
.eroare{margin:0;color:var(--signal);font-size:14px}
.nota{margin:0;color:var(--muted);font-size:13px}
.sau{display:flex;align-items:center;gap:12px;margin:8px 0 0;color:var(--muted);font-family:var(--mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase}
.sau::before,.sau::after{content:"";flex:1;border-top:1px solid var(--line)}
.actiuni{display:flex;flex-wrap:wrap;align-items:center;gap:16px}
.link{font:inherit;min-height:44px;padding:0 4px;background:none;border:0;color:var(--ink);text-decoration:underline;text-underline-offset:4px;cursor:pointer}
.link:hover{color:var(--signal)}
@media (prefers-reduced-motion:reduce){.btn{transition:none}}
</style>
