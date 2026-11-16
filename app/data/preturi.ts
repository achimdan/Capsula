// „Prețuri de atunci”: doar prețuri cu sursă reală, citită efectiv. Nimic estimat.
// Înainte de iulie 2005 valorile sunt în lei vechi (ROL); 1 leu nou (RON) = 10.000 lei vechi.
export interface Pret {
  id: string
  produs: string
  an: number
  an_exact: boolean
  valoare: number
  moneda: 'ROL' | 'RON'
  unitate: string
  sursa: string
  url: string
  verificat: false
}

export const PRETURI: Pret[] = [
  {
    id: 'lapte-1990', produs: 'Lapte proaspăt de vacă', an: 1990, an_exact: true, valoare: 11.9, moneda: 'ROL', unitate: '1 litru',
    sursa: 'Economica.net, 25 mai 2012, după datele INS (preț mediu, februarie 1990)',
    url: 'https://www.economica.net/?p=24231', verificat: false,
  },
  {
    id: 'oua-1990', produs: 'Ouă', an: 1990, an_exact: true, valoare: 3.31, moneda: 'ROL', unitate: 'bucata',
    sursa: 'Economica.net, 25 mai 2012, după datele INS (preț mediu, februarie 1990)',
    url: 'https://www.economica.net/?p=24231', verificat: false,
  },
  {
    id: 'telemea-vaca-1990', produs: 'Telemea de vacă', an: 1990, an_exact: true, valoare: 65.71, moneda: 'ROL', unitate: '1 kg',
    sursa: 'Economica.net, 25 mai 2012, după datele INS (preț mediu, februarie 1990)',
    url: 'https://www.economica.net/?p=24231', verificat: false,
  },
  {
    id: 'paine-1993', produs: 'Pâine', an: 1993, an_exact: false, valoare: 32, moneda: 'ROL', unitate: 'o pâine',
    sursa: 'Digi24, 19 ianuarie 2014: „în banii de atunci”, comparație cu 1993 (anul nu e repetat în propoziție)',
    url: 'https://www.digi24.ro/stiri/economie/inflatia-dupa-24-de-ani-adrian-vasilescu-painea-o-fi-mai-scumpa-decat-in-1993-dar-si-salariile-au-crescut-186796', verificat: false,
  },
  {
    id: 'pui-1993', produs: 'Carne de pui', an: 1993, an_exact: false, valoare: 50, moneda: 'ROL', unitate: '1 kg',
    sursa: 'Digi24, 19 ianuarie 2014: „în banii de atunci”, comparație cu 1993 (anul nu e repetat în propoziție)',
    url: 'https://www.digi24.ro/stiri/economie/inflatia-dupa-24-de-ani-adrian-vasilescu-painea-o-fi-mai-scumpa-decat-in-1993-dar-si-salariile-au-crescut-186796', verificat: false,
  },
  {
    id: 'cartofi-1993', produs: 'Cartofi', an: 1993, an_exact: false, valoare: 75, moneda: 'ROL', unitate: '1 kg',
    sursa: 'Digi24, 19 ianuarie 2014: „în banii de atunci”, comparație cu 1993 (anul nu e repetat în propoziție)',
    url: 'https://www.digi24.ro/stiri/economie/inflatia-dupa-24-de-ani-adrian-vasilescu-painea-o-fi-mai-scumpa-decat-in-1993-dar-si-salariile-au-crescut-186796', verificat: false,
  },
  {
    id: 'benzina-1998', produs: 'Benzină premium fără plumb', an: 1998, an_exact: true, valoare: 2900, moneda: 'ROL', unitate: '1 litru',
    sursa: 'Ziarul Financiar: comunicat Petrom către Mediafax, februarie 1998 (după scumpire, de la 2.650 lei)',
    url: 'https://www.zf.ro/zf-24/zf15-ani-benzina-costa-0-3-lei-la-inceputul-lui-1998-acum-un-litru-trece-de-5-8-lei-11713674', verificat: false,
  },
  {
    id: 'romtelecom-impuls-1999', produs: 'Apel Romtelecom (taxă pe impuls)', an: 1999, an_exact: true, valoare: 460, moneda: 'ROL', unitate: '1 impuls',
    sursa: 'Capital, 29 iulie 1999 (tarif în vigoare din iulie 1999)',
    url: 'https://www.capital.ro/celularele-bat-telefonul-fix-3332.html', verificat: false,
  },
  {
    id: 'sim-alo-1999', produs: 'Pachet SIM ALO-DA (telefon mobil prepay)', an: 1999, an_exact: true, valoare: 195200, moneda: 'ROL', unitate: 'pachet, cu TVA',
    sursa: 'Capital, 29 iulie 1999 („12,2 USD, incluzând TVA”)',
    url: 'https://www.capital.ro/celularele-bat-telefonul-fix-3332.html', verificat: false,
  },
  {
    id: 'caseta-1999', produs: 'Casetă audio cu muzică (copie)', an: 1999, an_exact: false, valoare: 15000, moneda: 'ROL', unitate: 'bucata, între 15.000 și 20.000',
    sursa: 'Vice România: mărturia unui fost vânzător de casete, pe la sfârșitul anilor ’90 (amintire, nu tarif oficial)',
    url: 'https://www.vice.com/ro/article/cum-piratai-si-vindeai-muzica-la-negru-in-romania-anilor-90/', verificat: false,
  },
  {
    id: 'salariu-2003', produs: 'Câștig salarial mediu net lunar', an: 2003, an_exact: true, valoare: 5037861, moneda: 'ROL', unitate: 'pe lună, noiembrie',
    sursa: 'Bursa, 12 ianuarie 2004, după datele INS (noiembrie 2003)',
    url: 'https://www.bursa.ro/salariul-mediu-net-a-crescut-cu-1-6-procente-48119717', verificat: false,
  },
  {
    id: 'salariu-2005', produs: 'Câștig salarial mediu net lunar', an: 2005, an_exact: true, valoare: 774, moneda: 'RON', unitate: 'pe lună, noiembrie',
    sursa: 'Capital, 9 ianuarie 2006, după datele INS (noiembrie 2005)',
    url: 'https://www.capital.ro/774-lei-salariu-mediu-net-22573.html', verificat: false,
  },
  {
    id: 'bilet-ratb-2008', produs: 'Bilet RATB (o călătorie)', an: 2008, an_exact: true, valoare: 1.3, moneda: 'RON', unitate: 'o călătorie',
    sursa: 'Digi24: RATB, preț majorat în 2008 de la 1,1 la 1,3 lei',
    url: 'https://www.digi24.ro/stiri/actualitate/social/ratb-solicitam-majorarea-tarifelor-pentru-a-putea-plati-datoria-catre-anaf-preturile-sunt-neschimbate-din-2008-423640', verificat: false,
  },
  {
    id: 'paine-2008', produs: 'Pâine albă', an: 2008, an_exact: true, valoare: 1, moneda: 'RON', unitate: 'o pâine de 280 g',
    sursa: 'Bursa, 9 aprilie 2008: președintele ROMPAN, înaintea scumpirii dinainte de Paște',
    url: 'https://www.bursa.ro/pretul-painii-va-creste-cu-circa-10-bani-pana-la-paste-0585525', verificat: false,
  },
]
