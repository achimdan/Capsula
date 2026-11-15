<script setup lang="ts">
import type { Raspuns } from '~/data/chestionar'
import { cauta, citesteRaspunsLocalitate, descrie, eticheta, raspunsLocalitate, type Localitate } from '~/utils/localitati'

// Căutare în toate localitățile din SIRUTA (combobox ARIA). Alegerea devine „loc:<siruta>:<u|r>”,
// iar dacă e unul dintre orașele din listă (Cluj-Napoca → Cluj), chiar scurtătura lui.
const props = defineProps<{ modelValue: Raspuns | undefined, autofocus?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [Raspuns] }>()

const { index, eroare, seIncarca, incarca } = useLocalitati()
const text = ref('')
const deschis = ref(false)
const activ = ref(-1)
const input = ref<HTMLInputElement>()
const idBaza = useId()

const aleasa = computed<Localitate | null>(() => {
  const r = citesteRaspunsLocalitate(props.modelValue)
  return r && index.value ? descrie(index.value, r.siruta) : null
})

const rezultate = computed<Localitate[]>(() => {
  if (!index.value) return []
  return cauta(index.value, text.value).map(s => descrie(index.value!, s)!).filter(Boolean)
})

watch(text, () => {
  activ.value = rezultate.value.length ? 0 : -1
  deschis.value = text.value.trim().length >= 2
})

onMounted(async () => {
  await incarca()
  if (!props.autofocus || !input.value) return
  input.value.focus({ preventScroll: true })
  // Câmpul e sub 13 opțiuni: îl aducem la mijloc, ca sugestiile să aibă loc dedesubt.
  const lin = matchMedia('(prefers-reduced-motion: reduce)').matches
  input.value.scrollIntoView({ block: 'center', behavior: lin ? 'auto' : 'smooth' })
})

function alege(l: Localitate) {
  const scurtatura = index.value?.date.scurtaturi[String(l.siruta)]
  emit('update:modelValue', scurtatura ?? raspunsLocalitate(l))
  text.value = ''
  deschis.value = false
}

function tasta(e: KeyboardEvent) {
  const n = rezultate.value.length
  if (e.key === 'ArrowDown' && n) {
    e.preventDefault()
    deschis.value = true
    activ.value = (activ.value + 1) % n
  } else if (e.key === 'ArrowUp' && n) {
    e.preventDefault()
    activ.value = (activ.value - 1 + n) % n
  } else if (e.key === 'Enter' && deschis.value && activ.value >= 0) {
    // Enter alege din listă; nu merge la pasul următor.
    e.preventDefault()
    e.stopPropagation()
    alege(rezultate.value[activ.value]!)
  } else if (e.key === 'Escape' && deschis.value) {
    e.stopPropagation()
    deschis.value = false
  }
}

function detalii(l: Localitate) {
  return [l.provincie, l.judet.cod === 40 ? null : `regiunea ${l.regiuneDezvoltare}`, l.urban ? 'mediu urban' : 'mediu rural']
    .filter(Boolean).join(' · ')
}
</script>

<template>
  <div class="localitate">
    <div v-if="aleasa" class="aleasa" aria-live="polite">
      <span class="k">Ai ales</span>
      <strong class="nume">{{ aleasa.nume }}</strong>
      <span class="eticheta">{{ eticheta(aleasa) }}</span>
      <span class="k">{{ detalii(aleasa) }}</span>
    </div>

    <label class="k" :for="`${idBaza}-input`">{{ aleasa ? 'Altă localitate?' : 'Scrie localitatea' }}</label>
    <div class="camp">
      <input
        :id="`${idBaza}-input`"
        ref="input"
        v-model="text"
        type="text"
        role="combobox"
        autocomplete="off"
        autocapitalize="words"
        spellcheck="false"
        placeholder="ex. Tecuci, Florești Cluj"
        :aria-expanded="deschis && rezultate.length > 0"
        :aria-controls="`${idBaza}-lista`"
        aria-autocomplete="list"
        :aria-activedescendant="deschis && activ >= 0 ? `${idBaza}-opt-${activ}` : undefined"
        :aria-describedby="`${idBaza}-nota`"
        @keydown="tasta"
        @focus="deschis = text.trim().length >= 2"
        @blur="deschis = false"
      >
      <ul v-show="deschis && rezultate.length" :id="`${idBaza}-lista`" role="listbox" class="lista" aria-label="Localități găsite">
        <li
          v-for="(l, i) in rezultate"
          :id="`${idBaza}-opt-${i}`"
          :key="l.siruta"
          role="option"
          :aria-selected="i === activ"
          class="sugestie"
          @mousedown.prevent="alege(l)"
          @mousemove="activ = i"
        >
          <span class="nume">{{ l.nume }}</span>
          <span class="eticheta">{{ eticheta(l) }}</span>
        </li>
      </ul>
    </div>
    <p :id="`${idBaza}-nota`" class="k nota" aria-live="polite">
      <template v-if="seIncarca">Încărcăm lista localităților…</template>
      <template v-else-if="eroare">Nu am putut încărca lista. <button type="button" class="reincearca" @click="incarca">Încearcă din nou</button></template>
      <template v-else-if="deschis && !rezultate.length">Nu găsim „{{ text.trim() }}”. Încearcă fără prescurtări sau adaugă județul.</template>
      <template v-else>Toate cele {{ index?.date.loc.length.toLocaleString('ro-RO') }} de localități din România (SIRUTA).</template>
    </p>
  </div>
</template>

<style scoped>
.localitate{display:grid;gap:8px;min-width:0;padding-top:8px}
.aleasa{display:grid;gap:2px;padding:14px 16px;background:var(--ink);color:var(--paper);border-radius:2px;box-shadow:0 0 0 2px var(--paper),0 0 0 4px var(--accent)}
.aleasa .k{color:inherit;opacity:.75;margin:0}
.aleasa .nume{font:800 28px/1 var(--display);text-transform:uppercase}
.camp{position:relative;min-width:0}
input{width:100%;box-sizing:border-box;font:500 17px var(--body);min-height:56px;padding:12px 16px;background:var(--card);color:var(--ink);border:1.5px solid var(--ink);border-radius:2px;transition:box-shadow .15s}
input:hover{box-shadow:4px 4px 0 var(--line)}
input:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.lista{position:absolute;z-index:5;left:0;right:0;top:calc(100% + 6px);margin:0;padding:4px;list-style:none;background:var(--card);border:1.5px solid var(--ink);border-radius:2px;box-shadow:6px 6px 0 var(--line);max-height:min(360px,50svh);overflow-y:auto}
.sugestie{display:grid;gap:2px;padding:10px 12px;min-height:44px;box-sizing:border-box;cursor:pointer;border-radius:2px}
.sugestie[aria-selected="true"]{background:var(--ink);color:var(--paper)}
.sugestie[aria-selected="true"] .eticheta{color:inherit;opacity:.8}
.nume{font-weight:600;overflow-wrap:anywhere}
.eticheta{font-size:14px;color:var(--muted)}
.aleasa .eticheta{color:inherit;opacity:.85}
.nota{margin:0;text-transform:none;letter-spacing:.02em}
.reincearca{font:inherit;min-height:44px;background:none;border:0;padding:0 4px;color:var(--ink);text-decoration:underline;cursor:pointer}
@media (prefers-reduced-motion:reduce){input{transition:none}}
</style>
