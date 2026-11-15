<script setup lang="ts">
import { ORASE } from '~/data/fise'
const { profil } = useCapsula()
const an = ref<number | null>(null)
const oras = ref('')
const eroare = ref('')
function gata() {
  if (!an.value || an.value < 1975 || an.value > 1996) { eroare.value = 'Scrie un an între 1975 și 1996. Capsula acoperă anii 1990–2008.'; return }
  if (!oras.value) { eroare.value = 'Alege orașul în care ai crescut.'; return }
  profil.value = { anNastere: an.value, oras: oras.value }
}
</script>

<template>
  <section class="onb">
    <span class="contor">0 0 0 0</span>
    <h1 class="d1">Derulează până la tine</h1>
    <p class="lead">Două întrebări și îți construim capsula: ce ascultai, ce purtai și ce era la TV când aveai 15 ani.</p>
    <form class="card form" @submit.prevent="gata">
      <div><label class="k" for="an">Anul nașterii</label><input id="an" v-model.number="an" type="number" inputmode="numeric" placeholder="ex. 1984" min="1975" max="1996"></div>
      <div><label class="k" for="oras">Orașul în care ai crescut</label>
        <select id="oras" v-model="oras"><option value="" disabled>Alege</option><option v-for="o in ORASE" :key="o">{{ o }}</option></select></div>
      <p v-if="eroare" class="err" role="alert">{{ eroare }}</p>
      <button class="btn" type="submit">▶ Pornește capsula</button>
      <p class="k">Datele rămân doar în browserul tău.</p>
    </form>
  </section>
</template>

<style scoped>
.onb{display:grid;gap:20px;max-width:640px}
.form{display:grid;gap:16px}
.err{color:var(--signal);margin:0;font-weight:500}
</style>
