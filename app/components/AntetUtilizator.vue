<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

// Avatarul din dreapta sus (poza de la Google sau inițiala) cu meniul contului.
const { utilizator, superAdmin, superAdminConfirmat, confirmaSuperAdmin, iese } = useAuth()
// Linkul de admin apare doar după ce serverul confirmă rolul (din nou la fiecare token nou).
const sesiune = useSupabaseSession()
watch(() => superAdmin.value && sesiune.value?.access_token, (t) => { if (t) void confirmaSuperAdmin() }, { immediate: true })
const { areProfil, caseta } = useCapsula()

async function iesire() {
  await iese()
  navigateTo('/')
}

const items = computed<DropdownMenuItem[][]>(() => {
  const u = utilizator.value
  const cont: DropdownMenuItem[] = [{ label: u?.nume ?? u?.email ?? 'Contul tău', description: u?.nume ? u.email : undefined, type: 'label' }]
  const capsula: DropdownMenuItem[] = areProfil.value
    ? [
        { label: 'Caseta mea', icon: 'i-lucide-cassette-tape', to: '/tape', kbds: caseta.value.length ? [String(caseta.value.length)] : undefined },
        { label: 'Refă testul', icon: 'i-lucide-rotate-ccw', to: '/start' }
      ]
    : [{ label: 'Fă testul', icon: 'i-lucide-play', to: '/start' }]
  return [
    cont,
    capsula,
    ...(superAdminConfirmat.value ? [[{ label: 'Admin · Aspect', icon: 'i-lucide-palette', to: '/admin' }]] : []),
    [{ label: 'Datele tale', icon: 'i-lucide-shield', to: '/privacy#datele-tale' }],
    [{ label: 'Ieși', icon: 'i-lucide-log-out', color: 'error', onSelect: iesire }]
  ]
})
</script>

<template>
  <UDropdownMenu v-if="utilizator" :items="items" :modal="false" :content="{ align: 'end', sideOffset: 8 }" :ui="{ content: 'min-w-56' }">
    <button type="button" class="avatar" :aria-label="`Contul tău: ${utilizator.nume ?? utilizator.email}`">
      <UAvatar
        :src="utilizator.avatar ?? undefined"
        :alt="utilizator.nume ?? utilizator.email"
        :text="initiale(utilizator.nume, utilizator.email)"
        size="lg"
        loading="lazy"
        referrerpolicy="no-referrer"
      />
    </button>
  </UDropdownMenu>
</template>

<style scoped>
.avatar{display:grid;place-items:center;min-width:44px;min-height:44px;padding:0;background:none;border:0;border-radius:999px;cursor:pointer;transition:transform .15s}
.avatar :deep(span){box-shadow:0 0 0 2px var(--ink)}
.avatar{position:relative}
.avatar::before{content:"";position:absolute;inset:-3px}
.avatar:hover{transform:translateY(-1px)}
.avatar:active{transform:translateY(1px)}
.avatar:focus-visible{outline:3px solid var(--signal);outline-offset:2px}
@media (prefers-reduced-motion:reduce){.avatar{transition:none}}
</style>
