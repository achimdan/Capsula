<script setup lang="ts">
useFundal()
aplicaAccent()
const { autentificat } = useAuth()
const route = useRoute()
// Decizia depinde de starea din browser (sesiune, profil local): nu randăm nimic gated până la montare (fără mismatch la hidratare).
const montat = ref(false)
onMounted(() => { montat.value = true })
const publica = computed(() => ['/login', '/confirm', '/admin'].includes(route.path))
</script>

<template>
  <UApp>
    <ClientOnly><FundalCapsula /></ClientOnly>
    <AntetCapsula />
    <NuxtPage v-if="publica || autentificat" />
    <TeaserCapsula v-else-if="montat" />
  </UApp>
</template>
