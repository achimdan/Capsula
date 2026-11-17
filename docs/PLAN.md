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
- **Fișa** e unitatea de conținut: număr de inventar, an, categorie, polaroid, notă scurtă cu voce caldă, „Am avut asta / Am fost acolo”, sursă.
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

- **Zapping (A):** Random Hit nelimitat, ponderat pe anii în care aveai 10–20 de ani. Salvezi în „Caseta mea”.
- **Ghicește anul (C):** vezi amintirea fără an și ghicești anul. 5 runde, cursorul pornește din 1997 la fiecare rundă. Puncte după distanță: 100, 80, 60, 45, 30, 20, 10 pentru 0–6 ani, apoi 0. În timpul rundei, anii din titlu, notă și sursă apar ca „____” / „’__”; fișa întreagă se vede după dezvăluire. Clasament pe generații și card de share. Folosește **doar fișe cu an exact**. Logica e în `app/utils/ghicesteAnul.ts`.
- **Caseta zilei (B):** cinci fișe pe zi, deschise una câte una. Fața casetei alternează zilnic (Partea A, apoi Partea B); alegerea fișelor depinde de zi și de deceniul nașterii, iar pe etichetă stă anul în care aveai 15 ani. Nu are sunet: apăsarea arată fișa.
- **Fișa deschisă din cronologie:** crește din miniatură și se întoarce în ea la închidere. E mare (două coloane pe ecran lat, o coloană pe mobil), cu detalii din date: an, loc, categorie, scenă, stare de verificare. Fișele cu `video` arată un film scurt în locul pozei (`public/fise/<id>.mp4`, mut la pornire, poza rămâne afiș și miniatură).

Demo: https://claude.ai/artifact/9Tpnur5tdGaSCaRX1PRDwA

- **Module din /admin:** conținutul nou intră ca modul pe care super adminul îl pornește sau îl oprește (`site_settings`, chei `modul_*`, toate oprite la început). Modul oprit = link ascuns, pagina trimite vizitatorii acasă; super adminul o vede oricum, ca s-o verifice.
  - **Azi, demult** (`/on-this-day`): evenimente cu zi exactă, din surse; altfel nu intră.
  - **Prețuri de atunci** (`/prices`): prețuri cu sursă și monedă explicită (lei vechi până în iulie 2005).
  - **La TV** (`/tv`): emisiuni, seriale, desene; doar titluri și texte proprii, fără clipuri.
  - **Stratul București**: al doilea oraș deblocat, după Cluj (`app/data/fiseBucuresti.ts`).

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

**Conturi și admin.** Intrarea e doar cu Google și e deschisă oricui. `/admin` e doar pentru super admin (rolul din `app_metadata`, pus de baza de date). Meniul și ruta nu se bazează doar pe JWT-ul citit local: rolul e confirmat de serverul de Auth (`getUser`) înainte să apară linkul sau pagina; scrierile le păzește RLS. Tot ce se alege în `/admin` se salvează în `site_settings` și se aplică tuturor vizitatorilor. Acum sunt două setări: fundalul paginii, care nu mai depinde de profilul citit (clasic, tapet de bloc, sufragerie VHS, hârtie de arhivă sau „Fișe în ceață”, animația fostului teaser de dinainte de intrare, mai ștearsă ca să rămână lizibil textul), și felul în care se afișează „Ce era peste tot” (grilă de polaroiduri sau cronologie pe bandă, cu anii pe orizontală și categoriile ca piste).

**Acces: navigare liberă, cont la acțiune (decizie din 17 nov 2026).** Toată capsula se vede fără cont: arhiva și fișele, cronologia, Random Hit, „Ghicește anul”, Caseta zilei și modulele pornite din `/admin`. Linkurile distribuite (o fișă, scorul) se deschid direct, fără ecran de logare. Testul de profil e opțional: fără el, paginile folosesc 1984 ca an de naștere și invită la test. Fără cont, rezultatul testului și profilul stau doar în browser (`localStorage`); la prima logare se urcă în cont dacă acesta e gol, iar dacă contul are deja date, contul câștigă (`decideStare` în `app/utils/cont.ts`). Contul Google se cere exact la acțiunea care păstrează ceva: „În casetă”, „Am avut asta”, seria de la Caseta zilei, amintirile scrise de tine, cu textul „Ca să păstrezi ce ai ales, intră cu Google.” După Google omul se întoarce pe aceeași pagină, iar acțiunea apăsată se face o dată (`useIntrare().cereCont`, intenția stă în `sessionStorage`). Rămân neschimbate: `/admin` doar pentru super admin, confirmat la serverul de Auth, și modulele oprite, care nu există pentru vizitatori, logați sau nu (super adminul le vede ca să le verifice). RLS: fișele naționale sunt statice (`app/data/fise.ts`), deci anon citește din baza de date doar `site_settings`, și acolo doar coloanele `key` și `value`; `profiles`, `questionnaire_responses`, `tape_items` și `user_cards` refuză anon la citire și scriere, iar scrierile sunt doar ale proprietarului. „Am avut asta” și seria nu sunt încă în cont: le cerem logarea, dar stau tot în browser până primesc tabele; la ieșirea din cont seria și Caseta zilei se golesc.

**Cardul de scor.** La finalul „Ghicește anul”, „Distribuie scorul” desenează în browser un PNG de 1080×1350 cu scorul pe bandă, titlul, generația și cele 5 runde (anul real și cu cât ai greșit). Pe telefon se deschide foaia de share; unde browserul nu poate trimite fișiere, imaginea se descarcă. Fără `--signal` pe card. Conținutul e în `app/utils/cardScor.ts`, desenul în `app/composables/useCardScor.ts`. Previzualizarea linkurilor (og:image) cere randare pe server și rămâne pentru când revine SSR.

**Confidențialitate.** `/privacy` e publică și spune ce date ținem (contul Google, profilul, testul, caseta, amintirile), cine le găzduiește (Supabase, Cloudflare, Google) și ce drepturi ai. Utilizatorul logat își descarcă de acolo toate datele într-un JSON și își poate șterge contul: funcția `delete_my_account()` din baza de date șterge rândul din `auth.users`, iar restul pleacă prin cascade; în browser se șterg cheile `capsula:*`. Textul e o ciornă: operatorul și contactul sunt de completat în `app/data/confidentialitate.ts` și urmează verificarea juridică.

**Cronologia pe bandă.** Ocupă toată lățimea ecranului, nu doar coloana paginii. Banda trece pe sub un cap de citire fix, la mijloc: anul de sub el apare în contorul mare, cu vârsta pe care o aveai atunci și câte fișe are anul. Se derulează cu degetul (pe mobil se prinde de fiecare an), trăgând cu mouse-ul (cu inerție), din riglă (o liniuță pe an, înaltă cât fișe are), din săgeți (sar la următorul an cu fișe) sau cu „Anul meu”. Banda pornește direct pe anul tău; fișele se leagănă pe fir după viteză, iar cele de la margini stau mai șterse. `--signal` marchează doar anul în care aveai 15 ani. Cu `prefers-reduced-motion` rămân doar salturile directe. Logica e în `app/utils/cronologie.ts`.

**Capsula fiecăruia.** Fișele de arhivă sunt aceleași pentru toți. Profilul citit din test le schimbă ordinea: categoriile preferate de arhetip vin primele (în filtre, în grilă în cadrul fiecărui an și ca piste pe bandă), iar deasupra apare intro-ul profilului. Pe bandă, pistele preferate au eticheta „pentru tine”, iar pozele de pe celelalte piste stau decolorate până le atingi. Fără test, ordinea rămâne cea obișnuită. Fișele de muzică au o scenă (pop, rock, dance, manele) doar unde genul e evident; e o alegere editorială, nu un fapt de arhivă. Fișele din scena profilului primesc eticheta „scena ta”, fără culoarea de accent (`--signal` rămâne pentru „ești aici” și Random Hit).

**Amintirile tale.** Un utilizator logat își poate scrie propriile fișe (titlu, an, categorie, notă), salvate în `user_cards` și văzute doar de el (RLS). Apar pe bandă și în grilă cu eticheta „a ta”, se pot șterge din fișă și sunt cel mult 200 pe cont. Nu intră în „Ghicește anul”, Caseta zilei, Random Hit sau caseta, fiindcă nu sunt în `FISE`. Fără cont, secțiunea cere intrarea; nu le ținem în browser.

## Roadmap

| Fază | Conținut | Stare |
|---|---|---|
| **v0.1 MVP local** | Onboarding, capsula națională, banda, Zapping, Ghicește anul, strat Cluj, vot local, Caseta mea, configurator magazin + „Anunță-mă” | ✅ Gata (date în `app/data/fise.ts`, stare în browser) |
| **v0.1.1 Conținut** | 150–200 de fișe verificate pentru Cluj și anii 1990–2008; ilustrații proprii | ⏳ |
| **v0.1.2 Online** | Deploy pe Cloudflare Workers, la fiecare push pe `main` | ✅ |
| **v0.2 Supabase** | Fișe în baza de date, conturi, voturi și „Am avut asta” comune, media pe generații, panou de curator | 🔶 Conturi Google, profil, casetă, amintiri proprii, admin și confidențialitate gata; restul ⏳ |
| **v0.3 Magazin A + primul drop C** | Comenzi reale prin Stripe și furnizorul de print; drop „Vara lui ’99” | ⏳ |
| **v0.4 Membru (C)** | Abonament: acces înainte la drop-uri, clasamente pe orașe | ⏳ |
| **v0.5 Talcioc (B)** | Marketplace cu Stripe Connect, după consultanță juridică | ⏳ |

## De rezolvat

- [x] Cont Supabase nou, separat.
- [ ] Verificarea fișelor din `app/data/fise.ts`: 91 au surse; 13 rămân `verificat: false`, amintiri fără sursă publică: RO-0101, 0108, 0124, 0128, 0130, 0133, 0134, 0136, 0138, 0140, 0141, 0148, 0159.
- [ ] Ani confirmați pentru discotecile din Cluj (sursele diferă între ele).
- [ ] Materiale originale (poze, flyere) cu acordul autorilor.
- [ ] Filme pentru fișele unde se potrivesc (câmpul `video`): nicio fișă nu are încă; aceleași reguli de licență ca la poze.
- [ ] Alegerea furnizorului de print-on-demand și prețurile.
- [ ] „Am avut asta” și seria de la Caseta zilei în cont (acum cer logarea, dar stau în browser).
- [ ] Termeni, confidențialitate și GDPR: `/privacy`, exportul și ștergerea contului sunt gata; lipsesc operatorul, contactul, termenii și verificarea juridică.
- [ ] Consultanță juridică pentru Talcioc.

## Surse folosite până acum

- [Clujul anilor 2000 – Cluj.com](https://cluj.com/articole/clujul-anilor-2000/)
- [Epoca de aur a discotecilor din Cluj – cluju.ro](https://cluju.ro/epoca-de-aur-a-discotecilor-din-cluj-napoca-anilor-2000/)
- [Hully-Gully, discoteca discotecilor – Știri de Cluj](https://www.stiridecluj.ro/divertisment/hully-gully-discoteca-discotecilor-din-clujul-anului-90-ce-amintiri-aveti-de-acolo-foto)
- [Discoteca Atlantic, Mănăștur – Știri de Cluj](https://www.stiridecluj.ro/divertisment/care-a-fost-cea-mai-tare-discoteca-sau-club-din-cluj-imagini-de-la-discoteca-atlantic-manastur-video)
- [Amintiri despre discotecile Clujului din anii 90 – clujenii.ro](https://clujenii.ro/amintiri-despre-discotecile-clujului-din-anii-90-unde-erau-petrecerile-rave-in-clujul-ala-foarte-cenusiu/)
