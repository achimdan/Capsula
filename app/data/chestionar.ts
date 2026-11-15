// Chestionarul „Capsula te citește”: 25 de întrebări în 6 capitole scurte.
// Fiecare opțiune poartă ponderi întregi pe trăsături și pe scena muzicală.
// Opțiunile „neutra” (Prefer să nu spun) au ponderi zero: nu mută nimic în profil.
// Logica de scor stă în app/utils/profilare.ts. Detalii în docs/profilare.md.
import { ORASE } from './fise'

export const TRASATURI = ['nostalgie', 'rebel', 'cerebral', 'social', 'familist', 'urban', 'diaspora', 'umor'] as const
export type Trasatura = typeof TRASATURI[number]

export const SCENE = ['pop', 'rock', 'hiphop', 'dance', 'manele', 'alternativ'] as const
export type Scena = typeof SCENE[number]

export type Ponderi = Partial<Record<Trasatura | Scena, number>>

export interface Optiune { id: string, text: string, ponderi: Ponderi, neutra?: true }

export type CapitolId = 'copilarie' | 'muzica' | 'ecrane' | 'scoala' | 'familie' | 'gusturi'

export const CAPITOLE: { id: CapitolId, titlu: string, subtitlu: string }[] = [
  { id: 'copilarie', titlu: 'Copilărie & cartier', subtitlu: 'Începem cu cheia de la gât.' },
  { id: 'muzica', titlu: 'Muzică', subtitlu: 'Ce era pe caseta ta, pe bune.' },
  { id: 'ecrane', titlu: 'Ecrane', subtitlu: 'Televizor, videoclub, net café.' },
  { id: 'scoala', titlu: 'Școală & drum', subtitlu: 'Fără catalog, promitem.' },
  { id: 'familie', titlu: 'Familie & acum', subtitlu: 'Doar cât vrei tu să ne spui.' },
  { id: 'gusturi', titlu: 'Gusturi', subtitlu: 'Ultimele întrebări, cele mai dulci.' }
]

interface Baza { id: string, capitol: CapitolId, text: string, ajutor?: string }

export type Intrebare =
  | Baza & { tip: 'an', min: number, max: number }
  | Baza & { tip: 'unic', optiuni: Optiune[] }
  | Baza & { tip: 'multiplu', max: number, optiuni: Optiune[] }
  | Baza & { tip: 'asta-sau-aia', optiuni: [Optiune, Optiune] }
  // Scală 1–5: mijlocul (3) e neutru; fiecare pas în sus adaugă `ponderi`, în jos le scade.
  | Baza & { tip: 'scala', etichete: [string, string], ponderi: Ponderi, permiteNeutru?: true }

export type Raspuns = string | string[] | number | null
export type Raspunsuri = Record<string, Raspuns | undefined>

export const SCALA_MIN = 1
export const SCALA_MAX = 5
export const SCALA_MIJLOC = 3

export const PREFER = 'prefer'
const prefer = (): Optiune => ({ id: PREFER, text: 'Prefer să nu spun', ponderi: {}, neutra: true })

// Orașele reiau lista din fise.ts; id-ul e chiar numele, ca să se potrivească cu profil.oras.
const optiuniOras: Optiune[] = [
  ...ORASE.map(o => ({ id: o, text: o, ponderi: { urban: o === 'Alt oraș' ? 1 : 2 } })),
  { id: 'sat', text: 'La sat sau la comună', ponderi: { urban: -2, familist: 1 } },
  prefer()
]

export const INTREBARI: Intrebare[] = [
  // ── Copilărie & cartier
  { id: 'an-nastere', capitol: 'copilarie', tip: 'an', min: 1975, max: 2000, text: 'Ce an scrie pe certificatul tău?', ajutor: 'Doar ca să știm ce ți-a cântat radioul la 15 ani.' },
  { id: 'oras', capitol: 'copilarie', tip: 'unic', text: 'Unde ți-ai tocit genunchii în copilărie?', optiuni: optiuniOras },
  {
    id: 'fata-blocului', capitol: 'copilarie', tip: 'unic', text: 'Ce se auzea de la tine din fața blocului?',
    optiuni: [
      { id: 'fotbal', text: 'Mingea în ușa garajului și „încă un minut!”', ponderi: { social: 3, nostalgie: 1 } },
      { id: 'bunica', text: 'Cineva de la etajul trei: „Gata, la masă!”', ponderi: { familist: 3, nostalgie: 1 } },
      { id: 'liniste', text: 'Nimic. Eram sus, cu o carte sau un puzzle', ponderi: { cerebral: 3 } },
      { id: 'pocnitori', text: 'Pocnitori. Mereu pocnitori', ponderi: { rebel: 3, umor: 1 } },
      { id: 'bancuri', text: 'Râsete: tocmai spusesem bancul cu Bulă', ponderi: { umor: 3, social: 1 } }
    ]
  },
  {
    id: 'vara', capitol: 'copilarie', tip: 'asta-sau-aia', text: 'Vara copilăriei, pe scurt:',
    optiuni: [
      { id: 'bunici', text: 'La bunici, cu dude și găini', ponderi: { familist: 2, nostalgie: 2, urban: -1 } },
      { id: 'cartier', text: 'În cartier, cu cheia de gât', ponderi: { social: 2, rebel: 1, urban: 1 } }
    ]
  },
  {
    id: 'comori', capitol: 'copilarie', tip: 'multiplu', max: 2, text: 'Ce comori țineai sub pat?', ajutor: 'Alege până la două.',
    optiuni: [
      { id: 'surprize', text: 'Surprize de la guma Turbo', ponderi: { nostalgie: 3 } },
      { id: 'casete', text: 'Casete înregistrate de pe radio', ponderi: { nostalgie: 1, pop: 1, dance: 1 } },
      { id: 'carti', text: 'Cărți de la bibliotecă, cu termenul depășit', ponderi: { cerebral: 3 } },
      { id: 'cartonase', text: 'Cartonașe cu fotbaliști, de schimb', ponderi: { social: 2, nostalgie: 1 } },
      { id: 'pegasus', text: 'Un Pegasus cu „9999 in 1”', ponderi: { umor: 2, rebel: 1 } }
    ]
  },

  // ── Muzică
  {
    id: 'prima-caseta', capitol: 'muzica', tip: 'unic', text: 'Prima casetă pe care ai ascultat-o până s-a rupt banda:',
    optiuni: [
      { id: 'rock', text: 'Iris, Holograf, Compact', ponderi: { rock: 3 } },
      { id: 'hiphop', text: 'B.U.G. Mafia, La Familia, Paraziții', ponderi: { hiphop: 3, rebel: 1 } },
      { id: 'dance', text: 'Haiducii, O-Zone, Akcent', ponderi: { dance: 3, social: 1 } },
      { id: 'manele', text: 'Nicolae Guță, Florin Salam, Adrian Minune', ponderi: { manele: 3, social: 1 } },
      { id: 'alternativ', text: 'Timpuri Noi, Sarmalele Reci, Kumm', ponderi: { alternativ: 3, cerebral: 1 } },
      { id: 'pop', text: 'Hi-Q, Animal X, Andreea Bănică', ponderi: { pop: 3 } }
    ]
  },
  {
    id: 'dansat', capitol: 'muzica', tip: 'multiplu', max: 2, text: 'Unde ai dansat cel mai mult?', ajutor: 'Până la două.',
    optiuni: [
      { id: 'disco', text: 'La discoteca din cartier', ponderi: { dance: 3, social: 1 } },
      { id: 'concert', text: 'La concerte în aer liber', ponderi: { rock: 3, social: 1 } },
      { id: 'nunti', text: 'La nunți și botezuri, până dimineața', ponderi: { manele: 3, familist: 1 } },
      { id: 'camera', text: 'În cameră, cu boxele la maximum', ponderi: { hiphop: 2, alternativ: 1, rebel: 1 } },
      { id: 'banchet', text: 'La banchet, pe ce dădea DJ-ul', ponderi: { pop: 3, social: 1 } },
      { id: 'perete', text: 'N-am dansat. Am susținut peretele', ponderi: { umor: 2, cerebral: 1 } }
    ]
  },
  { id: 'volum', capitol: 'muzica', tip: 'scala', text: 'Cât de tare dădeai volumul când ieșeau ai tăi din casă?', etichete: ['Cuminte', 'Vecinii știu tot'], ponderi: { rebel: 1 } },
  {
    id: 'album-compilatie', capitol: 'muzica', tip: 'asta-sau-aia', text: 'Pe casetă puneai:',
    optiuni: [
      { id: 'album', text: 'Un album întreg, de la cap la coadă', ponderi: { cerebral: 1, rock: 2, alternativ: 2 } },
      { id: 'compilatie', text: 'Compilația ta, prinsă de pe radio', ponderi: { nostalgie: 1, pop: 2, dance: 1, hiphop: 1 } }
    ]
  },

  // ── Ecrane
  {
    id: 'seara-tv', capitol: 'ecrane', tip: 'unic', text: 'Seara, la televizor, câștiga:',
    optiuni: [
      { id: 'telenovela', text: 'Telenovela, cu toată familia', ponderi: { familist: 2, nostalgie: 2 } },
      { id: 'desene', text: 'Desenele de pe Cartoon Network', ponderi: { umor: 2, nostalgie: 1 } },
      { id: 'mtv', text: 'MTV sau Atomic, cu videoclipuri', ponderi: { rebel: 1, social: 1, pop: 1, hiphop: 1 } },
      { id: 'documentare', text: 'Documentarele de pe Discovery', ponderi: { cerebral: 3 } },
      { id: 'fotbal', text: 'Meciul, cu tot blocul la geam', ponderi: { social: 3 } },
      { id: 'umor', text: 'Scheciurile de la Vacanța Mare sau Divertis', ponderi: { umor: 3 } }
    ]
  },
  { id: 'replici', capitol: 'ecrane', tip: 'scala', text: 'Câte replici din filme și scheciuri vechi folosești și azi?', etichete: ['Aproape niciuna', 'Vorbesc doar în citate'], ponderi: { umor: 1 } },
  {
    id: 'videoclub', capitol: 'ecrane', tip: 'asta-sau-aia', text: 'Filmul de sâmbătă seara:',
    optiuni: [
      { id: 'piratat', text: 'Caseta de la videoclub, cu o singură voce pentru toate personajele', ponderi: { rebel: 1, umor: 2 } },
      { id: 'tvr', text: 'Ce dădea la TVR, în fotoliul bun', ponderi: { familist: 1, nostalgie: 2 } }
    ]
  },
  {
    id: 'calculator', capitol: 'ecrane', tip: 'unic', text: 'Primul tău drum la calculator era către:',
    optiuni: [
      { id: 'netcafe', text: 'Counter-Strike la net café, până la ultimul leu', ponderi: { social: 2, rebel: 2 } },
      { id: 'mess', text: 'Yahoo Messenger și BUZZ!-uri', ponderi: { social: 2, umor: 1 } },
      { id: 'encarta', text: 'Encarta și referatele', ponderi: { cerebral: 3 } },
      { id: 'curte', text: 'Calculator? Aveam curtea', ponderi: { nostalgie: 2, urban: -1 } }
    ]
  },

  // ── Școală & drum
  {
    id: 'banca', capitol: 'scoala', tip: 'unic', text: 'În clasă, locul tău era:',
    optiuni: [
      { id: 'prima', text: 'Prima bancă, cu mâna sus', ponderi: { cerebral: 3 } },
      { id: 'ultima', text: 'Ultima bancă, de unde se vedea tot', ponderi: { rebel: 2, umor: 1 } },
      { id: 'mijloc', text: 'La mijloc, unde se organizau ieșirile', ponderi: { social: 3 } },
      { id: 'geam', text: 'Lângă geam, cu gândul în altă parte', ponderi: { nostalgie: 2, alternativ: 1 } },
      prefer()
    ]
  },
  {
    id: 'dupa-liceu', capitol: 'scoala', tip: 'unic', text: 'După liceu, drumul tău a fost:', ajutor: 'Toate drumurile sunt bune. Întrebăm doar ca să-ți potrivim fișele.',
    optiuni: [
      { id: 'facultate', text: 'Facultate, poate și ceva după', ponderi: { cerebral: 1, urban: 1 } },
      { id: 'meserie', text: 'O meserie, învățată pe bune', ponderi: { familist: 1 } },
      { id: 'munca', text: 'Direct la muncă, din prima vară', ponderi: { social: 1 } },
      { id: 'afara', text: 'Un bilet de autocar spre afară', ponderi: { diaspora: 2 } },
      { id: 'pe-drum', text: 'Încă mă caut, și e în regulă', ponderi: { rebel: 1 } },
      prefer()
    ]
  },
  { id: 'daca', capitol: 'scoala', tip: 'scala', text: 'Cât de des te întrebi „ce-ar fi fost dacă…”?', etichete: ['Rar', 'Săptămânal, la duș'], ponderi: { nostalgie: 1 } },
  {
    id: 'bani', capitol: 'scoala', tip: 'asta-sau-aia', text: 'Primul salariu:',
    optiuni: [
      { id: 'deoparte', text: 'O parte pus deoparte, „să fie”', ponderi: { familist: 2, cerebral: 1 } },
      { id: 'cheltuit', text: 'Cheltuit până la ultimul leu, cu prietenii', ponderi: { social: 2, rebel: 1 } }
    ]
  },

  // ── Familie & acum
  {
    id: 'acasa-acum', capitol: 'familie', tip: 'unic', text: 'Unde e „acasă” acum?',
    optiuni: [
      { id: 'acelasi', text: 'În orașul în care am crescut', ponderi: { nostalgie: 1 } },
      { id: 'alt-oras', text: 'În alt oraș din țară', ponderi: { urban: 1 } },
      { id: 'sat', text: 'La sat, cu liniștea mea', ponderi: { urban: -2, familist: 1 } },
      { id: 'afara', text: 'În altă țară', ponderi: { diaspora: 3 } },
      { id: 'intre', text: 'Între două țări, cu valiza mereu pe jumătate', ponderi: { diaspora: 2, nostalgie: 1 } },
      prefer()
    ]
  },
  {
    id: 'casa', capitol: 'familie', tip: 'unic', text: 'Cine îți ține de urât acasă în zilele astea?', ajutor: 'Orice răspuns e un răspuns bun.',
    optiuni: [
      { id: 'copii', text: 'Copii, cu toată gălăgia lor', ponderi: { familist: 3 } },
      { id: 'partener', text: 'Un partener sau o parteneră', ponderi: { familist: 2 } },
      { id: 'parinti', text: 'Părinții sau bunicii', ponderi: { familist: 2, nostalgie: 1 } },
      { id: 'colegi', text: 'Colegi de apartament sau prieteni', ponderi: { social: 2 } },
      { id: 'eu', text: 'Doar eu și poate o plantă', ponderi: { cerebral: 1, umor: 1 } },
      prefer()
    ]
  },
  {
    id: 'duminica', capitol: 'familie', tip: 'multiplu', max: 2, text: 'Ce duminică te încarcă?', ajutor: 'Până la două.',
    optiuni: [
      { id: 'masa', text: 'Masa lungă, cu ciorbă și „mai ia una”', ponderi: { familist: 3 } },
      { id: 'carte', text: 'O carte și telefonul pe silențios', ponderi: { cerebral: 3 } },
      { id: 'prieteni', text: 'Ieșit cu gașca, fără plan', ponderi: { social: 3 } },
      { id: 'film-vechi', text: 'Un film vechi, văzut a zecea oară', ponderi: { nostalgie: 3 } },
      { id: 'aventura', text: 'Un drum unde n-am mai fost', ponderi: { rebel: 2, urban: 1 } }
    ]
  },
  { id: 'suni-acasa', capitol: 'familie', tip: 'scala', text: 'Cât de des vorbești cu cei de acasă?', etichete: ['Când se poate', 'În fiecare zi'], ponderi: { familist: 1 }, permiteNeutru: true },

  // ── Gusturi
  {
    id: 'eugenia-rom', capitol: 'gusturi', tip: 'asta-sau-aia', text: 'Pentru pauza mare:',
    optiuni: [
      { id: 'eugenia', text: 'Eugenia, cuminte și sigură', ponderi: { familist: 1, nostalgie: 1 } },
      { id: 'rom', text: 'ROM, „senzații tari”', ponderi: { rebel: 1, umor: 1 } }
    ]
  },
  {
    id: 'umor', capitol: 'gusturi', tip: 'unic', text: 'Umorul tău seamănă cel mai mult cu:',
    optiuni: [
      { id: 'bula', text: 'Bancurile cu Bulă, spuse la masă', ponderi: { umor: 2, nostalgie: 1 } },
      { id: 'ironie', text: 'Ironia fină, pe care n-o prinde toată lumea', ponderi: { cerebral: 2, umor: 1 } },
      { id: 'meme', text: 'Meme-uri trimise la 2 noaptea', ponderi: { umor: 2, urban: 1 } },
      { id: 'autoironie', text: 'Râsul de mine, înaintea altora', ponderi: { umor: 1, social: 2 } },
      { id: 'serios', text: 'Prefer o poveste bună unei glume', ponderi: { nostalgie: 2 } }
    ]
  },
  {
    id: 'zambet', capitol: 'gusturi', tip: 'multiplu', max: 2, text: 'Ce te face să zâmbești instant?', ajutor: 'Până la două.',
    optiuni: [
      { id: 'riff', text: 'Un riff de chitară din liceu', ponderi: { rock: 3 } },
      { id: 'beat', text: 'Un beat care îți știe tot cartierul', ponderi: { hiphop: 3 } },
      { id: 'tei', text: 'Primele note din „Dragostea din tei”', ponderi: { dance: 3 } },
      { id: 'lautari', text: 'O manea bună, cântată cu toată sala', ponderi: { manele: 3 } },
      { id: 'obscur', text: 'O piesă pe care o știu doar trei oameni', ponderi: { alternativ: 3 } },
      { id: 'refren', text: 'Un refren pe care îl știu pe de rost', ponderi: { pop: 3 } }
    ]
  },
  { id: 'reguli', capitol: 'gusturi', tip: 'scala', text: 'Câte reguli ai ocolit săptămâna asta?', etichete: ['Niciuna', 'Am pierdut șirul'], ponderi: { rebel: 1, umor: 1 } }
]
