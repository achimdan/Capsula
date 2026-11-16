<script setup lang="ts">
defineProps<{ nr: number, total: number, titlu: string, subtitlu: string, replica: string }>()
</script>

<template>
  <div class="cap" role="group" :aria-label="`Capitolul ${nr}: ${titlu}`">
    <span class="k">Capitolul {{ nr }} din {{ total }}</span>
    <h2 class="d1">{{ titlu }}</h2>
    <p class="sub">{{ subtitlu }}</p>
    <p class="replica k">{{ replica }}</p>
  </div>
</template>

<style scoped>
.cap{display:grid;gap:14px;align-content:center;min-height:min(46vh,360px)}
.cap>*{animation:cap-in .7s var(--ease-ff) both}
.cap>.d1{animation-delay:.08s;color:var(--accent);font-size:clamp(44px,10vw,96px)}
.cap>.sub{animation-delay:.18s}.cap>.replica{animation-delay:.3s}
.sub{margin:0;font-size:20px;max-width:34ch}
.replica{margin:0;text-transform:none;letter-spacing:.02em;font-size:13px;max-width:46ch}
@keyframes cap-in{from{opacity:0;transform:translateY(22px)}}
@media (prefers-reduced-motion:reduce){.cap>*{animation:none}}
</style>
