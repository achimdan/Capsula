<script setup lang="ts">
import { AN_MIN, AN_MAX } from '~/data/fise'
const props = withDefaults(defineProps<{ anulMeu?: number; latime?: number; inaltime?: number; interactiva?: boolean }>(), { anulMeu: undefined, latime: 140, inaltime: 120, interactiva: false })
const ani = Array.from({ length: AN_MAX - AN_MIN + 1 }, (_, i) => AN_MIN + i)
const REP = 3
const banda = ref<HTMLElement>()
const tambur = ref<HTMLElement>()
const x = ref(0)
const anim = ref(false)
const ff = ref(false)
const lovit = ref<number | null>(null)
const snap = ref(false)
const trage = ref(false)
const activ = ref<number | null>(null)
const { toate: fise } = useFise()
const titlu = (an: number) => fise.value.find(f => f.an === an && f.oras === null)?.titlu ?? ''
// Titlul fișei pe care se oprește banda (Random Hit): celula lovită arată fișa aleasă, nu prima din anul ei.
const titluLovit = ref('')

function centru(idx: number) { return (banda.value?.clientWidth ?? 0) / 2 - (idx * props.latime + props.latime / 2) }
function seteaza(an: number) { anim.value = false; snap.value = false; x.value = centru(ani.indexOf(an)) }

// Derulează rapid (cu blur) până la anul dat; se rezolvă când banda s-a oprit
function deruleaza(an: number, titluFisa = ''): Promise<void> {
  const redus = miscareRedusa()
  lovit.value = null
  titluLovit.value = titluFisa
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

// --- Drag cu inerție + cap magnetic (doar cu prop-ul `interactiva`) ---
const redus = () => miscareRedusa()
const perioada = () => ani.length * props.latime
const idxSub = () => Math.floor(((banda.value?.clientWidth ?? 0) / 2 - x.value) / props.latime)
function normalizeaza() {
  const p = perioada()
  let i = idxSub()
  while (i < ani.length) { x.value -= p; i += ani.length }
  while (i >= ani.length * 2) { x.value += p; i -= ani.length }
  activ.value = idxSub()
}
let ultimX = 0; let ultimT = 0; let v = 0; let raf = 0
function opresteInertia() { cancelAnimationFrame(raf); raf = 0 }
function lipeste() {
  const i = Math.min(ani.length * 3 - 1, Math.max(0, idxSub()))
  trage.value = false
  anim.value = false
  snap.value = !redus()
  x.value = centru(0) - i * props.latime
  activ.value = i
}
function jos(e: PointerEvent) {
  if (!props.interactiva || (e.pointerType === 'mouse' && e.button !== 0)) return
  opresteInertia(); anim.value = false; snap.value = false; lovit.value = null
  trage.value = true; v = 0; ultimX = e.clientX; ultimT = performance.now()
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  activ.value = idxSub()
}
function misca(e: PointerEvent) {
  if (!trage.value) return
  const t = performance.now(); const dt = Math.max(1, t - ultimT)
  const dx = e.clientX - ultimX
  v = v * 0.6 + (dx / dt) * 0.4
  x.value += dx; ultimX = e.clientX; ultimT = t
  normalizeaza()
}
function sus() {
  if (!trage.value) return
  if (redus() || Math.abs(v) < 0.05) { lipeste(); return }
  let t0 = performance.now()
  const pas = (t: number) => {
    const dt = Math.min(32, t - t0); t0 = t
    x.value += v * dt; v *= Math.pow(0.95, dt / 16)
    normalizeaza()
    if (Math.abs(v) < 0.04) { raf = 0; lipeste(); return }
    raf = requestAnimationFrame(pas)
  }
  raf = requestAnimationFrame(pas)
  trage.value = false
}
function tasta(e: KeyboardEvent) {
  if (!props.interactiva) return
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!d) return
  e.preventDefault(); opresteInertia()
  anim.value = false; snap.value = !redus(); lovit.value = null
  const i = idxSub() - d
  x.value = centru(0) - i * props.latime
  nextTick(normalizeaza)
}
const anSub = computed(() => activ.value === null ? null : ani[((activ.value % ani.length) + ani.length) % ani.length])
defineExpose({ deruleaza, seteaza })
onMounted(() => { seteaza(props.anulMeu ?? 1999); window.addEventListener('resize', onResize) })
onBeforeUnmount(() => { window.removeEventListener('resize', onResize); opresteInertia() })
function onResize() { seteaza(props.anulMeu ?? 1999) }
</script>

<template>
   <div
    ref="banda" class="banda" :class="{ ff, inter: interactiva, trage }" :style="{ height: inaltime + 'px' }"
    :role="interactiva ? 'slider' : 'img'" :tabindex="interactiva ? 0 : undefined"
    :aria-label="`Banda anilor ${AN_MIN}–${AN_MAX}`"
    :aria-valuemin="interactiva ? AN_MIN : undefined" :aria-valuemax="interactiva ? AN_MAX : undefined"
    :aria-valuenow="interactiva ? (anSub ?? anulMeu) : undefined"
    :aria-valuetext="interactiva ? `${anSub ?? anulMeu} · ${titlu(anSub ?? anulMeu ?? AN_MIN)}` : undefined"
    @pointerdown="jos" @pointermove="misca" @pointerup="sus" @pointercancel="sus" @keydown="tasta">
    <div class="cap" aria-hidden="true" />
    <div v-if="interactiva" class="cap-et" aria-hidden="true">{{ anSub ?? anulMeu }}</div>
    <!-- Banda vizibilă e repetată de REP ori (derulare fără capăt): e decor, cititoarele de ecran primesc doar valoarea. -->
    <div ref="tambur" class="tambur" :class="{ anim, snap }" :style="{ transform: `translateX(${x}px)` }" aria-hidden="true">
      <template v-for="r in REP" :key="r">
        <div
v-for="(an, i) in ani" :key="r + '-' + an" class="an"
          :class="{ eu: an === anulMeu, lovit: lovit === (r - 1) * ani.length + i, activ: interactiva && activ === (r - 1) * ani.length + i }" :style="{ flexBasis: latime + 'px' }">
          <span class="y">{{ an }}</span><span class="t">{{ lovit === (r - 1) * ani.length + i && titluLovit ? titluLovit : titlu(an) }}</span>
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
.inter{cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.inter:hover{box-shadow:0 0 0 2px var(--line)}
.inter:focus-visible{box-shadow:0 0 0 3px var(--signal)}
.trage{cursor:grabbing}
.tambur.snap{transition:transform .6s cubic-bezier(.2,1.5,.35,1)}
.an{transition:background-color .2s}
.activ .y{color:var(--signal)}
.activ.lovit .y{color:inherit}
.cap{transform-origin:center;transition:transform .25s var(--ease-ff)}
.trage .cap{transform:scaleX(3)}
.cap-et{position:absolute;top:0;left:50%;z-index:4;transform:translate(-50%,-100%);font-family:var(--mono);font-size:11px;background:var(--signal);color:var(--on-signal);padding:2px 6px;border-radius:0 0 2px 2px;opacity:0;transition:opacity .2s,transform .3s var(--ease-ff);pointer-events:none}
.trage .cap-et,.inter:focus-visible .cap-et{opacity:1;transform:translate(-50%,0)}
@media (prefers-reduced-motion:reduce){.tambur.snap,.cap,.cap-et{transition:none}.trage .cap{transform:none}}
/* Capul de citire: două liniuțe sus și jos, nu o linie întreagă care taie anul și titlul celulei din mijloc. */
.cap{position:absolute;top:0;bottom:0;left:50%;width:3px;margin-left:-1px;z-index:3;background:linear-gradient(#E2582F 0 8px,transparent 8px calc(100% - 8px),#E2582F calc(100% - 8px))}
</style>
