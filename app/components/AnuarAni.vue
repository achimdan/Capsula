<script setup lang="ts">
// „Ce era peste tot” cu fundalul „Anuar”: anii pe verticală, ca un catalog de muzeu.
// În stânga stă fix anul uriaș (cifrele se rotesc ca un contor când treci la alt capitol) și rigla anilor;
// în dreapta curg capitolele: o fișă mare de deschidere, apoi restul anului, așezate în trepte.
// --signal marchează doar anul în care aveai 15 ani. Fără scroll-jacking: derularea e a vizitatorului.
import type { Fisa } from '~/data/fise'
import { aniRigla, capitolActiv, capitoleAnuar } from '~/utils/anuar'
import { cateFise, varstaInAn } from '~/utils/cronologie'

const props = defineProps<{ fise: Fisa[]; anEu: number | null }>()

const capitole = computed(() => capitoleAnuar(props.fise))
const rigla = computed(() => aniRigla(capitole.value, props.anEu))
const idx = ref(0)
const activ = computed(() => capitole.value[idx.value] ?? capitole.value[0])
const an = computed(() => activ.value?.an ?? props.anEu ?? 1990)
const cifre = computed(() => String(an.value).split('').map(Number))
const numar = computed(() => activ.value ? 1 + activ.value.rest.length : 0)

// Capitolul activ: cel care a trecut de mijlocul ecranului.
const lista = ref<HTMLElement>()
let raf = 0
function citeste() {
  raf = 0
  const el = lista.value
  if (!el) return
  const tops = [...el.querySelectorAll<HTMLElement>('.capitol')].map(c => c.getBoundingClientRect().top)
  const i = capitolActiv(tops, innerHeight * 0.5)
  if (i !== idx.value) idx.value = i
}
const laScroll = () => { if (!raf) raf = requestAnimationFrame(citeste) }
onMounted(() => { addEventListener('scroll', laScroll, { passive: true }); addEventListener('resize', laScroll, { passive: true }); citeste() })
onBeforeUnmount(() => { removeEventListener('scroll', laScroll); removeEventListener('resize', laScroll); cancelAnimationFrame(raf) })
watch(() => props.fise, () => nextTick(citeste))

function laAn(a: number) {
  const tinta = document.getElementById(`anuar-${a}`)
  tinta?.scrollIntoView({ behavior: miscareRedusa() ? 'auto' : 'smooth', block: 'start' })
}

// Fișa deschisă: aceeași fereastră ca în cronologie.
const selectata = ref<Fisa | null>(null)
const deschis = computed({ get: () => !!selectata.value, set: (v) => { if (!v) selectata.value = null } })
watch(() => props.fise, (l) => { if (selectata.value && !l.some(f => f.id === selectata.value!.id)) selectata.value = null })

const srcset = (f: Fisa) => srcsetPoza(f)
// Câmpul de culoare al fișelor fără poză: textul ia a doua culoare doar dacă se citește pe prima, altfel negru sau alb.
function luminanta(hex: string) {
  const v = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
const contrast = (a: string, b: string) => { const [x, y] = [luminanta(a), luminanta(b)].sort((m, n) => n - m); return (x! + 0.05) / (y! + 0.05) }
const camp = (f: Fisa) => {
  const [fond, text] = f.culori
  return { background: fond, color: contrast(fond, text) >= 3 ? text : (luminanta(fond) > 0.18 ? '#121212' : '#FFFFFF') }
}
const loc = (f: Fisa) => [f.categorie, f.oras].filter(Boolean).join(' · ')
</script>

<template>
  <section class="anuar" aria-label="Fișele pe ani">
    <div class="interior">
      <aside class="fix">
        <nav class="rigla" aria-label="Sari la un an">
          <button
            v-for="r in rigla"
            :key="r.an"
            type="button"
            class="treapta"
            :class="{ acum: r.an === an, eu: anEu !== null && r.an === anEu, gol: !r.numar }"
            :disabled="!r.numar"
            :aria-current="r.an === an ? 'true' : undefined"
            :aria-label="r.numar ? `${r.an}, ${cateFise(r.numar)}` : `${r.an}, fără fișe`"
            @click="laAn(r.an)"
          >
            <span class="treapta-an">{{ r.an }}</span>
            <i class="treapta-bara" :style="{ '--n': Math.min(10, r.numar) }" />
          </button>
        </nav>
        <div class="titlu-an">
          <p class="an-mare">
            <span class="sr">Anul {{ an }}</span>
            <span v-for="(c, i) in cifre" :key="i" class="cifra" aria-hidden="true">
              <span class="loc">{{ c }}</span>
              <span class="sul" :style="{ transform: `translateY(${-c * 10}%)` }"><span v-for="d in 10" :key="d">{{ d - 1 }}</span></span>
            </span>
          </p>
          <p class="stare">
            <span v-if="anEu !== null && an === anEu" class="aici">Ești aici · aveai 15 ani</span>
            <span v-else-if="anEu !== null" class="varsta">{{ varstaInAn(an, anEu) }}</span>
            <span class="numar">{{ cateFise(numar) }}</span>
          </p>
        </div>
      </aside>

      <div ref="lista" class="capitole">
        <article v-for="c in capitole" :id="`anuar-${c.an}`" :key="c.an" class="capitol" :class="{ eu: anEu !== null && c.an === anEu }">
          <h3 class="cap-an">{{ c.an }}<span class="cap-numar"><span class="sr">, </span>{{ cateFise(1 + c.rest.length) }}</span></h3>
          <button type="button" class="deschidere" :aria-label="`Deschide fișa ${c.deschidere.titlu}`" @click="selectata = c.deschidere">
            <span class="cadru">
              <img
                v-if="c.deschidere.poza"
                :src="srcPoza(c.deschidere, 960)"
                :srcset="srcset(c.deschidere)"
                sizes="(max-width: 900px) 92vw, 640px"
                alt=""
                width="960"
                height="960"
                loading="lazy"
                decoding="async"
              >
              <span v-else class="camp" :style="camp(c.deschidere)">{{ c.deschidere.titlu }}</span>
            </span>
            <span class="text">
              <span class="loc-f">{{ loc(c.deschidere) }}</span>
              <span class="nume">{{ c.deschidere.titlu }}</span>
              <span class="nota">{{ c.deschidere.nota }}</span>
            </span>
          </button>
          <ul v-if="c.rest.length" class="rest">
            <li v-for="f in c.rest" :key="f.id">
              <button type="button" class="mica" :aria-label="`Deschide fișa ${f.titlu}`" @click="selectata = f">
                <span class="cadru">
                  <img v-if="f.poza" :src="srcPoza(f, 480)" :srcset="srcset(f)" sizes="(max-width: 900px) 46vw, 300px" alt="" width="480" height="480" loading="lazy" decoding="async">
                  <span v-else class="camp" :style="camp(f)">{{ f.titlu }}</span>
                </span>
                <span class="loc-f">{{ loc(f) }}</span>
                <span class="nume">{{ f.titlu }}</span>
              </button>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>

  <UModal
    v-model:open="deschis"
    :title="selectata?.titlu ?? ''"
    :description="selectata ? `${selectata.an} · ${selectata.categorie}` : ''"
    :ui="{ overlay: 'fisa-voal bg-[#121212]/80', content: 'max-w-[812px] fisa-modal bg-transparent ring-0 shadow-none divide-y-0', header: 'sr-only', body: 'p-2 sm:p-4 flex justify-center [scrollbar-width:none]' }"
  >
    <template #body>
      <FisaPolaroid v-if="selectata" :fisa="selectata" mare @inchide="selectata = null" @deschide="f => selectata = f" />
    </template>
  </UModal>
</template>

<style scoped>
/* Iese din coloana paginii până la marginile ecranului, cu aceleași margini pe ambele părți. */
.anuar{margin-inline:calc(50% - 50vw);margin-top:24px;--antet:68px;--gut:max(16px,calc(50vw - 640px))}
.interior{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:0 clamp(32px,4vw,72px);padding-inline:var(--gut)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* Stânga: rigla și anul, fixe cât derulezi capitolele. */
.fix{position:sticky;top:var(--antet);height:calc(100svh - var(--antet));display:flex;align-items:center;gap:clamp(16px,2vw,32px)}
.rigla{display:flex;flex-direction:column;gap:2px}
.treapta{display:grid;grid-template-columns:44px 64px;align-items:center;gap:10px;padding:3px 0;background:none;border:0;cursor:pointer;color:var(--muted);font:500 13px/1 var(--body);font-variant-numeric:tabular-nums;text-align:left}
.treapta-bara{display:block;height:4px;width:calc(var(--n) * 10%);min-width:2px;background:currentColor;opacity:.45;transform-origin:left;transition:transform .4s var(--ease-ff),opacity .2s}
.treapta:hover:not(:disabled){color:var(--ink)}
.treapta:hover:not(:disabled) .treapta-bara{opacity:1}
.treapta:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.treapta.gol{cursor:default;opacity:.4}
.treapta.acum{color:var(--ink);font-weight:700}
.treapta.acum .treapta-bara{opacity:1;transform:scaleX(1.25)}
.treapta.eu .treapta-an{color:var(--signal);font-weight:700}

.titlu-an{min-width:0}
.an-mare{display:flex;margin:0;font-family:var(--display);font-weight:800;line-height:.82;letter-spacing:-.02em;font-size:clamp(150px,21vw,340px);color:var(--ink)}
.cifra{position:relative;display:block;height:.82em;overflow:hidden}
.loc{display:block;visibility:hidden}
.sul{position:absolute;top:0;left:50%;width:1em;margin-left:-.5em;text-align:center;display:flex;flex-direction:column;transition:transform .7s var(--ease-ff)}
.sul span{height:.82em}
.cifra:nth-child(3) .sul{transition-delay:.04s}.cifra:nth-child(4) .sul{transition-delay:.08s}.cifra:nth-child(5) .sul{transition-delay:.12s}
.stare{display:flex;flex-wrap:wrap;gap:6px 16px;margin:20px 0 0;font-size:18px;color:var(--ink)}
.aici{color:var(--signal);font-weight:700}
.numar{color:var(--muted)}

/* Dreapta: capitolele. */
.capitole{padding-block:12svh 20svh}
.capitol{padding-bottom:clamp(120px,22svh,240px);scroll-margin-top:calc(var(--antet) + 24px)}
.cap-an{margin:0 0 16px;font:500 15px var(--body);color:var(--muted);font-variant-numeric:tabular-nums}
.capitol.eu .cap-an{color:var(--signal);font-weight:700}
.cap-numar::before{content:" · "}
button.deschidere,button.mica{display:block;width:100%;padding:0;background:none;border:0;text-align:left;color:inherit;cursor:pointer}
.deschidere:focus-visible,.mica:focus-visible{outline:3px solid var(--ink);outline-offset:6px}
.cadru{display:block;position:relative;overflow:hidden;aspect-ratio:1;background:var(--card)}
.cadru img{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.04);transition:transform .9s var(--ease-ff)}
.deschidere:hover .cadru img,.mica:hover .cadru img{transform:scale(1.08)}
.camp{display:flex;align-items:flex-end;width:100%;height:100%;padding:clamp(16px,4%,32px);font-family:var(--display);font-weight:800;text-transform:uppercase;line-height:.9;letter-spacing:-.01em;font-size:clamp(32px,5vw,72px);text-wrap:balance}
.mica .camp{font-size:clamp(22px,2.6vw,36px)}
.text{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin-top:20px;max-width:60ch}
.loc-f{display:block;font-size:14px;color:var(--muted)}
.deschidere .nume{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:clamp(34px,4vw,56px);line-height:.92;letter-spacing:-.01em;text-wrap:balance}
.nota{font-size:18px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.deschidere:hover .nume,.mica:hover .nume{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:6px}

/* Restul anului, în trepte: coloana a doua coboară, ca într-un catalog. */
.rest{list-style:none;margin:clamp(56px,9svh,112px) 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(40px,6svh,72px) clamp(20px,3vw,40px)}
.rest li:nth-child(even){margin-top:clamp(48px,12svh,140px)}
.rest li:nth-child(3n){grid-column:1 / span 1}
.mica .loc-f{margin-top:14px}
.mica .nume{display:block;margin-top:4px;font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:clamp(22px,2vw,28px);line-height:.95;text-wrap:balance}

/* Intrarea legată de scroll: o cortină de hârtie se strânge în sus, deci poza se descoperă de jos, iar imaginea alunecă în cadru (doar unde browserul o știe). */
@supports (animation-timeline:view()){
  @media (prefers-reduced-motion:no-preference){
    :global(html:not(.lite) .anuar .cadru){view-timeline-name:--cadru}
    :global(html:not(.lite) .anuar .cadru::after){content:"";position:absolute;inset:0;z-index:1;background:var(--paper);transform-origin:top;animation:anuar-dezvelire linear both;animation-timeline:--cadru;animation-range:entry 5% cover 45%}
    :global(html:not(.lite) .anuar .cadru img){animation:anuar-paralaxa linear both;animation-timeline:view()}
    :global(html:not(.lite) .anuar .text),:global(html:not(.lite) .anuar .mica .nume){animation:anuar-urca linear both;animation-timeline:view();animation-range:entry 10% entry 80%}
  }
}
@keyframes anuar-dezvelire{from{transform:scaleY(1)}to{transform:scaleY(0)}}
@keyframes anuar-paralaxa{from{translate:0 -5%}to{translate:0 5%}}
@keyframes anuar-urca{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}

@media (prefers-reduced-motion:reduce){.sul,.cadru img,.treapta-bara{transition:none}}
:global(html.lite .anuar .sul),:global(html.lite .anuar .cadru img){transition:none}

/* Telefon și tabletă: fără coloană fixă (sticky doar pe ecrane mari). Rigla devine un șir orizontal sus,
   iar fiecare capitol își poartă anul mare ca titlu. */
@media (max-width:900px){
  .interior{grid-template-columns:minmax(0,1fr)}
  .fix{position:static;height:auto;display:block}
  .titlu-an{display:none}
  .rigla{flex-direction:row;overflow-x:auto;scrollbar-width:none;gap:0;margin-inline:calc(-1 * var(--gut));padding-inline:var(--gut)}
  .treapta{grid-template-columns:auto;justify-items:start;gap:4px;padding:8px 12px 6px 0;min-height:44px;align-content:end}
  .treapta-bara{width:calc(var(--n) * 3px)}
  .treapta.acum{color:var(--muted);font-weight:500}
  .treapta.acum .treapta-bara{transform:none;opacity:.45}
  .capitole{padding-block:40px 64px}
  .capitol{padding-bottom:96px;scroll-margin-top:calc(var(--antet) + 16px)}
  .cap-an{margin-bottom:12px;font-family:var(--display);font-weight:800;font-size:clamp(96px,31vw,150px);line-height:.85;letter-spacing:-.02em;color:var(--ink)}
  .cap-numar::before{content:none}
  .cap-an span{display:block;margin-top:8px;font:500 15px var(--body);letter-spacing:0;color:var(--muted)}
  .capitol.eu .cap-an::after{content:"Ești aici · aveai 15 ani";display:block;margin-top:6px;font:700 15px var(--body);letter-spacing:0;color:var(--signal)}
  .text{margin-top:16px}
  .rest{gap:32px 16px;margin-top:48px}
  .rest li:nth-child(even){margin-top:56px}
}
</style>
