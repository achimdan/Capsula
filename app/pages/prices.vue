<script setup lang="ts">
import { PRETURI } from '~/data/preturi'
import { etichetaAn, formatValoare, grupeazaPeAni, leiNoi } from '~/utils/preturi'

useHead({ title: 'Prețuri de atunci' })
const grupe = grupeazaPeAni(PRETURI)
</script>

<template>
  <main class="pagina">
    <section class="pr">
      <div class="k">Prețuri de atunci · 1990–2008</div>
      <h1 class="d1">Cât costa</h1>
      <p class="lead">
        Prețuri găsite în presă și în datele INS. Până în iunie 2005 sunt în lei vechi; un leu nou are 10.000 de lei vechi.
        Un an cu „~” înseamnă că sursa nu îl spune sigur. Ce n-a fost încă verificat pe sursă are eticheta „neverificat”.
      </p>

      <ol class="axa">
        <li v-for="g in grupe" :key="g.an" class="an">
          <h2 class="an-titlu d2">{{ g.an }}</h2>
          <ul class="lista">
            <li v-for="p in g.preturi" :key="p.id" class="pret card">
              <div class="sus">
                <span class="produs">{{ p.produs }}</span>
                <span v-if="!p.an_exact" class="k aprox" :title="'Anul nu e sigur în sursă'">{{ etichetaAn(p.an, p.an_exact) }}</span>
              </div>
              <div class="valoare">
                <b class="cifra">{{ formatValoare(p) }}</b>
                <span class="unitate">/ {{ p.unitate }}</span>
              </div>
              <div v-if="leiNoi(p)" class="noi k">{{ leiNoi(p) }}</div>
              <div class="jos">
                <a class="sursa" :href="p.url" target="_blank" rel="noopener noreferrer">{{ p.sursa }}</a>
                <span v-if="!p.verificat" class="k neverificat">neverificat</span>
              </div>
            </li>
          </ul>
        </li>
      </ol>
    </section>
  </main>
</template>

<style scoped>
.pr{display:grid;gap:20px;min-width:0}
.axa{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:28px}
.an{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;min-width:0}
.an-titlu{color:var(--ink)}
.lista{list-style:none;margin:0;padding:0;display:grid;gap:12px;min-width:0;
  border-left:2px solid var(--line);padding-left:14px}
.pret{display:grid;gap:6px;padding:16px;min-width:0;position:relative}
.pret::before{content:"";position:absolute;left:-21px;top:22px;width:10px;height:10px;border-radius:50%;
  background:var(--card);border:2px solid var(--ink)}
.sus{display:flex;gap:10px;align-items:baseline;justify-content:space-between;min-width:0}
.produs{font-weight:600;overflow-wrap:anywhere;min-width:0}
.aprox{white-space:nowrap}
.valoare{display:flex;flex-wrap:wrap;gap:4px 8px;align-items:baseline;min-width:0}
.cifra{font-family:var(--display);font-weight:800;font-size:clamp(26px,7vw,36px);line-height:1;text-transform:uppercase;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.unitate{font-family:var(--mono);font-size:13px;color:var(--muted);overflow-wrap:anywhere}
.noi{text-transform:none;letter-spacing:.04em}
.jos{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center;justify-content:space-between;margin-top:4px;
  border-top:1px solid var(--line);padding-top:8px;min-width:0}
.sursa{display:inline-flex;align-items:center;min-height:44px;min-width:44px;font-size:13px;color:var(--muted);
  text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere;flex:1 1 220px}
.sursa:hover{color:var(--ink)}
.neverificat{border:1px dashed var(--muted);border-radius:2px;padding:2px 6px;white-space:nowrap}

@media (min-width:720px){
  .an{grid-template-columns:140px minmax(0,1fr);gap:24px;align-items:start}
  .an-titlu{position:sticky;top:88px}
  .lista{padding-left:24px}
  .pret::before{left:-31px}
}
@media (prefers-reduced-motion:no-preference){
  .pret{animation:intra .45s var(--ease-ff) both}
  .pret:hover{border-color:var(--ink)}
}
@keyframes intra{from{opacity:0;transform:translateY(8px)}}
@media (prefers-reduced-motion:reduce){.pret{animation:none}}
</style>
