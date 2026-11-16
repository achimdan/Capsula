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
- **Ghicește anul (C):** vezi amintirea fără an și ghicești anul. 5 runde, 100 de puncte la an exact, minus 25 pe fiecare an diferență. Clasament pe generații și card de share. Folosește **doar fișe cu an exact**.
- **Caseta zilei (B)** rămâne o idee pentru mai târziu.

Demo: https://claude.ai/artifact/9Tpnur5tdGaSCaRX1PRDwA

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
| Carduri de share | Imagini generate pe server |
| Plăți | Stripe; Stripe Connect pentru Talcioc |
| Print-on-demand | API-ul unui furnizor, ales după costurile reale pentru România |
| 3D | Nu în MVP |

Codul de server rulează pe Cloudflare Workers, nu pe Node: orice bibliotecă nouă se verifică înainte.

**Conturi și admin.** Intrarea e doar cu Google și e deschisă oricui. `/admin` e doar pentru super admin (rolul din `app_metadata`, pus de baza de date). Tot ce se alege în `/admin` se salvează în `site_settings` și se aplică tuturor vizitatorilor. Acum sunt două setări: fundalul paginii, care nu mai depinde de profilul citit, și felul în care se afișează „Ce era peste tot” (grilă de polaroiduri sau cronologie pe bandă, cu anii pe orizontală și categoriile ca piste).

**Cronologia pe bandă.** Ocupă toată lățimea ecranului, nu doar coloana paginii. Banda trece pe sub un cap de citire fix, la mijloc: anul de sub el apare în contorul mare, cu vârsta pe care o aveai atunci și câte fișe are anul. Se derulează cu degetul (pe mobil se prinde de fiecare an), trăgând cu mouse-ul (cu inerție), din riglă (o liniuță pe an, înaltă cât fișe are), din săgeți (sar la următorul an cu fișe) sau cu „Anul meu”. La prima vedere banda derulează singură până la anul tău; fișele se leagănă pe fir după viteză, iar cele de la margini stau mai șterse. `--signal` marchează doar anul în care aveai 15 ani. Cu `prefers-reduced-motion` rămân doar salturile directe. Logica e în `app/utils/cronologie.ts`.

**Capsula fiecăruia.** Fișele de arhivă sunt aceleași pentru toți. Profilul citit din test le schimbă ordinea: categoriile preferate de arhetip vin primele (în filtre, în grilă în cadrul fiecărui an și ca piste pe bandă), iar deasupra apare intro-ul profilului. Fără test, ordinea rămâne cea obișnuită. Fișele de muzică au o scenă (pop, rock, dance, manele) doar unde genul e evident; e o alegere editorială, nu un fapt de arhivă. Fișele din scena profilului primesc eticheta „scena ta”, fără culoarea de accent (`--signal` rămâne pentru „ești aici” și Random Hit).

**Amintirile tale.** Un utilizator logat își poate scrie propriile fișe (titlu, an, categorie, notă), salvate în `user_cards` și văzute doar de el (RLS). Apar pe bandă și în grilă cu eticheta „a ta”, se pot șterge din fișă și sunt cel mult 200 pe cont. Nu intră în „Ghicește anul”, Caseta zilei, Random Hit sau caseta, fiindcă nu sunt în `FISE`. Fără cont, secțiunea cere intrarea; nu le ținem în browser.

## Roadmap

| Fază | Conținut | Stare |
|---|---|---|
| **v0.1 MVP local** | Onboarding, capsula națională, banda, Zapping, Ghicește anul, strat Cluj, vot local, Caseta mea, configurator magazin + „Anunță-mă” | ✅ Gata (date în `app/data/fise.ts`, stare în browser) |
| **v0.1.1 Conținut** | 150–200 de fișe verificate pentru Cluj și anii 1990–2008; ilustrații proprii | ⏳ |
| **v0.1.2 Online** | Deploy pe Cloudflare Workers, la fiecare push pe `main` | ✅ |
| **v0.2 Supabase** | Fișe în baza de date, conturi, voturi și „Am avut asta” comune, media pe generații, panou de curator | ⏳ (așteaptă contul Supabase nou) |
| **v0.3 Magazin A + primul drop C** | Comenzi reale prin Stripe și furnizorul de print; drop „Vara lui ’99” | ⏳ |
| **v0.4 Membru (C)** | Abonament: acces înainte la drop-uri, clasamente pe orașe | ⏳ |
| **v0.5 Talcioc (B)** | Marketplace cu Stripe Connect, după consultanță juridică | ⏳ |

## De rezolvat

- [ ] Cont Supabase nou (contul actual a atins limita de 2 proiecte gratuite).
- [ ] Verificarea tuturor fișelor din `app/data/fise.ts` (toate sunt `verificat: false`).
- [ ] Ani confirmați pentru discotecile din Cluj (sursele diferă între ele).
- [ ] Materiale originale (poze, flyere) cu acordul autorilor.
- [ ] Alegerea furnizorului de print-on-demand și prețurile.
- [ ] Termeni, confidențialitate și GDPR pentru amintirile trimise de oameni.
- [ ] Consultanță juridică pentru Talcioc.

## Surse folosite până acum

- [Clujul anilor 2000 – Cluj.com](https://cluj.com/articole/clujul-anilor-2000/)
- [Epoca de aur a discotecilor din Cluj – cluju.ro](https://cluju.ro/epoca-de-aur-a-discotecilor-din-cluj-napoca-anilor-2000/)
- [Hully-Gully, discoteca discotecilor – Știri de Cluj](https://www.stiridecluj.ro/divertisment/hully-gully-discoteca-discotecilor-din-clujul-anului-90-ce-amintiri-aveti-de-acolo-foto)
- [Discoteca Atlantic, Mănăștur – Știri de Cluj](https://www.stiridecluj.ro/divertisment/care-a-fost-cea-mai-tare-discoteca-sau-club-din-cluj-imagini-de-la-discoteca-atlantic-manastur-video)
- [Amintiri despre discotecile Clujului din anii 90 – clujenii.ro](https://clujenii.ro/amintiri-despre-discotecile-clujului-din-anii-90-unde-erau-petrecerile-rave-in-clujul-ala-foarte-cenusiu/)
