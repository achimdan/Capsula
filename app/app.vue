<script setup lang="ts">
// Textele Nuxt UI (Închide, Caută…) în română.
import { ro } from '@nuxt/ui/locale'

useFundal()
aplicaAccent()
const { autentificat } = useAuth()
// Starea de login vine din browser: fereastra de intrare apare abia după montare (fără mismatch la hidratare).
const montat = ref(false)
onMounted(() => { montat.value = true })
</script>

<template>
  <UApp :locale="ro">
    <ClientOnly><FundalCapsula /></ClientOnly>
    <AntetCapsula />
    <!-- Navigare liberă: paginile se văd fără cont; contul se cere doar la acțiunile care păstrează ceva. -->
    <NuxtPage />
    <ModalIntrare v-if="montat && !autentificat" />
  </UApp>
</template>
