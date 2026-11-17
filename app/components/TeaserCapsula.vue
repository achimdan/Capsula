<script setup lang="ts">
const { deschide } = useIntrare()

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
    <CeataFise />
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
.text{position:relative;display:grid;gap:20px;justify-items:start;max-width:760px;width:100%}
.contor .rec{color:var(--signal);animation:clipește 1.2s steps(2,jump-none) infinite}
.btn{min-height:44px;text-decoration:none;transition:transform .15s var(--ease-ff)}
.btn:hover{transform:translateY(-2px)}
.btn:active{transform:translateY(1px)}
@keyframes clipește{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.contor .rec{animation:none}}
</style>
