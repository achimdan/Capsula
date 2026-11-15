<script setup lang="ts">
useFundal()
aplicaAccent()
const { autentificat } = useAuth()
const route = useRoute()
// Decizia depinde de localStorage: nu randăm nimic gated până la montare (fără mismatch la hidratare).
const montat = ref(false)
onMounted(() => { montat.value = true })
const publica = computed(() => ['/login', '/admin'].includes(route.path))
</script>

<template>
  <div>
    <ClientOnly><FundalCapsula /></ClientOnly>
    <AntetCapsula />
    <NuxtPage v-if="publica || autentificat" />
    <TeaserCapsula v-else-if="montat" />
  </div>
</template>
