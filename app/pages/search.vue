<script setup lang="ts">
import { curataIntrebarea, esteIntrebare } from '~/utils/cautare'
import type { Fisa } from '~/data/fise'

useHead({ title: 'Caută · Capsula', meta: [{ name: 'robots', content: 'noindex' }] })

// Un singur câmp, două feluri de răspuns:
// - cuvinte („casete”, „Cluj”) → fișele potrivite apar singure, pe măsură ce scrii;
// - o întrebare („Ce se mânca la școală?”) → la Enter, capsula răspunde din fișe, cu sursele dedesubt.
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

const curent = computed(() => curataIntrebarea(text.value))
const modIntrebare = computed(() => esteIntrebare(curent.value))

const { cerere: intreb, text: raspunsText, surse } = useIntrebare()
// Răspunsul se arată doar cât timp în câmp e aceeași întrebare la care s-a răspuns.
const raspunsCurent = computed(() => intreb.variables.value === curent.value)
function intreaba() {
  if (!modIntrebare.value || intreb.isPending.value || (raspunsCurent.value && intreb.data.value)) return
  intreb.mutate(curent.value)
}
function trimite() {
  clearTimeout(pauza)
  intrebare.value = text.value
  intreaba()
}

const EXEMPLE_CUVINTE = ['casete', 'vara la mare', 'Cluj', 'discotecă']
const EXEMPLE_INTREBARI = ['Ce se mânca la școală?', 'Ce muzică se asculta în anii 90?', 'Cum arăta un telefon în 2005?']
function incearca(e: string) {
  text.value = e
  trimite()
}

// Un link cu o întrebare în ?q= primește răspuns direct.
onMounted(() => { if (modIntrebare.value) intreaba() })

// Fișele din straturile altor orașe deblocate apar în căutare, dar marcate.
const { profil } = useCapsula()
function dinAltOras(f: Fisa) { return f.oras !== null && f.oras !== profil.value.oras }

// Ce scrie sub câmp: un singur mesaj, potrivit cu ce face pagina acum.
const stare = computed(() => {
  if (curent.value.length < 2) return ''
  if (modIntrebare.value) {
    if (intreb.isPending.value && raspunsCurent.value) return 'Caut în fișe și scriu răspunsul…'
    if (raspunsCurent.value && (intreb.data.value || intreb.isError.value)) return ''
    return 'Pare o întrebare. Apasă Enter sau „Întreabă” și capsula răspunde din fișe.'
  }
  if (isFetching.value) return 'Se caută…'
  if (isError.value) return 'Căutarea nu a mers. Încearcă din nou.'
  if (data.value && !rezultate.value.length && ascunse.value) return 'Ce se potrivește e în orașe încă închise în capsulă.'
  if (data.value && !rezultate.value.length) return `Nicio fișă cu „${q.value}”. Încearcă alt cuvânt sau pune o întrebare întreagă.`
  return ''
})
const titluFise = computed(() => {
  const n = rezultate.value.length
  const fise = n === 1 ? 'O fișă' : `${n} fișe`
  return modIntrebare.value ? `${fise} cu aceleași cuvinte` : `${fise} pentru „${q.value}”`
})
</script>

<template>
  <main class="pagina">
    <section class="cauta">
      <div class="k">Caută în capsulă</div>
      <h1 class="d1">Ce cauți?</h1>
      <form class="camp" role="search" @submit.prevent="trimite">
        <label for="q" class="k">Un cuvânt sau o întrebare</label>
        <div class="rand">
          <input
            id="q" v-model="text" type="search" name="q" maxlength="200" autocomplete="off" enterkeyhint="search"
            placeholder="ex. casete sau o întrebare">
          <button v-if="modIntrebare" type="submit" class="btn" :disabled="intreb.isPending.value">
            {{ intreb.isPending.value ? 'Se gândește…' : 'Întreabă' }}
          </button>
        </div>
      </form>
      <p class="k stare" role="status" aria-live="polite">{{ stare }}</p>
      <div v-if="curent.length < 2" class="exemple">
        <div class="grup">
          <span class="k">Caută un cuvânt</span>
          <div class="butoane">
            <button v-for="e in EXEMPLE_CUVINTE" :key="e" type="button" class="btn ghost" @click="incearca(e)">{{ e }}</button>
          </div>
        </div>
        <div class="grup">
          <span class="k">Sau întreabă capsula</span>
          <div class="butoane">
            <button v-for="e in EXEMPLE_INTREBARI" :key="e" type="button" class="btn ghost" @click="incearca(e)">{{ e }}</button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="modIntrebare && raspunsCurent && (intreb.isPending.value || intreb.data.value || intreb.isError.value)" class="raspuns-card" aria-labelledby="raspuns-titlu" aria-live="polite">
      <h2 id="raspuns-titlu" class="k">Răspunsul capsulei</h2>
      <div v-if="intreb.isPending.value" class="schelet" aria-hidden="true"><span /><span /><span /></div>
      <p v-else-if="intreb.isError.value" class="raspuns">N-am putut răspunde acum. <button type="button" class="link" @click="intreb.reset(); intreaba()">Încearcă din nou</button></p>
      <template v-else-if="intreb.data.value">
        <p class="raspuns">{{ raspunsText }}</p>
        <p v-if="surse.length" class="k notita">Scris doar din fișele de mai jos. Poate greși: deschide fișele ca să verifici.</p>
        <div v-if="surse.length" class="grila">
          <div v-for="f in surse" :key="f.id" class="rezultat">
            <span v-if="dinAltOras(f)" class="k eticheta">din {{ f.oras }}</span>
            <FisaPolaroid :fisa="f" />
          </div>
        </div>
      </template>
    </section>

    <section v-if="rezultate.length" class="fise" aria-labelledby="fise-titlu">
      <h2 id="fise-titlu" class="k">{{ titluFise }}</h2>
      <div class="grila" :class="{ vechi: isFetching }">
        <div v-for="f in rezultate" :key="f.id" class="rezultat">
          <span v-if="dinAltOras(f)" class="k eticheta">din {{ f.oras }}</span>
          <FisaPolaroid :fisa="f" />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.cauta{display:grid;gap:16px}
.camp{display:grid;gap:6px;max-width:640px;min-width:0}
.rand{display:flex;gap:8px;min-width:0}
.rand input{flex:1;min-width:0;min-height:52px;font-size:18px}
.rand input:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.rand .btn{min-height:52px;flex:none}
.stare{min-height:1.5em;max-width:640px}
.exemple{display:grid;gap:16px}
.grup{display:grid;gap:8px}
.butoane{display:flex;flex-wrap:wrap;gap:8px}
.butoane .btn{min-height:44px;font-size:18px;text-transform:none}
.raspuns-card{display:grid;gap:12px;margin:8px 0 40px;padding:18px;background:var(--card);border:1px solid var(--line);border-radius:12px;max-width:760px;min-width:0}
.raspuns{font-size:19px;line-height:1.55;overflow-wrap:anywhere}
.notita{color:var(--muted)}
.link{background:none;border:0;padding:0;color:inherit;text-decoration:underline;cursor:pointer;font:inherit;min-height:44px}
.schelet{display:grid;gap:10px}
.schelet span{height:16px;border-radius:4px;background:var(--line);animation:puls 1.2s ease-in-out infinite alternate}
.schelet span:last-child{width:60%}
@keyframes puls{from{opacity:.4}to{opacity:1}}
.fise{display:grid;gap:16px}
.grila{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px;justify-items:center;transition:opacity .2s}
.grila.vechi{opacity:.5}
.rezultat{display:grid;gap:6px;justify-items:center;min-width:0}
.eticheta{color:var(--muted)}
@media (prefers-reduced-motion: reduce){.grila{transition:none}.schelet span{animation:none}}
</style>
