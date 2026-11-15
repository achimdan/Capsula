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
</script>

<template>
  <main class="pagina">
    <Onboarding v-if="!areProfil" />
    <template v-else>
      <section class="erou">
        <div class="k">Născut în {{ profil.anNastere }} · {{ profil.oras }} · <button class="link" @click="schimbaProfil">schimbă</button></div>
        <h1 class="d1">Aveai 15 ani în {{ an15 }}</h1>
        <BandaAni :anul-meu="an15" />
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
          <FisaPolaroid v-for="f in nationale" :key="f.id" :fisa="f" />
        </div>
      </section>

      <section class="sec">
        <div class="k">Stratul orașului</div>
        <template v-if="orasDeblocat">
          <h2 class="d2">{{ profil.oras }}, noaptea</h2>
          <p class="lead">Locurile vin din presa locală și din amintiri publicate. Datele exacte diferă de la o sursă la alta, așa că anii sunt aproximativi.</p>
          <div class="grila"><FisaPolaroid v-for="f in locale" :key="f.id" :fisa="f" /></div>
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
.link{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer;letter-spacing:inherit;text-transform:inherit}
</style>
