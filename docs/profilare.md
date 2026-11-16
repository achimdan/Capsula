# Profilare: „Capsula te citește”

După autentificare, utilizatorul răspunde la un chestionar scurt. Răspunsurile dau scoruri pe trăsături, iar scorurile aleg unul din 36 de profiluri. Profilul configurează aplicația: fundalul, ponderile pe categorii de fișe, tonul textelor și o culoare de accent.

Fișiere:
- `app/data/chestionar.ts`: trăsături, scene, capitole, cele 25 de întrebări.
- `app/data/profiluri.ts`: 6 arhetipuri × 6 scene = 36 de profiluri, fiecare cu config.
- `app/utils/profilare.ts`: `scoreAnswers`, `pickProfile`, `citesteProfil`, `nuantaLoc`, `profilDupaId`.
- `tests/profilare.test.ts`: scor, neutralitatea lui „Prefer să nu spun”, determinism, fiecare profil atins.

## 1. Ce am găsit (cercetare scurtă)

Am citit rezumate și articole, nu texte integrale. Cifrele de mai jos vin din aceste surse și nu sunt comparabile între ele: grupele de vârstă și anii diferă.

**Valori și muncă.** Un studiu Deloitte (2018, 14 țări) arată că aproape jumătate dintre tinerii români pun educația printre valorile cele mai importante. La alegerea unui job contează întâi șansa de a învăța lucruri noi. Un raport al Institutului de Științe ale Educației, citat de HotNews, pune banii pe primul loc la tineri, cu o familie unită aproape la egalitate. Concluzia pentru noi: „cerebral” și „familist” sunt axe reale, iar atitudinea față de bani merită o întrebare.
- [Deloitte România, tineri și organizații](https://www2.deloitte.com/ro/en/pages/about-deloitte/articles/deloitte-study-reveals-romania-young-talents-look-for-organizations-in-which-they-matter.html)
- [HotNews, „Romania loves cash and respect”](https://hotnews.ro/romania-loves-cash-and-respect-803384)
- [CURS pentru FES, tinerii din România](https://pjp-eu.coe.int/documents/42128013/47262199/Romanian_Youth-FES.pdf/61d957ad-c4d9-4f52-8eb8-442b6549a313)

**Scene muzicale.** Manelele, rockul și hip-hopul românesc au fost mult timp tabere separate. Publicul de rock și hip-hop disprețuia adesea maneaua, din snobism și din admirație pentru Occident. Azi muzica populară e discutată și ca identitate și autenticitate. Hip-hopul românesc exista de la mijlocul anilor 90, dar a explodat pentru mulți abia în liceu, spre 2000. Un studiu pe versurile a 14.000 de piese a găsit că rockul românesc seamănă lexical mai mult cu manelele decât cu hip-hopul. Concluzia pentru noi: scena muzicală e o axă proprie, cu șase valori egale ca demnitate.
- [Europa Liberă, ce ascultă românii](https://romania.europalibera.org/a/ce-asculta-romanii-muciza-populara-manele/32725540.html)
- [VICE, licean la începutul anilor 2000](https://www.vice.com/ro/article/cum-era-sa-fii-licean-in-2000/)
- [G4Media, studiul pe versuri](https://www.g4media.ro/ce-genuri-muzicale-romanesti-se-seamana-din-punct-de-vedere-al-versurilor-studiu-stiintific-versurile-din-rock-mai-aproape-ca-stil-de-manele-si-muzica-de-biserica.html)
- [Spotmedia, evoluția manelelor](https://spotmedia.ro/stiri/social/evolutia-manelelor-in-romania)

**Diaspora.** Eurostat (2017, citat de Romania Insider) arată că aproape unul din cinci români de vârstă activă trăia în alt stat UE, cea mai mare pondere din Uniune. OECD estimează aproximativ 3,6 milioane de oameni născuți în România în țările OECD (2015/16). Concluzia pentru noi: „diaspora” e o trăsătură separată, cu varianta „între două țări”.
- [Romania Insider, unul din cinci români de vârstă activă](https://www.romania-insider.com/working-age-romanians-live-eu-countries)
- [OECD, Talent Abroad: Romania](https://www.oecd.org/en/publications/talent-abroad-a-review-of-romanian-emigrants_bac53150-en.html)

**Nostalgie.** Generația „cu cheia de gât” își amintește anii 80–90 prin viața de zi cu zi, nu prin politică. Fenomenul a crescut din anii 2000 prin grupuri de Facebook, bloguri și autobiografii. Cercetătorii avertizează să nu luăm nostalgia ca atare. Obiectele (ciocolata ROM, de exemplu) au devenit semne ale trecutului mai mult decât produse. Concluzia pentru noi: declanșatorii sunt obiecte, gusturi, televizor, cartier.
- [Pohrib, „Romania's Latchkey Kids”](https://cris.maastrichtuniversity.nl/en/publications/romanias-latchkey-kids-generational-nostalgia-and-memory-politics/)
- [Rațiu, rebranding-ul produselor comuniste](https://sc.upt.ro/attachments/article/942/01_04_Ratiu.pdf)
- [Marin, nostalgia postcomunistă în sondaje](https://journals.lwbooks.co.uk/tcc/vol-2016-issue-11/article-9174/)

## 2. Modelul de trăsături

Opt trăsături, plus o axă muzicală separată:

| Trăsătură | Ce citește |
|---|---|
| `nostalgie` | cât de des te întorci în trecut |
| `rebel` | regulile ocolite, volumul dat tare |
| `cerebral` | cărți, documentare, ironie fină |
| `social` | gașca, ringul, fața blocului |
| `familist` | masa de duminică, cei de acasă |
| `urban` | oraș (+) sau sat (−) |
| `diaspora` | acasă în altă țară |
| `umor` | bancuri, scheciuri, meme-uri |

Scene muzicale: `pop`, `rock`, `hiphop`, `dance`, `manele`, `alternativ`.

Reguli de scor:
- Ponderi întregi (1–3) pe fiecare opțiune. Scala 1–5: mijlocul e neutru, fiecare pas adaugă sau scade ponderea.
- Multi-alegere: media bifelor, tăiate la `max`. „Prefer să nu spun” e exclusiv și anulează tot.
- Fiecare cheie se împarte la maximul ei posibil, ca o trăsătură cu multe întrebări să nu le înghită pe celelalte.
- „Prefer să nu spun” are ponderi zero: profilul iese identic cu cel fără răspuns (testat).
- Anul nașterii nu mută profilul. Îl folosim doar pentru `an15` și fișele vizibile.

## 3. De la trăsături la profil

- **Arhetip** = trăsătura dominantă dintre `nostalgie, rebel, cerebral, social, familist, umor`.
- **Scenă** = scena cu scorul cel mai mare.
- Egalitățile se rup după ordinea fixă din liste: primul câștigă. Fără răspunsuri ies `nostalgie-pop`.
- `urban` și `diaspora` nu aleg profilul. Ele dau o nuanță separată (`nuantaLoc`: `diaspora`, `oras`, `sat`) pentru stratul de oraș și pentru texte.

Config pe profil:
- `fundal` și `ton` vin din arhetip: nostalgie → tapet/cald, rebel → vhs/ironic, cerebral → arhivă/documentar, social → clasic/cald, familist → tapet/cald, umor → vhs/ironic.
- `ponderiCategorii`: baza arhetipului, plus +2 la Muzică și +1 la o categorie legată de scenă.
- `accent`: o culoare pe scenă. Are contrast ≥ 3:1 pe toate cele 10 tonuri `--paper`/`--card`.
- `intro`: o frază a arhetipului, urmată de una a scenei.

## 4. Reguli de ton

- Numele de profil sunt obiecte sau locuri („Chitara de pe dulap”), nu persoane. Așa nu marcăm genul.
- Citirile sunt la persoana a doua, cu verbe, fără adjective acordate („Ții minte…”, „Ai crescut cu…”).
- O scenă muzicală e un gust. Niciun text nu o leagă de clasă, etnie, studii sau gen.
- Întrebările despre studii, familie și unde locuiești au „Prefer să nu spun” și formulări fără judecată.

## 5. Limite și decizii deschise

- **Accent AA.** O singură culoare nu poate avea 4,5:1 și pe fundalurile deschise, și pe cele închise. Am ales 3:1 (componente de UI și text mare). Pentru text mic, accentul are nevoie de o variantă pe temă.
- **Încă nefolosit.** `useCapsula` și Random Hit nu citesc încă `ponderiCategorii`, `ton` sau `accent`.
- **Validare.** Profilurile sunt ipoteze. Trebuie testate cu oameni reali înainte de lansare.
