<script setup lang="ts">
import { curataIntrebarea } from '~/utils/cautare'

// Câmpul de căutare de pe prima pagină: duce la /search cu întrebarea în adresă.
const text = ref('')
async function cauta() {
  const q = curataIntrebarea(text.value)
  await navigateTo(q.length >= 2 ? { path: '/search', query: { q } } : '/search')
}
</script>

<template>
  <section class="sec cautare-rapida">
    <div class="k">Caută în capsulă</div>
    <form class="rand-cautare" role="search" @submit.prevent="cauta">
      <label for="cautare-rapida" class="sr-only">Caută în fișe</label>
      <input
        id="cautare-rapida" v-model="text" type="search" maxlength="200" autocomplete="off" enterkeyhint="search"
        placeholder="ex. eclipsa, casete, Cluj">
      <button type="submit" class="btn">Caută</button>
    </form>
  </section>
</template>

<style scoped>
.cautare-rapida{display:grid;gap:8px}
.rand-cautare{display:flex;gap:8px;max-width:720px;min-width:0}
.rand-cautare input{flex:1;min-width:0;min-height:52px;font-size:17px}
.rand-cautare input:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.rand-cautare .btn{min-height:52px;flex:none}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
</style>
