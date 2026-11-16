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
      <div class="lista">
        <NuxtLink v-for="(l, i) in linkuri" :key="l.to" :style="{ '--i': i }" :to="l.to" :aria-current="route.path === l.to ? 'page' : undefined">
          {{ l.text }}<span v-if="l.to === '/tape' && caseta.length" class="nr">{{ caseta.length }}</span>
        </NuxtLink>
      </div>
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
.lista{display:contents}
@media (max-width:600px){.antet{gap:8px}}
.meniu{display:none;align-items:center;margin-left:auto;min-height:44px;padding:0 14px;font:500 15px var(--body);color:var(--ink);background:transparent;border:0;border-radius:2px;box-shadow:inset 0 0 0 1.5px var(--ink);cursor:pointer}
.meniu[aria-expanded="true"]{background:var(--ink);color:var(--paper)}
@media (max-width:600px){
  .meniu{display:inline-flex}
  /* Se desfășoară lin: rândul grid trece de la 0fr la 1fr. visibility scoate linkurile din tab când e închis. */
  /* Panou peste pagină: pagina de dedesubt nu sare când se deschide sau se închide. */
  nav{position:absolute;top:100%;left:0;right:0;margin-top:2px;background:var(--paper);border-bottom:2px solid var(--ink);box-shadow:0 18px 24px -18px rgba(0,0,0,.35);
    padding:0 max(16px,env(safe-area-inset-right,0px)) 0 max(16px,env(safe-area-inset-left,0px));
    display:grid;grid-template-rows:0fr;opacity:0;visibility:hidden;
    transition:grid-template-rows .38s var(--ease-ff),opacity .25s ease,visibility 0s linear .38s}
  nav.deschis{grid-template-rows:1fr;opacity:1;visibility:visible;transition-delay:0s}
  .lista{min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:2px}
  .lista a:first-child{margin-top:8px}
  .lista a:last-child{margin-bottom:10px}
  .lista a{opacity:0;transform:translateY(-6px);transition:opacity .2s ease,transform .3s var(--ease-ff)}
  nav.deschis .lista a{opacity:1;transform:none;transition-delay:calc(var(--i) * 30ms + 60ms)}
  nav a{padding:10px 12px;min-height:44px;display:flex;align-items:center}
}
nav a{font-weight:500;font-size:15px;text-decoration:none;padding:6px 10px;border-radius:2px;white-space:nowrap}
nav a[aria-current="page"]{background:var(--ink);color:var(--paper)}
@media (max-width:600px) and (prefers-reduced-motion:reduce){nav,.lista a{transition:none!important}}
.nr{font-family:var(--mono);font-size:11px;background:var(--signal);color:#14211B;border-radius:999px;padding:0 6px;margin-left:6px}
</style>
