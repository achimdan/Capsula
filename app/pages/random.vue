<script setup lang="ts">
import type { Fisa } from '~/data/fise'
const { areProfil, an15, randomHit } = useCapsula()
const { incarca } = useFise()
const banda = ref<{ deruleaza: (an: number, titlu?: string) => Promise<void> }>()
const fisa = ref<Fisa | null>(null)
const ocupat = ref(false)
const cheie = ref(0)
const cadre = ref(0)
let tic: ReturnType<typeof setInterval> | undefined
const timecod = computed(() => {
  const c = cadre.value
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(c / 600) % 100)}:${p(Math.floor(c / 25) % 24 % 60)}:${p(c % 25)}`
})
function pornesteContor() { cadre.value = 0; clearInterval(tic); tic = setInterval(() => { cadre.value += 7 }, 40) }
function opresteContor() { clearInterval(tic); tic = undefined }
onBeforeUnmount(opresteContor)
async function hit() {
  if (ocupat.value) return
  ocupat.value = true
  pornesteContor()
  await incarca()
  const urm = randomHit(fisa.value?.id)
  if (!urm) { opresteContor(); ocupat.value = false; return }
  try { await banda.value?.deruleaza(urm.an, urm.titlu) } finally { opresteContor() }
  fisa.value = urm; cheie.value++
  ocupat.value = false
}
</script>

<template>
  <main class="pagina">
    <section class="rh">
      <div class="k">Random Hit{{ areProfil ? ' · ponderat pe anii tăi de 10–20' : '' }}</div>
      <h1 class="d1">Ce tare o fost</h1>
      <div class="deck" :class="{ ff: ocupat }">
        <BandaAni ref="banda" :anul-meu="areProfil ? an15 : undefined" />
        <div class="vhs" aria-hidden="true"><i class="linii" /><i class="track" /></div>
        <div class="osd" aria-hidden="true"><b>▶▶ FF</b><span>{{ timecod }}</span></div>
        <i v-if="cheie" :key="cheie" class="flash" aria-hidden="true" />
      </div>
      <div class="rand"><button class="btn hit" :class="{ gata: !ocupat }" :disabled="ocupat" @click="hit"><span class="halou" aria-hidden="true" />▶▶ {{ fisa ? 'Altul' : 'Random Hit' }}</button>
        <span class="k" aria-live="polite">{{ ocupat ? 'Se derulează…' : fisa ? fisa.an + ' · ' + fisa.titlu : 'Apasă și vezi unde se oprește banda' }}</span></div>
      <p v-if="!areProfil" class="lead invita">Anii tăi de 10–20 fac jocul mai personal. <NuxtLink to="/start">Fă testul</NuxtLink></p>
      <div class="scena"><div v-if="fisa" :key="cheie" class="aterizare"><FisaPolaroid :fisa="fisa" developare /><i class="umbra" aria-hidden="true" /></div></div>
      <div v-if="fisa" class="rand urm"><button class="btn ghost" :disabled="ocupat" @click="hit">▶▶ Încă unul</button></div>
    </section>
  </main>
</template>

<style scoped>
.rh{display:grid;gap:20px}
.scena{display:grid;place-items:center;min-height:200px;perspective:900px}
.urm{justify-content:center}
.urm .btn{min-height:44px}

/* Deck VHS */
.deck{position:relative;overflow:hidden;border-radius:4px;isolation:isolate}
.vhs{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .2s var(--ease-ff);z-index:2}
.ff .vhs{opacity:1}
.linii{position:absolute;left:0;right:0;top:-8px;height:calc(100% + 16px);opacity:.28;
  background:repeating-linear-gradient(to bottom,var(--ink) 0 1px,transparent 1px 4px);animation:linii .18s linear infinite}
.track{position:absolute;left:-4%;right:-4%;top:0;height:22%;opacity:.5;
  background:linear-gradient(to bottom,transparent,var(--card) 45%,var(--signal) 50%,var(--card) 55%,transparent);
  mix-blend-mode:overlay;animation:track 1.3s var(--ease-ff) infinite}
.ff :deep(.banda){animation:jit .12s steps(2) infinite}
.osd{position:absolute;top:8px;right:8px;z-index:3;display:flex;gap:10px;align-items:center;font-family:var(--mono);font-size:12px;letter-spacing:.12em;
  background:var(--ink);color:var(--paper);padding:4px 8px;border-radius:2px;opacity:0;transform:translateY(-6px);
  transition:opacity .2s var(--ease-ff),transform .3s var(--ease-ff);pointer-events:none}
.osd b{color:var(--signal);font-weight:500}
.osd span{font-variant-numeric:tabular-nums;min-width:8ch;text-align:right}
.ff .osd{opacity:1;transform:none}
.ff .osd b{animation:blink .6s steps(2) infinite}
.flash{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;background:var(--signal);mix-blend-mode:screen;animation:flash .55s var(--ease-ff)}
.flash::before,.flash::after{content:"";position:absolute;inset:0;background:var(--paper);opacity:.5}
.flash::before{transform:translateX(-6px);mix-blend-mode:difference}
.flash::after{transform:translateX(6px);mix-blend-mode:difference}

/* Buton */
.hit{position:relative;min-height:44px;min-width:44px;transition:transform .2s var(--ease-ff),background-color .2s}
.hit .halou{position:absolute;inset:0;border-radius:2px;box-shadow:0 0 0 2px var(--signal);opacity:0;pointer-events:none}
.hit.gata .halou{animation:puls 1.8s var(--ease-ff) infinite}
.hit:hover:not(:disabled){transform:translateY(-2px);background:var(--signal);color:var(--ink)}
.hit:active:not(:disabled){transform:translateY(1px) scale(.97)}
.hit:disabled{cursor:progress}

/* Aterizare carte */
.aterizare{position:relative;display:grid;place-items:center;transform-origin:50% 100%;animation:drop .9s var(--ease-ff) both}
.aterizare>:first-child{position:relative;z-index:1}
.umbra{position:absolute;left:8%;right:8%;bottom:-10px;height:18px;border-radius:50%;background:var(--ink);opacity:.22;filter:blur(8px);
  transform-origin:center;animation:umbra .9s var(--ease-ff) both}

@keyframes linii{to{transform:translateY(8px)}}
@keyframes track{0%{transform:translateY(-120%)}100%{transform:translateY(520%)}}
@keyframes jit{0%{transform:translateX(-1.5px)}100%{transform:translateX(1.5px)}}
@keyframes blink{50%{opacity:.2}}
@keyframes flash{0%{opacity:.7}100%{opacity:0}}
@keyframes puls{0%{opacity:.8;transform:scale(1)}70%,100%{opacity:0;transform:scale(1.14,1.35)}}
@keyframes drop{
  0%{opacity:0;transform:translateY(-70px) rotate(-5deg) scale(1.08)}
  55%{opacity:1;transform:translateY(0) rotate(1.2deg) scale(.985)}
  75%{transform:translateY(-8px) rotate(-.6deg) scale(1)}
  100%{transform:none}}
@keyframes umbra{
  0%{opacity:0;transform:scale(.5)}
  55%{opacity:.34;transform:scale(1.05,1.2)}
  75%{opacity:.18;transform:scale(.85)}
  100%{opacity:.22;transform:none}}

@media (max-width:480px){.osd{font-size:11px;top:6px;right:6px}.rand{align-items:flex-start}}
@media (prefers-reduced-motion:reduce){
  .vhs,.flash{display:none}
  .osd{transition:none;transform:none}
  .aterizare,.umbra{animation:none!important}
}
</style>
