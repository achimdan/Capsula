// Fișele Capsulei. Regula: nu inventăm fapte.
// - an_exact: true  → anul e verificabil public (doar acestea intră în „Ghicește anul”)
// - an_exact: false → an aproximativ, afișat cu „≈”
// - verificat: false → trebuie confirmat de curator înainte de lansare
// - oras: null → fișă națională; altfel apare doar în stratul orașului

export type Categorie = 'Evenimente' | 'Muzică' | 'Filme & TV' | 'Obiecte & Haine' | 'Mâncare' | 'Locuri'

export interface Fisa {
  id: string
  titlu: string
  nota: string
  an: number
  an_exact: boolean
  categorie: Categorie
  oras: string | null
  verificat: boolean
  sursa?: string
  culori: [string, string]
}

export const FISE: Fisa[] = [
  // ——— Evenimente naționale (ani verificabili) ———
  { id: 'RO-0001', titlu: 'Sfertul de finală din America', nota: 'Vara lui ’94. Toată scara blocului se uita la meci, iar la penaltiuri nu mai respira nimeni.', an: 1994, an_exact: true, categorie: 'Evenimente', oras: null, verificat: false, culori: ['#2E5E8C', '#F0B35A'] },
  { id: 'RO-0002', titlu: 'Naționala cu părul blond', nota: 'Toată echipa s-a vopsit blond la Mondialul din Franța. A doua zi jumătate din liceu încerca același lucru.', an: 1998, an_exact: true, categorie: 'Evenimente', oras: null, verificat: false, culori: ['#E8C76A', '#14211B'] },
  { id: 'RO-0003', titlu: 'Eclipsa totală de soare', nota: '11 august 1999. Ochelari speciali, sticlă afumată și o liniște ciudată la amiază.', an: 1999, an_exact: true, categorie: 'Evenimente', oras: null, verificat: false, culori: ['#14211B', '#E2582F'] },
  { id: 'RO-0004', titlu: 'Revelionul 2000', nota: 'Toată lumea aștepta să se strice calculatoarele la miezul nopții. Nu s-a stricat nimic.', an: 2000, an_exact: true, categorie: 'Evenimente', oras: null, verificat: false, culori: ['#5B3A7A', '#E07B4C'] },
  { id: 'RO-0005', titlu: 'Fără vize în Schengen', nota: 'Din ianuarie 2002 puteai pleca în vest fără viză. Fiecare avea pe cineva plecat la muncă.', an: 2002, an_exact: true, categorie: 'Evenimente', oras: null, verificat: false, culori: ['#2E5E8C', '#E8C76A'] },
  { id: 'RO-0006', titlu: 'România intră în NATO', nota: 'Primăvara lui 2004, cu steaguri noi pe clădirile oficiale.', an: 2004, an_exact: true, categorie: 'Evenimente', oras: null, verificat: false, culori: ['#7A2E3A', '#F0B35A'] },
  { id: 'RO-0007', titlu: 'Leul cu patru zerouri mai puțin', nota: '10.000 de lei vechi au devenit 1 leu nou. Bunicii au socotit în lei vechi încă mulți ani.', an: 2005, an_exact: true, categorie: 'Evenimente', oras: null, verificat: false, culori: ['#3D6B5A', '#E8C76A'] },
  { id: 'RO-0008', titlu: 'România intră în UE', nota: 'Revelionul lui 2007, cu artificii și cu sentimentul că s-a schimbat ceva.', an: 2007, an_exact: true, categorie: 'Evenimente', oras: null, verificat: false, culori: ['#2E5E8C', '#F4F6F1'] },

  // ——— Obiecte, muzică, TV, mâncare (ani aproximativi) ———
  { id: 'RO-0101', titlu: 'Jocul cu 9999 de jocuri', nota: 'Consola de buzunar cu piese care cad. În realitate erau vreo cinci jocuri, dar nu conta.', an: 1995, an_exact: false, categorie: 'Obiecte & Haine', oras: null, verificat: false, culori: ['#3D6B5A', '#D9A441'] },
  { id: 'RO-0102', titlu: 'Caseta și creionul', nota: 'Derulai cu creionul ca să nu consumi bateriile walkman-ului.', an: 1996, an_exact: false, categorie: 'Muzică', oras: null, verificat: false, culori: ['#5B3A7A', '#E07B4C'] },
  { id: 'RO-0103', titlu: 'Abțibildurile din guma cu surprize', nota: 'Le lipeai pe dulap. Mama nu era de acord.', an: 1997, an_exact: false, categorie: 'Obiecte & Haine', oras: null, verificat: false, culori: ['#7A2E3A', '#E2582F'] },
  { id: 'RO-0104', titlu: 'Compilația de la chioșc', nota: 'O casetă cu toate hiturile verii, cu coperta printată strâmb. O știai pe de rost până în septembrie.', an: 1998, an_exact: false, categorie: 'Muzică', oras: null, verificat: false, culori: ['#E2582F', '#F0B35A'] },
  { id: 'RO-0105', titlu: 'Animăluțul virtual de pe breloc', nota: 'Trebuia hrănit și la ore. Îl lăsai în grija lui frate-tu când mergeai la școală.', an: 1998, an_exact: false, categorie: 'Obiecte & Haine', oras: null, verificat: false, culori: ['#E2582F', '#F4F6F1'] },
  { id: 'RO-0106', titlu: 'Cartela pentru telefonul public', nota: 'Unități numărate pe ecranul cabinei și coadă la telefon în fața blocului.', an: 1999, an_exact: false, categorie: 'Obiecte & Haine', oras: null, verificat: false, culori: ['#2E5E8C', '#D9A441'] },
  { id: 'RO-0107', titlu: 'Sunetul modemului', nota: 'Un țiuit lung, apoi pârâituri. Nimeni nu avea voie să ridice telefonul cât erai pe internet.', an: 2000, an_exact: false, categorie: 'Obiecte & Haine', oras: null, verificat: false, culori: ['#14211B', '#B9C6B6'] },
  { id: 'RO-0108', titlu: 'Filmul copiat de la un prieten', nota: 'Caseta trecea pe la cinci prieteni până ajungea la tine, cu imaginea tot mai ștearsă.', an: 2001, an_exact: false, categorie: 'Filme & TV', oras: null, verificat: false, culori: ['#3D6B5A', '#D9A441'] },
  { id: 'RO-0109', titlu: 'Internet café-ul din cartier', nota: 'Ore plătite la bucată, jocuri în rețea și fum până la tavan.', an: 2001, an_exact: false, categorie: 'Obiecte & Haine', oras: null, verificat: false, culori: ['#14211B', '#E2582F'] },
  { id: 'RO-0110', titlu: 'Pufuleții din fața blocului', nota: 'Punga mare, degetele galbene și împărțitul cu toată gașca.', an: 1995, an_exact: false, categorie: 'Mâncare', oras: null, verificat: false, culori: ['#F0B35A', '#E8C76A'] },
  { id: 'RO-0111', titlu: 'Primul telefon cu ecran color', nota: 'Îl scoteai pe masă la terasă, din întâmplare, ca să se vadă.', an: 2004, an_exact: false, categorie: 'Obiecte & Haine', oras: null, verificat: false, culori: ['#2E5E8C', '#E07B4C'] },

  // ——— Stratul Cluj (din presa locală și amintiri publicate) ———
  { id: 'CJ-0001', titlu: 'Bianco e Nero', nota: 'Pe Universității, peste drum de UBB. Mulți o țin minte drept prima discotecă din oraș.', an: 1993, an_exact: false, categorie: 'Locuri', oras: 'Cluj', verificat: false, sursa: 'cluju.ro, stiridecluj.ro', culori: ['#14211B', '#F4F6F1'] },
  { id: 'CJ-0002', titlu: 'Hully Gully, Mănăștur', nota: 'Uriașă pentru vremea ei, cu mii de oameni într-o seară. Toată lumea are o poveste de acolo.', an: 1996, an_exact: false, categorie: 'Locuri', oras: 'Cluj', verificat: false, sursa: 'stiridecluj.ro', culori: ['#E2582F', '#14211B'] },
  { id: 'CJ-0003', titlu: 'Discoteca Atlantic', nota: 'În Mănăștur. Există filmări din ’99. Tu unde stăteai: la bar sau lângă boxe?', an: 1999, an_exact: false, categorie: 'Locuri', oras: 'Cluj', verificat: false, sursa: 'stiridecluj.ro', culori: ['#2E5E8C', '#E2582F'] },
  { id: 'CJ-0004', titlu: 'Obsession', nota: 'Unul dintre numele mari ale nopților clujene de la începutul anilor 2000.', an: 2002, an_exact: false, categorie: 'Locuri', oras: 'Cluj', verificat: false, sursa: 'cluju.ro', culori: ['#5B3A7A', '#E2582F'] },
  { id: 'CJ-0005', titlu: '„La Matei”', nota: 'Locul de întâlnire din centru. „Ne vedem la Matei” și apoi stăteai acolo ore întregi.', an: 2005, an_exact: false, categorie: 'Locuri', oras: 'Cluj', verificat: false, sursa: 'cluj.com', culori: ['#3D6B5A', '#F4F6F1'] }
]

export const ORASE_DEBLOCATE = ['Cluj']
export const ORASE = ['Cluj', 'București', 'Iași', 'Timișoara', 'Brașov', 'Constanța', 'Craiova', 'Oradea', 'Sibiu', 'Galați', 'Alt oraș']
export const AN_MIN = 1990
export const AN_MAX = 2008
