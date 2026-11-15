<script setup lang="ts">
import { ORASE } from '~/data/fise'
const { profil } = useCapsula()
const an = ref<number | null>(null)
const oras = ref('')
const eroare = ref('')
const rebobineaza = ref(false)
const cifra = ref('0000')
let timer = 0
onBeforeUnmount(() => cancelAnimationFrame(timer))
// Tranziție "rewind": contorul derulează înapoi de la anul curent până la anul de 15 ani, apoi pornește capsula
function porneste(anTinta: number, final: () => void) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { final(); return }
  const start = new Date().getFullYear(); const dur = 1300; const t0 = performance.now()
  rebobineaza.value = true
  const pas = (t: number) => {
    const p = Math.min(1, (t - t0) / dur)
    const e = 1 - Math.pow(1 - p, 3)
    cifra.value = String(Math.round(start - (start - anTinta) * e))
    if (p < 1) timer = requestAnimationFrame(pas)
    else setTimeout(final, 200)
  }
  timer = requestAnimationFrame(pas)
}
function gata() {
  if (!an.value || an.value < 1975 || an.value > 1996) { eroare.value = 'Scrie un an între 1975 și 1996. Capsula acoperă anii 1990–2008.'; return }
  if (!oras.value) { eroare.value = 'Alege orașul în care ai crescut.'; return }
  if (rebobineaza.value) return
  eroare.value = ''
  const anNastere = an.value; const orasAles = oras.value
  porneste(anNastere + 15, () => { profil.value = { anNastere, oras: orasAles } })
}
</script>

<template>
  <section class="onb">
    <span class="contor">0 0 0 0</span>
    <h1 class="d1">Derulează până la tine</h1>
    <p class="lead">Două întrebări și îți construim capsula: ce ascultai, ce purtai și ce era la TV când aveai 15 ani.</p>
    <form class="card form" @submit.prevent="gata">
      <div><label class="k" for="an">Anul nașterii</label><input id="an" v-model.number="an" type="number" inputmode="numeric" placeholder="ex. 1984" min="1975" max="1996"></div>
      <div><label class="k" for="oras">Orașul în care ai crescut</label>
        <select id="oras" v-model="oras"><option value="" disabled>Alege</option><option v-for="o in ORASE" :key="o">{{ o }}</option></select></div>
      <p v-if="eroare" class="err" role="alert">{{ eroare }}</p>
      <button class="btn pornire" type="submit" :disabled="rebobineaza">▶ Pornește capsula</button>
      <p class="k">Datele rămân doar în browserul tău.</p>
    </form>
    <div v-if="rebobineaza" class="rw" role="status" aria-live="polite">
      <div class="rw-benzi" aria-hidden="true" />
      <div class="rw-txt"><span class="k">◀◀ Se derulează banda…</span><span class="rw-an">{{ cifra }}</span></div>
    </div>
  </section>
</template>

<style scoped>
.onb{display:grid;gap:20px;max-width:640px}
.form{display:grid;gap:16px}
.onb>.contor,.onb>.d1,.onb>.lead,.onb>.form{animation:intra .8s var(--ease-ff) both}
.onb>.d1{animation-delay:.08s}.onb>.lead{animation-delay:.16s}.onb>.form{animation-delay:.24s}
@keyframes intra{from{opacity:0;transform:translateY(24px)}}
.form :is(input,select){min-height:44px}
.pornire{min-height:44px;justify-content:center;transition:transform .2s var(--ease-ff),background-color .2s}
.pornire:not(:disabled):hover{transform:translateY(-2px);background:var(--signal);color:var(--ink)}
.pornire:not(:disabled):active{transform:translateY(1px) scale(.98)}
.rw{position:fixed;inset:0;z-index:50;background:var(--ink);color:var(--paper);display:grid;place-items:center;overflow:hidden;animation:rw-in .25s both}
.rw-benzi{position:absolute;inset:-100% 0;background:repeating-linear-gradient(0deg,transparent 0 14px,rgba(220,227,218,.09) 14px 16px);animation:rw-benzi .5s linear infinite;will-change:transform}
.rw-txt{position:relative;display:grid;gap:8px;justify-items:center;animation:rw-glitch .18s steps(2) infinite}
.rw-txt .k{color:var(--signal)}
.rw-an{font-family:var(--display);font-weight:800;font-size:clamp(96px,28vw,260px);line-height:.85;font-variant-numeric:tabular-nums}
@keyframes rw-in{from{opacity:0}}
@keyframes rw-benzi{to{transform:translateY(32px)}}
@keyframes rw-glitch{50%{transform:translateX(2px)}}
@media (prefers-reduced-motion:reduce){.onb>*,.rw,.rw-benzi,.rw-txt{animation:none}.pornire:hover,.pornire:active{transform:none}}
.err{color:var(--signal);margin:0;font-weight:500}
</style>
