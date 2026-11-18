<script setup lang="ts">
// Managerul de poze al utilizatorului, la „Pune și tu o fișă”: urci o poză, alegi una deja urcată sau ștergi.
// Pozele sunt private (bucketul `amintiri`); se văd prin linkuri semnate.
import { POZE_PE_CONT, caleVarianta, valideazaSursa, type PozaProprie } from '~/utils/pozeProprii'

const aleasa = defineModel<PozaProprie | null>({ default: null })
const { poze, linkuri, seIncarca, urca, seUrca, sterge } = usePozeProprii()

const input = ref<HTMLInputElement | null>(null)
const eroare = ref('')
const deSters = ref<string | null>(null)
const seSterge = ref(false)

const mica = (p: PozaProprie) => linkuri.value[caleVarianta(p.cale, 480, p.ext)]
const plin = computed(() => poze.value.length >= POZE_PE_CONT)

async function laAlegere(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!f) return
  eroare.value = valideazaSursa(f) ?? ''
  if (eroare.value) return
  try {
    aleasa.value = await urca(f)
  } catch {
    eroare.value = 'Nu am putut urca poza. Încearcă din nou.'
  }
}

function comuta(p: PozaProprie) {
  deSters.value = null
  aleasa.value = aleasa.value?.cale === p.cale ? null : p
}

async function stergePoza(p: PozaProprie) {
  if (deSters.value !== p.cale) { deSters.value = p.cale; return }
  seSterge.value = true
  eroare.value = ''
  try {
    await sterge(p)
    if (aleasa.value?.cale === p.cale) aleasa.value = null
  } catch {
    eroare.value = 'Nu am putut șterge poza.'
  } finally {
    seSterge.value = false
    deSters.value = null
  }
}
</script>

<template>
  <div class="galerie">
    <div class="sus">
      <span class="k">Poză <span class="opt">(opțional)</span></span>
      <button type="button" class="urca" :disabled="seUrca || plin" @click="input?.click()">
        {{ seUrca ? 'Se urcă…' : '+ Urcă o poză' }}
      </button>
      <input ref="input" type="file" accept="image/*" class="ascuns" tabindex="-1" aria-hidden="true" @change="laAlegere">
    </div>
    <p class="mesaj">Le vezi doar tu. Le micșorăm înainte de urcare și scoatem datele ascunse din fișier, cum ar fi locul unde a fost făcută poza.</p>
    <p v-if="seIncarca" class="mesaj" role="status">Caut pozele tale…</p>
    <ul v-else-if="poze.length" class="grila" aria-label="Pozele tale">
      <li v-for="p in poze" :key="p.cale" :class="{ aleasa: aleasa?.cale === p.cale }">
        <button type="button" class="poza" :aria-pressed="aleasa?.cale === p.cale" :aria-label="aleasa?.cale === p.cale ? 'Poza aleasă. Apasă ca să n-o mai folosești' : 'Alege poza'" @click="comuta(p)">
          <img v-if="mica(p)" :src="mica(p)" alt="" width="160" height="160" loading="lazy" decoding="async">
        </button>
        <button type="button" class="sterge" :disabled="seSterge" @click="stergePoza(p)">
          {{ deSters === p.cale ? 'Sigur?' : 'Șterge' }}
        </button>
      </li>
    </ul>
    <p v-else class="mesaj">Încă nu ai urcat nicio poză.</p>
    <p v-if="plin" class="mesaj">Ai {{ POZE_PE_CONT }} de poze. Șterge una ca să urci alta.</p>
    <p v-if="eroare" class="mesaj eroare" role="alert">{{ eroare }}</p>
  </div>
</template>

<style scoped>
.galerie{display:grid;gap:10px;min-width:0}
.sus{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}
.opt{text-transform:none;letter-spacing:0}
.ascuns{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.urca{min-height:44px;padding:6px 14px;border:0;background:var(--ink);color:var(--paper);font:600 14px var(--body);border-radius:2px;cursor:pointer;transition:opacity .15s,transform .1s}
.urca:hover{opacity:.88}
.urca:active{transform:scale(.97)}
.urca:disabled{opacity:.4;cursor:default}
.urca:focus-visible,.poza:focus-visible,.sterge:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.mesaj{margin:0;font-family:var(--mono);font-size:13px;color:var(--muted)}
.eroare{color:var(--ink);font-weight:700}
.grila{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px}
.grila li{display:grid;gap:4px;min-width:0}
.poza{display:block;aspect-ratio:1;padding:0;border:2px solid var(--line);background:var(--card);cursor:pointer;overflow:hidden;border-radius:2px;transition:border-color .15s,transform .1s}
.poza:hover{border-color:var(--ink)}
.poza:active{transform:scale(.97)}
.poza img{width:100%;height:100%;object-fit:cover;display:block}
.aleasa .poza{border:3px solid var(--ink)}
.sterge{min-height:44px;border:0;background:none;color:var(--muted);font:500 13px var(--body);cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.sterge:hover{color:var(--ink)}
.sterge:disabled{opacity:.4}
@media (prefers-reduced-motion:reduce){.urca,.poza{transition:none}.urca:active,.poza:active{transform:none}}
</style>
