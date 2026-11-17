<script setup lang="ts">
import { progresPin } from '~/utils/ecranTv'
import type { Categorie } from '~/data/fise'
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
onMounted(() => { calm.value = matchMedia('(prefers-reduced-motion:reduce)').matches })
const cuPin = computed(() => import.meta.client && !calm.value && fundal.value.startsWith('televizor'))
// Snapping ca la MemoryQuest: dacă scroll-ul se oprește în mijlocul retragerii, merge lin la capătul cel mai apropiat.
const pista = ref<HTMLElement>()
let ceas: ReturnType<typeof setTimeout> | undefined
let seAseaza = false
function asazaPin() {
  const el = pista.value
  if (!el || seAseaza) return
  const r = el.getBoundingClientRect()
  const p = progresPin(r.top, r.height, innerHeight)
  if (p <= 0.02 || p >= 0.98) return
  const sus = scrollY + r.top
  seAseaza = true
  scrollTo({ top: p < 0.35 ? sus : sus + r.height - innerHeight, behavior: 'smooth' })
  setTimeout(() => { seAseaza = false }, 700)
}
function laOprire() { clearTimeout(ceas); ceas = setTimeout(asazaPin, 140) }
onMounted(() => addEventListener('scroll', laOprire, { passive: true }))
onBeforeUnmount(() => { removeEventListener('scroll', laOprire); clearTimeout(ceas) })

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
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
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
        <CronologieFise v-if="listaFise === 'cronologie'" :fise="nationale" :an-eu="areProfil ? an15 : null" />
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
.tv-pin{height:170vh;height:170svh}
.tv-pin-scena{position:sticky;top:0;height:100vh;height:100svh;display:grid;place-items:center;pointer-events:none}
.tv-pin-titlu{display:grid;gap:10px;justify-items:center;text-align:center;padding:18px 26px;border-radius:14px;
  background:rgb(0 0 0/.55);color:#F4F1FA;opacity:calc(1 - var(--tvp, 0) * 4);transform:scale(calc(1 - var(--tvp, 0) * .6))}
.tv-pin-titlu .k{color:#D9D4E6}
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
