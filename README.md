# Capsula

Capsula timpului pentru cei care au crescut în România anilor ’90–2000.

Planul complet: [docs/PLAN.md](docs/PLAN.md)

## Pornire

Necesită Node.js 22.22.3+ (sau 24.15+).

```bash
npm install
npm run dev
```

Aplicația pornește pe http://localhost:3000.

## Structură

- `app/data/fise.ts` — tipul fișelor și constantele; conținutul e în Supabase (tabelul `fise`, import inițial în `supabase/seed/fise.json`, vezi `scripts/seed-fise.mjs`)
- `app/composables/` — profilul, caseta, Random Hit ponderat pe vârstă
- `app/components/` — banda anilor, fișa-polaroid, antetul, onboarding-ul
- `app/pages/` — Capsula, Random Hit, Ghicește anul, Caseta mea, Magazin
- `app/assets/css/banda.css` — design system-ul „Banda”
