<script setup lang="ts">
// Textele Nuxt UI (Închide, Caută…) în română.
import { ro } from '@nuxt/ui/locale'

useFundal()
aplicaAccent()
const { autentificat } = useAuth()
// currentRoute din router, nu useRoute(): în app.vue, useRoute() se actualizează abia după ce pagina nouă
// se randează, iar când <NuxtPage> e ascuns (teaser) asta nu se întâmplă: URL-ul se schimba, ecranul nu.
const route = useRouter().currentRoute
// Decizia depinde de starea din browser (sesiune, profil local): nu randăm nimic gated până la montare (fără mismatch la hidratare).
const montat = ref(false)
onMounted(() => { montat.value = true })
const publica = computed(() => ['/confirm'].includes(route.value.path))
</script>

<template>
  <UApp :locale="ro">
    <ClientOnly><FundalCapsula /></ClientOnly>
    <AntetCapsula />
    <NuxtPage v-if="publica || autentificat" />
    <TeaserCapsula v-else-if="montat" />
    <ModalIntrare v-if="montat && !autentificat" />
  </UApp>
</template>
