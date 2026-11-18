<script setup lang="ts">
// Formularul pentru „amintirile tale”: fișe scrise de utilizator, salvate în contul lui și puse pe bandă lângă celelalte.
import { LIMITE_FISA, valideazaFisa, type FisaNoua } from '~/utils/fiseProprii'
import { ORDINE_CATEGORII } from '~/utils/personalizare'
import { fiseProprieCuAcelasiTitlu } from '#shared/utils/sugestiiFisa'

const props = defineProps<{ anImplicit: number | null }>()
const { userId, fise, adauga, salveaza } = useFiseProprii()
const { deschide } = useIntrare()

const { profil } = useCapsula()
const anMax = new Date().getFullYear()
const anMin = computed(() => profil.value.anNastere ?? LIMITE_FISA.anMin)
const gol = (): FisaNoua => ({ titlu: '', nota: '', an: props.anImplicit, categorie: null })
const forma = ref<FisaNoua>(gol())
const eroare = ref('')
const salvat = ref('')

const sugestii = useSugestiiFisa()
const cereSugestii = () => sugestii.cere(forma.value.titlu, forma.value.nota)
const { seamana, seCauta } = sugestii
// Ai deja o fișă cu titlul ăsta (scris oricum): se vede pe loc, fără cerere la server.
const dejaAle = computed(() => fiseProprieCuAcelasiTitlu(forma.value.titlu, fise.value))
const categoriePropusa = computed(() => sugestii.categorie.value !== forma.value.categorie ? sugestii.categorie.value : null)

async function trimite() {
  salvat.value = ''
  eroare.value = valideazaFisa(forma.value, anMax, anMin.value)
    ?? (dejaAle.value.length ? 'Ai deja o fișă cu titlul ăsta. Schimbă titlul dacă e altă amintire.' : '')
  if (eroare.value) return
  try {
    await adauga(forma.value)
    salvat.value = `„${forma.value.titlu.trim()}” e pe bandă, în ${forma.value.an}.`
    forma.value = { ...gol(), an: forma.value.an }
    sugestii.goleste()
  } catch {
    eroare.value = fise.value.length >= LIMITE_FISA.peCont
      ? `Ai deja ${LIMITE_FISA.peCont} de fișe proprii.`
      : 'Nu am putut salva fișa. Încearcă din nou.'
  }
}
</script>

<template>
  <section class="sec amintiri" aria-labelledby="amintiri-titlu">
    <div class="k">Doar în capsula ta</div>
    <h2 id="amintiri-titlu" class="d2">Pune și tu o fișă</h2>

    <template v-if="!userId">
      <p class="lead">Scrie ce ți-a rămas din anii aceia: un obiect, o melodie, un loc. Fișele tale stau pe bandă lângă celelalte și le vezi doar tu, din contul tău.</p>
      <div><button type="button" class="btn ghost" @click="deschide">Intră ca să scrii</button></div>
    </template>

    <form v-else class="card forma" novalidate @submit.prevent="trimite">
      <p class="lead">Le vezi doar tu. Apar pe bandă cu eticheta „a ta” și le poți șterge din fișă.</p>
      <label class="camp lat">
        <span class="k">Titlu</span>
        <input v-model="forma.titlu" type="text" :maxlength="LIMITE_FISA.titlu" required placeholder="Primul walkman" @blur="cereSugestii">
      </label>
      <label class="camp">
        <span class="k">Anul</span>
        <input v-model.number="forma.an" type="number" inputmode="numeric" :min="anMin" :max="anMax" required>
      </label>
      <label class="camp">
        <span class="k">Categoria</span>
        <select v-model="forma.categorie" required>
          <option :value="null" disabled>Alege</option>
          <option v-for="c in ORDINE_CATEGORII" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <button v-if="categoriePropusa" type="button" class="lat propune" @click="forma.categorie = categoriePropusa">
        Pare <b>{{ categoriePropusa }}</b> · alege
      </button>
      <label class="camp lat">
        <span class="k">Ce îți amintești <span class="opt">(opțional)</span></span>
        <textarea v-model="forma.nota" rows="3" :maxlength="LIMITE_FISA.nota" @blur="cereSugestii" />
      </label>
      <div v-if="dejaAle.length" class="lat seamana" role="status">
        <span class="k">Ai deja</span>
        <ul>
          <li v-for="f in dejaAle" :key="f.id">{{ f.titlu }} <span class="an">{{ f.an }}</span></li>
        </ul>
        <p class="mesaj">E printre fișele tale, așa că n-o mai poți pune o dată. Dacă e altă amintire, schimbă titlul.</p>
      </div>
      <p v-if="seCauta" class="lat mesaj" role="status">Caut fișe care seamănă…</p>
      <div v-else-if="seamana.length" class="lat seamana" role="status">
        <span class="k">Seamănă cu</span>
        <ul>
          <li v-for="f in seamana" :key="f.id">{{ f.titlu }} <span class="an">{{ f.an }}{{ f.an_exact ? '' : ' ≈' }}</span></li>
        </ul>
        <p class="mesaj">Dacă e deja aici, poți s-o pui în casetă. Dacă e amintirea ta, pune-o oricum.</p>
      </div>
      <div class="lat jos">
        <button type="submit" class="btn" :disabled="salveaza || dejaAle.length > 0">{{ salveaza ? 'Se salvează…' : 'Pune pe bandă' }}</button>
        <p v-if="eroare" class="mesaj eroare" role="alert">{{ eroare }}</p>
        <p v-else-if="salvat" class="mesaj" role="status">{{ salvat }}</p>
        <p v-else class="mesaj">{{ fise.length }} / {{ LIMITE_FISA.peCont }}</p>
      </div>
    </form>
  </section>
</template>

<style scoped>
.forma{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.forma .lead{grid-column:1 / -1}
.camp{display:grid;gap:6px;min-width:0}
.lat{grid-column:1 / -1}
.opt{text-transform:none;letter-spacing:0}
.jos{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px}
.jos .btn{min-height:44px}
.mesaj{margin:0;font-family:var(--mono);font-size:13px;color:var(--muted)}
.eroare{color:var(--ink);font-weight:700}
.propune{justify-self:start;min-height:44px;padding:6px 12px;border:1px dashed var(--line);background:none;color:var(--ink);font:500 13px var(--body);cursor:pointer;transition:background-color .15s,color .15s,transform .1s}
.propune:hover{background:var(--ink);color:var(--paper)}
.propune:active{transform:scale(.97)}
.propune:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.seamana{display:grid;gap:6px;padding:12px 14px;border:1px dashed var(--line)}
.seamana ul{margin:0;padding:0;list-style:none;display:grid;gap:4px}
.seamana li{font:500 15px var(--body);min-width:0;overflow-wrap:anywhere}
.seamana .an{font-family:var(--mono);font-size:12px;color:var(--muted)}
@media (max-width:480px){.forma{grid-template-columns:minmax(0,1fr)}}
</style>
