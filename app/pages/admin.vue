<script setup lang="ts">
const fundal = useFundal()
useHead({ title: 'Admin · Aspect', meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <main class="pagina">
    <header>
      <p class="k">Admin</p>
      <h1 class="d2">Admin · Aspect</h1>
      <p class="lead">Alege fundalul paginii. Se aplică imediat.</p>
    </header>

    <ClientOnly>
      <fieldset class="grila">
        <legend class="sr">Fundal</legend>
        <label v-for="f in FUNDALURI" :key="f.id" class="optiune">
          <input v-model="fundal" class="sr" type="radio" name="fundal" :value="f.id">
          <span class="tile previzualizare" :data-fundal="f.id">
            <FundalCapsula :tema="f.id" mini />
            <span class="proba">
              <span class="k">Fișă · 1994</span>
              <strong class="titlu">Caseta de vară</strong>
            </span>
            <span v-if="fundal === f.id" class="stare">Activ</span>
          </span>
          <span class="nume">{{ f.nume }}</span>
          <span class="desc">{{ f.descriere }}</span>
        </label>
      </fieldset>
      <template #fallback><div class="grila" style="min-height:240px" /></template>
    </ClientOnly>

    <p class="k nota">Setarea se salvează în acest browser. Când conectăm conturile, o mutăm pe server.</p>
  </main>
</template>

<style scoped>
.grila{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:20px;border:0;padding:0;margin:0;min-width:0}
.optiune{display:grid;gap:4px;cursor:pointer;min-height:44px}
.tile{position:relative;display:grid;align-items:end;min-height:160px;padding:16px;overflow:hidden;
  background:var(--paper);color:var(--ink);border:2px solid var(--line);border-radius:4px;isolation:isolate;
  transition:transform .2s var(--ease-ff),border-color .2s}
.optiune:hover .tile{transform:translateY(-3px);border-color:var(--ink)}
.optiune:active .tile{transform:translateY(0) scale(.98)}
input:checked + .tile{border-color:var(--signal);box-shadow:0 0 0 2px var(--signal)}
input:focus-visible + .tile{outline:3px solid var(--signal);outline-offset:3px}
.proba{position:relative;z-index:1;display:grid;gap:4px;background:var(--card);border:1px solid var(--line);border-radius:4px;padding:12px;color:var(--ink)}
.titlu{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:22px;line-height:.9}
.stare{position:absolute;z-index:2;top:8px;right:8px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;background:var(--signal);color:#14211B;padding:2px 8px;border-radius:2px}
.nume{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:22px;margin-top:6px}
.desc{color:var(--muted);font-size:14px}
.nota{text-transform:none;letter-spacing:0;font-size:13px}
@media (prefers-reduced-motion:reduce){.tile{transition:none}.optiune:hover .tile,.optiune:active .tile{transform:none}}
</style>
