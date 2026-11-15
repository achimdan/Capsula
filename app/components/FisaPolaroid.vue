<script setup lang="ts">
import type { Fisa } from '~/data/fise'
const props = withDefaults(defineProps<{ fisa: Fisa; ascundeAn?: boolean; actiuni?: boolean; developare?: boolean }>(), {
  ascundeAn: false, actiuni: true, developare: false
})
const { caseta, amAvut, comuta } = useCapsula()
const salvata = computed(() => caseta.value.includes(props.fisa.id))
const avut = computed(() => amAvut.value.includes(props.fisa.id))
function comutaCaseta() { comuta(caseta, props.fisa.id) }
function comutaAvut() { comuta(amAvut, props.fisa.id) }
const anText = computed(() => props.ascundeAn ? '????' : props.fisa.an + (props.fisa.an_exact ? '' : ' ≈'))
</script>

<template>
  <article class="fisa" :class="{ dev: developare }">
    <div class="img" :style="{ background: `linear-gradient(135deg, ${fisa.culori[0]}, ${fisa.culori[1]})` }">
      <span>{{ fisa.categorie }}{{ fisa.oras ? ' · ' + fisa.oras : '' }}</span>
    </div>
    <div class="meta"><span>NR. INV. {{ fisa.id }}</span><span :class="{ ascuns: ascundeAn }">{{ anText }}</span></div>
    <h3>{{ fisa.titlu }}</h3>
    <p>{{ fisa.nota }}</p>
    <p v-if="fisa.sursa" class="sursa">Sursă: {{ fisa.sursa }}</p>
    <div v-if="actiuni" class="act">
      <button type="button" :aria-pressed="avut" @click="comutaAvut">{{ avut ? '✓ Am fost acolo' : (fisa.categorie === 'Locuri' ? 'Am fost acolo' : 'Am avut asta') }}</button>
      <button type="button" class="sec" :aria-pressed="salvata" @click="comutaCaseta">{{ salvata ? '✓ În casetă' : '+ Caseta mea' }}</button>
    </div>
  </article>
</template>

<style scoped>
.fisa{background:#F4F6F1;color:#14211B;padding:10px 10px 14px;box-shadow:0 18px 30px -18px rgba(0,0,0,.45);width:min(300px,100%)}
.img{aspect-ratio:1;position:relative;overflow:hidden}
.img span{position:absolute;left:8px;bottom:8px;font-family:var(--mono);font-size:11px;color:#F4F6F1;background:rgba(20,33,27,.6);padding:2px 6px}
.meta{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;margin-top:10px;color:#4F5F55}
.ascuns{background:#14211B;color:#14211B;border-radius:2px;padding:0 4px}
h3{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:28px;line-height:.92;margin:6px 0}
p{font-size:14px;line-height:1.45;margin:0}
.sursa{font-family:var(--mono);font-size:11px;color:#4F5F55;margin-top:8px}
.act{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;border-top:1px dashed #B9C6B6;padding-top:10px}
.act button{font:600 13px var(--body);background:#14211B;color:#F4F6F1;border:0;padding:7px 10px;border-radius:2px;cursor:pointer}
.act button.sec{background:transparent;color:#14211B;box-shadow:inset 0 0 0 1.5px #14211B}
.act button[aria-pressed="true"]{background:#E2582F;color:#14211B;box-shadow:none}
.dev .img{animation:dev 2.4s ease-out}
@keyframes dev{0%{filter:brightness(2.4) contrast(.25) saturate(0)}100%{filter:none}}
</style>
