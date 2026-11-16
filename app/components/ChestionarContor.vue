<script setup lang="ts">
// Progres ca numărător de bandă: „03 / 25”, cu bară de bandă dedesubt (transform pe scaleX).
const props = defineProps<{ curenta: number, total: number }>()
const cifre = computed(() => String(props.curenta).padStart(2, '0'))
const fractie = computed(() => (props.total ? props.curenta / props.total : 0))
</script>

<template>
  <div class="cnt" role="progressbar" aria-label="Progres chestionar" :aria-valuemin="0" :aria-valuemax="total" :aria-valuenow="curenta">
    <span class="contor"><span :key="cifre" class="c">{{ cifre }}</span>&nbsp;/&nbsp;{{ String(total).padStart(2, '0') }}</span>
    <span class="bara" aria-hidden="true"><span class="plin" :style="{ transform: `scaleX(${fractie})` }" /></span>
  </div>
</template>

<style scoped>
.cnt{display:flex;align-items:center;gap:12px}
.bara{flex:1;height:6px;background:var(--line);border-radius:3px;overflow:hidden}
.plin{display:block;height:100%;background:var(--accent);transform-origin:left;transition:transform .5s var(--ease-ff)}
.c{display:inline-block;animation:tic .35s var(--ease-ff)}
@keyframes tic{from{opacity:0;transform:translateY(-60%)}}
@media (prefers-reduced-motion:reduce){.plin{transition:none}.c{animation:none}}
</style>
