<script setup lang="ts">
import type { ProfilCititor } from '~/data/profiluri'

const props = defineProps<{ profil: ProfilCititor }>()
defineEmits<{ refa: [] }>()

// Citirea se „bate la mașină” după ce polaroidul s-a developat; sub reduced-motion apare întreagă.
const scris = ref(props.profil.citire)
const developat = ref(true)
let timer: ReturnType<typeof setInterval> | undefined
function porneste() {
  clearInterval(timer)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { scris.value = props.profil.citire; developat.value = true; return }
  developat.value = false
  scris.value = ''
  requestAnimationFrame(() => requestAnimationFrame(() => { developat.value = true }))
  const text = props.profil.citire
  let i = 0
  setTimeout(() => {
    timer = setInterval(() => {
      i += 2
      scris.value = text.slice(0, i)
      if (i >= text.length) clearInterval(timer)
    }, 28)
  }, 1500)
}
onMounted(porneste)
watch(() => props.profil.id, porneste)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <section class="rev" :class="{ dev: developat }" aria-labelledby="rev-nume">
    <span class="k etapa">Capsula te-a citit</span>
    <figure class="pol" aria-hidden="true">
      <div class="poza"><span class="cif">{{ profil.nume.charAt(0) }}</span></div>
      <figcaption class="leg">{{ profil.arhetip }} · {{ profil.scena }}</figcaption>
    </figure>
    <h1 id="rev-nume" class="d1 nume">{{ profil.nume }}</h1>
    <p class="citire" aria-live="polite"><span class="sr">{{ profil.citire }}</span><span aria-hidden="true">{{ scris }}<span v-if="scris.length < profil.citire.length" class="cursor" /></span></p>
    <p class="intro">{{ profil.config.intro }}</p>
    <div class="rand">
      <NuxtLink to="/" class="btn semnal cta">Intră în capsula ta</NuxtLink>
      <button type="button" class="refa" @click="$emit('refa')">Refă testul</button>
    </div>
    <p class="intro">Dacă refaci testul, răspunsurile de acum se șterg. Profilul ăsta rămâne până termini testul nou; poți anula oricând.</p>
  </section>
</template>

<style scoped>
.rev{display:grid;gap:18px;max-width:640px;justify-items:start}
.rev>*{animation:rev-in .8s var(--ease-ff) both}
.pol{animation-delay:.05s}.nume{animation-delay:.9s}.citire{animation-delay:1.3s}.intro{animation-delay:2.2s}.rand{animation-delay:2.5s}
.etapa{animation-delay:0s}
.pol{margin:0;width:min(240px,70vw);background:#fff;padding:12px 12px 40px;box-shadow:0 14px 30px rgba(0,0,0,.28);transform:rotate(-3deg)}
.poza{aspect-ratio:1;background:var(--ink);display:grid;place-items:center;overflow:hidden;position:relative}
.poza::after{content:"";position:absolute;inset:0;background:var(--accent);mix-blend-mode:screen;opacity:1;transition:opacity 1.6s var(--ease-ff) .2s}
.dev .poza::after{opacity:0}
.cif{font:800 clamp(96px,24vw,140px)/1 var(--display);color:var(--paper);opacity:0;transform:scale(.8);transition:opacity 1.4s var(--ease-ff) .4s,transform 1.4s var(--ease-ff) .4s}
.dev .cif{opacity:1;transform:none}
.leg{position:absolute;margin-top:10px;font:500 12px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:#14211B}
.pol{position:relative}
.pol .leg{position:absolute;left:12px;bottom:12px;margin:0}
.nume{color:var(--accent);font-size:clamp(44px,11vw,96px)}
.citire{margin:0;font-size:20px;line-height:1.5;min-height:6em;max-width:46ch}
.cursor{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-.15em;background:var(--ink);animation:clip .7s steps(2) infinite}
.intro{margin:0;font-family:var(--mono);font-size:14px;color:var(--muted)}
.cta{min-height:44px;transition:transform .2s var(--ease-ff),background-color .2s}
.cta:hover{transform:translateY(-2px)}
.cta:active{transform:translateY(1px) scale(.98)}
.refa{min-height:44px;padding:0 8px;background:none;border:0;font:inherit;color:var(--muted);text-decoration:underline;cursor:pointer;transition:color .2s}
.refa:hover{color:var(--ink)}
.refa:active{opacity:.7}
@keyframes rev-in{from{opacity:0;transform:translateY(24px)}}
@keyframes clip{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.rev>*{animation:none}.poza::after,.cif{transition:none}.cursor{animation:none}.cta:hover,.cta:active{transform:none}.citire{min-height:0}}
</style>
