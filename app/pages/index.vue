<script setup lang="ts">
import { progresPin, tintaSnap } from '~/utils/ecranTv'
import { anDeOprire, imparteProgres, pozitieAn, progresPentruAn } from '~/utils/caseta'
import { AN_MIN, AN_MAX, type Categorie } from '~/data/fise'
import { CASETE_RO } from '~/data/caseteRo'
const { areProfil, profil, an15, fiseVizibile, orasDeblocat, voturi } = useCapsula()
const { ton, profilCititor, ponderiCategorii } = useProfilCitit()
const linieTon = computed(() => (ton.value ? LINII_TON[ton.value] : ''))
// Categoriile și fișele în ordinea profilului citit: aceleași pentru toți, dar altfel așezate.
const categorii = computed<Categorie[]>(() => ordineCategorii(ponderiCategorii.value, ['Evenimente', 'Muzică', 'Filme & TV', 'Obiecte & Haine', 'Mâncare']))
const filtru = ref<Categorie | null>(null)
// Grila sau cronologia pe bandă: setare de site, aleasă din /admin.
const listaFise = useListaFise()
// Fișele proprii ale utilizatorului stau pe bandă lângă cele naționale (doar aici, nu și în joc sau Random Hit).
const { fise: fiseProprii } = useFiseProprii()
const nationale = computed(() => ordoneazaFise(
  [...fiseVizibile.value.filter(f => f.oras === null), ...fiseProprii.value].filter(f => !filtru.value || f.categorie === filtru.value),
  ponderiCategorii.value))
const locale = computed(() => fiseVizibile.value.filter(f => f.oras !== null).sort((a, b) => a.an - b.an))
const aVotat = computed(() => !!profil.value.oras && voturi.value.includes(profil.value.oras))
function voteaza() { if (profil.value.oras && !aVotat.value) voturi.value = [...voturi.value, profil.value.oras] }

// Headline: cuvinte care urcă din mască, apoi cifrele anului tău. Cifrele sunt mereu cele corecte;
// animația doar le ridică din mască, nu derulează prin alți ani.
// Intro fixat doar cu fundalul televizor și fără „mișcare redusă” (atunci televizorul stă direct pe loc).
const fundal = useStocare<string>('fundal', 'clasic')
const calm = ref(false)
onMounted(() => { calm.value = miscareRedusa() })
const cuPin = computed(() => import.meta.client && !calm.value && fundal.value.startsWith('televizor'))
// Cu fundalul „Casetă 3D”: anii stau pe o bandă orizontală. Scroll-ul în jos o derulează spre dreapta,
// iar rolele casetei din spate se învârt (components/CasetaScena). Cu mișcare redusă, banda se derulează cu mâna.
const esteCaseta = computed(() => fundal.value === 'caseta')
const cuCaseta = computed(() => import.meta.client && !calm.value && esteCaseta.value)
const aniBanda = computed(() => Array.from({ length: AN_MAX - AN_MIN + 1 }, (_, i) => {
  const an = AN_MIN + i
  const fise = fiseVizibile.value.filter(f => f.oras === null && f.an === an)
  return { an, numar: fise.length, titluri: fise.slice(0, 3).map(f => f.titlu), muzica: [...new Set(CASETE_RO.filter(c => c.an === an).map(c => c.artist))].join(' · ') }
}))
const anCurent = ref(0)
const pistaCaseta = ref<HTMLElement>()
let rafCaseta = 0
function deruleazaCaseta() {
  rafCaseta = 0
  const el = pistaCaseta.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const parti = imparteProgres(progresPin(r.top, r.height, innerHeight), r.height, innerHeight)
  const x = pozitieAn(parti.ani, aniBanda.value.length)
  el.style.setProperty('--cx', x.toFixed(4))
  el.style.setProperty('--ci', parti.intro.toFixed(3))
  const i = Math.round(x)
  if (i !== anCurent.value) anCurent.value = i
}
// Butoanele anilor duc pagina exact la anul ales.
function laAn(i: number) {
  const el = pistaCaseta.value
  if (!el) return
  const r = el.getBoundingClientRect()
  tinta = yPentruAn(r, progresPentruAn(i, aniBanda.value.length))
  scrollTo({ top: tinta, behavior: 'smooth' })
}
// Poziția paginii pentru un progres pe bandă (0..1), după ecranul de intro.
function yPentruAn(r: DOMRect, ani: number) {
  const drum = r.height - innerHeight
  const prag = imparteProgres(0, r.height, innerHeight).prag
  return Math.round(scrollY + r.top + (prag + ani * (1 - prag)) * drum)
}
// Snapping ca la MemoryQuest: când scroll-ul se oprește în mijlocul retragerii, pagina merge lin la capătul
// spre care derulai (în jos → conținutul, în sus → ecranul plin). Cât timp se așază, nu-l întrerupem cu alt snap.
const pista = ref<HTMLElement>()
let ceas: ReturnType<typeof setTimeout> | undefined
let ultimY = 0
let directie = 0
let tinta: number | null = null
function asazaPin() {
  if (pistaCaseta.value) return asazaCaseta()
  const el = pista.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const sus = scrollY + r.top
  const unde = tintaSnap(progresPin(r.top, r.height, innerHeight), directie)
  if (!unde) return
  tinta = Math.round(unde === 'sus' ? sus : sus + r.height - innerHeight)
  scrollTo({ top: tinta, behavior: 'smooth' })
}
// Pe bandă, pagina se oprește mereu pe un an întreg.
function asazaCaseta() {
  const el = pistaCaseta.value!
  const r = el.getBoundingClientRect()
  const p = progresPin(r.top, r.height, innerHeight)
  if (p <= 0.001 || p >= 0.999) return
  const parti = imparteProgres(p, r.height, innerHeight)
  const n = aniBanda.value.length
  // În intro: înapoi la caseta de aproape sau înainte, la primul an, după sensul derulării.
  const y = parti.intro < 1
    ? (tintaSnap(parti.intro, directie) === 'sus' ? Math.round(scrollY + r.top) : yPentruAn(r, 0))
    : yPentruAn(r, progresPentruAn(anDeOprire(parti.ani, n, directie), n))
  if (Math.abs(y - scrollY) < 2) return
  tinta = y
  scrollTo({ top: tinta, behavior: 'smooth' })
}
function laScroll() {
  if (pistaCaseta.value && !rafCaseta) rafCaseta = requestAnimationFrame(deruleazaCaseta)
  const y = scrollY
  if (tinta !== null) {
    // Am ajuns la țintă: gata. Altfel lăsăm animația să se termine; dacă omul o întrerupe, oprirea următoare decide din nou.
    if (Math.abs(y - tinta) < 2) { tinta = null; ultimY = y; return }
    // Omul trage în sens opus animației: preia el controlul.
    if (y !== ultimY && Math.sign(y - ultimY) !== Math.sign(tinta - ultimY)) {
      tinta = null
      directie = Math.sign(y - ultimY)
      // Unele browsere nu opresc singure scroll-ul lin când omul atinge ecranul; îl oprim noi pe loc.
      scrollTo({ top: y, behavior: 'instant' })
    }
  } else if (y !== ultimY) {
    directie = Math.sign(y - ultimY)
  }
  ultimY = y
  clearTimeout(ceas)
  ceas = setTimeout(() => { tinta = null; asazaPin() }, 160)
}
onMounted(() => { ultimY = scrollY; addEventListener('scroll', laScroll, { passive: true }); addEventListener('resize', laScroll, { passive: true }) })
onBeforeUnmount(() => { removeEventListener('scroll', laScroll); removeEventListener('resize', laScroll); clearTimeout(ceas); cancelAnimationFrame(rafCaseta) })
watch(cuCaseta, v => { if (v) nextTick(deruleazaCaseta) }, { flush: 'post' })

const cuvinte = ['Aveai', '15', 'ani', 'în']
const cifre = computed(() => String(an15.value).split('').map(Number))
const gata = ref(false)
if (import.meta.client) {
  watch(areProfil, (v) => {
    gata.value = false
    if (v) nextTick(() => requestAnimationFrame(() => requestAnimationFrame(() => { gata.value = true })))
  }, { immediate: true })
}

// Intrare eșalonată la scroll pentru polaroide (doar transform/opacity)
let io: IntersectionObserver | null = null
const vReveal = {
  mounted(el: HTMLElement, b: { value?: number }) {
    if (typeof IntersectionObserver === 'undefined' || miscareRedusa()) return
    io ??= new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { (e.target as HTMLElement).classList.add('in'); io?.unobserve(e.target) }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    el.style.setProperty('--r', String((b.value ?? 0) % 6))
    el.classList.add('rev')
    io.observe(el)
  },
  unmounted(el: HTMLElement) { io?.unobserve(el) },
}
onBeforeUnmount(() => { io?.disconnect(); io = null })
</script>

<template>
  <main class="pagina">
    <!-- Cu fundalul televizor: pornești din ecran, scena stă fixată și camera se retrage până se vede tot televizorul. -->
    <div v-if="cuPin" ref="pista" class="tv-pin" data-tv-pin>
      <div class="tv-pin-scena">
        <div class="tv-pin-titlu">
          <div class="d1">Capsula</div>
          <div class="k">Derulează ca să intri ↓</div>
        </div>
      </div>
    </div>
    <!-- Cu fundalul „Casetă 3D”: anii pe bandă. Pagina stă fixată cât derulezi prin toți anii, apoi merge mai departe. -->
    <div v-if="cuCaseta" ref="pistaCaseta" class="cs-pin" data-caseta-pin :style="{ '--n': aniBanda.length }">
      <div class="cs-scena">
        <div class="cs-intro">
          <div class="d1">Capsula</div>
          <div class="k">Derulează ca să pornești banda ↓</div>
        </div>
        <div class="cs-cap">
          <div class="k">Capsula · banda anilor</div>
          <div class="k cs-indemn" aria-hidden="true">Derulează ↓ ca să avansezi banda →</div>
        </div>
        <ol class="cs-banda" aria-label="Anii din capsulă">
          <li v-for="(a, i) in aniBanda" :key="a.an" class="cs-an" :class="{ acum: i === anCurent, tu: areProfil && a.an === an15 }">
            <button type="button" class="cs-an-b" :aria-current="i === anCurent ? 'true' : undefined" @click="laAn(i)">
              <span v-if="areProfil && a.an === an15" class="cs-tu">Ești aici · aveai 15 ani</span>
              <span class="cs-anul">{{ a.an }}</span>
              <span class="k">{{ a.numar === 1 ? '1 fișă' : `${a.numar} fișe` }}</span>
              <span v-for="t in a.titluri" :key="t" class="cs-titlu">{{ t }}</span>
              <span v-if="a.muzica" class="cs-muzica">Pe casetă: {{ a.muzica }}</span>
            </button>
          </li>
        </ol>
        <i class="cs-citire" aria-hidden="true" />
      </div>
    </div>
    <section v-else-if="esteCaseta && calm" class="sec">
      <div class="k">Capsula · banda anilor</div>
      <ol class="cs-lista" aria-label="Anii din capsulă">
        <li v-for="a in aniBanda" :key="a.an" class="cs-an" :class="{ tu: areProfil && a.an === an15 }">
          <div class="cs-an-b">
            <span v-if="areProfil && a.an === an15" class="cs-tu">Ești aici · aveai 15 ani</span>
            <span class="cs-anul">{{ a.an }}</span>
            <span class="k">{{ a.numar === 1 ? '1 fișă' : `${a.numar} fișe` }}</span>
            <span v-for="t in a.titluri" :key="t" class="cs-titlu">{{ t }}</span>
            <span v-if="a.muzica" class="cs-muzica">Pe casetă: {{ a.muzica }}</span>
          </div>
        </li>
      </ol>
    </section>
    <section v-if="!areProfil" class="erou">
      <div class="k">Capsula · arhiva anilor tăi</div>
      <h1 class="d1">Ceva din ’9x te așteaptă.</h1>
      <p class="lead">Răsfoiește liber. Dacă vrei, un test scurt îți arată anul în care aveai 15 ani.</p>
      <div class="rand">
        <NuxtLink to="/start" class="btn">Fă testul, e opțional</NuxtLink>
        <NuxtLink to="/random" class="btn ghost">▶▶ Random Hit</NuxtLink>
        <NuxtLink to="/game" class="btn ghost">Ghicește anul</NuxtLink>
      </div>
    </section>
    <section v-else class="erou" :class="{ gata }">
      <div class="k">Născut în {{ profil.anNastere }}<template v-if="profil.oras"> · {{ profil.oras }}</template><template v-if="profilCititor"> · {{ profilCititor.nume }}</template> · <NuxtLink to="/start" class="link">refă testul</NuxtLink></div>
      <h1 class="d1" :aria-label="`Aveai 15 ani în ${an15}`">
        <span v-for="(c, i) in cuvinte" :key="c" class="cuv" aria-hidden="true"><span class="cuv-i" :style="{ '--i': i }">{{ c }}</span>&nbsp;</span><span class="odo" aria-hidden="true"><span v-for="(d, col) in cifre" :key="col" class="col"><span class="cf" :style="{ '--c': col }">{{ d }}</span></span></span>
      </h1>
      <p v-if="linieTon" class="ton-linie" :data-ton="ton">{{ linieTon }}</p>
      <BandaAni :anul-meu="an15" interactiva />
      <div class="rand">
        <NuxtLink to="/random" class="btn">▶▶ Random Hit</NuxtLink>
        <NuxtLink to="/game" class="btn ghost">Ghicește anul</NuxtLink>
      </div>
    </section>

    <section class="sec">
      <div class="k">Capsula națională</div>
      <h2 class="d2">Ce era peste tot</h2>
      <p v-if="profilCititor" class="lead">{{ profilCititor.config.intro }}</p>
      <div class="chips">
        <button class="chip" :aria-pressed="filtru === null" @click="filtru = null">Toate</button>
        <button v-for="c in categorii" :key="c" class="chip" :aria-pressed="filtru === c" @click="filtru = c">{{ c }}</button>
      </div>
      <ClientOnly>
        <AnuarAni v-if="fundal === 'anuar'" :fise="nationale" :an-eu="areProfil ? an15 : null" />
        <CronologieFise v-else-if="listaFise === 'cronologie'" :fise="nationale" :an-eu="areProfil ? an15 : null" />
        <div v-else class="grila">
          <FisaPolaroid v-for="(f, i) in nationale" :key="f.id" v-reveal="i" :fisa="f" />
        </div>
        <template #fallback><div class="grila" /></template>
      </ClientOnly>
    </section>

    <ClientOnly><AmintiriTale :an-implicit="areProfil ? an15 : null" /></ClientOnly>

    <section v-if="profil.oras" class="sec">
      <div class="k">Stratul orașului</div>
      <template v-if="orasDeblocat">
        <h2 class="d2">{{ profil.oras }}, noaptea</h2>
        <p class="lead">Locurile vin din presa locală și din amintiri publicate. Datele exacte diferă de la o sursă la alta, așa că anii sunt aproximativi.</p>
        <div class="grila"><FisaPolaroid v-for="(f, i) in locale" :key="f.id" v-reveal="i" :fisa="f" /></div>
      </template>
      <div v-else class="card blocat">
        <h2 class="d2">{{ profil.oras }} încă nu e deblocat</h2>
        <p class="lead">Deblocăm orașele în ordinea voturilor. Votul tău se salvează deocamdată doar în browser; numărătoarea comună vine când conectăm baza de date.</p>
        <button class="btn" :disabled="aVotat" @click="voteaza">{{ aVotat ? '✓ Ai votat' : 'Votează ' + profil.oras }}</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.tv-pin{height:118vh;height:118svh}
.tv-pin-scena{position:sticky;top:0;height:100vh;height:100svh;display:grid;place-items:center;pointer-events:none}
.tv-pin-titlu{display:grid;gap:10px;justify-items:center;text-align:center;padding:18px 26px;border-radius:14px;
  background:rgb(0 0 0/.55);color:#F4F1FA;opacity:calc(1 - var(--tvp, 0) * 4);transform:scale(calc(1 - var(--tvp, 0) * .6))}
.tv-pin-titlu .k{color:#D9D4E6}
/* Banda anilor (fundal „Casetă 3D”): pista dă lungimea derulării, scena rămâne fixată. */
.cs-pin{height:calc(200svh + (var(--n) - 1) * 28svh);margin-inline:calc(50% - 50vw)}
/* Intro: titlul stă peste fereastra casetei, apoi dispare; banda de ani apare după ce camera s-a retras. */
.cs-intro{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:10px;text-align:center;pointer-events:none;
  color:#F4F1FA;text-shadow:0 2px 24px rgb(0 0 0/.8);opacity:calc(1 - var(--ci, 0) * 3);transform:scale(calc(1 + var(--ci, 0) * .4))}
.cs-intro .k{color:#E2DDEC}
.cs-cap,.cs-banda,.cs-citire{opacity:clamp(0,calc(var(--ci, 1) * 3 - 2),1)}
.cs-scena{position:sticky;top:0;height:100svh;overflow:hidden}
.cs-cap{position:absolute;left:0;right:0;top:calc(100svh * .02 + 64px);display:flex;justify-content:space-between;gap:12px;padding:0 max(16px,4vw)}
.cs-indemn{opacity:calc(1 - var(--cx, 0) * 2)}
.cs-banda{--w:clamp(230px,30vw,340px);position:absolute;left:0;top:56%;margin:0;padding:0;list-style:none;display:flex;
  transform:translate3d(calc(50vw - (var(--cx, 0) + .5) * var(--w)),0,0);will-change:transform}
.cs-banda .cs-an{width:var(--w);flex:none;padding:0 8px}
.cs-an-b{display:grid;gap:6px;align-content:start;width:100%;min-height:200px;padding:18px 18px 20px;text-align:left;font:inherit;color:inherit;
  background:color-mix(in srgb,var(--card) 82%,transparent);border:1px solid var(--line);border-radius:12px;cursor:pointer;
  transition:transform .35s var(--ease-ff),border-color .2s,opacity .35s;opacity:.55;transform:scale(.92)}
.cs-an-b:hover{border-color:var(--muted);opacity:.85}
.cs-an-b:active{transform:scale(.9)}
.cs-an-b:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
.acum .cs-an-b{opacity:1;transform:none;border-color:var(--muted)}
.tu .cs-an-b{border-color:var(--signal)}
.cs-anul{font-family:var(--display);font-weight:800;font-size:clamp(56px,7vw,84px);line-height:.85}
.cs-tu{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--signal)}
.cs-muzica{margin-top:4px;font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--ink);opacity:.8}
.cs-titlu{font-size:14px;line-height:1.35;color:var(--muted);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
/* Capul de citire: linia fină din dreptul anului curent */
.cs-citire{position:absolute;left:50%;top:calc(56% - 18px);width:1px;height:18px;background:var(--ink);opacity:.5}
/* Cu mișcare redusă: aceeași bandă, derulată cu mâna */
.cs-lista{display:flex;gap:12px;margin:0;padding:0 0 12px;list-style:none;overflow-x:auto;scroll-snap-type:x mandatory}
.cs-lista .cs-an{flex:none;width:min(72vw,280px);scroll-snap-align:start}
.cs-lista .cs-an-b{opacity:1;transform:none;cursor:auto}
@media (max-width:640px){.cs-banda{--w:74vw;top:52%}.cs-indemn{display:none}.cs-an-b{min-height:180px}}
.erou{display:grid;gap:20px}
/* Puțin mai mult loc între rânduri decât .d1: pe telefon „ÎN” cade pe rândul doi și căciula lui atingea rândul de sus. */
.erou h1{line-height:.96}
.sec{display:grid;gap:16px}
.grila{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px;justify-items:center;margin-top:8px}
.blocat{display:grid;gap:12px;justify-items:start}
.link{position:relative;background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer;letter-spacing:inherit;text-transform:inherit;transition:color .2s}
.link::after{content:"";position:absolute;inset:-14px -10px}
.link:hover{color:var(--signal)}
.ton-linie{margin:0;font-family:var(--mono);font-size:14px;letter-spacing:.04em;color:var(--muted);max-width:52ch}
.ton-linie[data-ton="ironic"]{font-style:italic}
.ton-linie[data-ton="documentar"]{text-transform:uppercase;font-size:12px;letter-spacing:.1em}
.link:active{opacity:.7}

/* Masca are loc și deasupra literelor: altfel căciula din „Î” (și orice diacritic de sus) e tăiată. */
.cuv{display:inline-block;overflow:hidden;vertical-align:top;padding:.2em 0 .06em;margin-top:-.2em}
.cuv-i{display:inline-block;transform:translateY(105%);opacity:0}
.odo{display:inline-flex;vertical-align:top;color:var(--accent)}
.col{position:relative;display:inline-block;height:.9em;overflow:hidden;line-height:.9}
.cf{display:block;height:.9em;line-height:.9;transform:translateY(105%)}
.gata .cuv-i{transform:none;opacity:1;transition:transform .8s var(--ease-ff) calc(var(--i) * 90ms),opacity .5s calc(var(--i) * 90ms)}
.gata .cf{transform:none;transition:transform .7s var(--ease-ff) calc(.35s + var(--c) * 90ms)}

:deep(.rev){opacity:0;transform:translateY(36px) rotate(-1.5deg)}
:deep(.rev.in){opacity:1;transform:none;transition:opacity .6s calc(var(--r) * 70ms),transform .8s var(--ease-ff) calc(var(--r) * 70ms)}

.rand .btn{transition:transform .2s var(--ease-ff),background-color .2s,color .2s;min-height:44px}
.rand .btn:hover{transform:translateY(-2px)}
.rand .btn:active{transform:translateY(1px) scale(.98)}

@media (prefers-reduced-motion:reduce){
  .cuv-i{transform:none;opacity:1}
  .cf{transform:none}
  .gata .cuv-i,.gata .cf{transition:none}
  :deep(.rev){opacity:1;transform:none}
  .rand .btn:hover,.rand .btn:active{transform:none}
}
</style>
