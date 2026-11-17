<script setup lang="ts">
import { FISE } from '~/data/fise'

// Fișe în ceață: doar culorile fișelor și anii mascați, fără titluri. Folosit ca fundal de pagină ales din /admin (`fundal`: mai șters, cu voal peste tot, ca textul să se citească).
defineProps<{ fundal?: boolean; mini?: boolean }>()

const coloane = [0, 1, 2].map((c) => {
  const lista = FISE.filter((_, i) => i % 3 === c).slice(0, 8)
  return [...lista, ...lista].map((f, i) => ({
    k: `${c}-${i}`,
    culori: f.culori,
    an: `${String(f.an).slice(0, 2)}··`
  }))
})
</script>

<template>
  <div class="ceata-fise" :class="{ fundal, mini }" aria-hidden="true">
    <div class="ceata">
      <div v-for="(col, c) in coloane" :key="c" class="col" :class="`c${c}`">
        <div class="banda">
          <div v-for="t in col" :key="t.k" class="placa" :style="{ background: `linear-gradient(150deg, ${t.culori[0]}, ${t.culori[1]})` }">
            <span>{{ t.an }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="voal" />
  </div>
</template>

<style scoped>
.ceata-fise{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.ceata{position:absolute;inset:-40px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;filter:blur(7px);opacity:.75}
.col{overflow:hidden;min-width:0}
.banda{display:grid;gap:16px;animation:plutește 60s linear infinite;will-change:transform}
.c1 .banda{animation-duration:80s;animation-direction:reverse}
.c2 .banda{animation-duration:70s}
.placa{aspect-ratio:4/5;border:6px solid var(--card);border-bottom-width:28px;border-radius:2px;display:grid;place-items:center}
.placa span{font-family:var(--display);font-weight:800;font-size:clamp(32px,8vw,64px);color:var(--card);mix-blend-mode:overlay}
.voal{position:absolute;inset:0;background:radial-gradient(ellipse at center,var(--paper) 20%,transparent 85%);opacity:.9}

/* Ca fundal al paginii: mai șters și cu voal uniform, ca fișele și textul de deasupra să rămână lizibile. */
.fundal .ceata{filter:blur(10px);opacity:.45}
.fundal .voal{background:radial-gradient(ellipse at center,var(--paper) 30%,transparent 110%);opacity:.75}

/* Previzualizarea din /admin */
.mini .ceata{inset:-12px;gap:6px;filter:blur(3px);opacity:.75}
.mini .voal{opacity:.35}
.mini .banda{gap:6px}
.mini .placa{border-width:3px;border-bottom-width:10px}
.mini .placa span{font-size:16px}

@keyframes plutește{to{transform:translateY(-50%)}}
@media (prefers-reduced-motion:reduce){.banda{animation:none}}
</style>
