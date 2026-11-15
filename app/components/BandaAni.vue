<script setup lang="ts">
import { AN_MIN, AN_MAX, FISE } from '~/data/fise'
const props = withDefaults(defineProps<{ anulMeu?: number; latime?: number; inaltime?: number }>(), { latime: 140, inaltime: 120 })
const ani = Array.from({ length: AN_MAX - AN_MIN + 1 }, (_, i) => AN_MIN + i)
const REP = 3
const banda = ref<HTMLElement>()
const tambur = ref<HTMLElement>()
const x = ref(0)
const anim = ref(false)
const ff = ref(false)
const lovit = ref<number | null>(null)
const titlu = (an: number) => FISE.find(f => f.an === an && f.oras === null)?.titlu ?? ''

function centru(idx: number) { return (banda.value?.clientWidth ?? 0) / 2 - (idx * props.latime + props.latime / 2) }
function seteaza(an: number) { anim.value = false; x.value = centru(ani.indexOf(an)) }

// Derulează rapid (cu blur) până la anul dat; se rezolvă când banda s-a oprit
function deruleaza(an: number): Promise<void> {
  const redus = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  lovit.value = null
  const tinta = ani.length * (REP - 1) + ani.indexOf(an)
  if (redus) { anim.value = false; x.value = centru(tinta); lovit.value = tinta; return Promise.resolve() }
  anim.value = false
  x.value = centru(ani.indexOf(an))
  return new Promise(res => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      anim.value = true; ff.value = true; x.value = centru(tinta)
      setTimeout(() => { ff.value = false; lovit.value = tinta; res() }, 1300)
    }))
  })
}
defineExpose({ deruleaza, seteaza })
onMounted(() => { seteaza(props.anulMeu ?? 1999); window.addEventListener('resize', onResize) })
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
function onResize() { seteaza(props.anulMeu ?? 1999) }
</script>

<template>
  <div ref="banda" class="banda" :class="{ ff }" :style="{ height: inaltime + 'px' }" role="img" :aria-label="`Banda anilor ${AN_MIN}–${AN_MAX}`">
    <div class="cap" aria-hidden="true" />
    <div ref="tambur" class="tambur" :class="{ anim }" :style="{ transform: `translateX(${x}px)` }">
      <template v-for="r in REP" :key="r">
        <div v-for="(an, i) in ani" :key="r + '-' + an" class="an"
          :class="{ eu: an === anulMeu, lovit: lovit === (r - 1) * ani.length + i }" :style="{ flexBasis: latime + 'px' }">
          <span class="y">{{ an }}</span><span class="t">{{ titlu(an) }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.banda{position:relative;overflow:hidden;background:#14211B;color:#DCE3DA;border-radius:2px}
.tambur{display:flex;position:absolute;inset:0 auto 0 0;will-change:transform}
.tambur.anim{transition:transform 1.6s var(--ease-ff)}
.ff .tambur{filter:blur(3px)}
.an{flex:0 0 auto;border-right:1px dashed rgba(220,227,218,.28);padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between;min-width:0}
.y{font-family:var(--display);font-weight:800;font-size:clamp(30px,4vw,44px);line-height:1}
.t{font-size:12px;line-height:1.3;color:#B9C6B6;overflow:hidden}
.eu .y::after{content:" ●";font-size:14px;color:#E2582F;vertical-align:top}
.lovit{background:#E2582F;color:#14211B}
.lovit .t{color:#14211B}
.lovit.eu .y::after{color:#14211B}
.cap{position:absolute;top:0;bottom:0;left:50%;width:2px;background:#E2582F;z-index:3}
</style>
