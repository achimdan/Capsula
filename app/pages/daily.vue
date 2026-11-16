<script setup lang="ts">
const { areProfil, profil, fiseVizibile } = useCapsula()

const azi = cheieZi(new Date())
const ieri = cheieIeri(Date.now())
const eticheta = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })

const generatie = computed(() => generatieDinAn(profil.value.anNastere))
const fise = computed(() => alegeFise(fiseVizibile.value, azi, generatie.value))

const zi = useStocare<{ data: string; deschise: number }>('caseta-zilei', { data: '', deschise: 0 })
const serie = useStocare<{ ultima: string; zile: number }>('serie', { ultima: '', zile: 0 })
const deschise = computed(() => zi.value.data === azi ? zi.value.deschise : 0)
const curenta = ref<number | null>(null)

function deschide(i: number) {
  if (i > deschise.value) return
  if (i === deschise.value) {
    zi.value = { data: azi, deschise: i + 1 }
    if (i === 4 && serie.value.ultima !== azi) {
      serie.value = actualizeazaSerie(serie.value, azi, ieri)
    }
  }
  curenta.value = i
  pornesteCaseta()
}
// Doar prezentare: rolele se învârt cât „rulează” amintirea.
const suna = ref(false)
let oprire: ReturnType<typeof setTimeout> | undefined
function pornesteCaseta() {
  suna.value = true
  clearTimeout(oprire)
  oprire = setTimeout(() => { suna.value = false }, 2600)
}
onBeforeUnmount(() => clearTimeout(oprire))
const progres = computed(() => deschise.value / 5)
const serieAfisata = computed(() => [azi, ieri].includes(serie.value.ultima) ? serie.value.zile : 0)
onMounted(() => {
  if (!areProfil.value) return navigateTo('/')
  if (deschise.value) curenta.value = deschise.value - 1
})
</script>

<template>
  <main class="pagina">
    <section class="cz">
      <div class="k">Caseta zilei · {{ eticheta }} · generația ’{{ String(generatie).slice(2) }}</div>
      <h1 class="d1">Partea A</h1>
      <p class="lead">Cinci amintiri pe zi, una câte una. Partea B vine mâine.</p>

      <div class="caseta" :class="{ suna }">
        <div class="eticheta">
          <div class="et-sus"><span>PARTEA A</span><span>{{ eticheta }} · ’{{ String(generatie).slice(2) }}</span></div>
          <div class="fereastra" aria-hidden="true">
            <div class="rola st"><i class="pachet" :style="{ transform: `scale(${1 - progres * 0.55})` }" /><i class="roata" /></div>
            <div class="banda-fir" />
            <div class="rola dr"><i class="pachet" :style="{ transform: `scale(${0.45 + progres * 0.55})` }" /><i class="roata" /></div>
          </div>
          <div class="et-jos"><span>C-5</span><span>{{ deschise }}/5 ▮ NR</span></div>
        </div>
        <div class="sloturi" role="group" aria-label="Amintirile de azi">
          <button
v-for="(f, i) in fise" :key="f.id" type="button" class="slot" :aria-pressed="curenta === i"
            :disabled="i > deschise" :class="{ gata: i < deschise }" @click="deschide(i)">
            <span class="nr">{{ i + 1 }}</span><span class="t">{{ i < deschise ? f.an : '••••' }}</span>
          </button>
        </div>
      </div>

      <div class="k" aria-live="polite">
        <template v-if="deschise === 0">Apasă pe 1 ca să dai play</template>
        <template v-else-if="deschise < 5">{{ deschise }}/5 · următoarea piesă te așteaptă</template>
        <template v-else>Gata pe azi · întoarce caseta mâine pentru partea B</template>
        <template v-if="serieAfisata"> · 🔥 {{ serieAfisata }} {{ serieAfisata === 1 ? 'zi' : 'zile la rând' }}</template>
      </div>
      <div class="scena"><FisaPolaroid v-if="curenta !== null && fise[curenta]" :key="fise[curenta]!.id" :fisa="fise[curenta]!" developare /></div>
      <div v-if="deschise === 5" class="rand"><NuxtLink to="/tape" class="btn ghost">Caseta mea</NuxtLink><NuxtLink to="/random" class="btn ghost">▶▶ Random Hit</NuxtLink></div>
    </section>
  </main>
</template>

<style scoped>
.cz{display:grid;gap:20px;min-width:0}
.caseta{width:min(560px,100%);background:var(--ink);color:var(--paper);border-radius:14px;padding:14px 14px 12px;display:grid;gap:12px;box-shadow:0 22px 34px -20px rgba(0,0,0,.6),inset 0 0 0 2px var(--line);position:relative}
.caseta::before,.caseta::after{content:"";position:absolute;top:8px;width:8px;height:8px;border-radius:50%;background:var(--muted)}
.caseta::before{left:8px}.caseta::after{right:8px}
.eticheta{background:var(--card);color:var(--ink);border-radius:6px;padding:8px 10px 6px;display:grid;gap:6px;border-top:6px solid var(--signal)}
.et-sus,.et-jos{display:flex;justify-content:space-between;gap:8px;font-family:var(--display);font-weight:800;text-transform:uppercase;letter-spacing:.06em;font-size:18px;line-height:1}
.et-jos{font-family:var(--mono);font-weight:500;font-size:11px;color:var(--muted)}
.fereastra{display:flex;align-items:center;justify-content:space-between;background:var(--ink);border-radius:999px;padding:8px 14px;height:72px;position:relative;overflow:hidden}
.banda-fir{position:absolute;left:50px;right:50px;bottom:14px;height:2px;background:var(--signal)}
.rola{position:relative;width:52px;height:52px;display:grid;place-items:center;flex:none}
.pachet{position:absolute;inset:0;border-radius:50%;background:var(--muted);opacity:.55;transform-origin:center}
.roata{position:relative;width:30px;height:30px;border-radius:50%;background:conic-gradient(var(--paper) 0 8%,var(--ink) 8% 17%,var(--paper) 17% 25%,var(--ink) 25% 33%,var(--paper) 33% 42%,var(--ink) 42% 50%,var(--paper) 50% 58%,var(--ink) 58% 67%,var(--paper) 67% 75%,var(--ink) 75% 83%,var(--paper) 83% 92%,var(--ink) 92% 100%);box-shadow:0 0 0 3px var(--paper)}
.roata::after{content:"";position:absolute;inset:9px;border-radius:50%;background:var(--ink)}
.suna .roata{animation:rola 1.1s linear infinite}
.suna .pachet{transition:transform 2.4s var(--ease-ff)}
@keyframes rola{to{transform:rotate(360deg)}}
.sloturi{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;padding-top:2px}
.slot{display:grid;gap:2px;place-items:center;min-height:52px;padding:6px 2px;border:0;border-radius:4px 4px 8px 8px;background:var(--card);color:var(--ink);font:inherit;cursor:pointer;text-align:center;box-shadow:0 4px 0 var(--line);transform:translateY(0);transition:transform .12s,opacity .15s}
.slot{position:relative}
.slot::before{content:"";position:absolute;inset:-6px 0}
.slot:hover:not(:disabled){transform:translateY(-2px)}
.slot:active:not(:disabled){transform:translateY(3px);box-shadow:0 1px 0 var(--line)}
.slot:focus-visible{outline:3px solid var(--signal);outline-offset:3px}
.slot:disabled{opacity:.4;cursor:not-allowed;box-shadow:0 2px 0 var(--line)}
.slot.gata .t{color:var(--muted)}
.slot[aria-pressed=true]{background:var(--signal);color:var(--ink);transform:translateY(3px);box-shadow:0 1px 0 var(--line)}
.slot[aria-pressed=true] .t{color:var(--ink)}
.nr{font-family:var(--display);font-weight:800;font-size:24px;line-height:1}
.t{font-family:var(--mono);font-size:11px;letter-spacing:.04em}
.scena{display:grid;place-items:center;min-height:200px}
@media (prefers-reduced-motion:reduce){.suna .roata{animation:none}.slot,.pachet{transition:none}}
</style>
