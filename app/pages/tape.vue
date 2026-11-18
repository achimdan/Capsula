<script setup lang="ts">
const { caseta, fise } = useCapsula()
const { autentificat } = useAuth()
const { cereCont } = useIntrare()
const salvate = computed(() => fise.value.filter(f => caseta.value.includes(f.id)).sort((a, b) => a.an - b.an))
</script>

<template>
  <main class="pagina">
    <section class="sec">
      <div class="k">Partea A · {{ salvate.length }} {{ salvate.length === 1 ? 'amintire' : 'amintiri' }}</div>
      <h1 class="d1">Caseta mea</h1>
      <p v-if="salvate.length" class="lead">Aici păstrezi ce vrei să revezi. „Am avut asta” e separat: bifează-l pe fișă doar dacă ai avut-o cu adevărat.</p>
      <div v-if="!autentificat && !salvate.length" class="card gol">
        <p class="lead">Ca să păstrezi caseta, intră cu Google. Până atunci, răsfoiești liber.</p>
        <button type="button" class="btn" @click="cereCont()">Intră cu Google</button>
      </div>
      <div v-else-if="!salvate.length" class="card gol">
        <p class="lead">Caseta e goală. Când o amintire te atinge, apasă „+ Caseta mea” pe fișă și o găsești aici.</p>
        <NuxtLink to="/random" class="btn">▶▶ Random Hit</NuxtLink>
      </div>
      <div v-else class="grila"><FisaPolaroid v-for="f in salvate" :key="f.id" :fisa="f" /></div>
    </section>
  </main>
</template>

<style scoped>
.sec{display:grid;gap:20px}
.gol{display:grid;gap:14px;justify-items:start}
.grila{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px;justify-items:center}
</style>
