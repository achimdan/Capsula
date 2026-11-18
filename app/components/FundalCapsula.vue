<script setup lang="ts">
import type { Fundal } from '~/utils/setari'
import { camera, ECRAN_TV, progresPin } from '~/utils/ecranTv'

// `tema` + `mini` = previzualizare în /admin; altfel fundalul fix al paginii.
const props = defineProps<{ tema?: Fundal; mini?: boolean }>()
const activ = useStocare<Fundal>('fundal', 'clasic')
const tema = computed(() => props.tema ?? activ.value)
// Ecranul televizorului arată epoca vizitatorului (anul în care avea 15 ani).
const { areProfil, an15 } = useCapsula()
// Lumina din cameră urmează ecranul: culoarea medie a imaginii, câteva ori pe secundă.
const luminaTv = ref('rgb(90 120 255)')
// Fișa deschisă din cronologie își arată poza pe ecranul televizorului (vezi CronologieFise).
const fisaPeTv = useState<{ id: string; titlu: string } | null>('fisa-pe-tv', () => null)

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
  const calm = miscareRedusa()
  poz = { x: window.innerWidth * 0.3, y: window.innerHeight * 0.25 }
  tinta = { ...poz }
  if (lampa.value) lampa.value.style.transform = `translate3d(${poz.x}px,${poz.y}px,0)`
  if (fin && !calm) window.addEventListener('pointermove', mutaMouse, { passive: true })
}
// „Bloc la apus”: straturile se mișcă diferit la scroll (soarele apune, blocurile coboară puțin, cele din față mai mult). Doar o variabilă CSS, pe rAF.
const radacina = ref<HTMLElement>()
let rafScroll = 0
const tv = ref<HTMLElement>()
const esteTv = computed(() => tema.value === 'televizor' || tema.value === 'televizor-90')
// Televizorul: camera se retrage cât ține pista fixată de pe prima pagină (vezi index.vue). Pe celelalte pagini, retras și estompat.
function aseazaTv() {
  const el = tv.value
  if (!el || props.mini) return
  const pista = document.querySelector<HTMLElement>('[data-tv-pin]')
  const vp = { w: window.innerWidth, h: window.innerHeight }
  let p = 1
  let dupa = 1
  if (pista) {
    const r = pista.getBoundingClientRect()
    p = progresPin(r.top, r.height, vp.h)
    // După pin, conținutul urcă peste televizor: îl estompăm pe încă o jumătate de ecran.
    dupa = Math.min(1, Math.max(0, (vp.h - r.bottom) / (vp.h * 0.5)))
  }
  const c = camera(p, { w: el.offsetWidth, h: el.offsetHeight }, ECRAN_TV[tema.value as keyof typeof ECRAN_TV], vp)
  el.style.transform = `translate(-50%,-50%) translate3d(${c.x}px,${c.y}px,0) scale(${c.scara})`
  el.style.opacity = String(1 - dupa * 0.62)
  pista?.style.setProperty('--tvp', String(p))
}
function citesteScroll() {
  rafScroll = 0
  if (esteTv.value) return aseazaTv()
  radacina.value?.style.setProperty('--sc', String(Math.min(window.scrollY / 1600, 1)))
}
function laScroll() {
  if (!rafScroll) rafScroll = requestAnimationFrame(citesteScroll)
}
function paralaxa() {
  window.removeEventListener('scroll', laScroll)
  window.removeEventListener('resize', laScroll)
  radacina.value?.style.removeProperty('--sc')
  if (props.mini || !['bloc', 'televizor', 'televizor-90'].includes(tema.value)) return
  // Cu mișcare redusă, televizorul stă retras și estompat (pista nu mai apare), fără ascultători.
  if (miscareRedusa()) { if (esteTv.value) nextTick(aseazaTv); return }
  window.addEventListener('scroll', laScroll, { passive: true })
  window.addEventListener('resize', laScroll, { passive: true })
  nextTick(citesteScroll)
}
// Pista există doar pe prima pagină: la schimbarea paginii recalculăm poziția.
const ruta = useRoute()
watch(() => ruta.path, () => nextTick(() => requestAnimationFrame(citesteScroll)))
// Preferința se poate schimba cu pagina deschisă: atunci repornim (sau oprim) paralaxa.
let miscare: MediaQueryList | undefined
// Și tapetul (urmărirea mouse-ului) depinde de preferință, deci refacem ambele efecte.
function laSchimbareMiscare() { acordeaza(); paralaxa() }
onMounted(() => {
  acordeaza(); paralaxa()
  miscare = matchMedia('(prefers-reduced-motion:reduce)')
  miscare.addEventListener('change', laSchimbareMiscare)
})
watch(tema, () => nextTick(() => { acordeaza(); paralaxa() }))
onBeforeUnmount(() => {
  miscare?.removeEventListener('change', laSchimbareMiscare)
  window.removeEventListener('scroll', laScroll)
  window.removeEventListener('resize', laScroll)
  cancelAnimationFrame(rafScroll)
  window.removeEventListener('pointermove', mutaMouse)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <div ref="radacina" class="fundal" :class="{ mini }" aria-hidden="true">
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
    <CeataFise v-else-if="tema === 'ceata'" fundal :mini="mini" />
    <template v-else-if="tema === 'bloc'">
      <div class="bl-cer" />
      <svg class="bl-svg" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax slice">
        <defs>
          <pattern id="bl-pt" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.5" fill="#7A2E14" /></pattern>
          <pattern id="bl-win" width="52" height="62" patternUnits="userSpaceOnUse">
            <rect x="8" y="10" width="14" height="22" fill="#4A2112" /><rect x="30" y="10" width="14" height="22" fill="#4A2112" />
            <rect x="3" y="38" width="46" height="6" fill="#8F3A20" /><rect x="3" y="44" width="46" height="1.5" fill="#4A2112" />
          </pattern>
        </defs>
        <g class="bl-nori" fill="#F3B777" opacity=".7">
          <rect x="120" y="120" width="260" height="12" rx="6" /><rect x="190" y="146" width="170" height="10" rx="5" />
          <rect x="860" y="90" width="230" height="12" rx="6" /><rect x="920" y="116" width="150" height="10" rx="5" />
        </g>
        <g class="bl-sol">
          <circle cx="800" cy="400" r="250" fill="#F7C56B" opacity=".3" />
          <circle cx="800" cy="400" r="170" fill="#F2A03D" />
          <circle cx="800" cy="400" r="170" fill="url(#bl-pt)" opacity=".35" />
        </g>
        <g class="bl-departe" fill="#E2A25C">
          <rect x="0" y="300" width="140" height="220" /><rect x="150" y="250" width="120" height="270" />
          <rect x="280" y="340" width="100" height="180" /><rect x="840" y="290" width="150" height="230" /><rect x="1000" y="340" width="200" height="180" />
          <rect x="0" y="250" width="1200" height="270" fill="url(#bl-pt)" opacity=".25" />
        </g>
        <g class="bl-aproape">
          <rect x="52" y="186" width="260" height="334" fill="#C2552B" /><rect x="52" y="186" width="260" height="334" fill="url(#bl-win)" />
          <rect x="262" y="186" width="50" height="334" fill="url(#bl-pt)" opacity=".4" /><rect x="48" y="178" width="268" height="8" fill="#8F3A20" />
          <rect x="364" y="310" width="156" height="210" fill="#D3733A" /><rect x="364" y="310" width="156" height="210" fill="url(#bl-win)" />
          <rect x="470" y="310" width="50" height="210" fill="url(#bl-pt)" opacity=".4" /><rect x="360" y="302" width="164" height="8" fill="#8F3A20" />
          <rect x="624" y="248" width="312" height="272" fill="#B8502A" /><rect x="624" y="248" width="312" height="272" fill="url(#bl-win)" />
          <rect x="886" y="248" width="50" height="272" fill="url(#bl-pt)" opacity=".4" /><rect x="620" y="240" width="320" height="8" fill="#8F3A20" />
          <rect x="988" y="124" width="208" height="396" fill="#C9622F" /><rect x="988" y="124" width="208" height="396" fill="url(#bl-win)" />
          <rect x="1146" y="124" width="50" height="396" fill="url(#bl-pt)" opacity=".4" /><rect x="984" y="116" width="216" height="8" fill="#8F3A20" />
          <g fill="#FFD36B">
            <rect x="112" y="258" width="14" height="22" /><rect x="238" y="320" width="14" height="22" /><rect x="60" y="444" width="14" height="22" /><rect x="164" y="196" width="14" height="22" />
            <rect x="446" y="382" width="14" height="22" /><rect x="758" y="320" width="14" height="22" /><rect x="840" y="444" width="14" height="22" /><rect x="632" y="382" width="14" height="22" />
            <rect x="1048" y="320" width="14" height="22" /><rect x="1122" y="444" width="14" height="22" /><rect x="996" y="196" width="14" height="22" />
          </g>
          <g fill="none" stroke="#4A2112" stroke-width="3" stroke-linecap="round">
            <path d="M120 178v-34M104 156h32M108 146h24M112 136h16" /><path d="M430 302v-26M416 282h28M420 274h20" />
            <path d="M720 240v-32M704 218h32M708 208h24" /><path d="M1090 116v-36M1074 94h32M1078 84h24M1082 74h16" />
          </g>
          <rect x="560" y="440" width="10" height="60" fill="#4A2112" />
          <circle cx="565" cy="420" r="34" fill="#8A4B1E" /><circle cx="543" cy="442" r="26" fill="#A6622B" /><circle cx="589" cy="444" r="24" fill="#A6622B" />
          <rect x="0" y="492" width="1200" height="28" fill="#3A180D" />
          <g transform="translate(230 466)" fill="#2A1008">
            <path d="M0 22V12l10-2 12-10h30l10 10 16 2v10z" /><circle cx="16" cy="24" r="7" /><circle cx="62" cy="24" r="7" />
            <path d="M26 4h12v6H20zM42 4h8l6 6H42z" fill="#F3B777" opacity=".5" />
          </g>
        </g>
      </svg>
    </template>
    <template v-else-if="tema === 'pop'">
      <div class="pp p1"><svg viewBox="0 0 120 120"><rect x="8" y="26" width="104" height="70" rx="8" fill="#FFD43B" /><rect x="22" y="36" width="76" height="30" rx="4" fill="#fff" /><circle cx="40" cy="51" r="8" fill="#FF6FA8" /><circle cx="80" cy="51" r="8" fill="#FF6FA8" /><path d="M30 96l8-18h44l8 18" fill="#FF6FA8" /></svg></div>
      <div class="pp p2"><svg viewBox="0 0 120 120"><path d="M60 8C92 8 108 50 104 78 100 104 82 114 60 114S20 104 16 78C12 50 28 8 60 8Z" fill="#FF6FA8" /><rect x="34" y="30" width="52" height="40" rx="8" fill="#8FD3FF" /><circle cx="50" cy="46" r="3" fill="#1E1B2E" /><circle cx="70" cy="46" r="3" fill="#1E1B2E" /><path d="M50 56q10 7 20 0" fill="none" /><circle cx="42" cy="92" r="7" fill="#FFD43B" /><circle cx="60" cy="98" r="7" fill="#FFD43B" /><circle cx="78" cy="92" r="7" fill="#FFD43B" /></svg></div>
      <div class="pp p3"><svg viewBox="0 0 120 120"><path d="M14 108L24 70H96L106 108Z" fill="#FF6FA8" /><rect x="10" y="30" width="100" height="24" rx="12" fill="#FFD43B" /><path d="M24 54v16M96 54v16" /><circle cx="60" cy="89" r="13" fill="#fff" /><circle cx="60" cy="89" r="3" fill="#1E1B2E" /><path d="M6 42q-8 16 6 28" fill="none" /></svg></div>
      <div class="pp p4"><svg viewBox="0 0 120 120"><path d="M10 10H92L110 28V110H10Z" fill="#8FD3FF" /><rect x="32" y="10" width="48" height="30" fill="#D9D9E3" /><rect x="66" y="15" width="8" height="20" fill="#1E1B2E" /><rect x="24" y="60" width="72" height="50" rx="3" fill="#fff" /><path d="M34 78h52M34 92h36" /></svg></div>
      <div class="pp p5"><svg viewBox="0 0 120 120"><rect x="12" y="14" width="96" height="92" rx="14" fill="#FFD43B" /><rect x="26" y="26" width="68" height="40" rx="6" fill="#8FD3FF" /><path d="M34 78v18M25 87h18" /><circle cx="80" cy="84" r="6" fill="#FF6FA8" /><circle cx="94" cy="94" r="6" fill="#FF6FA8" /></svg></div>
    </template>
    <template v-else-if="tema === 'televizor' || tema === 'televizor-90'">
      <i class="tv-h" :style="{ color: luminaTv }" />
      <div ref="tv" class="tv" :class="{ 'tv-90': tema === 'televizor-90' }">
        <!-- Podeaua și umbra se mișcă odată cu televizorul, ca să pară o cameră în care camera de filmat se retrage. -->
        <i class="tv-podea" />
        <svg v-if="tema === 'televizor-90'" viewBox="0 0 360 320" aria-hidden="true">
          <defs>
            <linearGradient id="t9-corp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3C42" /><stop offset=".08" stop-color="#2A2C31" /><stop offset=".7" stop-color="#1C1D21" /><stop offset="1" stop-color="#101114" /></linearGradient>
            <linearGradient id="t9-lat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".55" /><stop offset=".08" stop-color="#000" stop-opacity="0" /><stop offset=".92" stop-color="#000" stop-opacity="0" /><stop offset="1" stop-color="#000" stop-opacity=".6" /></linearGradient>
            <linearGradient id="t9-spate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26272B" /><stop offset="1" stop-color="#1A1B1E" /></linearGradient>
            <linearGradient id="t9-rama" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08080A" /><stop offset=".5" stop-color="#16171A" /><stop offset="1" stop-color="#2C2E33" /></linearGradient>
            <linearGradient id="t9-luciu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22" /><stop offset=".35" stop-color="#fff" stop-opacity="0" /></linearGradient>
            <radialGradient id="t9-umbra" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".75" /><stop offset="1" stop-color="#000" stop-opacity="0" /></radialGradient>
            <pattern id="t9-grila" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="#050506" /></pattern>
          </defs>
          <ellipse cx="180" cy="306" rx="190" ry="16" fill="url(#t9-umbra)" />
          <path d="M70 34h220l-14 -18H84z" fill="url(#t9-spate)" />
          <path d="M84 16h192" stroke="#3B3D43" stroke-width="1" />
          <rect x="10" y="32" width="340" height="270" rx="16" fill="url(#t9-corp)" />
          <rect x="10" y="32" width="340" height="270" rx="16" fill="url(#t9-lat)" />
          <rect x="10" y="32" width="340" height="270" rx="16" fill="url(#t9-luciu)" />
          <path d="M26 33h308" stroke="#6A6D75" stroke-width="1.2" stroke-linecap="round" opacity=".8" />
          <rect x="28" y="48" width="304" height="194" rx="14" fill="url(#t9-rama)" />
          <rect x="28.5" y="48.5" width="303" height="193" rx="13.5" fill="none" stroke="#000" stroke-opacity=".7" />
          <path d="M42 241.5h276" stroke="#4A4C52" stroke-width="1" opacity=".7" />
          <rect x="38" y="58" width="284" height="174" rx="18" fill="#060708" />
          <rect x="30" y="254" width="300" height="34" rx="6" fill="#141518" />
          <rect x="34" y="258" width="104" height="26" rx="4" fill="url(#t9-grila)" />
          <rect x="222" y="258" width="104" height="26" rx="4" fill="url(#t9-grila)" />
          <rect x="150" y="262" width="60" height="7" rx="2" fill="#2A2C31" />
          <text x="180" y="281" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="7" letter-spacing="2.4" fill="#8C8F98">STEREO</text>
          <circle cx="206" cy="281" r="1.8" fill="#38D06A" class="tv-standby" />
          <circle cx="206" cy="281" r="5" fill="#38D06A" opacity=".18" />
          <rect x="300" y="290" width="38" height="4" rx="2" fill="#0B0B0D" /><rect x="22" y="290" width="38" height="4" rx="2" fill="#0B0B0D" />
        </svg>
        <svg v-else viewBox="0 0 360 320" aria-hidden="true">
          <defs>
            <linearGradient id="t8-lemn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A5428" /><stop offset=".15" stop-color="#6E3F1C" /><stop offset=".85" stop-color="#4E2B12" /><stop offset="1" stop-color="#36200D" /></linearGradient>
            <linearGradient id="t8-lat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".5" /><stop offset=".07" stop-color="#000" stop-opacity="0" /><stop offset=".93" stop-color="#000" stop-opacity="0" /><stop offset="1" stop-color="#000" stop-opacity=".55" /></linearGradient>
            <linearGradient id="t8-luciu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE2BC" stop-opacity=".2" /><stop offset=".4" stop-color="#FFE2BC" stop-opacity="0" /></linearGradient>
            <linearGradient id="t8-crom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDE8DE" /><stop offset=".5" stop-color="#9A9488" /><stop offset=".55" stop-color="#C9C3B7" /><stop offset="1" stop-color="#6E685D" /></linearGradient>
            <linearGradient id="t8-rama" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050404" /><stop offset="1" stop-color="#2A2420" /></linearGradient>
            <radialGradient id="t8-buton" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#F4EEE2" /><stop offset=".55" stop-color="#A39B8C" /><stop offset="1" stop-color="#4C463D" /></radialGradient>
            <radialGradient id="t8-umbra" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".75" /><stop offset="1" stop-color="#000" stop-opacity="0" /></radialGradient>
          </defs>
          <ellipse cx="180" cy="312" rx="190" ry="12" fill="url(#t8-umbra)" />
          <g fill="none" stroke="url(#t8-crom)" stroke-width="3" stroke-linecap="round"><path d="M172 58L100 4M188 58L258 0" /></g>
          <path d="M146 70a34 18 0 0 1 68 0z" fill="#1C191C" />
          <path d="M44 294h14l-3 22h-8zM302 294h14l-3 22h-8z" fill="#1E120A" />
          <rect x="8" y="66" width="344" height="232" rx="12" fill="url(#t8-lemn)" />
          <g fill="none" stroke="#2A1608" stroke-width="1.2" opacity=".35"><path d="M10 90c90-6 200 8 340-2M10 132c110 7 220-7 340 3M10 176c80-5 190 9 340-1M10 222c120 6 210-8 340 2M10 270c90-6 200 6 340-2" /></g>
          <rect x="8" y="66" width="344" height="232" rx="12" fill="url(#t8-lat)" />
          <rect x="8" y="66" width="344" height="232" rx="12" fill="url(#t8-luciu)" />
          <path d="M18 67h324" stroke="#C48A52" stroke-width="1.3" stroke-linecap="round" opacity=".7" />
          <rect x="26" y="84" width="230" height="190" rx="20" fill="url(#t8-rama)" />
          <rect x="26" y="84" width="230" height="190" rx="20" fill="none" stroke="url(#t8-crom)" stroke-width="2.4" />
          <rect x="38" y="96" width="204" height="166" rx="24" fill="#060505" />
          <rect x="266" y="84" width="76" height="190" rx="5" fill="#1A1512" />
          <rect x="266" y="84" width="76" height="190" rx="5" fill="none" stroke="url(#t8-crom)" stroke-width="1.6" />
          <rect x="274" y="94" width="60" height="34" rx="3" fill="url(#t8-crom)" />
          <g fill="#2B2722"><rect x="280" y="100" width="12" height="10" rx="1.5" /><rect x="298" y="100" width="12" height="10" rx="1.5" /><rect x="316" y="100" width="12" height="10" rx="1.5" /><rect x="280" y="114" width="12" height="10" rx="1.5" /><rect x="298" y="114" width="12" height="10" rx="1.5" /><rect x="316" y="114" width="12" height="10" rx="1.5" /></g>
          <circle cx="304" cy="160" r="18" fill="#0C0A09" /><circle cx="304" cy="158" r="15" fill="url(#t8-buton)" /><path d="M304 146v9" stroke="#3A332C" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="292" cy="198" r="10" fill="#0C0A09" /><circle cx="292" cy="197" r="8" fill="url(#t8-buton)" />
          <circle cx="316" cy="198" r="10" fill="#0C0A09" /><circle cx="316" cy="197" r="8" fill="url(#t8-buton)" />
          <g fill="#070605"><rect x="276" y="220" width="56" height="2.4" rx="1.2" /><rect x="276" y="226" width="56" height="2.4" rx="1.2" /><rect x="276" y="232" width="56" height="2.4" rx="1.2" /><rect x="276" y="238" width="56" height="2.4" rx="1.2" /><rect x="276" y="244" width="56" height="2.4" rx="1.2" /><rect x="276" y="250" width="56" height="2.4" rx="1.2" /><rect x="276" y="256" width="56" height="2.4" rx="1.2" /></g>
          <circle cx="334" cy="140" r="2.4" fill="#E2483A" class="tv-standby" /><circle cx="334" cy="140" r="6" fill="#E2483A" opacity=".2" />
        </svg>
        <div class="tv-ec"><ClientOnly><EcranTv :an="areProfil ? an15 : null" @lumina="luminaTv = $event" /></ClientOnly><img v-if="fisaPeTv && !mini" :key="fisaPeTv.id" class="tv-poza" :src="`/fise/${fisaPeTv.id}-960.webp`" alt="" decoding="async"><i class="tv-linii" /><i class="tv-bara" /><i class="tv-sticla" /></div>
      </div>
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

/* Bloc la apus */
.bl-cer{left:0;right:0;bottom:0;height:60%;background:linear-gradient(to top,rgb(244 160 80/.5),rgb(246 190 120/.18) 55%,transparent)}
.bl-svg{left:0;bottom:0;width:100%;height:48vh;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 24%);mask-image:linear-gradient(to bottom,transparent 0,#000 24%)}
.mini .bl-svg{height:62%}
.bl-sol{animation:bl-sol 40s ease-in-out infinite alternate}
.bl-nori{animation:bl-nori 70s ease-in-out infinite alternate}
/* Paralaxa la scroll: `translate` se adună peste animațiile pe `transform`. --sc merge de la 0 la 1 în primii 1600px. */
.bl-sol{translate:0 calc(var(--sc,0) * 140px)}
.bl-nori{translate:calc(var(--sc,0) * -60px) calc(var(--sc,0) * 20px)}
.bl-departe{translate:0 calc(var(--sc,0) * 25px)}
.bl-aproape{translate:0 calc(var(--sc,0) * 60px)}
/* Pe telefon textul trece peste blocuri: le facem mai joase și mai șterse. */
@media (max-width:480px){.fundal:not(.mini) .bl-svg{height:30vh;opacity:.45}}
@keyframes bl-sol{from{transform:translate3d(0,0,0)}to{transform:translate3d(-30px,-16px,0)}}
@keyframes bl-nori{from{transform:translate3d(-40px,0,0)}to{transform:translate3d(60px,0,0)}}

/* Pop anii '90 */
.pp{width:clamp(72px,9vw,128px);animation:bob 11s ease-in-out infinite;transform:rotate(var(--r))}
.pp svg{display:block;width:100%;height:auto;stroke:#1E1B2E;stroke-width:5;stroke-linejoin:round;stroke-linecap:round}
.p1{--r:-12deg;top:11vh;left:2vw}
.p2{--r:9deg;top:6vh;right:3vw;animation-duration:9s;animation-delay:-3s}
.p3{--r:-7deg;top:50vh;left:1vw;animation-duration:13s;animation-delay:-6s}
.p4{--r:14deg;top:60vh;right:2vw;animation-duration:10s;animation-delay:-2s}
.p5{--r:-10deg;bottom:4vh;left:14vw;animation-duration:12s;animation-delay:-8s}
@keyframes bob{50%{transform:translate3d(0,-14px,0) rotate(calc(var(--r) + 4deg))}}
.mini .pp{width:34px}
.mini .p1{top:8%;left:4%}.mini .p2{top:6%;right:4%}.mini .p3{top:52%;left:3%}.mini .p4{top:56%;right:4%}.mini .p5{bottom:4%;left:40%}
@media (max-width:480px){
  .pp{width:52px;opacity:.5}
  .mini .pp{opacity:1}
  .p3,.p4{display:none}
  .p1{top:9vh;left:-6px}.p2{top:5vh;right:-4px}.p5{bottom:3vh;left:8vw}
  .mini .pp{width:34px}
}

/* Televizor în întuneric */
/* Centrat; camera (zoom + deplasare) o pune aseazaTv() din script, ca transform. */
.tv{left:50%;top:50%;width:min(70vw,100vh);aspect-ratio:360/320;transform-origin:50% 50%;will-change:transform,opacity;transform:translate(-50%,-50%)}
.tv svg{position:absolute;inset:0;width:100%;height:100%}
.tv-ec{position:absolute;left:10.56%;top:30%;width:56.67%;height:51.88%;border-radius:16% / 19%;overflow:hidden;background:#1D2A55;box-shadow:0 0 60px 14px rgb(120 150 255/.22)}
.tv-linii,.tv-sticla{will-change:transform}
.tv-linii{position:absolute;inset:0;background:repeating-linear-gradient(to bottom,rgb(0 0 0/.28) 0 1px,transparent 1px 3px)}
.tv-bara{position:absolute;left:0;right:0;top:-20%;height:20%;background:linear-gradient(to bottom,transparent,rgb(255 255 255/.09),transparent);animation:tv-rulaj 7s linear infinite}
/* Sticla bombată a tubului: întunecată pe margini, cu o reflexie curbă sus-stânga și una slabă jos-dreapta. */
.tv-sticla{position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 40px 14px rgb(0 0 0/.7),inset 0 0 6px 3px rgb(0 0 0/.6);
  background:radial-gradient(90% 55% at 28% 8%,rgb(255 255 255/.2),rgb(255 255 255/.05) 40%,transparent 60%),radial-gradient(60% 40% at 82% 96%,rgb(255 255 255/.06),transparent 70%),radial-gradient(ellipse at center,transparent 50%,rgb(0 0 0/.4))}
/* Camera: podea de parchet închis, luminată de ecran, care se întinde mult în jurul televizorului. */
.tv-podea{position:absolute;left:-260%;width:620%;top:94%;height:200%;
  background:radial-gradient(18% 14% at 50% 0,rgb(120 150 255/.14),transparent 70%),radial-gradient(50% 60% at 50% 0,#17120F,transparent 75%)}
/* Televizorul de plastic din anii '90, pe un video */
.tv-poza{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.15) contrast(1.05);animation:tv-poza-intra .5s .55s steps(6,end) both}
@keyframes tv-poza-intra{from{opacity:0;transform:scaleY(.02)}50%{opacity:1;transform:scaleY(.02) scaleX(1)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.tv-poza{animation:none}}
.tv-90 .tv-ec{left:10.56%;top:18.13%;width:78.89%;height:54.38%;border-radius:7% / 10%}
.tv-standby{animation:tv-clipire 2.4s steps(1) infinite}
@keyframes tv-clipire{50%{opacity:0}}
@keyframes tv-rulaj{to{transform:translateY(600%)}}
.tv-h{left:-25vw;top:-25vh;width:150vw;height:150vh;border-radius:50%;opacity:.3;background:radial-gradient(closest-side,currentColor,transparent);will-change:transform}
.mini .tv{width:64%}
.mini .tv-h{left:-20%;top:-20%;width:140%;height:140%}
@media (max-width:480px){.tv{width:88vw}.mini .tv{width:64%}}

@media (prefers-reduced-motion:reduce){.tv-h{transition:none}.zgomot,.bl-sol,.bl-nori,.pp,.tv-bara,.tv-standby{animation:none}}
</style>
