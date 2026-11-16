<script setup lang="ts">
// Confidențialitate: ce date ținem și de ce, plus exportul și ștergerea contului.
// Descrie doar ce face codul azi; textul e o ciornă până la o verificare juridică.
import { OPERATOR } from '~/data/confidentialitate'

useHead({ title: 'Confidențialitate · Capsula' })

const { autentificat } = useAuth()
const { descarca, stergeCont } = useDatePersonale()

const confirmare = ref(false)
const ocupat = ref<'' | 'export' | 'sterge'>('')
const eroare = ref('')

async function exporta() {
  eroare.value = ''
  ocupat.value = 'export'
  try {
    await descarca()
  } catch {
    eroare.value = 'Nu am putut pregăti fișierul. Încearcă din nou.'
  } finally {
    ocupat.value = ''
  }
}

async function sterge() {
  eroare.value = ''
  ocupat.value = 'sterge'
  try {
    await stergeCont()
  } catch {
    eroare.value = 'Nu am putut șterge contul. Nu s-a pierdut nimic; încearcă din nou.'
    ocupat.value = ''
    confirmare.value = false
  }
}
</script>

<template>
  <main class="pagina">
    <section class="sec text">
      <div class="k">Confidențialitate</div>
      <h1 class="d1">Ce păstrăm despre tine</h1>
      <p class="lead">
        Capsula ține doar ce îi trebuie ca să-ți arate capsula ta. Nu vindem date, nu avem reclame și nu folosim
        programe de analiză a traficului.
      </p>
      <p class="nota">Ciornă, actualizată pe 16 noiembrie 2026.</p>

      <h2 class="d2">Cine răspunde de date</h2>
      <p>{{ OPERATOR.nume }}. Pentru orice întrebare despre datele tale: {{ OPERATOR.contact }}.</p>

      <h2 class="d2">Ce date ținem</h2>
      <ul>
        <li><strong>Contul Google:</strong> adresa de e-mail, numele și poza de profil, primite de la Google când intri.</li>
        <li><strong>Profilul tău:</strong> anul nașterii, orașul sau localitatea și profilul citit din test.</li>
        <li><strong>Răspunsurile la test</strong>, ca să-l poți relua de unde ai rămas.</li>
        <li><strong>Caseta mea:</strong> fișele pe care le-ai salvat.</li>
        <li><strong>Amintirile tale:</strong> fișele scrise de tine (titlu, an, categorie, notă). Le vezi doar tu.</li>
      </ul>
      <p>
        Le folosim doar ca să-ți arătăm capsula personalizată și să-ți păstrăm salvările între dispozitive.
        Le păstrăm cât timp ai cont; când îl ștergi, pleacă toate.
      </p>

      <h2 class="d2">Pe cine folosim</h2>
      <ul>
        <li><strong>Supabase</strong> găzduiește baza de date și conturile.</li>
        <li><strong>Cloudflare</strong> servește site-ul. Ca orice server, înregistrează cererile (inclusiv adresa IP) în jurnale tehnice.</li>
        <li><strong>Google</strong> se ocupă de conectare, doar când intri în cont. Fonturile le servim noi, nu Google.</li>
      </ul>

      <h2 class="d2">În browserul tău</h2>
      <p>
        Păstrăm în browser sesiunea de conectare și o copie a profilului și a casetei, ca pagina să se deschidă repede.
        Nu folosim cookie-uri de urmărire.
      </p>

      <h2 class="d2">Drepturile tale</h2>
      <p>
        Poți cere oricând să vezi, să corectezi sau să ștergi datele tale. Profilul îl corectezi refăcând testul, iar
        mai jos poți descărca tot sau șterge contul. Dacă ai o plângere, te poți adresa
        <a href="https://www.dataprotection.ro/" target="_blank" rel="noopener">ANSPDCP</a>.
      </p>
    </section>

    <section v-if="autentificat" id="datele-tale" class="sec text">
      <div class="k">Contul tău</div>
      <h2 class="d2">Datele tale</h2>
      <div class="card actiuni">
        <div>
          <p class="titlu">Descarcă datele mele</p>
          <p>Un fișier JSON cu tot ce ține de contul tău.</p>
          <button type="button" class="btn" :disabled="!!ocupat" :aria-busy="ocupat === 'export'" @click="exporta">
            {{ ocupat === 'export' ? 'Pregătim fișierul…' : 'Descarcă' }}
          </button>
        </div>
        <div>
          <p class="titlu">Șterge contul</p>
          <p>Șterge contul și tot ce ai salvat: profilul, testul, caseta și amintirile tale.</p>
          <button type="button" class="btn sterge" :disabled="!!ocupat" @click="confirmare = true">Șterge contul</button>
        </div>
      </div>
      <p v-if="eroare" class="eroare" role="alert">{{ eroare }}</p>
    </section>

    <UModal
      v-model:open="confirmare"
      title="Ștergi contul?"
      description="Profilul, răspunsurile la test, caseta și amintirile tale se șterg definitiv. Nu le mai putem recupera."
      :dismissible="ocupat !== 'sterge'"
      :ui="{ content: 'max-w-sm' }"
    >
      <template #body>
        <div class="confirma">
          <button type="button" class="btn sterge" :disabled="ocupat === 'sterge'" :aria-busy="ocupat === 'sterge'" @click="sterge">
            {{ ocupat === 'sterge' ? 'Ștergem…' : 'Da, șterge tot' }}
          </button>
          <button type="button" class="btn" :disabled="ocupat === 'sterge'" @click="confirmare = false">Renunț</button>
        </div>
      </template>
    </UModal>
  </main>
</template>

<style scoped>
.text{max-width:680px;display:grid;gap:14px}
.text h2{margin-top:18px}
.text p,.text ul{margin:0}
.text ul{padding-left:20px;display:grid;gap:6px}
.text a{text-decoration:underline}
.nota{font-family:var(--mono, 'IBM Plex Mono', monospace);font-size:13px;color:var(--muted)}
.actiuni{display:grid;gap:24px}
.actiuni > div{display:grid;gap:8px;justify-items:start}
.titlu{font-weight:600}
.btn{min-height:44px}
.btn:focus-visible{outline:3px solid var(--ink);outline-offset:3px}
.btn.sterge{border-color:var(--ink);font-weight:600}
.eroare{color:var(--ink);font-weight:600}
.confirma{display:grid;gap:10px}
</style>
