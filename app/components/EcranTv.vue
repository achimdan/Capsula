<script setup lang="ts">
import { epocaPentruAn, programLa, type EpocaTv } from '~/utils/ecranTv'

// Ecranul televizorului din fundal: mira, purici, o casetă VHS și stingerea tubului, desenate pe un canvas mic.
// Fără clipuri: nimic de descărcat. Cu „mișcare redusă” rămâne mira, nemișcată.
const props = defineProps<{ an?: number | null }>()
const emit = defineEmits<{ lumina: [culoare: string] }>()
const W = 160
const H = 120
const panza = ref<HTMLCanvasElement>()
const epoca = computed<EpocaTv>(() => epocaPentruAn(props.an))

const BARE = ['#EDEDED', '#E8D44A', '#4FC8D6', '#4CB650', '#C34FC0', '#D2443A', '#3A4FC9']
const gri = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const y = Math.round(0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255))
  return `rgb(${y},${y},${y})`
}

let ctx: CanvasRenderingContext2D | null = null
let zgomot: ImageData | null = null
let raf = 0
let ultim = 0
let start = 0
let ultimaLumina = 0
let programAnterior = ''
let canal = 1
let osdPana = 0
const mostra = import.meta.client ? document.createElement('canvas') : null
if (mostra) { mostra.width = 4; mostra.height = 3 }

// Culoarea medie a imaginii, pentru lumina din cameră.
function trimiteLumina() {
  const m = mostra?.getContext('2d', { willReadFrequently: true })
  if (!m || !ctx) return
  m.drawImage(ctx.canvas, 0, 0, 4, 3)
  const d = m.getImageData(0, 0, 4, 3).data
  let r = 0, g = 0, b = 0
  for (let i = 0; i < d.length; i += 4) { r += d[i]!; g += d[i + 1]!; b += d[i + 2]! }
  const n = d.length / 4
  emit('lumina', `rgb(${Math.round(r / n)} ${Math.round(g / n)} ${Math.round(b / n)})`)
}

// Numărul canalului, verde, ca pe televizoarele cu telecomandă (nu și pe cele alb-negru).
function osd(c: CanvasRenderingContext2D, t: number) {
  if (epoca.value === 'alb-negru' || t > osdPana) return
  c.font = 'bold 13px ui-monospace, monospace'
  c.fillStyle = 'rgba(0,0,0,.5)'
  c.fillText(`P${String(canal).padStart(2, '0')}`, W - 37, 19)
  c.fillStyle = '#5BE38A'
  c.fillText(`P${String(canal).padStart(2, '0')}`, W - 38, 18)
}

function culoare(hex: string) {
  return epoca.value === 'alb-negru' ? gri(hex) : hex
}

function mira(c: CanvasRenderingContext2D) {
  const lat = W / BARE.length
  BARE.forEach((b, i) => { c.fillStyle = culoare(b); c.fillRect(Math.floor(i * lat), 0, Math.ceil(lat), H * 0.68) })
  const jos = c.createLinearGradient(0, 0, W, 0)
  jos.addColorStop(0, '#000'); jos.addColorStop(1, '#fff')
  c.fillStyle = jos; c.fillRect(0, H * 0.68, W, H * 0.14)
  c.fillStyle = '#111'; c.fillRect(0, H * 0.82, W, H * 0.18)
  c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.5
  c.beginPath(); c.arc(W / 2, H * 0.44, H * 0.3, 0, Math.PI * 2); c.stroke()
  c.beginPath(); c.moveTo(W / 2, H * 0.14); c.lineTo(W / 2, H * 0.74); c.moveTo(W / 2 - H * 0.3, H * 0.44); c.lineTo(W / 2 + H * 0.3, H * 0.44); c.stroke()
}

function purici(c: CanvasRenderingContext2D) {
  if (!zgomot) zgomot = c.createImageData(W, H)
  const d = zgomot.data
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255
    d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255
  }
  c.putImageData(zgomot, 0, 0)
}

function vhs(c: CanvasRenderingContext2D, t: number, p: number) {
  const nuanta = (t * 18) % 360
  const g = c.createLinearGradient(0, 0, W, H)
  if (epoca.value === 'alb-negru') {
    g.addColorStop(0, '#2A2A2A'); g.addColorStop(1, '#9A9A9A')
  } else {
    const sat = epoca.value === 'digital' ? 75 : 55
    g.addColorStop(0, `hsl(${nuanta},${sat}%,38%)`); g.addColorStop(1, `hsl(${(nuanta + 70) % 360},${sat}%,58%)`)
  }
  c.fillStyle = g; c.fillRect(0, 0, W, H)
  // Banda de tracking: coboară încet, cu rânduri deplasate și puțin zgomot.
  const y0 = Math.floor(((p * 1.6) % 1) * (H + 24)) - 12
  for (let y = Math.max(0, y0); y < Math.min(H, y0 + 10); y++) {
    const dx = Math.round((Math.random() - 0.5) * 10)
    c.drawImage(c.canvas, 0, y, W, 1, dx, y, W, 1)
    c.fillStyle = `rgba(255,255,255,${Math.random() * 0.35})`
    c.fillRect(Math.random() * W, y, 6 + Math.random() * 20, 1)
  }
  c.font = 'bold 9px ui-monospace, monospace'
  c.fillStyle = 'rgba(235,245,235,.9)'
  c.fillText(epoca.value === 'digital' ? 'AV1' : 'PLAY ▶', 8, 14)
  if (epoca.value !== 'alb-negru' && Math.floor(t * 2) % 2 === 0) c.fillText('●', W - 16, 14)
}

function stingere(c: CanvasRenderingContext2D, p: number) {
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H)
  const alb = epoca.value === 'alb-negru' ? '#EEE' : '#F4F7FF'
  c.fillStyle = alb
  if (p < 0.35) {
    const h = Math.max(1, H * (1 - p / 0.35))
    c.fillRect(0, (H - h) / 2, W, h)
  } else if (p < 0.6) {
    const w = Math.max(2, W * (1 - (p - 0.35) / 0.25))
    c.fillRect((W - w) / 2, H / 2 - 0.5, w, 1.5)
  } else {
    const r = 2.5 * (1 - (p - 0.6) / 0.4)
    if (r > 0.2) { c.beginPath(); c.arc(W / 2, H / 2, r, 0, Math.PI * 2); c.fill() }
  }
}

function deseneaza(t: number) {
  if (!ctx) return
  const { program, progres } = programLa(t)
  if (program !== programAnterior) {
    if (programAnterior && (program === 'mira' || program === 'vhs')) { canal = canal % 6 + 1; osdPana = t + 1.6 }
    programAnterior = program
  }
  if (program === 'mira') mira(ctx)
  else if (program === 'purici') purici(ctx)
  else if (program === 'vhs') vhs(ctx, t, progres)
  else stingere(ctx, progres)
  osd(ctx, t)
  if (t - ultimaLumina > 0.2 || t === 0) { ultimaLumina = t; trimiteLumina() }
}

function cadru(acum: number) {
  raf = requestAnimationFrame(cadru)
  if (acum - ultim < 50) return // ~20 cadre pe secundă ajung pentru un CRT
  ultim = acum
  deseneaza((acum - start) / 1000)
}

function porneste() {
  cancelAnimationFrame(raf)
  raf = 0
  if (document.hidden || matchMedia('(prefers-reduced-motion:reduce)').matches) {
    deseneaza(0)
    return
  }
  raf = requestAnimationFrame(cadru)
}

let calm: MediaQueryList | null = null
onMounted(() => {
  ctx = panza.value?.getContext('2d') ?? null
  start = performance.now()
  calm = matchMedia('(prefers-reduced-motion:reduce)')
  calm.addEventListener('change', porneste)
  document.addEventListener('visibilitychange', porneste)
  porneste()
})
watch(epoca, () => { if (!raf) deseneaza(0) })
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  calm?.removeEventListener('change', porneste)
  document.removeEventListener('visibilitychange', porneste)
})
</script>

<template>
  <canvas ref="panza" class="ecran-tv" :width="W" :height="H" aria-hidden="true" />
</template>

<style scoped>
.ecran-tv{position:absolute;inset:0;width:100%;height:100%;display:block}
</style>
