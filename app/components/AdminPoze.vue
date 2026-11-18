<script setup lang="ts">
// Managerul de fișiere din /admin: pozele urcate de utilizatori la „Pune și tu o fișă” (bucketul privat `amintiri`).
// Se încarcă doar la cerere, ca pagina de admin să nu ceară linkuri pentru toate pozele la fiecare deschidere.
import { caleVarianta, toateVariantele, type PozaProprie } from '~/utils/pozeProprii'

const api = pozeApi()
const queryClient = useQueryClient()
const deschis = ref(false)
const query = useQuery({ queryKey: queryKeys.pozeAdmin, queryFn: () => api.toate(), enabled: deschis })
const poze = computed(() => query.data.value ?? [])
const linkuri = useLinkuriPoze(computed(() => poze.value.flatMap(toateVariantele)))
const utilizatori = computed(() => new Set(poze.value.map(p => p.cale.split('/')[0])).size)

const deSters = ref<string | null>(null)
const eroare = ref('')
const stergere = useMutation({
  mutationFn: (p: PozaProprie) => api.sterge(p),
  onSuccess: (_, p) => queryClient.setQueryData<PozaProprie[]>(queryKeys.pozeAdmin, l => (l ?? []).filter(x => x.cale !== p.cale))
})
async function sterge(p: PozaProprie) {
  if (deSters.value !== p.cale) { deSters.value = p.cale; return }
  eroare.value = ''
  try { await stergere.mutateAsync(p) } catch { eroare.value = 'Nu am putut șterge poza.' } finally { deSters.value = null }
}
const data = (p: PozaProprie) => p.creata ? new Date(p.creata).toLocaleDateString('ro-RO') : ''
</script>

<template>
  <div class="poze">
    <button v-if="!deschis" type="button" class="btn ghost" @click="deschis = true">Arată pozele</button>
    <p v-else-if="query.isLoading.value" class="mesaj" role="status">Caut pozele…</p>
    <p v-else-if="query.isError.value" class="mesaj" role="alert">Nu am putut citi pozele.</p>
    <template v-else>
      <p class="mesaj">{{ poze.length }} {{ poze.length === 1 ? 'poză' : 'poze' }} de la {{ utilizatori }} {{ utilizatori === 1 ? 'utilizator' : 'utilizatori' }}. Ștergerea e definitivă; fișa care o folosea rămâne fără poză.</p>
      <ul v-if="poze.length" class="grila">
        <li v-for="p in poze" :key="p.cale">
          <a v-if="linkuri[caleVarianta(p.cale, 960, p.ext)]" :href="linkuri[caleVarianta(p.cale, 960, p.ext)]" target="_blank" rel="noopener" class="poza">
            <img v-if="linkuri[caleVarianta(p.cale, 480, p.ext)]" :src="linkuri[caleVarianta(p.cale, 480, p.ext)]" alt="" width="160" height="160" loading="lazy" decoding="async">
          </a>
          <span class="meta">{{ p.cale.slice(0, 8) }} · {{ data(p) }}</span>
          <button type="button" class="sterge" :disabled="stergere.isPending.value" @click="sterge(p)">{{ deSters === p.cale ? 'Sigur? Șterge' : 'Șterge' }}</button>
        </li>
      </ul>
      <p v-if="eroare" class="mesaj" role="alert">{{ eroare }}</p>
    </template>
  </div>
</template>

<style scoped>
.poze{display:grid;gap:12px;justify-items:start}
.mesaj{margin:0;font-family:var(--mono);font-size:13px;color:var(--muted)}
.grila{list-style:none;margin:0;padding:0;width:100%;display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px}
.grila li{display:grid;gap:4px;min-width:0}
.poza{display:block;aspect-ratio:1;border:1px solid var(--line);background:var(--card);overflow:hidden}
.poza:focus-visible,.sterge:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.poza img{width:100%;height:100%;object-fit:cover;display:block}
.meta{font-family:var(--mono);font-size:11px;color:var(--muted);overflow-wrap:anywhere}
.sterge{justify-self:start;min-height:44px;border:0;background:none;color:var(--ink);font:500 13px var(--body);cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.sterge:disabled{opacity:.4}
</style>
