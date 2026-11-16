<script setup lang="ts">
const { profil, an15, areProfil } = useCapsula()
const scoruri = useStocare<number[]>('scoruri', [])
const interes = useStocare<string[]>('interes-magazin', [])
const produs = ref<'tricou' | 'poster'>('tricou')
const cuScor = ref(true)
const record = computed(() => scoruri.value.length ? Math.max(...scoruri.value) : null)
const oras = computed(() => profil.value.oras === 'Alt oraș' ? 'România' : (profil.value.oras ?? 'România'))
const cheie = computed(() => `${produs.value}-${an15.value}`)
const notat = computed(() => interes.value.includes(cheie.value))
function anunta() { if (!notat.value) interes.value = [...interes.value, cheie.value] }
onMounted(() => { if (!areProfil.value) navigateTo('/') })
</script>

<template>
  <main class="pagina">
    <section class="sec">
      <div class="k">Magazin · în curând</div>
      <h1 class="d1">Anul tău, tipărit</h1>
      <p class="lead">Fiecare produs se face pe comandă, cu anul, orașul și scorul tău. Încă nu vindem: spune-ne ce ți-ar plăcea și te anunțăm la lansare.</p>
      <div class="cfg card">
        <div class="mock">
          <div v-if="produs === 'tricou'" class="tee">
            <svg viewBox="0 0 200 210" aria-hidden="true"><path d="M60 10 L80 4 Q100 18 120 4 L140 10 L196 40 L178 78 L156 68 L156 206 L44 206 L44 68 L22 78 L4 40 Z" fill="#14211B" /></svg>
            <div class="print"><span class="s">Capsula · {{ oras }}</span><span class="y">’{{ String(an15).slice(2) }}</span><span class="bar" /><span class="s">Aveai 15 ani<br>Născut {{ profil.anNastere }}<template v-if="cuScor && record !== null"><br>Scor {{ record }}/500</template></span></div>
          </div>
          <div v-else class="poster">
            <span class="m">CAPSULA · {{ oras.toUpperCase() }} · {{ profil.anNastere }}–{{ an15 }}</span>
            <div><div class="py">{{ an15 }}</div><div class="cap" /></div>
            <div class="pt">Aveai 15 ani.<br>Ce tare o fost.</div>
            <span class="m">{{ cuScor && record !== null ? 'GHICEȘTE ANUL · ' + record + '/500' : 'NĂSCUT ' + profil.anNastere }}</span>
          </div>
        </div>
        <div class="opt">
          <div class="k">Produs</div>
          <div class="chips">
            <button class="chip" :aria-pressed="produs === 'tricou'" @click="produs = 'tricou'">Tricou</button>
            <button class="chip" :aria-pressed="produs === 'poster'" @click="produs = 'poster'">Poster A3</button>
          </div>
          <label class="bifa"><input v-model="cuScor" type="checkbox" :disabled="record === null"> Pune scorul meu din „Ghicește anul”</label>
          <p v-if="record === null" class="k">Joacă o dată „Ghicește anul” ca să ai un scor.</p>
          <button class="btn" :disabled="notat" @click="anunta">{{ notat ? '✓ Te anunțăm' : 'Anunță-mă la lansare' }}</button>
          <p class="k">Prețul îl stabilim după ce aflăm costurile de producție.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.sec{display:grid;gap:20px}
.cfg{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:28px}
@media (max-width:760px){.cfg{grid-template-columns:1fr}}
.mock{display:grid;place-items:center;background:var(--paper);border-radius:4px;padding:24px;min-height:340px}
.tee{width:min(300px,100%);aspect-ratio:1/1.05;position:relative}
.tee svg{width:100%;height:100%;display:block}
.print{position:absolute;left:28%;right:28%;top:30%;display:grid;gap:4px;text-align:center;color:#DCE3DA;font-family:var(--display);font-weight:800;text-transform:uppercase;line-height:.85}
.print .y{font-size:clamp(40px,7vw,58px)}
.print .s{font-family:var(--mono);font-weight:500;font-size:10px;letter-spacing:.12em;line-height:1.3}
.print .bar{height:3px;background:#E2582F;margin:4px 0}
.poster{width:min(240px,100%);aspect-ratio:3/4;background:#F4F6F1;color:#14211B;padding:18px;display:grid;align-content:space-between;box-shadow:0 18px 30px -18px rgba(0,0,0,.45)}
.py{font-family:var(--display);font-weight:800;font-size:80px;line-height:.8}
.cap{height:3px;background:#E2582F}
.pt{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:24px;line-height:.9}
.m{font-family:var(--mono);font-size:10px;letter-spacing:.1em}
.opt{display:grid;gap:14px;align-content:start;justify-items:start}
.bifa{display:flex;gap:8px;align-items:center;font-size:15px}
</style>
