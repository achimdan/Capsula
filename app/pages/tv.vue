<script setup lang="ts">
import { EMISIUNI, TIPURI_TV, type TipEmisiune } from '~/data/tv'
import { eticheteAni, filtreazaTv, grupeazaPeDecade } from '~/utils/tv'

useHead({ title: 'La TV' })
const tip = ref<TipEmisiune | null>(null)
const grupe = computed(() => grupeazaPeDecade(filtreazaTv(EMISIUNI, tip.value)))
</script>

<template>
  <main class="pagina">
    <section class="tv">
      <div class="k">Ce se vedea la televizor · 1990–2008</div>
      <h1 class="d1">La TV</h1>
      <div class="chips" role="group" aria-label="Filtrează după tip">
        <button class="chip" :aria-pressed="tip === null" @click="tip = null">Toate</button>
        <button v-for="t in TIPURI_TV" :key="t" class="chip" :aria-pressed="tip === t" @click="tip = t">{{ t }}</button>
      </div>
      <p v-if="!grupe.length" class="k">Nimic la categoria asta.</p>
      <section v-for="g in grupe" :key="g.decada" class="decada">
        <h2 class="k dec">{{ g.eticheta }}</h2>
        <ul class="lista">
          <li v-for="e in g.emisiuni" :key="e.id" class="card">
            <div class="cap">
              <h3 class="titlu">{{ e.titlu }}</h3>
              <span class="ani">{{ eticheteAni(e) }}</span>
            </div>
            <div class="k">{{ e.post }} · {{ e.tip }}</div>
            <p class="nota">{{ e.nota }}</p>
            <div class="jos">
              <a class="sursa" :href="e.url" target="_blank" rel="noopener noreferrer">{{ e.sursa }}</a>
              <span v-if="!e.verificat" class="neverificat">neverificat</span>
            </div>
          </li>
        </ul>
      </section>
    </section>
  </main>
</template>

<style scoped>
.tv{display:grid;gap:20px;min-width:0}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{min-height:44px;padding:0 16px;font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;
  background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:4px;cursor:pointer;transition:background .15s,color .15s}
.chip[aria-pressed="true"]{background:var(--ink);color:var(--card);border-color:var(--ink)}
.decada{display:grid;gap:12px}
.dec{margin:0;padding-bottom:6px;border-bottom:1px solid var(--line)}
.lista{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:16px;display:grid;gap:8px;align-content:start;min-width:0}
.cap{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
.titlu{margin:0;font-family:var(--display);font-size:20px;color:var(--ink);overflow-wrap:anywhere}
.ani{font-family:var(--mono);font-size:13px;color:var(--ink)}
.nota{margin:0;color:var(--ink);line-height:1.5}
.jos{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:4px}
.sursa{display:inline-flex;align-items:center;min-height:44px;font-family:var(--mono);font-size:12px;color:var(--muted);text-decoration:underline;overflow-wrap:anywhere}
.neverificat{font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);border:1px dashed var(--line);padding:2px 6px;border-radius:3px}
@media (prefers-reduced-motion:reduce){.chip{transition:none}}
</style>
