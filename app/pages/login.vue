<script setup lang="ts">
// PROVIZORIU: se înlocuiește cu Supabase Auth (@nuxtjs/supabase).
const { intra } = useAuth()
const email = ref('')
const eroare = ref('')
const RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function trimite() {
  if (!RE.test(email.value.trim())) {
    eroare.value = 'Scrie o adresă de email validă, de forma nume@exemplu.ro.'
    return
  }
  eroare.value = ''
  intra(email.value)
  navigateTo('/start')
}
</script>

<template>
  <main class="login">
    <form novalidate @submit.prevent="trimite">
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
        :aria-invalid="!!eroare"
        aria-describedby="email-nota"
        @input="eroare = ''"
      >
      <p v-if="eroare" id="email-eroare" class="eroare" role="alert">{{ eroare }}</p>
      <button type="submit" class="btn semnal">Intră</button>
      <p id="email-nota" class="nota">Deocamdată contul e doar în browserul tău.</p>
    </form>
  </main>
</template>

<style scoped>
.login{display:grid;place-items:center;min-height:calc(100svh - 70px);padding:32px 16px}
form{display:grid;gap:12px;width:100%;max-width:420px}
input{font:inherit;font-size:16px;min-height:44px;padding:10px 12px;background:var(--card);color:var(--ink);border:2px solid var(--ink);border-radius:2px;transition:box-shadow .15s}
input:hover{box-shadow:4px 4px 0 var(--line)}
input[aria-invalid="true"]{border-color:var(--signal)}
.btn{min-height:44px;justify-content:center;transition:transform .15s var(--ease-ff)}
.btn:hover{transform:translateY(-2px)}
.btn:active{transform:translateY(1px)}
.eroare{margin:0;color:var(--signal);font-size:14px}
.nota{margin:0;color:var(--muted);font-size:13px}
@media (prefers-reduced-motion:reduce){.btn{transition:none}}
</style>
