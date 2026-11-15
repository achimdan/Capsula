<script setup lang="ts">
import type { Categorie } from '~/data/fise'
const { areProfil, profil, an15, fiseVizibile, orasDeblocat, voturi } = useCapsula()
const categorii: Categorie[] = ['Evenimente', 'Muzică', 'Filme & TV', 'Obiecte & Haine', 'Mâncare']
const filtru = ref<Categorie | null>(null)
const nationale = computed(() => fiseVizibile.value
  .filter(f => f.oras === null && (!filtru.value || f.categorie === filtru.value))
  .sort((a, b) => a.an - b.an))
const locale = computed(() => fiseVizibile.value.filter(f => f.oras !== null).sort((a, b) => a.an - b.an))
const aVotat = computed(() => !!profil.value.oras && voturi.value.includes(profil.value.oras))
function voteaza() { if (profil.value.oras && !aVotat.value) voturi.value = [...voturi.value, profil.value.oras] }
function schimbaProfil() { profil.value = { anNastere: null, oras: null } }

// Headline: cuvinte care urcă din mască + odometru care rulează anii până la anul tău
const cuvinte = ['Aveai', '15', 'ani', 'în']
const cifre = computed(() => String(an15.value).split('').map(Number))
const gata = ref(false)
// Poziția în stripul de 20 celule (0-9 de două ori): ultimele cifre fac o tură în plus
const tinta = (d: number, col: number) => (col >= 2 ? 10 + d : d)
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
    <Onboarding v-if="!areProfil" />
    <template v-else>
      <section class="erou" :class="{ gata }">
        <div class="k">Născut în {{ profil.anNastere }} · {{ profil.oras }} · <button class="link" @click="schimbaProfil">schimbă</button></div>
        <h1 class="d1" :aria-label="`Aveai 15 ani în ${an15}`">
          <span v-for="(c, i) in cuvinte" :key="c" class="cuv" aria-hidden="true"><span class="cuv-i" :style="{ '--i': i }">{{ c }}</span>&nbsp;</span><span class="odo" aria-hidden="true"><span v-for="(d, col) in cifre" :key="col" class="col"><span class="sz">{{ d }}</span><span class="strip" :style="{ '--t': tinta(d, col), '--c': col }"><span v-for="n in 20" :key="n" class="cf">{{ (n - 1) % 10 }}</span></span></span></span>
        </h1>
        <BandaAni :anul-meu="an15" interactiva />
        <div class="rand">
          <NuxtLink to="/random" class="btn">▶▶ Random Hit</NuxtLink>
          <NuxtLink to="/game" class="btn ghost">Ghicește anul</NuxtLink>
        </div>
      </section>

      <section class="sec">
        <div class="k">Capsula națională</div>
        <h2 class="d2">Ce era peste tot</h2>
        <div class="chips">
          <button class="chip" :aria-pressed="filtru === null" @click="filtru = null">Toate</button>
          <button v-for="c in categorii" :key="c" class="chip" :aria-pressed="filtru === c" @click="filtru = c">{{ c }}</button>
        </div>
        <div class="grila">
          <FisaPolaroid v-for="(f, i) in nationale" :key="f.id" v-reveal="i" :fisa="f" />
        </div>
      </section>

      <section class="sec">
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
    </template>
  </main>
</template>

<style scoped>
.erou{display:grid;gap:20px}
.sec{display:grid;gap:16px}
.grila{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px;justify-items:center;margin-top:8px}
.blocat{display:grid;gap:12px;justify-items:start}
.link{position:relative;background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer;letter-spacing:inherit;text-transform:inherit;transition:color .2s}
.link::after{content:"";position:absolute;inset:-14px -10px}
.link:hover{color:var(--signal)}
.link:active{opacity:.7}

.cuv{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.06em}
.cuv-i{display:inline-block;transform:translateY(105%);opacity:0}
.odo{display:inline-flex;vertical-align:top;color:var(--signal)}
.col{position:relative;display:inline-block;height:.9em;overflow:hidden;line-height:.9}
.sz{visibility:hidden}
.col .strip{position:absolute;inset:0 auto auto 50%;margin-left:-.5em;width:1em;text-align:center}
.strip{display:flex;flex-direction:column;transform:translateY(0);will-change:transform}
.cf{display:block;height:.9em;line-height:.9}
.gata .cuv-i{transform:none;opacity:1;transition:transform .8s var(--ease-ff) calc(var(--i) * 90ms),opacity .5s calc(var(--i) * 90ms)}
.gata .strip{transform:translateY(calc(var(--t) * -5%));transition:transform calc(1.1s + var(--c) * .3s) var(--ease-ff) .35s}

:deep(.rev){opacity:0;transform:translateY(36px) rotate(-1.5deg)}
:deep(.rev.in){opacity:1;transform:none;transition:opacity .6s calc(var(--r) * 70ms),transform .8s var(--ease-ff) calc(var(--r) * 70ms)}

.rand .btn{transition:transform .2s var(--ease-ff),background-color .2s,color .2s;min-height:44px}
.rand .btn:hover{transform:translateY(-2px)}
.rand .btn:active{transform:translateY(1px) scale(.98)}

@media (prefers-reduced-motion:reduce){
  .cuv-i{transform:none;opacity:1}
  .strip{transform:translateY(calc(var(--t) * -5%))}
  .gata .cuv-i,.gata .strip{transition:none}
  :deep(.rev){opacity:1;transform:none}
  .rand .btn:hover,.rand .btn:active{transform:none}
}
</style>
