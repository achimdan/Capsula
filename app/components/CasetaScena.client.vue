<script setup lang="ts">
import { CASETE_RO } from '~/data/caseteRo'
// Caseta 3D din fundal (Three.js). Fără WebGL, rămâne caseta desenată (CasetaStatica).
const props = defineProps<{ anMin: number, anMax: number }>()
const canvas = ref<HTMLCanvasElement | null>(null)
// Pe etichetă: muzica românească din data/caseteRo.ts. Indexul din listă (k) dă fiecărei înregistrări eticheta ei.
const casete = (an: number) => CASETE_RO.map((inr, k) => ({ inr, k })).filter(x => x.inr.an === an)
const { failed } = useThreeScene(canvas, async (ctx) => {
  const { construiesteCaseta } = await import('~/three/caseta')
  return construiesteCaseta(ctx, { anMin: props.anMin, anMax: props.anMax, casete })
}, { alpha: true, fov: 30, far: 100 })
</script>

<template>
  <CasetaStatica v-if="failed" :an-min="anMin" :an-max="anMax" />
  <canvas v-else ref="canvas" class="caseta-3d" />
</template>

<style scoped>
.caseta-3d{position:absolute;inset:0;width:100%;height:100%;display:block}
</style>
