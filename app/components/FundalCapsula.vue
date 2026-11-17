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
// „Bloc la apus”: straturile se mișcă diferit la scroll (soarele apune, blocurile coboară puțin, cele din față mai mult). Doar o variabilă CSS, pe rAF.
const radacina = ref<HTMLElement>()
let rafScroll = 0
function citesteScroll() {
  rafScroll = 0
  radacina.value?.style.setProperty('--sc', String(Math.min(window.scrollY / 1600, 1)))
}
function laScroll() {
  if (!rafScroll) rafScroll = requestAnimationFrame(citesteScroll)
}
function paralaxa() {
  window.removeEventListener('scroll', laScroll)
  radacina.value?.style.removeProperty('--sc')
  if (props.mini || tema.value !== 'bloc' || matchMedia('(prefers-reduced-motion:reduce)').matches) return
  window.addEventListener('scroll', laScroll, { passive: true })
  citesteScroll()
}
onMounted(() => { acordeaza(); paralaxa() })
watch(tema, () => nextTick(() => { acordeaza(); paralaxa() }))
onBeforeUnmount(() => {
  window.removeEventListener('scroll', laScroll)
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
    <template v-else-if="tema === 'televizor'">
      <i class="tv-h tv-h0" /><i class="tv-h tv-h1" /><i class="tv-h tv-h2" />
      <div class="tv">
        <svg viewBox="0 0 360 320">
          <g fill="none" stroke="#8A8794" stroke-width="5" stroke-linecap="round"><path d="M130 70L64 12M130 70L200 8" /></g>
          <circle cx="64" cy="12" r="5" fill="#8A8794" /><circle cx="200" cy="8" r="5" fill="#8A8794" />
          <path d="M100 72a30 22 0 0 1 60 0z" fill="#2B2630" />
          <rect x="30" y="300" width="30" height="18" rx="3" fill="#1A1620" /><rect x="300" y="300" width="30" height="18" rx="3" fill="#1A1620" />
          <rect x="10" y="70" width="340" height="232" rx="18" fill="#6B4423" />
          <path d="M20 100H340M20 130H340M20 160H340M20 190H340M20 220H340M20 250H340M20 280H340" stroke="#4E3017" stroke-width="2" opacity=".6" />
          <rect x="20" y="76" width="232" height="190" rx="22" fill="#17120D" />
          <circle cx="302" cy="124" r="19" fill="#C9C2B4" /><circle cx="302" cy="124" r="19" fill="none" stroke="#2B2118" stroke-width="3" /><path d="M302 108v12" stroke="#2B2118" stroke-width="3" />
          <circle cx="302" cy="178" r="19" fill="#C9C2B4" /><circle cx="302" cy="178" r="19" fill="none" stroke="#2B2118" stroke-width="3" /><path d="M312 168l-8 10" stroke="#2B2118" stroke-width="3" />
          <path d="M280 214h44M280 224h44M280 234h44M280 244h44" stroke="#2B2118" stroke-width="3" stroke-linecap="round" />
          <circle cx="322" cy="276" r="4" fill="#FF5A3C" />
        </svg>
        <div class="tv-ec"><i class="tv-c tv-c0" /><i class="tv-c tv-c1" /><i class="tv-c tv-c2" /><i class="tv-linii" /></div>
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
.tv{right:6vw;bottom:0;width:min(46vw,420px);aspect-ratio:360/320}
.tv svg{position:absolute;inset:0;width:100%;height:100%}
.tv-ec{position:absolute;left:7.8%;top:26.3%;width:59.4%;height:54.4%;border-radius:12% / 14%;overflow:hidden;background:#1D2A55;box-shadow:0 0 40px 6px rgb(120 150 255/.35)}
.tv-c{position:absolute;inset:0;opacity:0;animation:tv-fade 20s ease-in-out infinite}
.tv-c0{background:linear-gradient(135deg,#3B82F6,#8B5CF6);opacity:1}
.tv-c1{background:linear-gradient(160deg,#F97316,#EC4899);animation-delay:-6.6s}
.tv-c2{background:linear-gradient(120deg,#10B981,#22D3EE);animation-delay:-13.3s}
.tv-linii{position:absolute;inset:0;background:repeating-linear-gradient(to bottom,rgb(0 0 0/.3) 0 1px,transparent 1px 3px)}
.tv-h{right:-30vw;bottom:-40vh;width:100vw;height:100vh;border-radius:50%;opacity:0;animation:tv-fade 20s ease-in-out infinite}
.tv-h0{background:radial-gradient(closest-side,rgb(90 120 255/.42),transparent);opacity:1}
.tv-h1{background:radial-gradient(closest-side,rgb(255 110 60/.38),transparent);animation-delay:-6.6s}
.tv-h2{background:radial-gradient(closest-side,rgb(40 220 190/.34),transparent);animation-delay:-13.3s}
@keyframes tv-fade{0%,5%{opacity:0}20%,45%{opacity:1}60%,100%{opacity:0}}
.mini .tv{right:6%;width:58%}
.mini .tv-h{right:-30%;bottom:-40%;width:110%;height:110%}
@media (max-width:480px){
  .tv,.mini .tv{right:auto;left:50%;margin-left:max(-35vw,-150px);width:min(70vw,300px)}
  .fundal:not(.mini) .tv{opacity:.35}
  .mini .tv{margin-left:-29%;width:58%}
  .tv-h{right:-25vw;bottom:-30vh;width:150vw;height:90vh}
  .mini .tv-h{right:-30%;bottom:-40%;width:110%;height:110%}
}

@media (prefers-reduced-motion:reduce){.zgomot,.bl-sol,.bl-nori,.pp,.tv-c,.tv-h{animation:none}}
</style>
