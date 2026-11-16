<script setup lang="ts">
import { ALT_ORAS, PREFER, SCALA_MAX, SCALA_MIN, type Intrebare, type Raspuns } from '~/data/chestionar'
import { citesteRaspunsLocalitate } from '~/utils/localitati'

const props = defineProps<{ intrebare: Intrebare, modelValue: Raspuns | undefined }>()
const emit = defineEmits<{ 'update:modelValue': [Raspuns], 'trimite': [] }>()

const treptele = Array.from({ length: SCALA_MAX - SCALA_MIN + 1 }, (_, i) => SCALA_MIN + i)
const multi = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))
const an = computed(() => (typeof props.modelValue === 'number' ? props.modelValue : ''))

function alege(id: string | number) { emit('update:modelValue', id) }

// Întrebarea cu localitate: „Altă localitate” deschide căutarea; o localitate aleasă o ține bifată.
const cuLocalitate = computed(() => props.intrebare.tip === 'unic' && !!props.intrebare.permiteLocalitate)
const eLocalitate = computed(() => !!citesteRaspunsLocalitate(props.modelValue))
const cautaLocalitate = computed(() => cuLocalitate.value && (props.modelValue === ALT_ORAS || eLocalitate.value))
const focusCautare = ref(false)
function bifat(id: string) {
  return props.modelValue === id || (id === ALT_ORAS && cuLocalitate.value && eLocalitate.value)
}
function alegeOptiune(id: string) {
  focusCautare.value = cuLocalitate.value && id === ALT_ORAS
  // Re-click pe „Altă localitate” păstrează localitatea deja aleasă.
  if (id === ALT_ORAS && eLocalitate.value) return
  alege(id)
}
function comuta(id: string) {
  if (props.intrebare.tip !== 'multiplu') return
  if (id === PREFER) return emit('update:modelValue', multi.value.includes(PREFER) ? [] : [PREFER])
  const fara = multi.value.filter(x => x !== PREFER)
  emit('update:modelValue', fara.includes(id) ? fara.filter(x => x !== id) : [...fara, id])
}
function plinMulti(id: string) {
  return props.intrebare.tip === 'multiplu' && id !== PREFER && !multi.value.includes(id)
    && multi.value.filter(x => x !== PREFER).length >= props.intrebare.max
}
function scrieAn(e: Event) {
  const v = (e.target as HTMLInputElement).value
  emit('update:modelValue', v === '' ? null : Number(v))
}
</script>

<template>
  <fieldset class="pas">
    <legend class="intrebare d2">{{ intrebare.text }}</legend>
    <p v-if="intrebare.tip === 'multiplu'" class="k sus">Alege până la {{ intrebare.max }}</p>
    <p v-else-if="intrebare.ajutor" class="k sus">{{ intrebare.ajutor }}</p>

    <div v-if="intrebare.tip === 'an'" class="an">
      <label class="k" for="ch-an">Anul nașterii ({{ intrebare.min }}–{{ intrebare.max }})</label>
      <input
id="ch-an" :value="an" type="number" inputmode="numeric" :min="intrebare.min" :max="intrebare.max" placeholder="ex. 1984"
        autocomplete="bday-year" @input="scrieAn" @keydown.enter.prevent="emit('trimite')">
    </div>

    <div v-else-if="intrebare.tip === 'multiplu'" class="optiuni" role="group" :aria-label="intrebare.text">
      <button
v-for="(o, i) in intrebare.optiuni" :key="o.id" type="button" class="opt" :aria-pressed="multi.includes(o.id)"
        :disabled="plinMulti(o.id)" @click="comuta(o.id)">
        <span class="nr" aria-hidden="true">{{ i + 1 }}</span><span>{{ o.text }}</span>
      </button>
    </div>

    <div v-else-if="intrebare.tip === 'scala'" class="scala" role="radiogroup" :aria-label="intrebare.text">
      <div class="trepte">
        <button
v-for="n in treptele" :key="n" type="button" class="treapta" role="radio" :aria-checked="modelValue === n"
          :aria-label="`${n} din ${SCALA_MAX}`" @click="alege(n)">{{ n }}</button>
      </div>
      <div class="capete k" aria-hidden="true"><span>{{ intrebare.etichete[0] }}</span><span>{{ intrebare.etichete[1] }}</span></div>
      <button v-if="intrebare.permiteNeutru" type="button" class="opt neutru" :aria-pressed="modelValue === PREFER" @click="alege(PREFER)">Prefer să nu spun</button>
    </div>

    <div v-else class="optiuni" :class="{ dublu: intrebare.tip === 'asta-sau-aia' }" role="radiogroup" :aria-label="intrebare.text">
      <button
v-for="(o, i) in intrebare.optiuni" :key="o.id" type="button" class="opt" role="radio" :aria-checked="bifat(o.id)"
        @click="alegeOptiune(o.id)">
        <span class="nr" aria-hidden="true">{{ i + 1 }}</span><span>{{ o.text }}</span>
      </button>
    </div>
    <ChestionarLocalitate
      v-if="cautaLocalitate" :model-value="modelValue" :autofocus="focusCautare"
      @update:model-value="v => emit('update:modelValue', v)" />
  </fieldset>
</template>

<style scoped>
.pas{border:0;margin:0;padding:0;min-width:0;display:grid;gap:16px}
.intrebare{padding:0;margin-bottom:4px;text-wrap:balance}
.sus{margin:0}
.optiuni{display:grid;gap:10px}
.opt{display:flex;align-items:center;gap:12px;text-align:left;min-height:56px;padding:12px 16px;font:500 17px/1.3 var(--body);color:var(--ink);background:var(--card);
  border:1.5px solid var(--ink);border-radius:2px;cursor:pointer;transition:transform .2s var(--ease-ff),background-color .2s,color .2s}
.opt{position:relative}
.opt::before{content:"";position:absolute;inset:-2px -2px -2px -6px}
.opt:hover:not(:disabled){transform:translateX(4px);border-color:var(--accent)}
.opt:active:not(:disabled){transform:scale(.985)}
.opt:disabled{opacity:.4;cursor:default}
.opt[aria-checked="true"],.opt[aria-pressed="true"]{background:var(--ink);color:var(--paper);box-shadow:0 0 0 2px var(--paper),0 0 0 4px var(--accent)}
.nr{flex:none;display:grid;place-items:center;width:28px;height:28px;font:500 13px var(--mono);border:1.5px solid currentColor;border-radius:2px}
.neutru{min-height:44px;justify-self:start;font-size:15px;margin-top:8px}
.an input{min-height:56px;font-size:28px;font-family:var(--display);font-weight:800;max-width:220px}
.trepte{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.treapta{min-height:56px;font:800 28px var(--display);color:var(--ink);background:var(--card);border:1.5px solid var(--ink);border-radius:2px;cursor:pointer;transition:transform .2s var(--ease-ff),background-color .2s,color .2s}
.treapta{position:relative}
.treapta::before{content:"";position:absolute;inset:-4px 0}
.treapta:hover{transform:translateY(-3px);border-color:var(--accent)}
.treapta:active{transform:scale(.96)}
.treapta[aria-checked="true"]{background:var(--ink);color:var(--paper);box-shadow:0 0 0 2px var(--paper),0 0 0 4px var(--accent)}
.capete{display:flex;justify-content:space-between;gap:12px;margin-top:8px}
.capete span{min-width:0}
@media (min-width:640px){.dublu{grid-template-columns:1fr 1fr}.dublu .opt{min-height:96px}}
@media (prefers-reduced-motion:reduce){.opt,.treapta{transition:none}.opt:hover,.opt:active,.treapta:hover,.treapta:active{transform:none}}
</style>
