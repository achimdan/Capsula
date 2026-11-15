<script setup lang="ts">
import type { Fisa } from '~/data/fise'
const { areProfil, an15, randomHit } = useCapsula()
const banda = ref<{ deruleaza: (an: number) => Promise<void> }>()
const fisa = ref<Fisa | null>(null)
const ocupat = ref(false)
const cheie = ref(0)
async function hit() {
  if (ocupat.value) return
  ocupat.value = true
  const urm = randomHit(fisa.value?.id)
  await banda.value?.deruleaza(urm.an)
  fisa.value = urm; cheie.value++
  ocupat.value = false
}
onMounted(() => { if (!areProfil.value) navigateTo('/') })
</script>

<template>
  <main class="pagina">
    <section class="rh">
      <div class="k">Random Hit · ponderat pe anii tăi de 10–20</div>
      <h1 class="d1">Ce tare o fost</h1>
      <BandaAni ref="banda" :anul-meu="an15" />
      <div class="rand"><button class="btn" :disabled="ocupat" @click="hit">▶▶ {{ fisa ? 'Altul' : 'Random Hit' }}</button>
        <span class="k" aria-live="polite">{{ ocupat ? 'Se derulează…' : fisa ? fisa.an + ' · ' + fisa.titlu : 'Apasă și vezi unde se oprește banda' }}</span></div>
      <div class="scena"><FisaPolaroid v-if="fisa" :key="cheie" :fisa="fisa" developare /></div>
    </section>
  </main>
</template>

<style scoped>
.rh{display:grid;gap:20px}
.scena{display:grid;place-items:center;min-height:200px}
</style>
