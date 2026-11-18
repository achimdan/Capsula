<script setup lang="ts">
import type { Fisa } from '~/data/fise'
// `faraPoza`: poza stă pe ecranul televizorului din fundal, fișa arată doar descrierea.
// `mare`: fișa deschisă din cronologie, cu detalii, video (dacă fișa are) și buton de închidere.
const props = withDefaults(defineProps<{ fisa: Fisa; ascundeAn?: boolean; actiuni?: boolean; developare?: boolean; mare?: boolean; faraPoza?: boolean }>(), {
  ascundeAn: false, actiuni: true, developare: false, mare: false, faraPoza: false
})
defineEmits<{ inchide: [], deschide: [fisa: Fisa] }>()
// Filmul pornește mut, în buclă; cu „reduce motion” așteaptă să fie pornit de cititor.
// Doar în fișa deschisă: cererea pornește abia când e `mare`.
const { similare } = props.mare ? useFiseSimilare(toRef(props, 'fisa')) : { similare: computed<Fisa[]>(() => []) }
const cuVideo = computed(() => props.mare && !!props.fisa.video)
const film = ref<HTMLVideoElement | null>(null)
const mut = ref(true)
const embedPornit = ref(false)
const embedSrc = computed(() => props.fisa.embed ? `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(props.fisa.embed.url)}&show_text=false&width=500` : '')
const merge = ref(false)
const faraMiscare = ref(false)
onMounted(() => { faraMiscare.value = miscareRedusa() })
function comutaFilm() {
  const v = film.value
  if (!v) return
  if (v.paused) v.play().catch(() => {})
  else v.pause()
}
const { caseta, amAvut, comuta } = useCapsula()
const { profilCititor } = useProfilCitit()
const aScenei = computed(() => eDinScena(props.fisa, profilCititor.value?.scena))
// Fișele scrise de utilizator: fără casetă / „Am avut”, doar ștergere (cu confirmare, e definitivă).
const proprii = props.fisa.proprie ? useFiseProprii() : null
const confirmaStergerea = ref(false)
const seSterge = ref(false)
async function sterge() {
  if (!proprii) return
  if (!confirmaStergerea.value) { confirmaStergerea.value = true; return }
  seSterge.value = true
  try { await proprii.sterge(props.fisa) } finally { seSterge.value = false; confirmaStergerea.value = false }
}
const salvata = computed(() => caseta.value.includes(props.fisa.id))
const avut = computed(() => amAvut.value.includes(props.fisa.id))
const { cereCont } = useIntrare()
function comutaCaseta() {
  if (!salvata.value && !cereCont({ tip: 'caseta', id: props.fisa.id })) return
  comuta(caseta, props.fisa.id)
}
function comutaAvut(): boolean {
  if (!avut.value && !cereCont({ tip: 'amavut', id: props.fisa.id })) return false
  comuta(amAvut, props.fisa.id)
  return true
}
// Efecte vizuale (doar prezentare): înclinare 3D la pointer, ștampilă, sunet de bandă
const card = ref<HTMLElement | null>(null)
const stamped = ref(false)
let raf = 0
function pePointer(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !card.value) return
  const el = card.value, r = el.getBoundingClientRect(), x = e.clientX, y = e.clientY
  el.classList.add('inclinat')
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
  // Lumina rămâne pe loc cât se stinge; doar înclinarea revine, lin.
  el.classList.remove('inclinat')
  for (const k of ['--rx', '--ry']) el.style.removeProperty(k)
}
onBeforeUnmount(() => cancelAnimationFrame(raf))
function apasaAvut() { const va = !avut.value; if (comutaAvut()) stamped.value = va }
function apasaCaseta() { comutaCaseta() }
const anText = computed(() => props.ascundeAn ? '????' : props.fisa.an + (props.fisa.an_exact ? '' : ' ≈'))
</script>

<template>
  <article ref="card" class="fisa" :class="{ dev: developare, mare, 'fara-poza': faraPoza }" @pointermove="pePointer" @pointerleave="laIesire" @pointercancel="laIesire">
    <!-- Poza e pe televizorul din fundal (canvas ascuns cititoarelor de ecran): descrierea ei rămâne aici. -->
    <p v-if="faraPoza && fisa.poza?.alt" class="sr-only">Poza, pe televizor: {{ fisa.poza.alt }}</p>
    <div v-if="!faraPoza" class="img" :style="{ background: `linear-gradient(135deg, ${fisa.culori[0]}, ${fisa.culori[1]})` }">
      <video
        v-if="cuVideo"
        ref="film"
        class="foto"
        :src="`/fise/${fisa.id}.mp4`"
        :poster="fisa.poza ? `/fise/${fisa.id}-960.webp` : undefined"
        :autoplay="!faraMiscare"
        :muted="mut"
        loop
        playsinline
        preload="metadata"
        :aria-label="`Video: ${fisa.titlu}`"
        @play="merge = true"
        @pause="merge = false"
        @click="comutaFilm"
      />
      <div v-else-if="mare && fisa.embed" class="foto embed">
        <iframe v-if="embedPornit" :src="embedSrc" :title="`Postare Facebook: ${fisa.titlu}`" loading="lazy" allow="encrypted-media; clipboard-write" />
        <template v-else>
          <button type="button" @click="embedPornit = true">Arată coperta</button>
          <small>Se încarcă de pe facebook.com, care poate pune cookie-uri.</small>
        </template>
      </div>
      <img v-else-if="fisa.poza" class="foto" :src="`/fise/${fisa.id}-480.webp`" :srcset="`/fise/${fisa.id}-480.webp 480w, /fise/${fisa.id}-960.webp 960w`" :sizes="mare ? '(max-width: 800px) 92vw, 400px' : '(max-width: 640px) 90vw, 300px'" :alt="fisa.poza.alt ?? fisa.titlu" loading="lazy" decoding="async" width="480" height="480">
      <span class="eticheta">{{ fisa.categorie }}{{ fisa.oras ? ' · ' + fisa.oras : '' }}{{ aScenei ? ' · scena ta' : '' }}{{ fisa.proprie ? ' · a ta' : '' }}</span>
      <span v-if="avut" :key="stamped ? 'nou' : 'vechi'" class="stampila" :class="{ nou: stamped }" aria-hidden="true">{{ fisa.categorie === 'Locuri' ? 'Am fost acolo' : 'Am avut asta' }}</span>
      <div v-if="cuVideo" class="film-act">
        <button type="button" :aria-label="merge ? 'Pune pauză' : 'Pornește filmul'" @click="comutaFilm">{{ merge ? 'Pauză' : 'Play' }}</button>
        <button type="button" :aria-pressed="!mut" @click="mut = !mut">{{ mut ? 'Cu sunet' : 'Fără sunet' }}</button>
      </div>
    </div>
    <button v-if="mare" type="button" class="inchide" aria-label="Închide fișa" @click="$emit('inchide')">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
    <div class="meta"><span>{{ fisa.proprie ? 'Amintirea ta' : 'NR. INV. ' + fisa.id }}</span><span :class="{ ascuns: ascundeAn }">{{ anText }}</span></div>
    <h3>{{ fisa.titlu }}</h3>
    <p>{{ fisa.nota }}</p>
    <dl v-if="mare" class="detalii">
      <div><dt>An</dt><dd>{{ fisa.an_exact ? fisa.an : `în jur de ${fisa.an}` }}</dd></div>
      <div><dt>Loc</dt><dd>{{ fisa.oras ?? (fisa.proprie ? 'Nespus' : 'Toată țara') }}</dd></div>
      <div><dt>Categorie</dt><dd>{{ fisa.categorie }}</dd></div>
      <div v-if="fisa.scena"><dt>Scenă</dt><dd class="cap">{{ fisa.scena }}{{ aScenei ? ' · a ta' : '' }}</dd></div>
      <div v-if="!fisa.proprie"><dt>Stare</dt><dd>{{ fisa.verificat ? 'Verificată' : 'Din amintiri, încă neverificată' }}</dd></div>
    </dl>
    <p v-if="fisa.sursa" class="sursa">Sursă: {{ fisa.sursa }}</p>
    <p v-if="cuVideo && fisa.video" class="sursa credit">
      Video: <a v-if="fisa.video.url" :href="fisa.video.url" target="_blank" rel="noopener">{{ fisa.video.autor }}</a><template v-else>{{ fisa.video.autor }}</template> · {{ fisa.video.licenta }}
    </p>
    <p v-else-if="fisa.poza?.generata" class="sursa credit">Ilustrație generată pentru Capsula</p>
    <p v-else-if="fisa.poza" class="sursa credit">
      Foto: <a v-if="fisa.poza.url" :href="fisa.poza.url" target="_blank" rel="noopener">{{ fisa.poza.autor }}</a><template v-else>{{ fisa.poza.autor }}</template> · {{ fisa.poza.licenta }}
    </p>
    <div v-if="actiuni && fisa.proprie" class="act">
      <button type="button" class="sec" :disabled="seSterge" @click="sterge">{{ confirmaStergerea ? 'Sigur? Șterge definitiv' : 'Șterge fișa' }}</button>
      <button v-if="confirmaStergerea" type="button" class="sec" @click="confirmaStergerea = false">Renunță</button>
    </div>
    <div v-else-if="actiuni" class="act">
      <button type="button" class="avut" :aria-pressed="avut" @click="apasaAvut">{{ avut ? '✓ ' + (fisa.categorie === 'Locuri' ? 'Am fost acolo' : 'Am avut asta') : (fisa.categorie === 'Locuri' ? 'Am fost acolo' : 'Am avut asta') }}</button>
      <button type="button" class="sec caseta" :aria-pressed="salvata" :title="salvata ? 'Apasă din nou ca s-o scoți din casetă' : 'Pune fișa în caseta ta'" @click="apasaCaseta">
        <svg :key="'i' + salvata" class="banda" :class="{ lipit: salvata }" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="8.5" cy="12" r="2" /><circle cx="15.5" cy="12" r="2" /><path d="M8.5 14h7" /></svg>
        <span class="etichete"><span class="eticheta-buton">{{ salvata ? '✓ În casetă' : '+ Caseta mea' }}</span><span v-if="salvata" class="scoate" aria-hidden="true">Scoate din casetă</span></span>
      </button>
    </div>
    <span class="glare" aria-hidden="true" />
    <nav v-if="mare && similare.length" class="similare" aria-label="Fișe asemănătoare">
      <span class="k">Seamănă cu</span>
      <ul>
        <li v-for="s in similare" :key="s.id">
          <button type="button" @click="$emit('deschide', s)"><span class="an">{{ s.an_exact ? s.an : '≈' + s.an }}</span>{{ s.titlu }}</button>
        </li>
      </ul>
    </nav>
  </article>
</template>

<style scoped>
.fisa{--rx:0deg;--ry:0deg;--gx:0%;--gy:0%;position:relative;background:var(--card);color:var(--ink);padding:10px 10px 14px;width:min(300px,100%);
  box-shadow:0 18px 30px -18px rgba(0,0,0,.45);transform:perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));transition:transform .7s cubic-bezier(.33,1,.68,1),box-shadow .5s var(--ease-ff);will-change:transform}
.fisa.inclinat{transition:transform .18s ease-out,box-shadow .5s var(--ease-ff)}
.img{aspect-ratio:1;position:relative;overflow:hidden}
.foto{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.credit{font-size:11px;opacity:.75}
.credit a{color:inherit}
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
@media (max-width:799px){.mare .img:has(.embed){aspect-ratio:4/5}}
.embed{z-index:2;display:grid;place-content:center;justify-items:center;gap:8px;padding:16px;text-align:center}
.embed:has(iframe){display:block;padding:0;background:var(--card)}
.embed iframe{width:100%;height:100%;border:0;display:block}
.embed button{min-height:44px;font:600 13px var(--body);background:var(--card);color:var(--ink);border:0;border-radius:2px;cursor:pointer;padding:0 16px}
.embed small{font-family:var(--mono);font-size:11px;color:var(--card);max-width:28ch}
.sursa{font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:8px}
.act{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;border-top:1px dashed var(--line);padding-top:10px}
.act button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;min-width:44px;font:600 13px var(--body);background:var(--ink);color:var(--card);border:0;padding:0 14px;border-radius:2px;cursor:pointer;
  transition:transform .2s var(--ease-ff),opacity .2s var(--ease-ff)}
.act button.sec{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ink)}
.act button[aria-pressed="true"]{background:var(--signal);color:var(--on-signal);box-shadow:none}
.act button{position:relative}
.act button::before{content:"";position:absolute;inset:-3px}
.act button:active{transform:scale(.95)}
.act button:focus-visible{outline:2px solid var(--signal);outline-offset:2px}
.banda{flex:none}

/* Fișa deschisă din cronologie: mare, cu detalii. Pe ecran lat, poza stă în stânga și textul în dreapta. */
.mare{width:min(780px,100%);padding:12px 12px 16px}
.mare .img{aspect-ratio:4/3}
.mare h3{font-size:clamp(30px,8vw,40px);margin:8px 0 10px}
.mare p{font-size:16px;line-height:1.5}
.mare .sursa{font-size:11px}
.mare .stampila{right:auto;left:12px}
.detalii{margin:14px 0 0;border-top:1px dashed var(--line)}
.detalii div{display:grid;grid-template-columns:92px minmax(0,1fr);gap:8px;padding:7px 0;border-bottom:1px dashed var(--line)}
.detalii dt{font:400 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-top:2px}
.detalii dd{margin:0;font-size:14px;line-height:1.35;overflow-wrap:anywhere}
.cap{text-transform:capitalize}
.mare .act{border-top:0}
.inchide{position:absolute;z-index:4;top:18px;right:18px;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:2px;cursor:pointer;color:var(--ink);background:var(--card);box-shadow:0 0 0 1.5px var(--ink);transition:transform .15s var(--ease-ff)}
.inchide:active{transform:scale(.94)}
.inchide:focus-visible{outline:3px solid var(--signal);outline-offset:2px}
video.foto{cursor:pointer;background:#000}
.film-act{position:absolute;z-index:3;right:8px;bottom:8px;display:flex;gap:6px}
.film-act button{min-height:44px;min-width:44px;padding:0 12px;font:600 12px var(--body);color:var(--card);background:color-mix(in srgb,var(--ink) 78%,transparent);border:0;border-radius:2px;cursor:pointer}
.film-act button:focus-visible{outline:3px solid var(--signal);outline-offset:2px}
@media (min-width:800px){
  .mare{display:grid;grid-template-columns:400px minmax(0,1fr);column-gap:22px;align-content:start;padding:14px 22px 16px 14px}
  .mare>*{grid-column:2}
  .mare>.img{grid-column:1;grid-row:1/span 12;aspect-ratio:auto;min-height:400px;height:100%}
  .mare>.meta{margin-top:44px}
  .mare>.glare{grid-column:1/-1}
  .mare .inchide{top:10px;right:10px;box-shadow:none}
  .mare.fara-poza{display:block;padding:14px 22px 16px}
  .mare.fara-poza>.meta{margin-top:0}
}
/* Descrierea de sub televizor: mai scundă, ca să încapă sub ecran. */
.fara-poza{width:min(640px,100%)}
.fara-poza>.meta,.fara-poza h3{padding-right:52px}
.fara-poza h3{font-size:clamp(24px,6vw,32px)}
.fara-poza .detalii div{padding:5px 0}
.banda.lipit{animation:snap .45s var(--ease-ff) both}
@keyframes snap{0%{transform:translateY(-10px) rotate(-30deg) scale(1.5);opacity:0}60%{transform:translateY(1px) rotate(4deg) scale(.9);opacity:1}100%{transform:none}}
.etichete{display:inline-grid}
.etichete>*{grid-area:1/1;text-align:center}
.scoate{visibility:hidden}
.glare{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .4s var(--ease-ff);overflow:hidden}
.glare::before{content:"";position:absolute;left:-50%;top:-50%;width:200%;height:200%;background:radial-gradient(circle at center,rgba(255,255,255,.5),transparent 28%);
  transform:translate(var(--gx),var(--gy))}
@media (hover:hover) and (pointer:fine){
  .fisa:hover{box-shadow:0 28px 40px -20px rgba(0,0,0,.55)}
  .fisa:hover .glare{opacity:.5}
  .act button:hover{opacity:.88;transform:translateY(-1px)}
  .act button:active{transform:scale(.95)}
  /* Pe hover, butonul spune ce face al doilea click. */
  .caseta[aria-pressed="true"]:hover .eticheta-buton{opacity:0}
  .caseta[aria-pressed="true"]:hover .scoate{visibility:visible}
}
.dev .img::before{animation:chimic 3.2s var(--ease-ff) both}
.dev .img::after{animation:grain 3.2s ease-out both}
@keyframes chimic{0%{opacity:.96}45%{opacity:.6}100%{opacity:0}}
@keyframes grain{0%{opacity:.7}100%{opacity:.14}}
@media (prefers-reduced-motion:reduce){
  .fisa{transform:none!important;transition:none}
  .glare{display:none}
  .dev .img::before{animation:none;opacity:0}
  .dev .img::after,.stampila.nou,.banda.lipit{animation:none}
  .act button,.act button:hover,.act button:active,.inchide,.inchide:active{transition:none;transform:none}
}
.similare{grid-column:1/-1;display:grid;gap:8px;margin-top:14px;padding-top:12px;border-top:1px dashed var(--line)}
.similare ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.similare button{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:6px 12px;font:500 14px var(--body);text-align:left;
  color:var(--ink);background:transparent;border:1.5px solid var(--ink);border-radius:2px;cursor:pointer;transition:background .15s,color .15s,transform .15s}
.similare button:hover{background:var(--ink);color:var(--paper)}
.similare button:active{transform:scale(.97)}
.similare button:focus-visible{outline:3px solid var(--signal);outline-offset:2px}
.similare .an{font-family:var(--mono);font-size:12px;opacity:.7}
@media (prefers-reduced-motion: reduce){.similare button{transition:none}}
</style>
