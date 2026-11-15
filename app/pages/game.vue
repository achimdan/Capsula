<script setup lang="ts">
import { FISE, AN_MIN, AN_MAX, type Fisa } from '~/data/fise'
const { areProfil, profil } = useCapsula()
const RUNDE = 5
const recorduri = useStocare<number[]>('scoruri', [])
const lista = ref<Fisa[]>([])
const runda = ref(0)
const scor = ref(0)
const ghicit = ref(1997)
const dezvaluit = ref(false)
const puncte = ref(0)
const terminat = ref(false)

function amesteca() {
  const exacte = FISE.filter(f => f.an_exact && (f.oras === null || f.oras === profil.value.oras))
  lista.value = [...exacte].sort(() => Math.random() - .5).slice(0, RUNDE)
  runda.value = 0; scor.value = 0; dezvaluit.value = false; terminat.value = false; ghicit.value = 1997
}
const curenta = computed(() => lista.value[runda.value])
function confirma() {
  if (!curenta.value) return
  const d = Math.abs(ghicit.value - curenta.value.an)
  puncte.value = Math.max(0, 100 - 25 * d)
  scor.value += puncte.value
  dezvaluit.value = true
}
function urmatoarea() {
  if (runda.value + 1 >= lista.value.length) { terminat.value = true; recorduri.value = [...recorduri.value, scor.value]; return }
  runda.value++; dezvaluit.value = false
}
const mesaj = computed(() => {
  if (!curenta.value) return ''
  const d = Math.abs(ghicit.value - curenta.value.an)
  return d === 0 ? 'Exact!' : d === 1 ? 'Aproape!' : `A fost ${curenta.value.an}`
})
const record = computed(() => recorduri.value.length ? Math.max(...recorduri.value) : null)
onMounted(() => { if (!areProfil.value) navigateTo('/'); else amesteca() })
</script>

<template>
  <main class="pagina">
    <section class="joc">
      <div class="rand"><span class="contor">RUNDA {{ Math.min(runda + 1, RUNDE) }}/{{ RUNDE }} · {{ scor }} PCT</span><span v-if="record !== null" class="k">Recordul tău: {{ record }}</span></div>
      <h1 class="d1">Ghicește anul</h1>

      <div v-if="terminat" class="card final">
        <div class="k">Scor final</div>
        <p class="d1">{{ scor }}<span class="din">/{{ RUNDE * 100 }}</span></p>
        <p class="lead">Media generației {{ String(profil.anNastere).slice(2) }} apare după ce conectăm baza de date.</p>
        <div class="rand"><button class="btn" @click="amesteca">Joacă din nou</button><NuxtLink to="/shop" class="btn ghost">Scorul pe tricou</NuxtLink></div>
      </div>

      <div v-else-if="curenta" class="tabla">
        <FisaPolaroid :key="curenta.id + dezvaluit" :fisa="curenta" :ascunde-an="!dezvaluit" :actiuni="dezvaluit" :developare="dezvaluit" />
        <div class="ghiceste">
          <output class="mare" for="an-ghicit">{{ ghicit }}</output>
          <label class="k" for="an-ghicit">Derulează la anul pe care îl crezi</label>
          <input id="an-ghicit" v-model.number="ghicit" type="range" :min="AN_MIN" :max="AN_MAX" :disabled="dezvaluit">
          <div class="scala"><span>{{ AN_MIN }}</span><span>{{ AN_MAX }}</span></div>
          <button v-if="!dezvaluit" class="btn" @click="confirma">Ăsta e anul</button>
          <template v-else>
            <p class="rez" aria-live="polite"><b>{{ mesaj }}</b> +{{ puncte }} puncte</p>
            <button class="btn semnal" @click="urmatoarea">{{ runda + 1 >= lista.length ? 'Vezi scorul' : 'Următoarea ▶▶' }}</button>
          </template>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.joc{display:grid;gap:20px}
.tabla{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:32px;align-items:center;justify-items:center}
@media (max-width:720px){.tabla{grid-template-columns:1fr}}
.ghiceste{display:grid;gap:10px;width:min(360px,100%)}
.mare{font-family:var(--display);font-weight:800;font-size:88px;line-height:.85;text-align:center}
input[type=range]{width:100%;accent-color:var(--signal)}
.scala{display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;color:var(--muted)}
.rez{margin:0;font-size:18px;text-align:center}
.rez b{font-family:var(--display);font-size:30px;text-transform:uppercase;margin-right:6px}
.final{display:grid;gap:12px;justify-items:start}
.din{font-size:.4em;color:var(--muted)}
</style>
