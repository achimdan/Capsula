<script setup lang="ts">
const { areProfil, caseta } = useCapsula()
const route = useRoute()
const { autentificat, iese } = useAuth()
function iesire() {
  iese()
  navigateTo('/')
}
const linkuri = [
  { to: '/', text: 'Capsula' },
  { to: '/daily', text: 'Caseta zilei' },
  { to: '/random', text: 'Random Hit' },
  { to: '/game', text: 'Ghicește anul' },
  { to: '/tape', text: 'Caseta mea' },
  { to: '/shop', text: 'Magazin' }
]
</script>

<template>
  <header class="antet">
    <NuxtLink to="/" class="logo">Capsula</NuxtLink>
    <nav v-if="autentificat && areProfil" aria-label="Principal">
      <NuxtLink v-for="l in linkuri" :key="l.to" :to="l.to" :aria-current="route.path === l.to ? 'page' : undefined">
        {{ l.text }}<span v-if="l.to === '/tape' && caseta.length" class="nr">{{ caseta.length }}</span>
      </NuxtLink>
    </nav>
    <button v-if="autentificat" type="button" class="iese" @click="iesire">Ieși</button>
  </header>
</template>

<style scoped>
.antet{position:sticky;top:0;z-index:20;background:var(--paper);border-bottom:2px solid var(--ink);
  display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
  padding:12px max(16px,env(safe-area-inset-right,0px)) 12px max(16px,env(safe-area-inset-left,0px))}
.logo{font-family:var(--display);font-weight:800;font-size:28px;text-transform:uppercase;text-decoration:none;letter-spacing:.02em}
nav{display:flex;gap:4px;overflow-x:auto;max-width:100%;scrollbar-width:none}
@media (max-width:600px){.antet{gap:8px}nav{width:100%}}
nav a{font-weight:500;font-size:15px;text-decoration:none;padding:6px 10px;border-radius:2px;white-space:nowrap}
nav a[aria-current="page"]{background:var(--ink);color:var(--paper)}
.nr{font-family:var(--mono);font-size:11px;background:var(--signal);color:#14211B;border-radius:999px;padding:0 6px;margin-left:6px}
.iese{font:inherit;font-weight:500;font-size:15px;min-height:44px;min-width:44px;padding:6px 14px;background:transparent;color:var(--ink);border:2px solid var(--ink);border-radius:2px;cursor:pointer;transition:transform .15s}
.iese:hover{background:var(--ink);color:var(--paper)}
.iese:active{transform:translateY(1px)}
</style>
