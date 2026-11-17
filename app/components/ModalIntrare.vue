<script setup lang="ts">
// Intrarea în capsulă, doar cu Google, într-o fereastră peste pagina curentă. Întoarcerea se face pe /confirm.
const { autentificat } = useAuth()
const { deschis, pastreaza, pleaca } = useIntrare()
// Deschisă de o acțiune care păstrează ceva: spunem de ce cerem contul, exact în momentul acela.
const descriere = computed(() => pastreaza.value ? TEXT_PASTREAZA : 'Te conectezi cu contul tău Google. Fără parolă nouă.')

const eroare = ref('')
const ocupat = ref(false)

// Conectat (sau fereastra închisă): o resetăm pentru data viitoare.
watch(autentificat, (da) => { if (da) deschis.value = false })
watch(deschis, (da) => { if (!da) { eroare.value = ''; ocupat.value = false } })

async function google() {
  eroare.value = ''
  ocupat.value = true
  try {
    await pleaca()
  } catch {
    eroare.value = 'Nu am putut porni conectarea cu Google. Încearcă din nou.'
    ocupat.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="deschis"
    title="Intră în capsulă"
    :description="descriere"
    :ui="{ content: 'max-w-sm', title: 'intrare-titlu', description: 'intrare-nota' }"
  >
    <template #body>
      <div class="corp">
        <button type="button" class="btn semnal" :disabled="ocupat" :aria-busy="ocupat" @click="google">
          {{ ocupat ? 'Te ducem la Google…' : 'Continuă cu Google' }}
        </button>
        <p v-if="eroare" class="eroare" role="alert">{{ eroare }}</p>
        <p class="legal">Ce păstrăm despre tine: <NuxtLink to="/privacy" @click="deschis = false">confidențialitate</NuxtLink>.</p>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.corp{display:grid;gap:12px}
.btn{min-height:44px;justify-content:center;transition:transform .15s var(--ease-ff)}
.btn:not(:disabled):hover{transform:translateY(-2px)}
.btn:not(:disabled):active{transform:translateY(1px)}
.btn:focus-visible{outline:3px solid var(--signal);outline-offset:3px}
.eroare{margin:0;color:var(--signal);font-size:14px}
.legal{margin:0;font-size:13px;color:var(--muted)}
.legal a{text-decoration:underline}
@media (prefers-reduced-motion:reduce){.btn{transition:none}}
</style>
