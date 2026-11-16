<script setup lang="ts">
import type { NuxtError } from '#app'

// Pagina de eroare a aplicației (în locul celei implicite, în engleză): un singur mesaj și drumul spre casă.
const props = defineProps<{ error: NuxtError }>()
const negasita = computed(() => props.error.statusCode === 404)
useHead({ title: negasita.value ? 'Pagina nu există · Capsula' : 'Eroare · Capsula' })
useFundal()
</script>

<template>
  <main class="pagina eroare">
    <span class="logo">Capsula</span>
    <p class="k">{{ negasita ? 'Eroare 404' : `Eroare ${error.statusCode}` }}</p>
    <h1 class="d1">{{ negasita ? 'Banda s-a rupt aici' : 'Ceva n-a mers' }}</h1>
    <p class="lead">{{ negasita ? 'Pagina asta nu există. Poate linkul e greșit sau a fost mutată.' : 'Am dat de o problemă la încărcare. Încearcă din nou în câteva clipe.' }}</p>
    <div class="rand">
      <a href="/" class="btn" @click.prevent="clearError({ redirect: '/' })">Înapoi la Capsula</a>
    </div>
  </main>
</template>

<style scoped>
.eroare{gap:20px;align-content:start;min-height:100svh}
.logo{font-family:var(--display);font-weight:800;font-size:28px;text-transform:uppercase;letter-spacing:.02em;margin-bottom:24px}
.btn{min-height:44px}
</style>
