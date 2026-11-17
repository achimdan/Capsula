// Emisiuni și seriale difuzate în România, 1990–2008. Doar titluri și texte proprii scurte; fără clipuri găzduite.
// Sursa fiecărei fișe e pagina de Wikipedia deschisă la redactare; `verificat: true` după a doua verificare, pe sursă.
export type TipEmisiune = 'Emisiune' | 'Serial' | 'Desene' | 'Film'

export interface Emisiune {
  id: string
  titlu: string
  post: string
  an_start: number
  an_sfarsit: number | null
  an_exact: boolean
  tip: TipEmisiune
  nota: string
  sursa: string
  url: string
  verificat: boolean
}

export const TIPURI_TV: TipEmisiune[] = ['Emisiune', 'Serial', 'Desene', 'Film']

export const EMISIUNI: Emisiune[] = [
  { id: 'dallas-1990', titlu: 'Dallas', post: 'TVR', an_start: 1990, an_sfarsit: null, an_exact: false, tip: 'Serial',
    nota: 'Serialul american pe care mulți îl știau deja din anii 1980. Pilotul a fost printre primele programe occidentale după Revoluție.',
    sursa: 'Wikipedia (ro): Dallas (serial TV)', url: 'https://ro.wikipedia.org/wiki/Dallas_(serial_TV)', verificat: false },
  { id: 'lantul-slabiciunilor-1990', titlu: 'Lanțul slăbiciunilor (ecranizare TVR)', post: 'TVR', an_start: 1990, an_sfarsit: null, an_exact: true, tip: 'Film',
    nota: 'O ecranizare TVR din 1990 după opera lui Caragiale.',
    sursa: 'Wikipedia (ro): Lanțul slăbiciunilor', url: 'https://ro.wikipedia.org/wiki/Lan%C8%9Bul_sl%C4%83biciunilor', verificat: true },
  { id: 'abracadabra', titlu: 'Abracadabra', post: 'TVR 1, apoi Pro TV', an_start: 1991, an_sfarsit: 2001, an_exact: true, tip: 'Emisiune',
    nota: 'Emisiune pentru copii cu Marele Magician. A pornit la TVR 1 și s-a mutat la Pro TV în 1996.',
    sursa: 'Wikipedia (ro): Abracadabra (emisiune)', url: 'https://ro.wikipedia.org/wiki/Abracadabra_(emisiune)', verificat: true },
  { id: 'cartoon-network', titlu: 'Cartoon Network', post: 'Cartoon Network', an_start: 1993, an_sfarsit: null, an_exact: false, tip: 'Desene',
    nota: 'Postul de desene animate, care a început să emită la nivel european în 1993. Pentru mulți, ecranul de după școală.',
    sursa: 'Wikipedia (ro): Cartoon Network (România)', url: 'https://ro.wikipedia.org/wiki/Cartoon_Network_(Rom%C3%A2nia)', verificat: true },
  { id: 'chestiunea-zilei', titlu: 'Chestiunea zilei', post: 'Pro TV', an_start: 1996, an_sfarsit: 2000, an_exact: false, tip: 'Emisiune',
    nota: 'Emisiune de seară cu Florin Călinescu, care comenta știrile anului cu umor politic. A revenit scurt în 2004; datele sursei diferă ușor.',
    sursa: 'Wikipedia (ro): Chestiunea zilei', url: 'https://ro.wikipedia.org/wiki/Chestiunea_zilei', verificat: true },
  { id: 'tanar-si-neliniscit', titlu: 'Tânăr și neliniștit', post: 'Pro TV', an_start: 1996, an_sfarsit: 2014, an_exact: true, tip: 'Serial',
    nota: 'Telenovela americană difuzată la Pro TV din 1996 până în toamna lui 2014, cu episoade venite cam cinci ani după SUA. A continuat apoi la Acasă TV.',
    sursa: 'Wikipedia (ro): Tânăr și neliniștit', url: 'https://ro.wikipedia.org/wiki/T%C3%A2n%C4%83r_%C8%99i_nelini%C8%99tit', verificat: true },
  { id: 'sunset-beach', titlu: 'Sunset Beach', post: 'TVR 1', an_start: 1998, an_sfarsit: 1999, an_exact: true, tip: 'Serial',
    nota: 'Telenovelă americană cu 755 de episoade, difuzată la TVR 1 seara la 19:00.',
    sursa: 'Wikipedia (ro): Sunset Beach', url: 'https://ro.wikipedia.org/wiki/Sunset_Beach', verificat: true },
  { id: 'surprize-surprize', titlu: 'Surprize, surprize', post: 'TVR 1', an_start: 1999, an_sfarsit: 2008, an_exact: false, tip: 'Emisiune',
    nota: 'Emisiunea Andreei Marin cu revederi emoționante între rude. Articolul spune că a rulat cam nouă ani, fără un an exact de final.',
    sursa: 'Wikipedia (ro): Surprize, surprize', url: 'https://ro.wikipedia.org/wiki/Surprize,_surprize', verificat: true },
  { id: 'garantat-100', titlu: 'Garantat 100%', post: 'TVR 1', an_start: 1999, an_sfarsit: null, an_exact: false, tip: 'Emisiune',
    nota: 'Talk-show cultural condus de Cătălin Ștefănescu, în care fiecare invitat aducea un obiect personal. Sursa nu dă un an de final.',
    sursa: 'Wikipedia (ro): Garantat 100%', url: 'https://ro.wikipedia.org/wiki/Garantat_100%25', verificat: true },
  { id: 'vacanta-mare', titlu: 'Vacanța Mare', post: 'Pro TV', an_start: 1999, an_sfarsit: 2007, an_exact: false, tip: 'Emisiune',
    nota: 'Grupul umoristic Vacanța Mare, cu emisiuni săptămânale la Pro TV din toamna lui 1999 până spre începutul lui 2007.',
    sursa: 'Wikipedia (ro): Vacanța Mare', url: 'https://ro.wikipedia.org/wiki/Vacan%C8%9Ba_Mare', verificat: true },
  { id: 'divertis', titlu: 'Divertis', post: 'Pro TV, Antena 1', an_start: 1999, an_sfarsit: null, an_exact: false, tip: 'Emisiune',
    nota: 'Grupul de umor Divertis, cu schițe satirice, a trecut de la Pro TV la Antena 1 și înapoi. Datele din sursă variază.',
    sursa: 'Wikipedia (ro): Divertis', url: 'https://ro.wikipedia.org/wiki/Divertis', verificat: true },
  { id: 'cronica-carcotasilor', titlu: 'Cronica Cârcotașilor', post: 'Prima TV', an_start: 2000, an_sfarsit: null, an_exact: false, tip: 'Emisiune',
    nota: 'Emisiune satirică de miercuri seara, care comenta gafele de la televizor. Începutul e estimat din anul în care apar primii membri ai echipei.',
    sursa: 'Wikipedia (ro): Cronica Cârcotașilor', url: 'https://ro.wikipedia.org/wiki/Cronica_C%C3%A2rcota%C8%99ilor', verificat: true },
  { id: 'la-bloc', titlu: 'La bloc', post: 'Pro TV', an_start: 2002, an_sfarsit: 2008, an_exact: true, tip: 'Serial',
    nota: 'Serial de comedie despre vecinii unui bloc, cu Nelu și Costel în centru. 13 sezoane.',
    sursa: 'Wikipedia (ro): La bloc', url: 'https://ro.wikipedia.org/wiki/La_bloc', verificat: true },
  { id: 'la-maruta', titlu: 'La Măruță (fost Happy Hour)', post: 'Pro TV', an_start: 2007, an_sfarsit: 2026, an_exact: true, tip: 'Emisiune',
    nota: 'Emisiune de divertisment cu Cătălin Măruță, începută în 2007 și numită Happy Hour până în 2013. Ultima ediție a fost difuzată pe 6 februarie 2026.',
    sursa: 'Wikipedia (ro): La Măruță', url: 'https://ro.wikipedia.org/wiki/La_M%C4%83ru%C8%9B%C4%83', verificat: true },
  { id: 'romania-te-iubesc', titlu: 'România, te iubesc!', post: 'Pro TV', an_start: 2008, an_sfarsit: null, an_exact: true, tip: 'Emisiune',
    nota: 'Emisiune de anchete prezentată de Cristian Leonte, despre sănătate, păduri și turism.',
    sursa: 'Wikipedia (ro): România, te iubesc!', url: 'https://ro.wikipedia.org/wiki/Rom%C3%A2nia,_te_iubesc!', verificat: true },
]
