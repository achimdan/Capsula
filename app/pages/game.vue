<script setup lang="ts">
import { FISE, AN_MIN, AN_MAX, type Fisa } from '~/data/fise'
import type { RundaJucata } from '~/utils/cardScor'
const { areProfil, profil } = useCapsula()
const recorduri = useStocare<number[]>('scoruri', [])
const lista = ref<Fisa[]>([])
const runda = ref(0)
const scor = ref(0)
const ghicit = ref(AN_START)
const dezvaluit = ref(false)
const puncte = ref(0)
const terminat = ref(false)
const jucate = ref<RundaJucata[]>([])

// --- animation state (presentation only) ---
const reduce = ref(false)
const afisScor = ref(0)
const flap = ref<string[]>(['', '', '', ''])
const flapGata = ref<boolean[]>([false, false, false, false])
let rafScor = 0
let flapTimer: ReturnType<typeof setInterval> | undefined

function tween(from: number, to: number, ms: number, set: (v: number) => void) {
  cancelAnimationFrame(rafScor)
  if (reduce.value || from === to) { set(to); return }
  const t0 = performance.now()
  const pas = (t: number) => {
    const k = Math.min(1, (t - t0) / ms)
    set(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))))
    rafScor = k < 1 ? requestAnimationFrame(pas) : 0
  }
  rafScor = requestAnimationFrame(pas)
}
function opresteFlap() { if (flapTimer) clearInterval(flapTimer); flapTimer = undefined }
function pornesteFlap() {
  opresteFlap()
  const tinta = String(curenta.value?.an ?? '').padStart(4, '0').split('')
  if (reduce.value) { flap.value = tinta; flapGata.value = [true, true, true, true]; return }
  flapGata.value = [false, false, false, false]
  let tick = 0
  flapTimer = setInterval(() => {
    tick++
    flap.value = tinta.map((c, i) => {
      if (tick >= 6 + i * 3) { flapGata.value[i] = true; return c }
      return String(Math.floor(Math.random() * 10))
    })
    if (tick >= 6 + 3 * 3) opresteFlap()
  }, 70)
}

function amesteca() {
  opresteFlap()
  lista.value = alegeRunde(FISE, profil.value.oras)
  runda.value = 0; scor.value = 0; dezvaluit.value = false; terminat.value = false; ghicit.value = AN_START
  jucate.value = []; mesajShare.value = ''
  afisScor.value = 0
}
const curenta = computed(() => lista.value[runda.value])
// În timpul rundei fișa nu are voie să spună anul (titlu, notă, sursă); după dezvăluire apare întreagă.
const fisaAfisata = computed(() => curenta.value && (dezvaluit.value ? curenta.value : fisaFaraAn(curenta.value)))
function confirma() {
  if (!curenta.value) return
  const d = Math.abs(ghicit.value - curenta.value.an)
  puncte.value = puncteDupaDistanta(d)
  jucate.value = [...jucate.value, { an: curenta.value.an, ghicit: ghicit.value, puncte: puncte.value }]
  const dinainte = scor.value
  scor.value += puncte.value
  dezvaluit.value = true
  pornesteFlap()
  setTimeout(() => tween(dinainte, scor.value, 700, v => { afisScor.value = v }), reduce.value ? 0 : 900)
}
function urmatoarea() {
  opresteFlap()
  if (runda.value + 1 >= lista.value.length) {
    terminat.value = true; recorduri.value = [...recorduri.value, scor.value]
    tween(0, scor.value, 1100, v => { afisScor.value = v })
    return
  }
  runda.value++; dezvaluit.value = false; ghicit.value = AN_START
}
const mesaj = computed(() => {
  if (!curenta.value) return ''
  const d = Math.abs(ghicit.value - curenta.value.an)
  return d === 0 ? 'Exact!' : d === 1 ? 'Aproape!' : `A fost ${curenta.value.an}`
})
const record = computed(() => recorduri.value.length ? Math.max(...recorduri.value) : null)

// odometer digits for the guess
const cifre = computed(() => String(ghicit.value).padStart(4, '0').split('').map(Number))
// distance meter (positions are static %, animation is scaleX / opacity)
const span = AN_MAX - AN_MIN
const proc = (an: number) => Math.max(0, Math.min(100, ((an - AN_MIN) / span) * 100))
const pozGhicit = computed(() => proc(ghicit.value))
const pozReal = computed(() => proc(curenta.value?.an ?? ghicit.value))
const bara = computed(() => ({
  left: `${Math.min(pozGhicit.value, pozReal.value)}%`,
  width: `${Math.abs(pozGhicit.value - pozReal.value)}%`,
  transformOrigin: pozReal.value >= pozGhicit.value ? 'left center' : 'right center',
}))
const diferenta = computed(() => curenta.value ? Math.abs(ghicit.value - curenta.value.an) : 0)
// Cardul de share: PNG desenat în browser, trimis din foaia de share a telefonului sau descărcat.
const { distribuie, pregateste, uita } = useCardScor()
const ocupatShare = ref(false)
const mesajShare = ref('')
const cardCurent = () => continutCard({ scor: scor.value, max: RUNDE * 100, titlu: titlu.value, runde: jucate.value, anNastere: profil.value.anNastere, host: location.host })
// Cardul se desenează cât apare ecranul final, ca butonul să deschidă foaia de share fără întârziere.
watch(terminat, gata => { if (gata) pregateste(cardCurent(), scor.value, RUNDE * 100); else uita() })
async function share() {
  ocupatShare.value = true
  mesajShare.value = ''
  try {
    const r = await distribuie(cardCurent(), scor.value, RUNDE * 100)
    if (r === 'descarcat') mesajShare.value = 'Cardul s-a salvat ca imagine. Trimite-l cui vrei.'
  } catch {
    mesajShare.value = 'Nu am putut face cardul. Încearcă din nou.'
  } finally {
    ocupatShare.value = false
  }
}
const titlu = computed(() => scor.value >= 450 ? 'Arhivar de meserie' : scor.value >= 300 ? 'Ureche bună de casetofon' : scor.value >= 150 ? 'Banda se mai derulează' : 'Casetă nouă, încă fără amintiri')

onMounted(() => {
  reduce.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  amesteca()
})
onBeforeUnmount(() => { opresteFlap(); cancelAnimationFrame(rafScor) })
</script>

<template>
  <main class="pagina">
    <section class="joc">
      <div class="rand"><span class="contor"><span>RUNDA {{ Math.min(runda + 1, RUNDE) }}/{{ RUNDE }} · <span class="tic">{{ afisScor }}</span> PCT</span></span><span v-if="record !== null" class="k">Recordul tău: {{ record }}</span></div>
      <h1 class="d1">Ghicește anul</h1>
      <p v-if="!areProfil" class="lead invita">Anii tăi de 10–20 fac jocul mai personal. <NuxtLink to="/start">Fă testul</NuxtLink></p>

      <Transition name="kaseta" mode="out-in">
        <div v-if="terminat" key="final" class="card final">
          <div class="k">Scor final</div>
          <p class="d1 scorfinal"><span class="tic">{{ afisScor }}</span><span class="din">/{{ RUNDE * 100 }}</span></p>
          <span class="sr" role="status">Scor final {{ scor }} din {{ RUNDE * 100 }}. {{ titlu }}.</span>
          <div class="stampila" aria-hidden="true"><span>{{ titlu }}</span><b>{{ scor }} PCT</b></div>
          <p class="lead">Media generației {{ String(profil.anNastere).slice(2) }} apare după ce conectăm baza de date.</p>
          <div class="rand"><button class="btn" :disabled="ocupatShare" :aria-busy="ocupatShare" @click="share">{{ ocupatShare ? 'Facem cardul…' : 'Distribuie scorul' }}</button><button class="btn ghost" @click="amesteca">Joacă din nou</button><NuxtLink to="/shop" class="btn ghost">Scorul pe tricou</NuxtLink></div>
          <p v-if="mesajShare" class="k" role="status">{{ mesajShare }}</p>
        </div>

        <div v-else-if="curenta" :key="`r${runda}`" class="tabla">
          <FisaPolaroid :key="curenta.id + dezvaluit" :fisa="fisaAfisata ?? curenta" :ascunde-an="!dezvaluit" :actiuni="dezvaluit" :developare="dezvaluit" />
          <div class="ghiceste">
            <output class="mare" for="an-ghicit">
              <span class="sr">{{ ghicit }}</span>
              <span class="odo" aria-hidden="true">
                <span v-for="(c, i) in cifre" :key="i" class="coloana">
                  <span class="banda" :style="{ transform: `translateY(${-c * 10}%)` }">
                    <span v-for="n in 10" :key="n">{{ n - 1 }}</span>
                  </span>
                </span>
              </span>
            </output>
            <label class="k" for="an-ghicit">Derulează la anul pe care îl crezi</label>
            <input id="an-ghicit" v-model.number="ghicit" type="range" :min="AN_MIN" :max="AN_MAX" :disabled="dezvaluit">
            <div class="scala"><span>{{ AN_MIN }}</span><span>{{ AN_MAX }}</span></div>
            <button v-if="!dezvaluit" class="btn" @click="confirma">Ăsta e anul</button>
            <template v-else>
              <div class="flap" aria-hidden="true">
                <span v-for="(c, i) in flap" :key="`${i}${flapGata[i] ? 's' : 'r'}`" class="foaie" :class="{ gata: flapGata[i] }">{{ c }}</span>
              </div>
              <div class="metru" aria-hidden="true">
                <div class="sina">
                  <span class="bara" :style="bara" />
                  <span class="semn tu" :style="{ left: `${pozGhicit}%` }" />
                  <span class="semn real" :style="{ left: `${pozReal}%` }" />
                </div>
                <div class="k">{{ diferenta === 0 ? 'Fix pe bandă' : `${diferenta} ${diferenta === 1 ? 'an' : 'ani'} distanță` }}</div>
              </div>
              <p class="rez" role="status"><b>{{ mesaj }}</b> +{{ puncte }} puncte</p>
              <button class="btn semnal" @click="urmatoarea">{{ runda + 1 >= lista.length ? 'Vezi scorul' : 'Următoarea ▶▶' }}</button>
            </template>
          </div>
        </div>
      </Transition>
    </section>
  </main>
</template>

<style scoped>
.joc{display:grid;gap:20px;overflow-x:clip}
.tabla{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:32px;align-items:center;justify-items:center}
@media (max-width:720px){.tabla{grid-template-columns:1fr}}
.ghiceste{display:grid;gap:10px;width:min(360px,100%);min-width:0}
.tic{font-variant-numeric:tabular-nums}

/* odometer */
.mare{display:flex;justify-content:center;font-family:var(--display);font-weight:800;font-size:clamp(64px,22vw,88px);line-height:1}
.odo{display:inline-flex;gap:4px;padding:6px 8px;background:var(--ink);color:var(--paper);border-radius:4px;box-shadow:inset 0 0 0 1px var(--ink)}
.coloana{display:block;height:1em;width:.62em;overflow:hidden;text-align:center;background:linear-gradient(to bottom,transparent 49%,var(--muted) 49%,var(--muted) 51%,transparent 51%)}
.banda{display:flex;flex-direction:column;transition:transform .45s var(--ease-ff);will-change:transform}
.banda span{display:block;height:1em;line-height:1}
input[type=range]{width:100%;min-height:44px;margin:0;accent-color:var(--signal);cursor:grab}
input[type=range]:active{cursor:grabbing}
input[type=range]:hover:not(:disabled){filter:brightness(1.1)}
input[type=range]:focus-visible{outline:3px solid var(--signal);outline-offset:4px;border-radius:4px}
.scala{display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;color:var(--muted)}

/* split-flap */
.flap{display:flex;justify-content:center;gap:6px;perspective:400px}
.foaie{position:relative;display:grid;place-items:center;width:clamp(40px,12vw,52px);height:68px;background:var(--ink);color:var(--paper);font:800 52px/1 var(--display);border-radius:3px;font-variant-numeric:tabular-nums}
.foaie::after{content:"";position:absolute;left:0;right:0;top:50%;height:2px;background:var(--paper);opacity:.35}
.foaie.gata{animation:flip .38s var(--ease-ff) both}
@keyframes flip{from{transform:rotateX(-90deg);opacity:.2}to{transform:rotateX(0);opacity:1}}

/* distance meter */
.metru{display:grid;gap:6px}
.sina{position:relative;height:44px}
.sina::before{content:"";position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;background:var(--line)}
.bara{position:absolute;top:50%;height:6px;margin-top:-3px;background:var(--signal);transform:scaleX(0);animation:trage .7s .5s var(--ease-ff) forwards}
.semn{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%}
.semn.tu{background:var(--muted)}
.semn.real{background:var(--signal);outline:3px solid var(--ink);opacity:0;transform:scale(.2);animation:pop .4s 1.1s var(--ease-ff) forwards}
@keyframes trage{to{transform:scaleX(1)}}
@keyframes pop{to{opacity:1;transform:scale(1)}}

.rez{margin:0;font-size:18px;text-align:center}
.rez b{font-family:var(--display);font-size:30px;text-transform:uppercase;margin-right:6px}

/* buttons */
.btn{min-height:44px;transition:transform .15s var(--ease-ff),opacity .15s}
.btn:hover{transform:translateY(-2px)}
.btn:active{transform:translateY(1px) scale(.98)}
.btn:focus-visible{outline:3px solid var(--signal);outline-offset:3px}

/* end screen */
.final{position:relative;display:grid;gap:12px;justify-items:start;overflow:hidden}
.din{font-size:.4em;color:var(--muted)}
.stampila{display:grid;justify-items:center;gap:2px;padding:10px 18px;border:4px double var(--signal);border-radius:6px;color:var(--signal);font-family:var(--display);font-weight:800;text-transform:uppercase;letter-spacing:.06em;transform:rotate(-6deg);opacity:0;animation:stampila .5s 1.2s var(--ease-ff) forwards}
.stampila span{font-size:18px}
.stampila b{font-size:32px;line-height:1}
@keyframes stampila{from{opacity:0;transform:rotate(-14deg) scale(2.2)}60%{opacity:1;transform:rotate(-6deg) scale(.94)}to{opacity:1;transform:rotate(-6deg) scale(1)}}

/* round transition: cassette slide */
.kaseta-enter-active,.kaseta-leave-active{transition:transform .4s var(--ease-ff),opacity .3s}
.kaseta-enter-from{transform:translateX(60px);opacity:0}
.kaseta-leave-to{transform:translateX(-60px);opacity:0}

@media (prefers-reduced-motion:reduce){
  .banda,.btn,.kaseta-enter-active,.kaseta-leave-active{transition:none}
  .foaie.gata{animation:none}
  .bara{animation:none;transform:scaleX(1)}
  .semn.real{animation:none;opacity:1;transform:none}
  .stampila{animation:none;opacity:1}
  .kaseta-enter-from,.kaseta-leave-to{transform:none}
  .btn:hover,.btn:active{transform:none}
}
</style>
