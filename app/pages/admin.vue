<script setup lang="ts">
import { cheieModul, type Modul, type SetariSite } from '~/utils/setari'

const setari = useSetari()
const { fundal, listaFise, salveaza } = setari
useHead({ title: 'Admin · Aspect', meta: [{ name: 'robots', content: 'noindex' }] })

const LISTE: { id: SetariSite['listaFise']; nume: string; descriere: string }[] = [
  { id: 'grila', nume: 'Grilă de polaroiduri', descriere: 'Fișele una lângă alta, cu notă și butoane.' },
  { id: 'cronologie', nume: 'Cronologie pe bandă', descriere: 'Pe toată lățimea ecranului: anii pe orizontală, categoriile ca piste, contor mare și riglă pentru derulare.' }
]

// Starea salvării, separat pentru fiecare setare.
type Stare = '' | 'salvez' | 'salvat' | 'eroare'
const stare = reactive<Partial<Record<keyof SetariSite, Stare>>>({})

// Modulele: pornesc oprite. Pagina lor o vezi tu oricum (ca super admin), ca s-o verifici înainte de pornire.
const MODULE_ADMIN: { id: Modul; nume: string; descriere: string; ruta?: string }[] = [
  { id: 'azi', nume: 'Azi, demult', descriere: 'Ce s-a întâmplat în ziua de azi, cu ani în urmă. Doar evenimente cu dată exactă.', ruta: '/on-this-day' },
  { id: 'preturi', nume: 'Prețuri de atunci', descriere: 'Cât costau lucrurile de zi cu zi, an de an, cu sursă și monedă (lei vechi până în 2005).', ruta: '/prices' },
  { id: 'tv', nume: 'La TV', descriere: 'Emisiunile, serialele și desenele fiecărui an. Doar titluri și texte proprii.', ruta: '/tv' },
  { id: 'bucuresti', nume: 'Stratul București', descriere: 'Fișele locale din București apar celor care au ales Bucureștiul.' }
]
async function alege<K extends keyof SetariSite>(cheie: K, valoare: SetariSite[K], curent: SetariSite[K]) {
  if (valoare === curent || stare[cheie] === 'salvez') return
  stare[cheie] = 'salvez'
  try {
    await salveaza(cheie, valoare)
    stare[cheie] = 'salvat'
  } catch {
    stare[cheie] = 'eroare'
  }
}
</script>

<template>
  <main class="pagina">
    <header>
      <p class="k">Admin</p>
      <h1 class="d2">Admin · Aspect</h1>
      <p class="lead">Ce alegi aici se salvează pe server și se aplică imediat tuturor vizitatorilor.</p>
    </header>

    <ClientOnly>
      <section class="bloc">
        <h2 class="d3">Lista „Ce era peste tot”</h2>
        <fieldset class="grila">
          <legend class="sr">Cum se afișează fișele</legend>
          <label v-for="l in LISTE" :key="l.id" class="optiune">
            <input class="sr" type="radio" name="lista-fise" :value="l.id" :checked="listaFise === l.id" :disabled="stare.listaFise === 'salvez'" @change="alege('listaFise', l.id, listaFise)">
            <span class="tile schita" :class="l.id" aria-hidden="true">
              <template v-if="l.id === 'grila'"><i v-for="n in 6" :key="n" /></template>
              <template v-else>
                <b class="bnd"><s v-for="a in ['96', '97', '98', '99', '00']" :key="a" :class="{ eu: a === '99' }">{{ a }}</s></b>
                <i v-for="n in 5" :key="n" :style="{ '--x': [0, 2, 3, 3, 4][n - 1], '--y': [0, 1, 0, 2, 1][n - 1] }" />
                <u />
              </template>
            </span>
            <span v-if="listaFise === l.id" class="stare">Activ</span>
            <span class="nume">{{ l.nume }}</span>
            <span class="desc">{{ l.descriere }}</span>
          </label>
        </fieldset>
        <p class="k nota" role="status" aria-live="polite">
          <template v-if="stare.listaFise === 'salvez'">Se salvează…</template>
          <template v-else-if="stare.listaFise === 'salvat'">Salvat. Toți vizitatorii văd acum lista așa.</template>
          <template v-else-if="stare.listaFise === 'eroare'">Nu s-a salvat. Lista a rămas cea de dinainte; încearcă din nou.</template>
        </p>
      </section>

      <section class="bloc">
        <h2 class="d3">Fundalul paginii</h2>
        <fieldset class="grila">
          <legend class="sr">Fundal</legend>
          <label v-for="f in FUNDALURI" :key="f.id" class="optiune">
            <input class="sr" type="radio" name="fundal" :value="f.id" :checked="fundal === f.id" :disabled="stare.fundal === 'salvez'" @change="alege('fundal', f.id, fundal)">
            <span class="tile previzualizare" :data-fundal="f.id">
              <FundalCapsula :tema="f.id" mini />
              <span class="proba">
                <span class="k">Fișă · 1994</span>
                <strong class="titlu">Caseta de vară</strong>
              </span>
              <span v-if="fundal === f.id" class="stare">Activ</span>
            </span>
            <span class="nume">{{ f.nume }}</span>
            <span class="desc">{{ f.descriere }}</span>
          </label>
        </fieldset>
        <p class="k nota" role="status" aria-live="polite">
          <template v-if="stare.fundal === 'salvez'">Se salvează…</template>
          <template v-else-if="stare.fundal === 'salvat'">Salvat. Toți vizitatorii văd acum fundalul ăsta.</template>
          <template v-else-if="stare.fundal === 'eroare'">Nu s-a salvat. Fundalul a rămas cel de dinainte; încearcă din nou.</template>
        </p>
      </section>
      <section class="bloc">
        <h2 class="d3">Module</h2>
        <p class="desc">Conținutul nou pornește ascuns. Îl pornești când e verificat; până atunci îl vezi doar tu.</p>
        <div class="grila module">
          <label v-for="m in MODULE_ADMIN" :key="m.id" class="modul">
            <input
              type="checkbox" role="switch" :checked="setari[cheieModul(m.id)].value" :disabled="stare[cheieModul(m.id)] === 'salvez'"
              @change="alege(cheieModul(m.id), !setari[cheieModul(m.id)].value, setari[cheieModul(m.id)].value)">
            <span class="text">
              <span class="nume">{{ m.nume }}</span>
              <span class="desc">{{ m.descriere }}</span>
              <NuxtLink v-if="m.ruta" :to="m.ruta" class="k">Vezi pagina →</NuxtLink>
              <span class="k nota" role="status" aria-live="polite">
                <template v-if="stare[cheieModul(m.id)] === 'salvez'">Se salvează…</template>
                <template v-else-if="stare[cheieModul(m.id)] === 'eroare'">Nu s-a salvat. Încearcă din nou.</template>
                <template v-else>{{ setari[cheieModul(m.id)].value ? 'Pornit pentru toți' : 'Oprit' }}</template>
              </span>
            </span>
          </label>
        </div>
      </section>
      <template #fallback><div class="grila" style="min-height:240px" /></template>
    </ClientOnly>
  </main>
</template>

<style scoped>
.grila{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:20px;border:0;padding:0;margin:0;min-width:0}
.optiune{display:grid;gap:4px;cursor:pointer;min-height:44px}
.tile{position:relative;display:grid;align-items:end;min-height:160px;padding:16px;overflow:hidden;
  background:var(--paper);color:var(--ink);border:2px solid var(--line);border-radius:4px;isolation:isolate;
  transition:transform .2s var(--ease-ff),border-color .2s}
.optiune:hover .tile{transform:translateY(-3px);border-color:var(--ink)}
.optiune:active .tile{transform:translateY(0) scale(.98)}
input:checked + .tile{border-color:var(--signal);box-shadow:0 0 0 2px var(--signal)}
input:focus-visible + .tile{outline:3px solid var(--signal);outline-offset:3px}
.proba{position:relative;z-index:1;display:grid;gap:4px;background:var(--card);border:1px solid var(--line);border-radius:4px;padding:12px;color:var(--ink)}
.titlu{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:22px;line-height:.9}
.stare{position:absolute;z-index:2;top:8px;right:8px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;background:var(--signal);color:#14211B;padding:2px 8px;border-radius:2px}
.nume{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:22px;margin-top:6px}
.desc{color:var(--muted);font-size:14px}
.nota{text-transform:none;letter-spacing:0;font-size:13px;min-height:20px;margin-top:12px}
.bloc{margin-top:40px}
.d3{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:28px;line-height:1;margin:0 0 16px}
.optiune{position:relative}
.optiune>.stare{top:10px;right:10px}
.schita{background:var(--card)}
.schita.grila{grid-template-columns:repeat(3,1fr);gap:8px;align-items:stretch}
.schita.grila i{background:var(--line);border-radius:2px;min-height:52px}
.schita.cronologie{align-items:start;align-content:start;position:relative}
.bnd{display:grid;grid-template-columns:repeat(5,1fr);background:var(--ink);border-radius:2px}
.bnd s{text-decoration:none;font-family:var(--display);font-weight:800;font-size:18px;color:var(--paper);padding:2px 6px}
.bnd s.eu{color:var(--signal)}
.schita.cronologie i{position:absolute;width:15%;height:30px;background:var(--line);border:3px solid var(--paper);
  left:calc(16px + var(--x) * (100% - 32px) / 5 + 2%);top:calc(56px + var(--y) * 34px)}
.schita.cronologie u{position:absolute;top:16px;bottom:16px;width:2px;background:var(--signal);left:calc(16px + 3.5 * (100% - 32px) / 5)}
.modul{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start;padding:16px;border:2px solid var(--line);border-radius:4px;background:var(--card);cursor:pointer;min-width:0}
.modul:has(input:checked){border-color:var(--ink)}
.modul .text{display:grid;gap:4px;min-width:0}
.modul .nume{margin:0}
.modul .nota{margin-top:4px;min-height:0}
.modul input{appearance:none;width:44px;height:26px;margin:2px 0 0;border-radius:13px;background:var(--line);position:relative;cursor:pointer;transition:background-color .2s}
.modul input::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:var(--card);transition:transform .2s var(--ease-ff)}
.modul input:checked{background:var(--ink)}
.modul input:checked::after{transform:translateX(18px)}
.modul input:focus-visible{outline:3px solid var(--signal);outline-offset:3px}
@media (prefers-reduced-motion:reduce){.modul input,.modul input::after{transition:none}}
@media (prefers-reduced-motion:reduce){.tile{transition:none}.optiune:hover .tile,.optiune:active .tile{transform:none}}
</style>
