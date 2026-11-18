<script setup lang="ts">
// Caseta desenată, fără WebGL: în previzualizarea din /admin, cu mișcare redusă, în modul „lite” și când WebGL lipsește.
defineProps<{ anMin: number, anMax: number }>()
</script>

<template>
  <svg class="caseta-st" viewBox="0 0 400 256" aria-hidden="true">
    <defs>
      <linearGradient id="cs-pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2930" /><stop offset="1" stop-color="#141318" /></linearGradient>
      <radialGradient id="cs-banda" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#4A2E1E" /><stop offset="1" stop-color="#1E120B" /></radialGradient>
    </defs>
    <rect x="2" y="2" width="396" height="252" rx="16" fill="url(#cs-pl)" stroke="#3A3842" stroke-width="2" />
    <rect x="20" y="16" width="360" height="176" rx="8" fill="#EFE6D0" />
    <text x="38" y="58" fill="#14211B" font-family="Big Shoulders, Big Shoulders Display, Arial Narrow, sans-serif" font-weight="800" font-size="40">CAPSULA</text>
    <text x="362" y="58" fill="#14211B" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="12">{{ anMin }} — {{ anMax }}</text>
    <rect x="20" y="166" width="360" height="7" fill="#24493C" /><rect x="20" y="176" width="360" height="10" fill="#C9A23A" />
    <rect x="80" y="76" width="240" height="84" rx="12" fill="#0E0D12" />
    <circle cx="146" cy="118" r="56" fill="url(#cs-banda)" /><circle cx="254" cy="118" r="30" fill="url(#cs-banda)" />
    <g fill="#EDE7DA"><circle cx="146" cy="118" r="22" /><circle cx="254" cy="118" r="22" /></g>
    <g fill="#0E0D12"><circle cx="146" cy="118" r="12" /><circle cx="254" cy="118" r="12" /></g>
    <rect x="80" y="76" width="240" height="84" rx="12" fill="#fff" opacity=".06" />
    <path d="M68 254L90 210H310L332 254Z" fill="#25242B" />
    <g fill="#0E0D12"><circle cx="124" cy="232" r="8" /><circle cx="178" cy="232" r="5" /><circle cx="222" cy="232" r="5" /><circle cx="276" cy="232" r="8" /></g>
  </svg>
</template>

<style scoped>
.caseta-st{position:absolute;left:50%;top:50%;width:min(64vw,560px);transform:translate(-50%,-50%) rotate(-4deg);opacity:.5;filter:drop-shadow(0 30px 40px rgb(0 0 0/.5))}
</style>
