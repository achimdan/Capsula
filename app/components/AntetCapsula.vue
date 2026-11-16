<script setup lang="ts">
const { areProfil, caseta } = useCapsula()
const route = useRoute()
const { autentificat } = useAuth()
const linkuri = [
  { to: '/', text: 'Capsula' },
  { to: '/daily', text: 'Caseta zilei' },
  { to: '/random', text: 'Random Hit' },
  { to: '/game', text: 'Ghicește anul' },
  { to: '/tape', text: 'Caseta mea' },
  { to: '/shop', text: 'Magazin' }
]
// Pe telefon meniul stă după un buton: pe un rând nu încap toate linkurile.
const deschis = ref(false)
watch(() => route.path, () => { deschis.value = false })
</script>

<template>
  <header class="antet">
    <NuxtLink to="/" class="logo">Capsula</NuxtLink>
    <button
      v-if="autentificat && areProfil" type="button" class="meniu" :aria-expanded="deschis" aria-controls="nav-principal"
      @click="deschis = !deschis">
      {{ deschis ? 'Închide' : 'Meniu' }}<span v-if="caseta.length" class="nr" :aria-label="`${caseta.length} în caseta ta`">{{ caseta.length }}</span>
    </button>
    <nav v-if="autentificat && areProfil" id="nav-principal" aria-label="Principal" :class="{ deschis }">
      <NuxtLink v-for="l in linkuri" :key="l.to" :to="l.to" :aria-current="route.path === l.to ? 'page' : undefined">
        {{ l.text }}<span v-if="l.to === '/tape' && caseta.length" class="nr">{{ caseta.length }}</span>
      </NuxtLink>
    </nav>
    <AntetUtilizator v-if="autentificat" class="cont" />
  </header>
</template>

<style scoped>
.antet{position:sticky;top:0;z-index:20;background:var(--paper);border-bottom:2px solid var(--ink);
  display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
  padding:12px max(16px,env(safe-area-inset-right,0px)) 12px max(16px,env(safe-area-inset-left,0px))}
.logo{font-family:var(--display);font-weight:800;font-size:28px;text-transform:uppercase;text-decoration:none;letter-spacing:.02em}
nav{display:flex;gap:4px;overflow-x:auto;max-width:100%;scrollbar-width:none}
@media (max-width:600px){.antet{gap:8px}nav{width:100%;order:3}}
.meniu{display:none;align-items:center;margin-left:auto;min-height:44px;padding:0 14px;font:500 15px var(--body);color:var(--ink);background:transparent;border:0;border-radius:2px;box-shadow:inset 0 0 0 1.5px var(--ink);cursor:pointer}
.meniu[aria-expanded="true"]{background:var(--ink);color:var(--paper)}
@media (max-width:600px){
  .meniu{display:inline-flex}
  nav{display:none;flex-direction:column;gap:2px;padding-bottom:4px}
  nav.deschis{display:flex}
  nav a{padding:10px 12px;min-height:44px;display:flex;align-items:center}
}
nav a{font-weight:500;font-size:15px;text-decoration:none;padding:6px 10px;border-radius:2px;white-space:nowrap}
nav a[aria-current="page"]{background:var(--ink);color:var(--paper)}
.nr{font-family:var(--mono);font-size:11px;background:var(--signal);color:#14211B;border-radius:999px;padding:0 6px;margin-left:6px}
</style>
