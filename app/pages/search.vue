<script setup lang="ts">
import { curataIntrebarea } from '~/utils/cautare'
import type { Fisa } from '~/data/fise'

useHead({ title: 'Caută · Capsula', meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const router = useRouter()
const text = ref(typeof route.query.q === 'string' ? route.query.q : '')
// Căutăm după ce omul se oprește din scris, nu la fiecare literă.
const intrebare = ref(text.value)
let pauza: ReturnType<typeof setTimeout> | undefined
watch(text, (t) => {
  clearTimeout(pauza)
  pauza = setTimeout(() => { intrebare.value = t }, 350)
})
onBeforeUnmount(() => clearTimeout(pauza))

const { q, rezultate, ascunse, cerere } = useCautare(intrebare)
const { isFetching, isError, data } = cerere
watch(q, v => router.replace({ query: v ? { q: v } : {} }))

const EXEMPLE = ['vara la mare', 'ce se mânca la școală', 'muzică de discotecă', 'iarna anilor 90']
function incearca(e: string) { text.value = e; intrebare.value = e }

// Fișele din straturile altor orașe deblocate apar în căutare, dar marcate.
const { profil } = useCapsula()
function dinAltOras(f: Fisa) { return f.oras !== null && f.oras !== profil.value.oras }

const { cerere: intreb, text: raspunsText, surse } = useIntrebare()
const poateIntreba = computed(() => curataIntrebarea(text.value).length >= 3 && !intreb.isPending.value)
function intreaba() { if (poateIntreba.value) intreb.mutate(curataIntrebarea(text.value)) }
</script>

<template>
  <main class="pagina">
    <section class="cauta">
      <div class="k">Caută în capsulă</div>
      <h1 class="d1">Ce cauți?</h1>
      <form class="camp" role="search" @submit.prevent="intrebare = text">
        <label for="q" class="k">Un cuvânt, un loc, o amintire</label>
        <input
id="q" v-model="text" type="search" name="q" maxlength="200" autocomplete="off" enterkeyhint="search"
          placeholder="ex. vara la mare, casete, Cluj">
      </form>
      <div v-if="q.length < 2" class="exemple">
        <span class="k">Încearcă</span>
        <button v-for="e in EXEMPLE" :key="e" type="button" class="btn ghost" @click="incearca(e)">{{ e }}</button>
      </div>
      <p class="k stare" role="status" aria-live="polite">
        <template v-if="q.length < 2" />
        <template v-else-if="isFetching">Se caută…</template>
        <template v-else-if="isError">Căutarea nu a mers. Încearcă din nou.</template>
        <template v-else-if="data && !rezultate.length && ascunse">Ce se potrivește e în straturile altor orașe. Alege-ți orașul din test ca să le vezi.</template>
        <template v-else-if="data && !rezultate.length">Nimic pentru „{{ q }}”. Încearcă alte cuvinte.</template>
        <template v-else-if="data">{{ rezultate.length === 1 ? 'O fișă' : `${rezultate.length} fișe` }}, cele mai potrivite primele</template>
      </p>
    </section>
    <section v-if="q.length >= 2" class="intreaba" aria-labelledby="intreaba-titlu">
      <div class="intreaba-cap">
        <h2 id="intreaba-titlu" class="k">Întreabă capsula</h2>
        <button type="button" class="btn" :disabled="!poateIntreba" @click="intreaba">
          {{ intreb.isPending.value ? 'Se gândește…' : 'Răspunde din fișe' }}
        </button>
      </div>
      <p class="k notita">Răspunsul vine doar din fișele capsulei, cu sursele dedesubt. Poate greși: verifică fișele.</p>
      <div role="status" aria-live="polite">
        <p v-if="intreb.isError.value" class="raspuns">N-am putut răspunde acum. Încearcă din nou.</p>
        <template v-else-if="intreb.data.value">
          <p class="raspuns">{{ raspunsText }}</p>
          <div v-if="surse.length" class="grila surse">
            <div v-for="f in surse" :key="f.id" class="rezultat">
              <span v-if="dinAltOras(f)" class="k eticheta">din {{ f.oras }}</span>
              <FisaPolaroid :fisa="f" />
            </div>
          </div>
        </template>
      </div>
    </section>
    <div v-if="rezultate.length" class="grila" :class="{ vechi: isFetching }">
      <div v-for="f in rezultate" :key="f.id" class="rezultat">
        <span v-if="dinAltOras(f)" class="k eticheta">din {{ f.oras }}</span>
        <FisaPolaroid :fisa="f" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.cauta{display:grid;gap:16px}
.camp{display:grid;gap:6px;max-width:640px;min-width:0}
.camp input{min-height:52px;font-size:18px}
.camp input:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.exemple{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.exemple .btn{min-height:44px}
.stare{min-height:1.5em}
.grila{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px;justify-items:center;transition:opacity .2s}
.grila.vechi{opacity:.5}
.intreaba{display:grid;gap:10px;margin:8px 0 32px;padding:16px;border:1px solid var(--line);border-radius:12px;max-width:760px;min-width:0}
.intreaba-cap{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}
.intreaba-cap .btn{min-height:44px}
.notita{color:var(--muted)}
.raspuns{font-size:18px;line-height:1.5;white-space:pre-line;overflow-wrap:anywhere}
.surse{margin-top:12px}
.rezultat{display:grid;gap:6px;justify-items:center;min-width:0}
.eticheta{color:var(--muted)}
@media (prefers-reduced-motion: reduce){.grila{transition:none}}
</style>
