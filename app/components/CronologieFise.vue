<script setup lang="ts">
// „Ce era peste tot” ca o bandă pe toată lățimea ecranului: anii pe orizontală, categoriile ca piste,
// fișele atârnate la anul lor. Banda trece pe sub un cap de citire fix, la mijloc; anul de sub el se vede
// în contorul mare și pe riglă. --signal marchează doar anul în care aveai 15 ani.
// Varianta se alege din /admin (site_settings).
import type { Fisa } from '~/data/fise'
import { anVecinCuFise, cateFise, indexDinScroll, varstaInAn, varstaScurta } from '~/utils/cronologie'

const props = defineProps<{ fise: Fisa[]; anEu: number }>()

const { caseta, amAvut } = useCapsula()

const ani = computed(() => {
  if (!props.fise.length) return []
  const anii = props.fise.map(f => f.an)
  const min = Math.min(...anii, props.anEu), max = Math.max(...anii, props.anEu)
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
})
// Pistele în ordinea profilului citit (categoriile preferate sus); fără profil, ordinea obișnuită.
const { ponderiCategorii, profilCititor } = useProfilCitit()
const piste = computed(() => ordineCategorii(ponderiCategorii.value, ORDINE_CATEGORII.filter(c => props.fise.some(f => f.categorie === c))))
const celule = computed(() => {
  const m = new Map<string, Fisa[]>()
  for (const f of props.fise) {
    const k = f.categorie + '|' + f.an
    m.set(k, [...(m.get(k) ?? []), f])
  }
  return m
})
const perAn = computed(() => {
  const m = new Map<number, number>()
  for (const f of props.fise) m.set(f.an, (m.get(f.an) ?? 0) + 1)
  return m
})
const aniCuFise = computed(() => [...perAn.value.keys()].sort((a, b) => a - b))
const indexEu = computed(() => Math.max(0, ani.value.indexOf(props.anEu)))
// Înclinare mică, stabilă pe fișă (aceeași la fiecare randare).
const rotire = (id: string) => ((Number(id.replace(/\D/g, '')) * 37) % 9 - 4) * 0.6 + 'deg'

// Anul de sub capul de citire.
const idx = ref(0)
const an = computed(() => ani.value[idx.value] ?? props.anEu)
const cifre = computed(() => String(an.value).split('').map(Number))
const inapoi = computed(() => anVecinCuFise(aniCuFise.value, an.value, -1))
const inainte = computed(() => anVecinCuFise(aniCuFise.value, an.value, 1))
const pasEtichete = computed(() => (ani.value.length > 36 ? 10 : 5))

const banda = ref<HTMLElement>()
const pe = ref<HTMLElement>()
const redus = () => matchMedia('(prefers-reduced-motion: reduce)').matches
// Lățimea exactă (poate fi fracționară pe mobil), ca anul să cadă fix sub capul de citire.
const latCol = () => banda.value?.querySelector<HTMLElement>('.an')?.getBoundingClientRect().width || 1
const laIndex = (i: number) => Math.min(ani.value.length - 1, Math.max(0, i))

// O singură animație de poziție odată (intrare sau inerție). Cât rulează, banda nu se prinde de ani („liber”).
let cadru = 0
// Anul spre care merge animația; fără el, săgețile apăsate repede ar porni toate din anul vechi.
let destinatie: number | null = null
const pozitie = () => destinatie ?? idx.value
function opreste() {
  cancelAnimationFrame(cadru)
  cadru = 0
  destinatie = null
  banda.value?.classList.remove('liber')
}
// Derularea lină o facem noi, nu browserul: scroll-ul nativ „smooth” se oprește la jumătatea drumului
// când banda se prinde obligatoriu de ani (mobil).
function mergi(i: number, lin = true) {
  const el = banda.value
  if (!el) return
  const spre = laIndex(i) * latCol()
  if (lin && !redus()) {
    anima(spre, Math.min(900, 320 + Math.abs(spre - el.scrollLeft) * 0.3))
    destinatie = laIndex(i)
    return
  }
  opreste()
  el.scrollLeft = spre
  idx.value = laIndex(i)
}
function mergiLaAn(a: number | null) {
  if (a !== null) mergi(ani.value.indexOf(a))
}
function anima(spre: number, ms: number) {
  const el = banda.value
  if (!el) return
  opreste()
  el.classList.add('liber')
  const de = el.scrollLeft, t0 = performance.now()
  const pas = (t: number) => {
    // Timpul cadrului poate fi puțin înaintea lui t0: fără limita de jos, banda ar da întâi înapoi.
    const p = Math.min(1, Math.max(0, (t - t0) / ms))
    el.scrollLeft = de + (spre - de) * (1 - Math.pow(1 - p, 4))
    if (p < 1) return void (cadru = requestAnimationFrame(pas))
    opreste()
    idx.value = indexDinScroll(spre, latCol(), ani.value.length)
  }
  cadru = requestAnimationFrame(pas)
}

// Fișele atârnă de un fir și se leagănă după viteza benzii. Fiecare are arcul ei (amplitudine, rigiditate,
// amortizare alese stabil din id), deci nu se mișcă două la fel. Calculăm doar coloanele de pe ecran.
type Arc = { el: HTMLElement; col: number; amp: number; k: number; d: number; x: number; v: number }
let arcuri: Arc[] | null = null
const zar = (n: number, sare: number) => { const x = Math.sin(n * sare) * 43758.5453; return x - Math.floor(x) }
function citesteArcuri(): Arc[] {
  return [...(pe.value?.querySelectorAll<HTMLElement>('.mini') ?? [])].map((el, i) => {
    const n = Number(el.dataset.id?.replace(/\D/g, '')) || i + 1
    return { el, col: Number(el.dataset.c), amp: 0.55 + zar(n, 12.9898) * 1.25, k: 0.045 + zar(n, 78.233) * 0.11, d: 0.8 + zar(n, 37.719) * 0.13, x: 0, v: 0 }
  })
}
let leagan = 0, ultim = 0
function bucla() {
  const el = banda.value
  if (!el || !pe.value) { leagan = 0; return }
  arcuri ??= citesteArcuri()
  const d = el.scrollLeft - ultim
  ultim = el.scrollLeft
  const tinta = Math.max(-1, Math.min(1, d / 45))
  const col = latCol(), margine = Math.ceil(el.clientWidth / 2 / col) + 1, mijloc = el.scrollLeft / col
  let viu = d !== 0
  for (const a of arcuri) {
    if (Math.abs(a.col - mijloc) > margine) {
      if (a.x !== 0) { a.x = a.v = 0; a.el.style.removeProperty('--inc') }
      continue
    }
    a.v = (a.v + (tinta * a.amp - a.x) * a.k) * a.d
    a.x += a.v
    if (Math.abs(a.x) < 0.003 && Math.abs(a.v) < 0.003 && tinta === 0) {
      if (a.x !== 0) { a.x = a.v = 0; a.el.style.removeProperty('--inc') }
      continue
    }
    viu = true
    a.el.style.setProperty('--inc', a.x.toFixed(3))
  }
  leagan = viu ? requestAnimationFrame(bucla) : 0
}
function laScroll() {
  const el = banda.value
  if (!el) return
  idx.value = indexDinScroll(el.scrollLeft, latCol(), ani.value.length)
  if (!leagan && !redus()) leagan = requestAnimationFrame(bucla)
}

// Mouse: tragi banda cu mâna, cu inerție la eliberare. Pe touch rămâne scroll-ul nativ.
let trag: { x: number; left: number; id: number; activ: boolean } | null = null
let vx = 0, tx = 0, xUlt = 0, aTras = false
function jos(e: PointerEvent) {
  // Orice atingere oprește derularea automată, ca să nu se bată cu degetul.
  opreste()
  if (e.pointerType !== 'mouse' || e.button !== 0 || !banda.value) return
  trag = { x: e.clientX, left: banda.value.scrollLeft, id: e.pointerId, activ: false }
  xUlt = e.clientX; tx = e.timeStamp; vx = 0
}
function misca(e: PointerEvent) {
  const el = banda.value
  if (!trag || !el) return
  const dx = e.clientX - trag.x
  if (!trag.activ) {
    if (Math.abs(dx) < 6) return
    trag.activ = true
    el.setPointerCapture(trag.id)
    el.classList.add('liber', 'trage')
  }
  el.scrollLeft = trag.left - dx
  const dt = e.timeStamp - tx
  if (dt > 0) vx = 0.7 * vx + 0.3 * ((xUlt - e.clientX) / dt)
  xUlt = e.clientX; tx = e.timeStamp
}
function sus(e: PointerEvent) {
  const t = trag, el = banda.value
  trag = null
  if (!t?.activ || !el) return
  // Click-ul care urmează după o tragere nu deschide fișa de sub cursor.
  aTras = true
  setTimeout(() => { aTras = false }, 0)
  el.classList.remove('trage')
  // Viteza plafonată (px/ms): o aruncare rapidă duce banda câțiva ani, nu zeci.
  const VMAX = 2.5
  let v = redus() || e.timeStamp - tx > 80 ? 0 : Math.max(-VMAX, Math.min(VMAX, vx))
  let tUlt = performance.now()
  const pas = (acum: number) => {
    const dt = Math.min(32, acum - tUlt)
    tUlt = acum
    el.scrollLeft += v * dt
    v *= Math.pow(0.995, dt)
    if (Math.abs(v) > 0.04) cadru = requestAnimationFrame(pas)
    else mergi(indexDinScroll(el.scrollLeft, latCol(), ani.value.length))
  }
  cadru = requestAnimationFrame(pas)
}
function laClick(e: MouseEvent) {
  if (!aTras) return
  e.stopPropagation()
  e.preventDefault()
}
function taste(e: KeyboardEvent) {
  if (e.target !== banda.value) return
  if (e.key === 'ArrowLeft') mergi(pozitie() - 1)
  else if (e.key === 'ArrowRight') mergi(pozitie() + 1)
  else return
  e.preventDefault()
}

// Rigla: un an pe liniuță, înaltă cât fișe are anul. Atingi sau tragi ca să derulezi.
let peRigla = false
function dinRigla(e: PointerEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  mergi(Math.floor(((e.clientX - r.left) / r.width) * ani.value.length), false)
}
function riglaJos(e: PointerEvent) {
  peRigla = true
  dinRigla(e)
  try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* pointer deja eliberat */ }
}
function riglaMisca(e: PointerEvent) { if (peRigla) dinRigla(e) }
function riglaSus() { peRigla = false }
function riglaTaste(e: KeyboardEvent) {
  const i = pozitie()
  const spre: Record<string, number> = {
    ArrowLeft: i - 1, ArrowDown: i - 1, ArrowRight: i + 1, ArrowUp: i + 1,
    PageDown: i - 5, PageUp: i + 5, Home: 0, End: ani.value.length - 1
  }
  const tinta = spre[e.key]
  if (tinta === undefined) return
  e.preventDefault()
  mergi(tinta)
}

// Banda pornește direct pe anul tău.
let ro: ResizeObserver | undefined
function aseaza() {
  const el = banda.value
  if (!el || !ani.value.length) return
  opreste()
  const i = indexEu.value
  el.scrollLeft = i * latCol()
  ultim = el.scrollLeft
  idx.value = i
}
onMounted(() => nextTick(() => {
  const el = banda.value
  if (!el) return
  aseaza()
  // Lățimea coloanei ține de ecran: la redimensionare păstrăm același an la mijloc.
  // Pupitrul se lipește sub antetul site-ului, deci îi trebuie înălțimea lui.
  ro = new ResizeObserver(() => {
    const antet = document.querySelector<HTMLElement>('header.antet')
    el.closest<HTMLElement>('.cron')?.style.setProperty('--antet', (antet?.offsetHeight ?? 0) + 'px')
    if (!cadru && !trag) el.scrollLeft = idx.value * latCol()
  })
  ro.observe(el)
}))
watch(() => [props.fise.length, props.anEu], () => { arcuri = null; nextTick(aseaza) })
onBeforeUnmount(() => {
  ro?.disconnect()
  cancelAnimationFrame(cadru)
  cancelAnimationFrame(leagan)
})

const selectata = ref<Fisa | null>(null)
// O fișă proprie ștearsă din fereastră dispare din listă: închidem fereastra.
watch(() => props.fise, (l) => { if (selectata.value && !l.some(f => f.id === selectata.value!.id)) selectata.value = null })
const deschis = computed({ get: () => !!selectata.value, set: (v) => { if (!v) selectata.value = null } })
</script>

<template>
  <section class="cron" aria-label="Cronologia fișelor pe ani">
    <div class="pupitru">
      <div class="anul-curent">
        <p class="contor-an">
          <span class="sr">Anul {{ an }}</span>
          <span v-for="(c, i) in cifre" :key="i" class="cifra" aria-hidden="true">
            <span class="loc">{{ c }}</span>
            <span class="sul" :style="{ transform: `translateY(${-c * 10}%)` }"><span v-for="d in 10" :key="d">{{ d - 1 }}</span></span>
          </span>
        </p>
        <p class="stare">
          <span class="varsta" :class="{ eu: an === anEu }">{{ varstaInAn(an, anEu) }}</span>
          <span class="k">{{ cateFise(perAn.get(an) ?? 0) }}</span>
        </p>
      </div>

      <div
        class="rigla"
        role="slider"
        tabindex="0"
        aria-label="Anul de pe bandă"
        :aria-valuemin="ani[0]"
        :aria-valuemax="ani[ani.length - 1]"
        :aria-valuenow="an"
        :aria-valuetext="`${an}, ${cateFise(perAn.get(an) ?? 0)}`"
        @pointerdown="riglaJos"
        @pointermove="riglaMisca"
        @pointerup="riglaSus"
        @pointercancel="riglaSus"
        @keydown="riglaTaste"
      >
        <span
          v-for="(a, i) in ani"
          :key="a"
          class="lin"
          :class="{ eu: a === anEu, acum: i === idx }"
          :style="{ '--h': Math.min(4, perAn.get(a) ?? 0) }"
        >
          <i />
          <b v-if="a % pasEtichete === 0">{{ a }}</b>
        </span>
      </div>

      <div class="taste">
        <button type="button" class="tasta" :disabled="inapoi === null" :aria-label="inapoi === null ? 'Niciun an cu fișe înainte' : `Înapoi la ${inapoi}`" @click="mergiLaAn(inapoi)">
          <UIcon name="i-lucide-chevron-left" />
        </button>
        <button type="button" class="tasta lat" :disabled="an === anEu" @click="mergi(indexEu)">Anul meu</button>
        <button type="button" class="tasta" :disabled="inainte === null" :aria-label="inainte === null ? 'Niciun an cu fișe după' : `Înainte la ${inainte}`" @click="mergiLaAn(inainte)">
          <UIcon name="i-lucide-chevron-right" />
        </button>
      </div>
    </div>

    <div class="ecran">
      <span class="cap" aria-hidden="true" />
      <div
        ref="banda"
        class="banda"
        role="group"
        aria-label="Banda cu fișe. Săgețile stânga și dreapta schimbă anul."
        tabindex="0"
        @scroll.passive="laScroll"
        @wheel.passive="opreste"
        @pointerdown="jos"
        @pointermove="misca"
        @pointerup="sus"
        @pointercancel="sus"
        @click.capture="laClick"
        @keydown="taste"
      >
        <div ref="pe" class="pe-ani" :style="{ '--n': ani.length }">
          <span class="sina" aria-hidden="true" />
          <span
            v-for="(a, i) in ani"
            :key="a"
            class="an"
            :class="{ eu: a === anEu, acum: i === idx }"
            :style="{ gridColumn: i + 2 }"
          >
            <span class="nr">{{ a }}</span>
            <span class="v">{{ a === anEu ? 'Aveai 15 ani' : varstaScurta(a, anEu) }}</span>
          </span>

          <template v-for="(p, t) in piste" :key="p">
            <div class="pista" :style="{ gridRow: 2 + t * 2 }"><span class="k">{{ p }}</span></div>
            <div
              v-for="(a, i) in ani"
              :key="a"
              class="celula"
              :class="{ eu: a === anEu, acum: i === idx }"
              :style="{ gridRow: 3 + t * 2, gridColumn: i + 2 }"
            >
              <button
                v-for="f in celule.get(p + '|' + a) ?? []"
                :key="f.id"
                type="button"
                class="mini"
                :data-id="f.id"
                :data-c="i"
                :style="{ '--r': rotire(f.id) }"
                :aria-label="`${f.titlu}, ${f.an}${f.an_exact ? '' : ' aproximativ'}`"
                @click="selectata = f"
              >
                <span class="img" :style="{ background: `linear-gradient(135deg, ${f.culori[0]}, ${f.culori[1]})` }">
                  <img v-if="f.poza" :src="`/fise/${f.id}-480.webp`" alt="" loading="lazy" decoding="async" width="480" height="480" draggable="false">
                  <span v-if="amAvut.includes(f.id)" class="avut">{{ f.categorie === 'Locuri' ? 'Am fost' : 'Am avut' }}</span>
                </span>
                <span class="titlu">{{ f.titlu }}</span>
                <span class="meta">{{ f.an }}{{ f.an_exact ? '' : ' ≈' }}<template v-if="caseta.includes(f.id)"> · în casetă</template><template v-if="eDinScena(f, profilCititor?.scena)"> · scena ta</template><template v-if="f.proprie"> · a ta</template></span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>

  <UModal
    v-model:open="deschis"
    :title="selectata?.titlu ?? ''"
    :description="selectata ? `${selectata.an} · ${selectata.categorie}` : ''"
    :ui="{ content: 'max-w-sm cron-modal', header: 'sr-only' }"
  >
    <template #body>
      <FisaPolaroid v-if="selectata" :fisa="selectata" />
    </template>
  </UModal>
</template>

<style scoped>
/* Iese din coloana paginii până la marginile ecranului. --gut aliniază pupitrul și numele pistelor cu restul paginii. */
.cron{container-type:inline-size;margin-inline:calc(50% - 50vw);margin-top:12px;
  --col:clamp(168px,14cqi,220px);--gol:calc(50cqi - var(--col) / 2);--gut:max(16px,calc(50cqi - 524px))}

/* Pupitrul: contorul anului, rigla și tastele. */
.pupitru{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:end;gap:20px 32px;padding:0 var(--gut) 18px}
.anul-curent{display:flex;align-items:flex-end;gap:16px;min-width:0}
/* Fiecare coloană e lată cât cifra pe care o arată (.loc, invizibilă), nu cât cea mai lată din rolă: altfel „1” stă într-o
   coloană de „0” și anul se citește „1 999”. Rola e centrată peste ea. */
.contor-an{margin:0;display:flex;font-family:var(--display);font-weight:800;font-size:clamp(72px,9cqi,128px);line-height:.82;font-variant-numeric:proportional-nums}
.cifra{position:relative;display:block;height:.82em;overflow:hidden}
.loc{display:block;visibility:hidden}
.sul{position:absolute;top:0;left:50%;width:1em;margin-left:-.5em;text-align:center;display:flex;flex-direction:column;transition:transform .6s var(--ease-ff)}
.sul span{height:.82em}
.cifra:nth-child(3) .sul{transition-delay:.03s}.cifra:nth-child(4) .sul{transition-delay:.06s}.cifra:nth-child(5) .sul{transition-delay:.09s}
.stare{margin:0;display:grid;gap:2px;padding-bottom:4px;min-width:0}
.varsta{font-family:var(--display);font-weight:800;font-size:22px;line-height:1;text-transform:uppercase}
.varsta.eu{color:var(--signal)}

.rigla{position:relative;display:flex;align-items:flex-end;height:64px;padding-bottom:18px;cursor:pointer;touch-action:pan-y;user-select:none;-webkit-user-select:none;min-width:0}
.rigla::before{content:"";position:absolute;left:0;right:0;bottom:18px;height:1px;background:var(--line)}
.lin{position:relative;flex:1;display:flex;justify-content:center;align-items:flex-end;height:100%;min-width:0}
.lin i{width:2px;height:calc(5px + var(--h) * 7px);background:var(--muted);opacity:.55;transform-origin:bottom;transition:transform .25s var(--ease-ff),opacity .2s,background-color .2s}
.lin b{position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);font:400 10px var(--mono);letter-spacing:.06em;color:var(--muted)}
.lin.eu i{background:var(--signal);opacity:1}
.lin.acum i{background:var(--ink);opacity:1;transform:scaleY(1.5) scaleX(2)}
.lin.acum.eu i{background:var(--signal)}
.rigla:hover .lin i{opacity:.8}
.rigla:hover .lin.eu i,.rigla:hover .lin.acum i{opacity:1}

.taste{display:flex;gap:6px}
.tasta{display:grid;place-items:center;min-width:44px;height:44px;font:800 18px var(--display);letter-spacing:.04em;text-transform:uppercase;color:var(--ink);background:transparent;border:0;border-radius:2px;box-shadow:inset 0 0 0 2px var(--ink);cursor:pointer;transition:transform .15s var(--ease-ff),background-color .15s,color .15s}
.tasta.lat{padding:0 14px}
.tasta :deep(svg),.tasta :deep(.iconify){width:22px;height:22px}
.tasta:hover:not(:disabled){background:var(--ink);color:var(--paper)}
.tasta:active:not(:disabled){transform:scale(.94)}
.tasta:disabled{opacity:.3;cursor:default}

/* Banda. */
.ecran{position:relative}
.cap{position:absolute;z-index:6;top:0;left:50%;width:0;height:0;margin-left:-9px;border:9px solid transparent;border-top:10px solid var(--paper);border-bottom:0;pointer-events:none}
.banda{overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scroll-snap-type:x proximity;scrollbar-width:none;cursor:grab;outline:none;-webkit-overflow-scrolling:touch}
.banda::-webkit-scrollbar{display:none}
.banda.liber{scroll-snap-type:none}
.banda.trage{cursor:grabbing;user-select:none;-webkit-user-select:none}
.banda.trage .mini{pointer-events:none}
.banda:focus-visible{outline:3px solid var(--signal);outline-offset:-3px}
.pe-ani{--inc:0;display:grid;grid-template-columns:var(--gol) repeat(var(--n),var(--col)) var(--gol);width:max-content;padding-bottom:20px}

.sina{grid-row:1;grid-column:1/-1;background:var(--ink)}
.an{grid-row:1;display:grid;gap:3px;align-content:end;padding:20px 12px 10px;color:var(--paper);scroll-snap-align:center;border-left:1px solid color-mix(in srgb,var(--paper) 15%,transparent)}
.nr{font-family:var(--display);font-weight:800;font-size:30px;line-height:1;opacity:.5;transform-origin:left bottom;transition:transform .35s var(--ease-ff),opacity .25s}
.v{font:400 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;min-height:1.4em;opacity:.5;transition:opacity .25s}
.an.acum .nr{opacity:1;transform:scale(1.3)}
.an.acum .v{opacity:.85}
.an.eu .nr,.an.eu .v{color:var(--signal);opacity:1}

.pista{grid-column:1/-1;padding-top:14px;border-top:1px dashed var(--line);pointer-events:none}
.pista:first-of-type{border-top:0}
.pista .k{position:sticky;left:var(--gut);display:inline-block;background:var(--paper);padding:2px 8px 2px 0}
.celula{border-left:1px solid var(--line);padding:22px 12px 16px;display:flex;flex-direction:column;gap:22px;min-height:56px;transition:background-color .3s}
.celula.acum{background:color-mix(in srgb,var(--ink) 5%,transparent)}
.celula.eu{background:color-mix(in srgb,var(--signal) 8%,transparent)}

.mini{position:relative;display:grid;gap:4px;text-align:left;font:inherit;color:var(--ink);background:var(--card);border:0;padding:6px 6px 8px;cursor:pointer;
  box-shadow:0 0 0 1px var(--line);transform-origin:50% -16px;transform:rotate(calc(var(--r) - var(--inc) * 8deg));transition:translate .2s var(--ease-ff),box-shadow .2s}
.mini::before{content:"";position:absolute;top:-16px;left:50%;width:1px;height:16px;background:var(--muted)}
.mini:hover{translate:0 -4px;box-shadow:0 0 0 1px var(--ink),0 10px 18px -12px color-mix(in srgb,var(--ink) 60%,transparent)}
.mini:active{translate:0 -1px}
.mini:focus-visible{outline:3px solid var(--signal);outline-offset:3px}
.img{position:relative;display:block;aspect-ratio:4/3;overflow:hidden}
.img img{width:100%;height:100%;object-fit:cover;display:block;-webkit-user-drag:none}
.avut{position:absolute;top:6px;right:6px;font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;background:var(--signal);color:#14211B;padding:1px 5px;border-radius:2px}
.titlu{font-family:var(--display);font-weight:800;font-size:17px;line-height:1;text-transform:uppercase}
.meta{font-family:var(--mono);font-size:11px;color:var(--muted)}

/* Coloanele de la margini stau puțin mai mici și mai șterse; cresc lin spre capul de citire.
   Progresul e pe coloană (--f), deci toate fișele dintr-un an se schimbă la fel. */
@property --f{syntax:"<number>";inherits:true;initial-value:1}
.mini{opacity:calc(.35 + .65 * var(--f));scale:calc(.93 + .07 * var(--f))}
@supports (animation-timeline:view()){
  @media (prefers-reduced-motion:no-preference){
    .celula{animation:focar linear both;animation-timeline:view(inline);animation-range:cover 0% cover 100%}
  }
}
@keyframes focar{
  0%,100%{--f:0}
  32%,68%{--f:1}
}

@media (min-width:1024px){
  .pupitru{position:sticky;top:var(--antet,0px);z-index:7;background:var(--paper);padding-top:12px}
}
@media (max-width:820px){
  .pupitru{grid-template-columns:minmax(0,1fr) auto;gap:14px 12px}
  .rigla{grid-column:1/-1;grid-row:2}
  .anul-curent{gap:12px}
}
@media (max-width:640px){
  .cron{--col:46cqi}
  .banda{scroll-snap-type:x mandatory}
  .contor-an{font-size:64px}
  .varsta{font-size:17px}
  .stare .k{font-size:11px}
  .nr{font-size:26px}
  .titlu{font-size:16px}
  .celula{padding:20px 8px 14px}
}
@media (max-width:400px){
  .anul-curent{flex-direction:column;align-items:flex-start;gap:6px}
  .tasta.lat{padding:0 10px;font-size:16px}
}
@media (prefers-reduced-motion:reduce){.mini:hover,.mini:active{translate:none}.an.acum .nr{transform:none}}
</style>
