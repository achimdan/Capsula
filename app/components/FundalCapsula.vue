<script setup lang="ts">
import type { Fundal } from '~/utils/setari'

// `tema` + `mini` = previzualizare în /admin; altfel fundalul fix al paginii.
const props = defineProps<{ tema?: Fundal; mini?: boolean }>()
const activ = useStocare<Fundal>('fundal', 'clasic')
const tema = computed(() => props.tema ?? activ.value)

const lampa = ref<HTMLElement>()
let rafId = 0
let tinta = { x: 0, y: 0 }
let poz = { x: 0, y: 0 }

function pas() {
  poz.x += (tinta.x - poz.x) * 0.08
  poz.y += (tinta.y - poz.y) * 0.08
  if (lampa.value) lampa.value.style.transform = `translate3d(${poz.x}px,${poz.y}px,0)`
  rafId = (Math.abs(tinta.x - poz.x) + Math.abs(tinta.y - poz.y) > 0.5) ? requestAnimationFrame(pas) : 0
}
function mutaMouse(e: PointerEvent) {
  tinta = { x: e.clientX, y: e.clientY }
  if (!rafId) rafId = requestAnimationFrame(pas)
}
function acordeaza() {
  window.removeEventListener('pointermove', mutaMouse)
  cancelAnimationFrame(rafId)
  rafId = 0
  if (props.mini || tema.value !== 'tapet') return
  const fin = matchMedia('(pointer:fine)').matches
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches
  poz = { x: window.innerWidth * 0.3, y: window.innerHeight * 0.25 }
  tinta = { ...poz }
  if (lampa.value) lampa.value.style.transform = `translate3d(${poz.x}px,${poz.y}px,0)`
  if (fin && !calm) window.addEventListener('pointermove', mutaMouse, { passive: true })
}
onMounted(acordeaza)
watch(tema, () => nextTick(acordeaza))
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', mutaMouse)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <div class="fundal" :class="{ mini }" aria-hidden="true">
    <template v-if="tema === 'tapet'">
      <div class="tapet" />
      <div ref="lampa" class="lampa"><i /></div>
      <div class="vignieta" />
    </template>
    <template v-else-if="tema === 'vhs'">
      <div class="vhs-lumina" />
      <div class="zgomot" />
      <div class="linii" />
      <div class="vignieta tare" />
    </template>
    <template v-else-if="tema === 'arhiva'">
      <div class="fibre" />
      <div class="rigla" />
      <i class="banda b1" />
      <i class="banda b2" />
      <i class="banda b3" />
    </template>
  </div>
</template>

<style scoped>
.fundal{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;contain:strict}
.fundal.mini{position:absolute;z-index:0}
.fundal>*{position:absolute}

/* Tapet de bloc */
.tapet{inset:0;opacity:.07;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96' fill='none' stroke='%23EADFC8' stroke-width='1.4'><path d='M48 6 78 36 48 66 18 36Z'/><path d='M48 16 68 36 48 56 28 36Z'/><circle cx='48' cy='36' r='3' fill='%23EADFC8'/><g transform='translate(0 0)'><circle cx='0' cy='84' r='3'/><circle cx='6' cy='78' r='3'/><circle cx='-6' cy='78' r='3'/><circle cx='0' cy='72' r='3'/><circle cx='96' cy='84' r='3'/><circle cx='102' cy='78' r='3'/><circle cx='90' cy='78' r='3'/><circle cx='96' cy='72' r='3'/><circle cx='48' cy='90' r='2'/><path d='M48 92v4'/></g></svg>");
  background-size:96px 96px}
.lampa{left:0;top:0;width:0;height:0;will-change:transform}
.lampa i{position:absolute;left:-40vmax;top:-40vmax;width:80vmax;height:80vmax;border-radius:50%;
  background:radial-gradient(closest-side,rgb(255 170 60/.22),rgb(255 150 40/.08) 55%,transparent)}
.mini .lampa i{left:-60px;top:-60px;width:120px;height:120px}
.mini .lampa{left:55%;top:40%;transform:none!important}
.vignieta{inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgb(0 0 0/.35))}
.vignieta.tare{background:radial-gradient(ellipse at center,transparent 45%,rgb(0 0 0/.75))}

/* Sufragerie VHS */
.vhs-lumina{inset:0;background:radial-gradient(ellipse at 50% 40%,rgb(255 122 46/.09),transparent 65%)}
.linii{inset:0;background:repeating-linear-gradient(to bottom,rgb(0 0 0/.28) 0 1px,transparent 1px 3px)}
.zgomot{inset:-50%;opacity:.04;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  animation:zgomot 1.6s steps(6) infinite}
@keyframes zgomot{
  0%{transform:translate3d(0,0,0)}20%{transform:translate3d(-6%,4%,0)}40%{transform:translate3d(5%,-7%,0)}
  60%{transform:translate3d(-4%,-3%,0)}80%{transform:translate3d(7%,6%,0)}100%{transform:translate3d(0,0,0)}}

/* Hârtie de arhivă */
.fibre{inset:0;opacity:.5;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.04 .9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .36  0 0 0 0 .2  0 0 0 .22 0'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>")}
.rigla{inset:0;opacity:.55;
  background:repeating-linear-gradient(to bottom,transparent 0 31px,var(--line) 31px 32px)}
.banda{width:110px;height:30px;background:rgb(226 205 140/.72);box-shadow:0 1px 3px rgb(60 40 10/.25);
  background-image:repeating-linear-gradient(90deg,transparent 0 6px,rgb(255 255 255/.18) 6px 7px)}
.b1{left:-18px;top:28px;transform:rotate(-38deg)}
.b2{right:-20px;top:18%;transform:rotate(34deg)}
.b3{left:12%;bottom:-8px;transform:rotate(-4deg);width:90px}
.mini .banda{width:44px;height:12px}
.mini .b1{left:-10px;top:8px}.mini .b2{right:-10px;top:30%}.mini .b3{left:20%;bottom:-3px;width:36px}

@media (prefers-reduced-motion:reduce){.zgomot{animation:none}}
</style>
