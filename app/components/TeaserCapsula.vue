<script setup lang="ts">
import { FISE } from '~/data/fise'

const { deschide } = useIntrare()

// Plăci ceață: doar culorile fișelor și anii mascați, fără titluri.
const coloane = [0, 1, 2].map((c) => {
  const lista = FISE.filter((_, i) => i % 3 === c).slice(0, 8)
  return [...lista, ...lista].map((f, i) => ({
    k: `${c}-${i}`,
    culori: f.culori,
    an: `${String(f.an).slice(0, 2)}··`
  }))
})

const secunde = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => { secunde.value++ }, 1000) })
onBeforeUnmount(() => clearInterval(timer))
const ceas = computed(() => {
  const s = secunde.value
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`
})
</script>

<template>
  <main class="teaser">
    <div class="ceata" aria-hidden="true">
      <div v-for="(col, c) in coloane" :key="c" class="col" :class="`c${c}`">
        <div class="banda">
          <div v-for="t in col" :key="t.k" class="placa" :style="{ background: `linear-gradient(150deg, ${t.culori[0]}, ${t.culori[1]})` }">
            <span>{{ t.an }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="voal" aria-hidden="true" />
    <div class="text">
      <span class="contor"><span class="rec">●</span>&nbsp;REC {{ ceas }}</span>
      <h1 class="d1">Ceva din '9x te așteaptă.</h1>
      <p class="lead">O casetă veche, pusă deoparte pentru tine. Nu-ți spunem ce e pe ea, încă.</p>
      <button type="button" class="btn semnal" aria-haspopup="dialog" @click="deschide">Intră și te citim</button>
    </div>
  </main>
</template>

<style scoped>
.teaser{position:relative;min-height:calc(100svh - 70px);overflow:hidden;display:grid;place-items:center;padding:32px 16px}
.ceata{position:absolute;inset:-40px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;filter:blur(7px);opacity:.75}
.col{overflow:hidden;min-width:0}
.banda{display:grid;gap:16px;animation:plutește 60s linear infinite;will-change:transform}
.c1 .banda{animation-duration:80s;animation-direction:reverse}
.c2 .banda{animation-duration:70s}
.placa{aspect-ratio:4/5;border:6px solid var(--card);border-bottom-width:28px;border-radius:2px;display:grid;place-items:center}
.placa span{font-family:var(--display);font-weight:800;font-size:clamp(32px,8vw,64px);color:var(--card);mix-blend-mode:overlay}
.voal{position:absolute;inset:0;background:radial-gradient(ellipse at center,var(--paper) 20%,transparent 85%);opacity:.9}
.text{position:relative;display:grid;gap:20px;justify-items:start;max-width:760px;width:100%}
.contor .rec{color:var(--signal);animation:clipește 1.2s steps(2,jump-none) infinite}
.btn{min-height:44px;text-decoration:none;transition:transform .15s var(--ease-ff)}
.btn:hover{transform:translateY(-2px)}
.btn:active{transform:translateY(1px)}
@keyframes plutește{to{transform:translateY(-50%)}}
@keyframes clipește{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.banda,.contor .rec{animation:none}}
</style>
