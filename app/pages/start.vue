<script setup lang="ts">
import { CAPITOLE, type CapitolId, type Raspuns } from '~/data/chestionar'

// Chestionarul „Capsula te citește”: un ecran pe întrebare, carte de capitol între capitole.
useHead({ title: 'Capsula te citește' })
const { stare, profilCitit, profilCititor, aplica, refa } = useProfilCitit()
const pasi = construiestePasi()

// Replici scurte, ca un om care te ascultă, nu un formular.
const REPLICI: Record<CapitolId, string> = {
  copilarie: 'Nu e test, nu se notează. Răspunde cum îți vine, prima dată.',
  muzica: 'Aici de obicei se oprește lumea din vorbit și începe să fredoneze.',
  ecrane: 'Bănuim că ai așteptat vreodată să se încarce ceva. Era parte din farmec.',
  scoala: 'Jumătate din ce ții minte e din pauze, nu din ore.',
  familie: 'Poți sări peste ce nu vrei să spui. Pe „Prefer să nu spun” nu ne supărăm.',
  gusturi: 'Ultimele întrebări. Apoi îți spunem ce am citit despre tine.'
}

const reveal = computed(() => !!profilCitit.value && !stare.value.refacere && !!profilCititor.value)
const pas = computed(() => Math.min(Math.max(stare.value.pas, 0), pasi.length - 1))
const curent = computed(() => pasi[pas.value]!)
const contor = computed(() => numarIntrebare(pasi, pas.value))
const raspunsCurent = computed<Raspuns | undefined>(() =>
  curent.value.tip === 'intrebare' ? stare.value.raspunsuri[curent.value.intrebare.id] : undefined)
const poateInainte = computed(() =>
  curent.value.tip === 'capitol' || esteRaspuns(curent.value.intrebare, raspunsCurent.value))
const ultimul = computed(() => pas.value === pasi.length - 1)

const scena = ref<HTMLElement | null>(null)
const directie = ref<'inainte' | 'inapoi'>('inainte')

function seteaza(v: Raspuns) {
  if (curent.value.tip !== 'intrebare') return
  stare.value = { ...stare.value, raspunsuri: { ...stare.value.raspunsuri, [curent.value.intrebare.id]: v } }
}
async function muta(delta: number) {
  directie.value = delta > 0 ? 'inainte' : 'inapoi'
  stare.value = { ...stare.value, pas: Math.min(Math.max(pas.value + delta, 0), pasi.length - 1) }
  await nextTick()
  scena.value?.focus({ preventScroll: true })
  window.scrollTo({ top: 0 })
}
function inainte() {
  if (!poateInainte.value) return
  if (ultimul.value) { aplica(); return }
  muta(1)
}
function inapoi() { if (pas.value > 0) muta(-1) }

// Tastatură: cifrele aleg opțiunea, Enter merge mai departe (dacă focusul nu e pe un buton).
function tasta(e: KeyboardEvent) {
  if (reveal.value || e.metaKey || e.ctrlKey || e.altKey) return
  const t = e.target as HTMLElement | null
  if (e.key === 'Enter' && t?.tagName !== 'BUTTON' && t?.tagName !== 'A') { e.preventDefault(); inainte(); return }
  if (/^[1-9]$/.test(e.key) && t?.tagName !== 'INPUT') {
    const butoane = scena.value?.querySelectorAll<HTMLButtonElement>('.opt:not(.neutru), .treapta')
    butoane?.[Number(e.key) - 1]?.click()
  }
}
onMounted(() => window.addEventListener('keydown', tasta))
onBeforeUnmount(() => window.removeEventListener('keydown', tasta))
</script>

<template>
  <main class="pagina start">
    <ClientOnly>
      <ProfilReveal v-if="reveal && profilCititor" :profil="profilCititor" @refa="refa" />
      <template v-else>
        <ChestionarContor :curenta="contor.curenta" :total="contor.total" />
        <div ref="scena" class="scena" tabindex="-1" aria-live="polite">
          <Transition name="pas" mode="out-in">
            <ChestionarCapitol
              v-if="curent.tip === 'capitol'" :key="'c' + curent.capitol.id"
              :nr="curent.nr" :total="CAPITOLE.length" :titlu="curent.capitol.titlu" :subtitlu="curent.capitol.subtitlu"
              :replica="REPLICI[curent.capitol.id]" :class="directie" />
            <ChestionarPas
              v-else :key="curent.intrebare.id" :intrebare="curent.intrebare" :model-value="raspunsCurent"
              :class="directie" @update:model-value="seteaza" @trimite="inainte" />
          </Transition>
        </div>
        <div class="nav">
          <button type="button" class="btn ghost nav-b" :disabled="pas === 0" @click="inapoi">◀ Înapoi</button>
          <button type="button" class="btn nav-b" :disabled="!poateInainte" @click="inainte">
            {{ ultimul ? 'Citește-mă' : curent.tip === 'capitol' ? 'Începem' : 'Mai departe' }} ▶
          </button>
        </div>
        <p class="k tasta">Tastele 1–9 aleg, Enter merge mai departe. Răspunsurile rămân doar în browserul tău.</p>
      </template>
    </ClientOnly>
  </main>
</template>

<style scoped>
.start{max-width:680px;gap:28px;align-content:start}
.scena{outline:none;min-height:min(46vh,380px)}
.nav{display:flex;gap:10px;flex-wrap:wrap}
.nav-b{min-height:44px;justify-content:center;transition:transform .2s var(--ease-ff),background-color .2s,color .2s}
.nav-b:not(:disabled):hover{transform:translateY(-2px)}
.nav-b:not(:disabled):active{transform:translateY(1px) scale(.98)}
.tasta{margin:0;text-transform:none;letter-spacing:.02em}
.pas-enter-active,.pas-leave-active{transition:opacity .22s,transform .35s var(--ease-ff)}
.pas-enter-from.inainte,.pas-leave-to.inapoi{opacity:0;transform:translateX(28px)}
.pas-enter-from.inapoi,.pas-leave-to.inainte{opacity:0;transform:translateX(-28px)}
@media (max-width:420px){.nav-b{flex:1}}
@media (prefers-reduced-motion:reduce){
  .pas-enter-active,.pas-leave-active{transition:none}
  .nav-b:hover,.nav-b:active{transform:none}
}
</style>
