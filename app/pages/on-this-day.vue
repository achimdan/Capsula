<script setup lang="ts">
import { ZILE } from '~/data/zile'
import { aniInUrma, celeMaiApropiate, celeMaiRecente, evenimenteAzi, peLuni } from '~/utils/zile'

useHead({ title: 'Azi, demult' })

// Data se calculează doar pe client, ca HTML-ul server să nu difere de cel din browser.
const azi = ref<Date | null>(null)
onMounted(() => { azi.value = new Date() })

const dataAzi = computed(() => azi.value?.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' }) ?? '')
const deAzi = computed(() => (azi.value ? evenimenteAzi(ZILE, azi.value) : []))
// Mereu mai mult decât ziua de azi: ce urmează, ce tocmai a trecut și tot calendarul.
const apropiate = computed(() => (azi.value ? celeMaiApropiate(ZILE, azi.value, 6) : []))
const recente = computed(() => (azi.value ? celeMaiRecente(ZILE, azi.value, 4) : []))
const calendar = peLuni(ZILE)
const LUNI = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
const lunaAzi = computed(() => (azi.value ? azi.value.getMonth() + 1 : 0))
function ziua(data: string) { return Number(data.slice(8, 10)) }
function anul(data: string) { return data.slice(0, 4) }

function acum(data: string) {
  const ani = aniInUrma(data, azi.value as Date)
  return ani === 1 ? 'acum 1 an' : `acum ${ani} ani`
}
function peste(n: number) {
  return n === 1 ? 'mâine' : `peste ${n} zile`
}
function inUrma(n: number) {
  return n === 1 ? 'ieri' : `acum ${n} zile`
}
function dataLunga(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <main class="pagina">
    <section class="ad">
      <div class="k">Azi, demult<template v-if="dataAzi"> · {{ dataAzi }}</template></div>
      <h1 class="d1">Azi, demult</h1>
      <p class="lead">Ce s-a întâmplat în ziua de azi, în anii 1989–2010. Fiecare intrare vine cu sursa ei.</p>

      <p v-if="!azi" class="gol" aria-live="polite">Se caută ziua de azi…</p>

      <template v-else>
        <ul v-if="deAzi.length" class="lista" aria-label="Evenimente de azi">
          <li v-for="e in deAzi" :key="e.id" class="intrare">
            <div class="ani">{{ acum(e.data) }}</div>
            <h2 class="titlu">{{ e.titlu }}</h2>
            <p class="nota">{{ e.nota }}</p>
            <div class="meta"><span>{{ dataLunga(e.data) }}</span><span>{{ e.categorie }}</span></div>
            <a class="sursa" :href="e.url" target="_blank" rel="noopener noreferrer">Sursa: {{ e.sursa }}</a>
          </li>
        </ul>

        <p v-else class="gol">Pentru {{ dataAzi }} nu avem nicio intrare. Uite ce urmează și ce tocmai a trecut.</p>

        <div class="k">În zilele următoare</div>
        <ul class="lista" aria-label="Evenimente din zilele următoare">
          <li v-for="a in apropiate" :key="a.zi.id" class="intrare">
            <div class="ani">{{ peste(a.peste) }}</div>
            <h2 class="titlu">{{ a.zi.titlu }}</h2>
            <p class="nota">{{ a.zi.nota }}</p>
            <div class="meta"><span>{{ dataLunga(a.zi.data) }}</span><span>{{ a.zi.categorie }}</span></div>
            <a class="sursa" :href="a.zi.url" target="_blank" rel="noopener noreferrer">Sursa: {{ a.zi.sursa }}</a>
          </li>
        </ul>

        <div class="k">Zilele trecute</div>
        <ul class="lista mici" aria-label="Evenimente din zilele trecute">
          <li v-for="a in recente" :key="a.zi.id" class="intrare">
            <div class="meta"><span>{{ inUrma(a.peste) }}</span><span>{{ dataLunga(a.zi.data) }}</span></div>
            <h2 class="titlu">{{ a.zi.titlu }}</h2>
            <p class="nota">{{ a.zi.nota }}</p>
            <a class="sursa" :href="a.zi.url" target="_blank" rel="noopener noreferrer">Sursa: {{ a.zi.sursa }}</a>
          </li>
        </ul>

        <details class="calendar">
          <summary>Tot calendarul · {{ ZILE.length }} de zile</summary>
          <section v-for="g in calendar" :key="g.luna" class="luna" :aria-label="LUNI[g.luna - 1]">
            <h2 class="k" :class="{ curenta: g.luna === lunaAzi }">{{ LUNI[g.luna - 1] }}</h2>
            <ul>
              <li v-for="z in g.zile" :key="z.id">
                <span class="zi">{{ ziua(z.data) }}</span>
                <a :href="z.url" target="_blank" rel="noopener noreferrer">{{ z.titlu }}</a>
                <span class="an">{{ anul(z.data) }}</span>
              </li>
            </ul>
          </section>
        </details>
      </template>
    </section>
  </main>
</template>

<style scoped>
.ad{display:grid;gap:20px;min-width:0}
.lista{list-style:none;margin:0;padding:0;display:grid;gap:14px;min-width:0}
.intrare{background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:16px;display:grid;gap:8px;min-width:0;box-shadow:0 4px 0 var(--line);animation:intra .35s var(--ease-ff) both}
.ani{font-family:var(--display);font-weight:800;font-size:28px;line-height:1;text-transform:uppercase;letter-spacing:.04em}
.titlu{margin:0;font-family:var(--display);font-weight:800;font-size:clamp(22px,6vw,30px);line-height:1.1;overflow-wrap:anywhere}
.nota{margin:0;line-height:1.5;overflow-wrap:anywhere}
.meta{display:flex;flex-wrap:wrap;gap:4px 14px;font-family:var(--mono);font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.sursa{display:inline-flex;align-items:center;min-height:44px;font-family:var(--mono);font-size:12px;color:var(--ink);text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere;transition:color .15s}
.sursa:hover{color:var(--muted)}
.gol{margin:0;color:var(--muted);font-family:var(--mono);font-size:13px;line-height:1.5}
.lista.mici .titlu{font-size:clamp(18px,5vw,22px)}
.calendar{border-top:2px solid var(--ink);padding-top:8px}
.calendar summary{min-height:44px;display:flex;align-items:center;cursor:pointer;font-family:var(--display);font-weight:800;font-size:22px;text-transform:uppercase}
.luna{margin-top:16px}
.luna .k{margin:0 0 6px}
.luna .curenta{color:var(--ink);text-decoration:underline;text-underline-offset:4px}
.luna ul{list-style:none;margin:0;padding:0;display:grid}
.luna li{display:grid;grid-template-columns:2.5ch 1fr auto;gap:10px;align-items:center;min-height:44px;border-bottom:1px solid var(--line);min-width:0}
.luna .zi{font-family:var(--display);font-weight:800;font-size:20px}
.luna a{color:var(--ink);overflow-wrap:anywhere;min-width:0}
.luna .an{font-family:var(--mono);font-size:12px;color:var(--muted)}
@keyframes intra{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.intrare{animation:none}.sursa{transition:none}}
</style>
