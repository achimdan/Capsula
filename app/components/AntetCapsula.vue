<script setup lang="ts">
import type { ModulSetare } from '~/utils/setari'
const { caseta } = useCapsula()
const route = useRoute()
const { autentificat } = useAuth()
const { deschide } = useIntrare()
const module = useModule()
// Linkurile modulelor apar doar când sunt pornite din /admin.
const toate: { to: string, text: string, modul?: ModulSetare }[] = [
  { to: '/', text: 'Capsula' },
  { to: '/daily', text: 'Caseta zilei' },
  { to: '/on-this-day', text: 'Azi, demult', modul: 'modul_azi' },
  { to: '/random', text: 'Random Hit' },
  { to: '/game', text: 'Ghicește anul' },
  { to: '/prices', text: 'Prețuri', modul: 'modul_preturi' },
  { to: '/tv', text: 'La TV', modul: 'modul_tv' },
  { to: '/tape', text: 'Caseta mea' },
  { to: '/shop', text: 'Magazin' }
]
const linkuri = computed(() => toate.filter(l => !l.modul || module[l.modul].value))
// Fiecare secțiune e o pistă numerotată pe bandă: 01, 02… (numărul urmează ordinea vizibilă).
const pista = (i: number) => String(i + 1).padStart(2, '0')
// Pe telefon meniul stă după un buton: pe un rând nu încap toate linkurile.
const deschis = ref(false)
watch(() => route.path, () => { deschis.value = false })
</script>

<template>
  <header class="antet">
    <NuxtLink to="/" class="logo">Capsula</NuxtLink>
    <button
      type="button" class="meniu" :aria-expanded="deschis" aria-controls="nav-principal"
      @click="deschis = !deschis">
      {{ deschis ? 'Închide' : 'Meniu' }}<span v-if="caseta.length" class="nr" :aria-label="`${caseta.length} în caseta ta`">{{ caseta.length }}</span>
    </button>
    <nav id="nav-principal" aria-label="Principal" :class="{ deschis }">
      <div class="lista">
        <NuxtLink v-for="(l, i) in linkuri" :key="l.to" :style="{ '--i': i }" :to="l.to" :aria-current="route.path === l.to ? 'page' : undefined" class="pista">
          <span class="num" aria-hidden="true">{{ pista(i) }}</span>
          <span class="nume"><span>{{ l.text }}</span></span>
          <span v-if="l.to === '/tape' && caseta.length" class="nr">{{ caseta.length }}</span>
        </NuxtLink>
      </div>
    </nav>
    <AntetUtilizator v-if="autentificat" class="cont" />
    <button v-else type="button" class="intra cont" @click="deschide">Intră</button>
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
  nav a{padding:10px 12px;min-height:44px;display:flex;align-items:center;gap:12px}
  .num{color:var(--muted)}
  nav a[aria-current="page"]{background:var(--ink);color:var(--paper)}
  nav a[aria-current="page"] .num{color:var(--signal)}
}
nav a{font-weight:500;font-size:15px;text-decoration:none;white-space:nowrap}
.num{font-family:var(--mono);font-size:12px;letter-spacing:.06em}
.nume{display:grid}
.nume>span{min-width:0;overflow:hidden}

/* Desktop: meniul e o bandă de casetofon. Pistele arată doar numărul; pista curentă (capul de citire) și cea de sub cursor își arată numele. */
@media (min-width:601px){
  /* Banda ocupă tot spațiul dintre logo și avatar; pistele se întind uniform pe ea. */
  nav{flex:1 1 0;min-width:0;justify-content:center;overflow:visible}
  .lista{position:relative;display:flex;flex:1;align-items:center;justify-content:space-between;width:100%;min-height:52px;padding:0 10px;
    background:repeating-linear-gradient(90deg,transparent 0 22px,color-mix(in srgb,var(--paper) 5%,transparent) 22px 23px),var(--ink);
    color:var(--paper);border-radius:3px;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--paper) 12%,transparent)}
  /* Marginile bobinei: două fire fine sus și jos, ca la o casetă. */
  .lista::before,.lista::after{content:"";position:absolute;left:0;right:0;height:2px;background:color-mix(in srgb,var(--paper) 22%,transparent)}
  .lista::before{top:3px}
  .lista::after{bottom:3px}
  .pista{position:relative;display:flex;flex:1 1 auto;align-items:center;justify-content:center;min-height:44px;padding:0 12px;color:color-mix(in srgb,var(--paper) 62%,transparent);border-radius:2px;
    transition:color .2s ease}
  .pista .num{font-size:15px;letter-spacing:.08em}
  .pista+.pista::before{content:"";position:absolute;left:-2px;top:50%;width:3px;height:3px;margin-top:-1.5px;border-radius:50%;background:color-mix(in srgb,var(--paper) 30%,transparent)}
  .nume{grid-template-columns:0fr;opacity:0;transition:grid-template-columns .35s var(--ease-ff),opacity .2s ease,margin .35s var(--ease-ff)}
  .pista:hover,.pista:focus-visible,.pista[aria-current="page"]{color:var(--paper)}
  .pista:hover .nume,.pista:focus-visible .nume,.pista[aria-current="page"] .nume{grid-template-columns:1fr;opacity:1;margin-left:8px}
  /* Capul de citire: singurul accent, doar pe pista unde ești. */
  .pista[aria-current="page"]::after{content:"";position:absolute;left:4px;right:4px;bottom:2px;height:3px;border-radius:2px;background:var(--signal)}
  .pista[aria-current="page"] .num{color:var(--signal)}
  .pista:focus-visible{outline:2px solid var(--paper);outline-offset:-2px}
  .nume>span{font-family:var(--display);font-weight:800;font-size:16px;text-transform:uppercase;letter-spacing:.04em}
}
@media (min-width:601px) and (prefers-reduced-motion:reduce){.nume,.pista{transition:none}}
@media (max-width:600px) and (prefers-reduced-motion:reduce){nav,.lista a{transition:none!important}}
.nr{font-family:var(--mono);font-size:11px;background:var(--signal);color:var(--on-signal);border-radius:999px;padding:0 6px;margin-left:6px}
.intra{min-height:44px;padding:0 16px;background:transparent;color:var(--ink);border:0;border-radius:2px;box-shadow:inset 0 0 0 2px var(--ink);font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:18px;letter-spacing:.03em;cursor:pointer}
.intra:focus-visible{outline:3px solid var(--signal);outline-offset:2px}
</style>
