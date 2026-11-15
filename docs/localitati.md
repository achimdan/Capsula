# Localități (SIRUTA)

Întrebarea „Unde ți-ai tocit genunchii în copilărie?” permite căutarea oricărei localități din România.

- **Sursa:** nomenclatorul SIRUTA al INS, ediția S1 2026, de pe [data.gov.ro](https://data.gov.ro/dataset/siruta_s1-2026). CSV UTF-8, separator `;`.
- **Fișierul din aplicație:** `public/data/localitati.json` (~500 KB, ~150 KB comprimat), generat de `scripts/build-localitati.mjs`. Se încarcă doar pe pasul cu localitatea, ca fișier static; nu trece prin Supabase.
- **Regenerare** (SIRUTA se actualizează de două ori pe an):
  ```bash
  node scripts/build-localitati.mjs <cale/siruta.csv> "SIRUTA S1 2027"
  npm test
  ```
- **Logica** (căutare fără diacritice, ordonare după importanță, etichete, provincie istorică, regiune de dezvoltare): `app/utils/localitati.ts`, testată în `tests/localitati.test.ts` pe fișierul real.
- **Răspunsul** în chestionar: `loc:<siruta>:<u|r>` (u = urban, r = rural). Mediul e în răspuns ca scorul să nu depindă de listă. Orașele din scurtături (Cluj-Napoca, București…) se salvează ca scurtătura lor, ca să deblocheze stratul de fișe.
- **Provincia istorică** e dedusă din județ, deci aproximativă pentru județele de graniță (Arad, Mureș, Suceava etc.).
