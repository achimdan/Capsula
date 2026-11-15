<script setup lang="ts">
import type { Fisa } from '~/data/fise'
const props = withDefaults(defineProps<{ fisa: Fisa; ascundeAn?: boolean; actiuni?: boolean; developare?: boolean }>(), {
  ascundeAn: false, actiuni: true, developare: false
})
const { caseta, amAvut, comuta } = useCapsula()
const salvata = computed(() => caseta.value.includes(props.fisa.id))
const avut = computed(() => amAvut.value.includes(props.fisa.id))
function comutaCaseta() { comuta(caseta, props.fisa.id) }
function comutaAvut() { comuta(amAvut, props.fisa.id) }
// Efecte vizuale (doar prezentare): înclinare 3D la pointer, ștampilă, sunet de bandă
const card = ref<HTMLElement | null>(null)
const stamped = ref(false)
const bump = ref(0)
let raf = 0
function pePointer(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !card.value) return
  const el = card.value, r = el.getBoundingClientRect(), x = e.clientX, y = e.clientY
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const px = Math.min(1, Math.max(0, (x - r.left) / r.width)), py = Math.min(1, Math.max(0, (y - r.top) / r.height))
    el.style.setProperty('--ry', ((px - .5) * 12).toFixed(2) + 'deg')
    el.style.setProperty('--rx', ((.5 - py) * 12).toFixed(2) + 'deg')
    el.style.setProperty('--gx', ((px - .5) * 100).toFixed(1) + '%')
    el.style.setProperty('--gy', ((py - .5) * 100).toFixed(1) + '%')
  })
}
function laIesire() {
  cancelAnimationFrame(raf)
  const el = card.value
  if (!el) return
  for (const k of ['--rx', '--ry', '--gx', '--gy']) el.style.removeProperty(k)
}
onBeforeUnmount(() => cancelAnimationFrame(raf))
function apasaAvut() { stamped.value = !avut.value; comutaAvut() }
function apasaCaseta() { bump.value++; comutaCaseta() }
const nrCaseta = computed(() => caseta.value.length)
const anText = computed(() => props.ascundeAn ? '????' : props.fisa.an + (props.fisa.an_exact ? '' : ' ≈'))
</script>

<template>
  <article ref="card" class="fisa" :class="{ dev: developare }" @pointermove="pePointer" @pointerleave="laIesire" @pointercancel="laIesire">
    <div class="img" :style="{ background: `linear-gradient(135deg, ${fisa.culori[0]}, ${fisa.culori[1]})` }">
      <span class="eticheta">{{ fisa.categorie }}{{ fisa.oras ? ' · ' + fisa.oras : '' }}</span>
      <span v-if="avut" :key="stamped ? 'nou' : 'vechi'" class="stampila" :class="{ nou: stamped }" aria-hidden="true">{{ fisa.categorie === 'Locuri' ? 'Am fost acolo' : 'Am avut asta' }}</span>
    </div>
    <div class="meta"><span>NR. INV. {{ fisa.id }}</span><span :class="{ ascuns: ascundeAn }">{{ anText }}</span></div>
    <h3>{{ fisa.titlu }}</h3>
    <p>{{ fisa.nota }}</p>
    <p v-if="fisa.sursa" class="sursa">Sursă: {{ fisa.sursa }}</p>
    <div v-if="actiuni" class="act">
      <button type="button" class="avut" :aria-pressed="avut" @click="apasaAvut">{{ avut ? '✓ Am fost acolo' : (fisa.categorie === 'Locuri' ? 'Am fost acolo' : 'Am avut asta') }}</button>
      <button type="button" class="sec" :aria-pressed="salvata" @click="apasaCaseta">
        <svg :key="'i' + salvata" class="banda" :class="{ lipit: salvata }" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="8.5" cy="12" r="2" /><circle cx="15.5" cy="12" r="2" /><path d="M8.5 14h7" /></svg>
        <span>{{ salvata ? '✓ În casetă' : '+ Caseta mea' }}</span>
        <span v-if="salvata && nrCaseta" :key="bump" class="nr" aria-hidden="true">{{ nrCaseta }}</span>
      </button>
    </div>
    <span class="glare" aria-hidden="true" />
  </article>
</template>

<style scoped>
.fisa{--rx:0deg;--ry:0deg;--gx:0%;--gy:0%;position:relative;background:var(--card);color:var(--ink);padding:10px 10px 14px;width:min(300px,100%);
  box-shadow:0 18px 30px -18px rgba(0,0,0,.45);transform:perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));transition:transform .5s var(--ease-ff),box-shadow .5s var(--ease-ff);will-change:transform}
.img{aspect-ratio:1;position:relative;overflow:hidden}
.img::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.14;mix-blend-mode:multiply;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
.img::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;background:radial-gradient(circle at 50% 40%,#C9D0B4,#5E7A62 70%,#2B4036)}
.eticheta{position:absolute;z-index:2;left:8px;bottom:8px;font-family:var(--mono);font-size:11px;color:var(--card);background:color-mix(in srgb,var(--ink) 60%,transparent);padding:2px 6px}
.stampila{position:absolute;z-index:2;right:10px;top:12px;font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:20px;letter-spacing:.06em;color:var(--signal);
  border:3px solid var(--signal);border-radius:4px;padding:2px 8px;background:color-mix(in srgb,var(--card) 70%,transparent);transform:rotate(-9deg);opacity:.92;pointer-events:none}
.stampila.nou{animation:stamp .5s var(--ease-ff) both}
@keyframes stamp{0%{transform:rotate(-16deg) scale(2.2);opacity:0}55%{transform:rotate(-8deg) scale(.94);opacity:1}100%{transform:rotate(-9deg) scale(1);opacity:.92}}
.meta{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;margin-top:10px;color:var(--muted)}
.ascuns{background:var(--ink);color:var(--ink);border-radius:2px;padding:0 4px}
h3{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:28px;line-height:.92;margin:6px 0}
p{font-size:14px;line-height:1.45;margin:0}
.sursa{font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:8px}
.act{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;border-top:1px dashed var(--line);padding-top:10px}
.act button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;min-width:44px;font:600 13px var(--body);background:var(--ink);color:var(--card);border:0;padding:0 14px;border-radius:2px;cursor:pointer;
  transition:transform .2s var(--ease-ff),opacity .2s var(--ease-ff)}
.act button.sec{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ink)}
.act button[aria-pressed="true"]{background:var(--signal);color:var(--ink);box-shadow:none}
.act button:active{transform:scale(.95)}
.act button:focus-visible{outline:2px solid var(--signal);outline-offset:2px}
.banda{flex:none}
.banda.lipit{animation:snap .45s var(--ease-ff) both}
@keyframes snap{0%{transform:translateY(-10px) rotate(-30deg) scale(1.5);opacity:0}60%{transform:translateY(1px) rotate(4deg) scale(.9);opacity:1}100%{transform:none}}
.nr{font-family:var(--mono);font-size:11px;min-width:18px;height:18px;line-height:18px;text-align:center;border-radius:9px;background:var(--ink);color:var(--card);animation:bump .4s var(--ease-ff)}
@keyframes bump{0%{transform:scale(.4)}60%{transform:scale(1.35)}100%{transform:scale(1)}}
.glare{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .4s var(--ease-ff);overflow:hidden}
.glare::before{content:"";position:absolute;left:-50%;top:-50%;width:200%;height:200%;background:radial-gradient(circle at center,rgba(255,255,255,.5),transparent 28%);
  transform:translate(var(--gx),var(--gy))}
@media (hover:hover) and (pointer:fine){
  .fisa:hover{box-shadow:0 28px 40px -20px rgba(0,0,0,.55)}
  .fisa:hover .glare{opacity:.5}
  .act button:hover{opacity:.88;transform:translateY(-1px)}
  .act button:active{transform:scale(.95)}
}
.dev .img::before{animation:chimic 3.2s var(--ease-ff) both}
.dev .img::after{animation:grain 3.2s ease-out both}
@keyframes chimic{0%{opacity:.96}45%{opacity:.6}100%{opacity:0}}
@keyframes grain{0%{opacity:.7}100%{opacity:.14}}
@media (prefers-reduced-motion:reduce){
  .fisa{transform:none!important;transition:none}
  .glare{display:none}
  .dev .img::before{animation:none;opacity:0}
  .dev .img::after,.stampila.nou,.banda.lipit,.nr{animation:none}
  .act button,.act button:hover,.act button:active{transition:none;transform:none}
}
</style>
