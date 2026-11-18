# Capsula — planul produsului

Capsula timpului pentru cei care au crescut în România anilor ’90–2000.
Documentul strânge deciziile luate în etapele de concept și pașii următori.

## Reguli de lucru

- Totul în română, cu focus pe România.
- **Nu inventăm fapte.** Fiecare fișă are un an exact (verificabil) sau aproximativ (afișat cu „≈”) și un câmp `verificat`. Nimic nu se lansează nemarcat ca verificat.
- Fără logo-uri de mărci, trupe sau discoteci pe produse, fără permisiune.
- Fără clipuri sau muzică găzduite de noi: doar embed-uri, citate scurte și texte proprii.
- Fără imagini generate care să pară fotografii de epocă: ilustrațiile trebuie să arate clar ca ilustrații.

## Etapa 1 — Concept și arhitectură informațională

**Ales:** capsulă personală, cu ton de arhivă editorială.

- **Onboarding** cu 2 întrebări: anul nașterii și orașul.
- **Capsula națională**, aceeași pentru toți: muzică, filme & TV, obiecte & haine, mâncare, evenimente. Personalizată pe vârstă („Aveai 15 ani în 1999”).
- **Stratul orașului** apare doar dacă alegi un oraș deblocat. Cluj e primul (discotecile Bianco e Nero, Hully Gully, Atlantic, Obsession și locul de întâlnire „la Matei”). Celelalte orașe: vot „Deblochează orașul tău”.
- **Fișa** e unitatea de conținut: număr de inventar, an, categorie, polaroid, notă scurtă cu voce caldă, „Am avut asta / Am fost acolo” (pune fișa în Caseta mea), sursă.
- Filmele americane (de ex. *Friday After Next*, *How High*) intră doar cu unghi local: „cum le vedeam noi” (casete copiate, TV), fără clipuri găzduite.

Public: născuți aproximativ între 1980 și 1990.

## Etapa 2 — Design system „Banda”

Timpul e o bandă magnetică pe care o derulezi.

- **Culori:** etichetă `#DCE3DA`, polaroid `#F4F6F1`, bandă `#14211B`, linie `#B9C6B6`, cap de citire `#E2582F` (singurul accent). Are și mod întunecat.
- **Tipografie:** Big Shoulders Display (titluri), Work Sans (text), IBM Plex Mono (numere de inventar și date).
- **Semnătura:** contorul de casetofon și capul de citire portocaliu.
- **Animații:** fast forward cu blur pentru Random Hit, developarea polaroidului, scroll care derulează banda, variantă fără animații pentru `prefers-reduced-motion`.
- Grain ușor pe toată pagina.

Pagini de referință (claude.ai, private):
- Direcțiile vizuale: https://claude.ai/artifact/Q11kRiRAWvtNWSL82dgWnt
- Design system Banda: https://claude.ai/artifact/Uk5Gx8eTmymrV9Wm42E7bU

## Etapa 3 — Funcționalități și Random Hit

**Ales:** A + C.

- **Zapping (A):** Random Hit nelimitat, ponderat pe anii în care aveai 10–20 de ani. Ce ai avut marchezi cu „Am avut asta” și ajunge în „Caseta mea”.
- **Ghicește anul (C):** vezi amintirea fără an și ghicești anul. 5 runde, cursorul pornește din 1997 la fiecare rundă. Puncte după distanță: 100, 80, 60, 45, 30, 20, 10 pentru 0–6 ani, apoi 0. În timpul rundei, anii din titlu, notă și sursă apar ca „____” / „’__”; fișa întreagă se vede după dezvăluire. Clasament pe generații și card de share. Folosește **doar fișe cu an exact**. Logica e în `app/utils/ghicesteAnul.ts`.
- **Caseta zilei (B):** cinci fișe pe zi, deschise una câte una. Fața casetei alternează zilnic (Partea A, apoi Partea B); alegerea fișelor depinde de zi și de deceniul nașterii, iar pe etichetă stă anul în care aveai 15 ani. Nu are sunet: apăsarea arată fișa.
- **Fișa deschisă din cronologie:** crește din miniatură și se întoarce în ea la închidere. E mare (două coloane pe ecran lat, o coloană pe mobil), cu detalii din date: an, loc, categorie, scenă, stare de verificare. Fișele cu `video` arată un film scurt în locul pozei (`public/fise/<id>.mp4`, mut la pornire, poza rămâne afiș și miniatură).

Demo: https://claude.ai/artifact/9Tpnur5tdGaSCaRX1PRDwA

- **Module din /admin:** conținutul nou intră ca modul pe care super adminul îl pornește sau îl oprește (`site_settings`, chei `modul_*`, toate oprite la început). Modul oprit = link ascuns, pagina trimite vizitatorii acasă; super adminul o vede oricum, ca s-o verifice.
  - **Azi, demult** (`/on-this-day`): evenimente cu zi exactă, din surse; altfel nu intră.
  - **Prețuri de atunci** (`/prices`): prețuri cu sursă și monedă explicită (lei vechi până în iulie 2005).
  - **La TV** (`/tv`): emisiuni, seriale, desene; doar titluri și texte proprii, fără clipuri.
  - **Stratul București**: al doilea oraș deblocat, după Cluj (fișele `BU-*` din tabelul `fise`).

## Etapa 4 — Magazin și monetizare

**Ales:** toate trei modelele, eșalonate în timp.

- **A · Anul tău, tipărit:** print-on-demand personalizat (an, oraș, scor). Fără stoc.
- **B · Talcioc:** târg de obiecte autentice (casete, CD-uri, jucării), cu comision. Singurul loc unde casetele și CD-urile există fizic.
- **C · Drop-uri + Membru:** ediții limitate tematice și abonament. **Fără limită de joc** pentru utilizatorii gratuiți, ca să nu frânăm share-urile.

Demo: https://claude.ai/artifact/TzJWrZoDD6iTGiW1GaR9B1

## Etapa 5 — Stack tehnic

| Nevoie | Soluție |
|---|---|
| Aplicația | Nuxt 4 |
| Găzduire | Cloudflare Workers (Worker `capsula`, cu assets statice; deploy automat din `main` prin Workers Builds) |
| Date, conturi, scoruri, voturi | Supabase (Postgres + Auth), într-un cont separat |
| Imagini | Supabase Storage sau Cloudflare R2 |
| Carduri de share | Acum: PNG desenat în browser (canvas) la finalul „Ghicește anul”; imagini de previzualizare generate pe server, mai târziu |
| Plăți | Stripe; Stripe Connect pentru Talcioc |
| Print-on-demand | API-ul unui furnizor, ales după costurile reale pentru România |
| 3D | Nu în MVP |

Codul de server rulează pe Cloudflare Workers, nu pe Node: orice bibliotecă nouă se verifică înainte.

Fonturile se descarcă la build prin `@nuxt/fonts` și se servesc din `/_fonts`, nu de la Google. Google a redenumit „Big Shoulders Display” în „Big Shoulders” (variabil, cu mărime optică); în CSS rămân amândouă numele.

**Conturi și admin.** Intrarea e doar cu Google și e deschisă oricui. `/admin` e doar pentru super admin (rolul din `app_metadata`, pus de baza de date). Meniul și ruta nu se bazează doar pe JWT-ul citit local: rolul e confirmat de serverul de Auth (`getUser`) înainte să apară linkul sau pagina; scrierile le păzește RLS. Tot ce se alege în `/admin` se salvează în `site_settings` și se aplică tuturor vizitatorilor. Acum sunt două setări: fundalul paginii, care nu mai depinde de profilul citit (clasic, tapet de bloc, sufragerie VHS, hârtie de arhivă sau „Fișe în ceață”, animația fostului teaser de dinainte de intrare, mai ștearsă ca să rămână lizibil textul), și felul în care se afișează „Ce era peste tot” (grilă de polaroiduri sau cronologie pe bandă, cu anii pe orizontală și categoriile ca piste). Fundalurile cu televizor au două variante, „Televizor anii '80” (lemn, clape, antenă) și „Televizor anii '90” (CRT negru, cu ecran bombat și grile de difuzor), amândouă desenate realist, cu volum, reflexii pe sticlă și umbră, pe o podea luminată de culoarea ecranului. Pe prima pagină, intro-ul pornește din interiorul ecranului: scena stă fixată (pin) pe aproximativ un ecran de scroll, iar camera se retrage până se vede tot televizorul, centrat; apoi urcă pagina și televizorul se estompează în spate. Dacă scroll-ul se oprește la jumătatea retragerii, pagina se așază lin la capătul spre care derulai: în jos spre conținut, în sus spre ecranul plin (snapping, ca la MemoryQuest). Dacă omul trage în sens opus cât timp pagina se așază, preia el controlul. Pe celelalte pagini și cu mișcare redusă stă direct retras și estompat. Ecranul nu folosește clipuri: mira, puricii, caseta VHS și stingerea tubului sunt desenate pe un canvas mic, după epoca vizitatorului (alb-negru înainte de 1990, color în anii '90, AV după 2000). Lumina din cameră ia culoarea medie a ecranului, iar la schimbarea programului apare canalul („P01”) în verde. Cu mișcare redusă rămâne mira, nemișcată. Cu fundal televizor, la deschiderea unei fișe din cronologie televizorul din spate vine spre vizitator (camera se repede spre ecran, cu dâre de lumină ca la saltul în hiperspațiu), apoi fișa iese din ecran, cu un glitch neon scurt (cian/magenta, linii de baleiaj), și se întoarce în ecran la închidere; cian și magenta apar doar în acest efect de o secundă, nu în interfață. Cu mișcare redusă, fără efect. Pe dispozitive slabe (puțină memorie sau puține nuclee, „Economizor de date”, 2G, ori animații sub ~35 fps la prima încărcare) site-ul intră în modul „lite”: ca la mișcare redusă, fără animații, fără canvas animat și fără efecte scumpe de randare (`utils/dispozitiv.ts`, `html.lite`). Varianta folosită acum (`EFECT_TV = 'tv-vine'`): televizorul se desprinde din cameră și vine aproape; la fișele cu poză (fără video sau embed), poza apare pe ecranul televizorului, iar fereastra arată doar descrierea, jos, sub televizor, cu restul paginii ascuns.

**Fundalul „Casetă 3D” (18 nov 2026).** Al treilea fundal „cu scenă”, ales din `/admin`, alături de cele două televizoare (care rămân). În spate e o casetă audio în 3D, făcută în Three.js direct din geometrie (fără model descărcat): plastic negru, etichetă de hârtie cu „CAPSULA” și anii arhivei, fereastră din plastic fumuriu prin care se văd rolele și banda maro dintre ele, trecută pe lângă rolele de ghidaj. Pe casetă e doar muzică românească: pentru fiecare an, albume sau piese din `app/data/caseteRo.ts` (Iris, Holograf, B.U.G. Mafia, La Familia, 3rei Sud Est, Andre, A.S.I.A., Hi-Q, Voltaj, Morandi...), fiecare cu sursa ei și cu `verificat: false` până le verifică un om. Eticheta arată artistul și titlul din dreptul capului de citire; când anul are mai multe, se schimbă la câteva secunde, iar cardul anului le înșiră („Pe casetă: …”). Fiecare înregistrare are eticheta ei, după modelul casetelor goale din anii '80–'90: 12 stiluri (dungi, diagonale, apus, Memphis, grilă, crom, egalizator, cercuri, blocuri, buline, valuri, împărțit) × 14 palete, alese după index, fără nicio combinație repetată până la 84 de înregistrări (`three/etichete.ts`, testat). Pe prima pagină, intro-ul pornește de foarte aproape, cu fereastra cu role pe tot ecranul și titlul „Capsula” peste ea; la primul ecran de scroll camera se retrage până se vede toată caseta. Apoi anii stau pe o bandă orizontală: pagina rămâne fixată, scroll-ul în jos derulează banda spre dreapta, iar rolele se învârt și banda trece de pe rola din stânga pe cea din dreapta (`utils/caseta.ts`, `three/caseta.ts`). Când scroll-ul se oprește, banda se așază pe un an întreg; un clic pe an duce acolo. Pe fiecare an: câte fișe are și primele titluri; anul tău e marcat cu „Ești aici” în `--signal`. După bandă, caseta rămâne centrată și estompată în spatele conținutului. Three.js se încarcă doar cu acest fundal, separat de restul site-ului. În previzualizarea din `/admin`, cu mișcare redusă, în modul „lite” și fără WebGL se vede o casetă desenată (SVG), iar banda de ani se derulează cu mâna, fără fixare. Inspirație: Press Play On Tape (Awwwards), Yestalgia (Decathlon), portofoliul lui Mike Matas.

**Fundalul „Anuar” (18 nov 2026).** Al patrulea fundal „cu scenă”, ales din `/admin`. Pagina e hârtie albă caldă (`--paper` #EEECE6, cerneală aproape neagră), iar „Ce era peste tot” devine un catalog citit pe verticală, câte un capitol pe an (`components/AnuarAni.vue`, `utils/anuar.ts`, testat). Pe ecrane mari, în stânga stă fix anul uriaș în Big Shoulders, cu cifrele care se rotesc ca un contor când treci în alt capitol, și rigla tuturor anilor (bara arată câte fișe are anul; anii fără fișe sunt stinși, anul tău e în `--signal`). În dreapta curg capitolele: fișa de deschidere mare (prima cu poză), cu categoria, titlul și nota, apoi restul anului pe două coloane în trepte. Fișele fără poză apar ca un câmp din culorile lor, cu titlul mare. Clic pe o fișă o deschide în aceeași fereastră ca în cronologie. Nu fixăm scroll-ul și nu îl așezăm: derularea e a vizitatorului; un clic pe riglă duce lin la an. Pozele urcă și alunecă în cadru legat de scroll (CSS `animation-timeline: view()`, doar transform și opacitate), numai unde browserul știe și fără mișcare redusă sau mod „lite”. Pe telefon nu e nimic fix: rigla devine un șir orizontal sus, iar fiecare capitol își poartă anul mare ca titlu. Filtrele pe categorii rămân deasupra. Inspirație: cataloagele de muzeu și site-urile editoriale de pe Awwwards cu cifre mari fixe.

**Un singur gest pe fișă (decizie din 18 nov 2026).** „Am avut asta” / „Am fost acolo” pune fișa în „Caseta mea” (tabelul `tape_items`); butonul separat „+ Caseta mea” a dispărut. Caseta înseamnă „lucrurile copilăriei mele”. Lista veche `amavut` din browser se mută o dată în casetă la încărcarea contului (`useCont`).

**Acces: navigare liberă, cont la acțiune (decizie din 17 nov 2026).** Toată capsula se vede fără cont: arhiva și fișele, cronologia, Random Hit, „Ghicește anul”, Caseta zilei și modulele pornite din `/admin`. Linkurile distribuite (o fișă, scorul) se deschid direct, fără ecran de logare. Testul de profil e opțional: fără el, paginile folosesc 1984 ca an de naștere și invită la test. Fără cont, rezultatul testului și profilul stau doar în browser (`localStorage`); la prima logare se urcă în cont dacă acesta e gol, iar dacă contul are deja date, contul câștigă (`decideStare` în `app/utils/cont.ts`). Contul Google se cere exact la acțiunea care păstrează ceva: „Am avut asta” (caseta), seria de la Caseta zilei, amintirile scrise de tine, cu textul „Ca să păstrezi ce ai ales, intră cu Google.” După Google omul se întoarce pe aceeași pagină, iar acțiunea apăsată se face o dată (`useIntrare().cereCont`, intenția stă în `sessionStorage`). Rămân neschimbate: `/admin` doar pentru super admin, confirmat la serverul de Auth, și modulele oprite, care nu există pentru vizitatori, logați sau nu (super adminul le vede ca să le verifice). RLS: anon citește din baza de date doar fișele publicate (`fise`) și `site_settings`, și acolo doar coloanele `key` și `value`; `profiles`, `questionnaire_responses`, `tape_items` și `user_cards` refuză anon la citire și scriere, iar scrierile sunt doar ale proprietarului. Seria nu e încă în cont: cerem logarea, dar stă tot în browser până primește tabel; la ieșirea din cont seria și Caseta zilei se golesc.

**Cardul de scor.** La finalul „Ghicește anul”, „Distribuie scorul” desenează în browser un PNG de 1080×1350 cu scorul pe bandă, titlul, generația și cele 5 runde (anul real și cu cât ai greșit). Pe telefon se deschide foaia de share; unde browserul nu poate trimite fișiere, imaginea se descarcă. Fără `--signal` pe card. Conținutul e în `app/utils/cardScor.ts`, desenul în `app/composables/useCardScor.ts`. Previzualizarea linkurilor (og:image) cere randare pe server și rămâne pentru când revine SSR.

**Confidențialitate.** `/privacy` e publică și spune ce date ținem (contul Google, profilul, testul, caseta, amintirile), cine le găzduiește (Supabase, Cloudflare, Google) și ce drepturi ai. Utilizatorul logat își descarcă de acolo toate datele într-un JSON și își poate șterge contul: funcția `delete_my_account()` din baza de date șterge rândul din `auth.users`, iar restul pleacă prin cascade; în browser se șterg cheile `capsula:*`. Textul e o ciornă: operatorul și contactul sunt de completat în `app/data/confidentialitate.ts` și urmează verificarea juridică.

**Cronologia pe bandă.** Ocupă toată lățimea ecranului, nu doar coloana paginii. Banda trece pe sub un cap de citire fix, la mijloc: anul de sub el apare în contorul mare, cu vârsta pe care o aveai atunci și câte fișe are anul. Se derulează cu degetul (pe mobil se prinde de fiecare an), trăgând cu mouse-ul (cu inerție), din riglă (o liniuță pe an, înaltă cât fișe are), din săgeți (sar la următorul an cu fișe) sau cu „Anul meu”. Banda pornește direct pe anul tău; fișele se leagănă pe fir după viteză, iar cele de la margini stau mai șterse. `--signal` marchează doar anul în care aveai 15 ani. Cu `prefers-reduced-motion` rămân doar salturile directe. Logica e în `app/utils/cronologie.ts`.

**Sursa fișelor: Supabase (18 nov 2026).** Fișele Capsulei nu mai stau în cod, ci în tabelul `public.fise` (migrația `supabase/migrations/20261118120000_fise.sql`). Coloanele urmează tipul `Fisa` din `app/data/fise.ts` (care păstrează doar tipurile și constantele: orașe, `AN_MIN`, `AN_MAX`); poza și filmul au coloane separate (`poza_autor`, `poza_licenta`...), iar `ordine` păstrează ordinea fostului tablou, de care depind banda anilor, Caseta zilei și „Fișe în ceață”. RLS: oricine citește fișele cu `publicat = true`; doar super adminul le vede pe toate și scrie. `publicat` nu e `verificat`: fișele neverificate se văd ca înainte, iar `verificat` rămâne doar o etichetă de curator. Aplicația cere lista o dată la încărcare (`plugins/fise.client.ts`, `composables/useFise.ts`, TanStack Query) și o mapează înapoi în `Fisa` (`utils/fise.ts`, testat); „Ghicește anul” și Random Hit așteaptă datele înainte să aleagă și păstrează regulile (doar `an_exact: true` în joc, ponderarea pe vârstă și categorii la Random Hit). Importul inițial e `supabase/seed/fise.json`, copia exactă a fostului `FISE`; `node scripts/seed-fise.mjs` scrie SQL-ul de import (idempotent), iar `--check` scrie interogarea care compară suma md5 din baza de date cu cea din JSON. După import: 117 fișe, sumă identică. Fișele noi se adaugă de acum în tabel (cu `verificat: false`, iar anii nesiguri cu `an_exact: false`); JSON-ul rămâne doar istoricul importului și sursa testelor.

**Capsula fiecăruia.** Fișele de arhivă sunt aceleași pentru toți. Profilul citit din test le schimbă ordinea: categoriile preferate de arhetip vin primele (în filtre, în grilă în cadrul fiecărui an și ca piste pe bandă), iar deasupra apare intro-ul profilului. Pe bandă, pistele preferate au eticheta „pentru tine”, iar pozele de pe celelalte piste stau decolorate până le atingi. Fără test, ordinea rămâne cea obișnuită. Fișele de muzică au o scenă (pop, rock, dance, manele) doar unde genul e evident; e o alegere editorială, nu un fapt de arhivă. Fișele din scena profilului primesc eticheta „scena ta”, fără culoarea de accent (`--signal` rămâne pentru „ești aici” și Random Hit).

**Amintirile tale.** Un utilizator logat își poate scrie propriile fișe (titlu, an, categorie, notă), salvate în `user_cards` și văzute doar de el (RLS). Apar pe bandă și în grilă cu eticheta „a ta”, se pot șterge din fișă și sunt cel mult 200 pe cont. Nu intră în „Ghicește anul”, Caseta zilei, Random Hit sau caseta, fiindcă nu sunt în `FISE`. Fără cont, secțiunea cere intrarea; nu le ținem în browser.

## Căutare și profil personal (vectori)

Fișele primesc un vector de sens (Workers AI, `@cf/baai/bge-m3`, multilingv, bun pe română), ținut în Supabase cu pgvector. Pe aceeași bază vin, pe rând, căutarea, recomandările și profilul personal. Regula „nu inventăm fapte” rămâne: nimic nu generează text despre trecut fără să citeze fișe.

1. **Căutare hibridă și „fișe asemănătoare”** — 🔶 căutarea gata (18 nov 2026), în pagina `/search` („Caută” în meniu), cu `?q=` în adresă; arată fișele naționale și pe cele din toate orașele deblocate, chiar dacă omul și-a ales alt oraș; cele din alt oraș decât al lui sunt marcate „din <oraș>” (decizie 18 nov 2026: altfel „cluj” nu găsea nimic pentru cine nu e din Cluj). Restul site-ului rămâne pe stratul orașului ales. Spune când ce se potrivește e doar în orașe încă blocate. Tabelul `fise_embeddings` (doar super adminul îl citește și scrie), funcțiile `cauta_fise` (cuvinte fără diacritice + sens, combinate prin Reciprocal Rank Fusion, doar fișele publicate) și `fise_similare`. Calibrare (13 întrebări de test): pe text, fiecare cuvânt se caută ca prefix; pe sens, intră doar fișele care ies în evidență față de restul arhivei pentru aceeași întrebare (z ≥ 2,5), fiindcă un prag absolut nu separă potrivirile de zgomot. Ruta `GET /api/search?q=` întoarce id-uri; fără Workers AI (în `nuxt dev`) caută doar după cuvinte. Vectorii se refac din `/admin` → „Reindexează fișele” (`POST /api/admin/reindex`, doar fișele schimbate, după hash-ul textului) sau cu `node --env-file=.env scripts/index-fise.mjs` + SQL editor. În fișa deschisă (cronologie și anuar), „Seamănă cu” arată până la 4 fișe vizibile omului, din `fise_similare`; un click deschide fișa în aceeași fereastră (și iese din modul „poza pe televizor”). Nu apare la amintirile proprii.
2. **Gust personal** — ⏳. Pentru fiecare cont, un vector de gust (media ponderată a fișelor salvate, deschise, ghicite), cu RLS pe `auth.uid()`. Din el: „Pentru tine” (fișe nevăzute, apropiate de gust) și Random Hit personalizat, cu o parte (~30%) lăsată la întâmplare, ca să nu se închidă într-o bulă. La început (cont nou): fișe populare sau 3–5 fișe alese la onboarding. „Ghicește anul” poate alege din zonele unde omul greșește des, tot doar cu `an_exact: true`.
3. **Capsula personală** — ⏳. Amintirile proprii (`user_cards`) primesc vectori și se leagă de fișele arhivei care le seamănă („asta seamănă cu ce ai trăit tu”). Rămân private; nu intră în arhiva publică. Dacă vreodată se propun, intră cu `verificat: false` și trec prin curator.
4. **„Întreabă-mi capsula”** — 🔶 prima variantă (18 nov 2026), în `/search`, cu două moduri alese explicit deasupra câmpului: „Caută fișe” (cuvinte, rezultate pe loc) și „Întreabă capsula” (la Enter, răspuns scurt din fișe, apoi fișele; `?mode=ask` în adresă). În „Caută”, dacă textul arată a întrebare (`esteIntrebare`) sau nu găsește nimic, apare butonul „Întreabă capsula: „…”” care trece în celălalt mod. Dacă fișele nu răspund exact, modelul spune asta și arată 1–3 fișe apropiate, cu citare. `POST /api/ask` ia cele mai apropiate 20 de fișe după sens (`fise_pentru_intrebare`, top-k fără prag, separat de `cauta_fise`), păstrează naționalele și orașele deblocate (aceeași regulă ca în căutare) și dă modelului cel mult 8. Model: Workers AI `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, `temperature` 0,2, maxim 400 de tokeni. Prompt: doar din fișe, citare `[ID]`, „cca” pentru anii nesiguri, fișele `verificat: false` spuse ca neverificate. Serverul scoate citările inventate și corectează ş/ţ în ș/ț; fără fișe nu cheamă modelul. Sursele apar ca fișe sub răspuns. Amintirile proprii nu intră încă (n-au vectori, vin cu pasul 3).
5. **Ajutor la „Pune și tu o fișă”** — 🔶 prima variantă (18 nov 2026). Când omul lasă titlul sau nota, `POST /api/card-hint` (doar logați) face un vector din titlu + notă și întoarce: până la 3 fișe din Capsulă care seamănă („Seamănă cu”, din `cauta_fise`, cu textul doar din titlu) și o categorie propusă din cei 8 vecini după sens (`fise_pentru_intrebare`, vot ponderat 1, 1/2, 1/3…; propune doar dacă una are cel puțin jumătate din greutate, `categorieSugerata` în `shared/utils/sugestiiFisa.ts`). Cât se caută, apare „Caut fișe care seamănă…” (`useSugestiiFisa`). Fără model de text: nu rescrie nimic și nu blochează salvarea, cu o excepție: o fișă proprie cu același titlu (fără diacritice și majuscule) nu se poate pune a doua oară; categoria se alege doar la click. La salvare, ş/ţ cu sedilă devin ș/ț. Fără Workers AI (în `nuxt dev` fără token) nu apare nicio sugestie.
6. **Texte alternative la poze** — 🔶 prima variantă (18 nov 2026). Coloana `fise.poza_alt` (cel mult 200 de caractere) spune ce se vede în poză, pentru cititoarele de ecran; fișa deschisă o folosește ca `alt`, cu titlul ca rezervă. Miniaturile din cronologie și anuar rămân cu `alt=""`, fiindcă butonul are deja eticheta; în modul „poza pe televizor” (canvas ascuns), fișa deschisă are textul într-un paragraf `sr-only`. Textul îl propune Workers AI (`@cf/meta/llama-4-scout-17b-16e-instruct`; `gemma-4` și-a consumat tokenii pe raționament) cu `node --env-file=.env scripts/alt-fise.mjs`, care scrie `tmp/fise_alt.sql` de rulat în SQL editor și sare peste fișele care au deja text. Promptul: o propoziție, doar ce se vede, nume, locuri și ani doar din titlu; `curataAlt` în `shared/utils/altPoza.ts` scoate „Imaginea arată”, corectează ş/ţ și taie la 160 de caractere. Descrie poza, nu fapte despre fișă, așa că nu are steag de verificare; textele greșite se corectează direct în tabel. Prima rulare (91 de poze) a fost revăzută de mână: 12 texte corectate (gramatică și un text inventat de pe un timbru). Prima rulare (91 de poze) a fost revăzută de mână: 12 texte corectate (gramatică, un text inventat de pe un timbru). Seed-ul nu atinge coloana.

Confidențialitate: vectorii de gust și amintirile se șterg odată cu contul.

## Roadmap

| Fază | Conținut | Stare |
|---|---|---|
| **v0.1 MVP local** | Onboarding, capsula națională, banda, Zapping, Ghicește anul, strat Cluj, vot local, Caseta mea, configurator magazin + „Anunță-mă” | ✅ Gata (date inițial în `app/data/fise.ts`, stare în browser) |
| **v0.1.1 Conținut** | 150–200 de fișe verificate pentru Cluj și anii 1990–2008; ilustrații proprii | ⏳ |
| **v0.1.2 Online** | Deploy pe Cloudflare Workers, la fiecare push pe `main` | ✅ |
| **v0.2 Supabase** | Fișe în baza de date, conturi, voturi și „Am avut asta” comune, media pe generații, panou de curator | 🔶 Fișe în Supabase, conturi Google, profil, casetă, amintiri proprii, admin și confidențialitate gata; restul ⏳ |
| **v0.3 Magazin A + primul drop C** | Comenzi reale prin Stripe și furnizorul de print; drop „Vara lui ’99” | ⏳ |
| **v0.4 Membru (C)** | Abonament: acces înainte la drop-uri, clasamente pe orașe | ⏳ |
| **v0.5 Talcioc (B)** | Marketplace cu Stripe Connect, după consultanță juridică | ⏳ |

## De rezolvat

- [x] Cont Supabase nou, separat.
- [ ] Verificarea fișelor din tabelul `fise`: 91 au surse; 13 rămân `verificat: false`, amintiri fără sursă publică: RO-0101, 0108, 0124, 0128, 0130, 0133, 0134, 0136, 0138, 0140, 0141, 0148, 0159.
- [ ] Ani confirmați pentru discotecile din Cluj (sursele diferă între ele).
- [ ] Materiale originale (poze, flyere) cu acordul autorilor.
- [ ] Filme pentru fișele unde se potrivesc (câmpul `video`): nicio fișă nu are încă; aceleași reguli de licență ca la poze.
- [x] Postări Facebook în fișă (câmpul `embed`): pluginul oficial, încărcat doar la click, ca imaginea să rămână găzduită de Facebook când nu avem licență liberă. Prima: RO-0164 (La Familia în Salut).
- [ ] Alegerea furnizorului de print-on-demand și prețurile.
- [ ] Seria de la Caseta zilei în cont (acum cere logarea, dar stă în browser).
- [ ] Termeni, confidențialitate și GDPR: `/privacy`, exportul și ștergerea contului sunt gata; lipsesc operatorul, contactul, termenii și verificarea juridică.
- [ ] Consultanță juridică pentru Talcioc.

## Surse folosite până acum

- [Clujul anilor 2000 – Cluj.com](https://cluj.com/articole/clujul-anilor-2000/)
- [Epoca de aur a discotecilor din Cluj – cluju.ro](https://cluju.ro/epoca-de-aur-a-discotecilor-din-cluj-napoca-anilor-2000/)
- [Hully-Gully, discoteca discotecilor – Știri de Cluj](https://www.stiridecluj.ro/divertisment/hully-gully-discoteca-discotecilor-din-clujul-anului-90-ce-amintiri-aveti-de-acolo-foto)
- [Discoteca Atlantic, Mănăștur – Știri de Cluj](https://www.stiridecluj.ro/divertisment/care-a-fost-cea-mai-tare-discoteca-sau-club-din-cluj-imagini-de-la-discoteca-atlantic-manastur-video)
- [Amintiri despre discotecile Clujului din anii 90 – clujenii.ro](https://clujenii.ro/amintiri-despre-discotecile-clujului-din-anii-90-unde-erau-petrecerile-rave-in-clujul-ala-foarte-cenusiu/)
