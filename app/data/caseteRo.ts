// Muzica românească de pe caseta din fundalul „Casetă 3D”: pentru fiecare an, albume sau piese românești
// apărute sau ascultate atunci. Fiecare rând are sursa lui; intră cu `verificat: false` până le verifică un om,
// iar `an_exact: false` marchează anii nesiguri. Nu adăugăm rânduri fără sursă.

export interface InregistrareCaseta {
  an: number
  artist: string
  titlu: string
  tip: 'album' | 'piesă'
  gen: string
  an_exact: boolean
  verificat: boolean
  sursa: string
}

// Surse: Wikipedia în română (paginile artiștilor, la discografie); pentru Andre și A.S.I.A., Wikipedia în engleză.
export const CASETE_RO: InregistrareCaseta[] = [
  { an: 1988, artist: 'Iris', titlu: 'Iris III – Nu te opri!', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Iris_(trupă)' },
  { an: 1988, artist: 'Loredana Groza', titlu: 'Bună seara, iubito', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Loredana_Groza' },
  { an: 1988, artist: 'Nicu Alifantis', titlu: 'Piața Romană nr. 9', tip: 'album', gen: 'folk', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Nicu_Alifantis' },
  { an: 1989, artist: 'Mihai Constantinescu', titlu: 'Cîntă iubire', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Mihai_Constantinescu' },
  { an: 1989, artist: 'Loredana Groza', titlu: 'Un buchet de trandafiri', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Loredana_Groza' },
  { an: 1990, artist: 'Iris', titlu: 'Iris IV', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Iris_(trupă)' },
  { an: 1990, artist: 'Nicu Alifantis', titlu: 'Risipitorul de iubire', tip: 'album', gen: 'folk', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Nicu_Alifantis' },
  { an: 1991, artist: 'Phoenix', titlu: 'Remember Phoenix', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Phoenix_(formație)' },
  { an: 1991, artist: 'Mirabela Dauer', titlu: 'Mirabela și Romanticii \'90', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Mirabela_Dauer' },
  { an: 1992, artist: 'Direcția 5', titlu: 'La vulturul de mare cu peștele în ghiare', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Direcția_5' },
  { an: 1993, artist: 'Holograf', titlu: 'World Full of Lies', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Holograf' },
  { an: 1993, artist: 'Direcția 5', titlu: 'Seducție', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Direcția_5' },
  { an: 1994, artist: 'Loredana Groza', titlu: 'Atitudine', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Loredana_Groza' },
  { an: 1994, artist: 'Mihai Constantinescu', titlu: 'Maria', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Mihai_Constantinescu' },
  { an: 1995, artist: 'B.U.G. Mafia', titlu: 'Mafia', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/B.U.G._Mafia' },
  { an: 1995, artist: 'Holograf', titlu: 'Stai în poala mea', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Holograf' },
  { an: 1996, artist: 'Voltaj', titlu: 'Pericol de moarte', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Voltaj' },
  { an: 1996, artist: 'Paraziții', titlu: 'Nimic normal', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Paraziții' },
  { an: 1996, artist: 'B.U.G. Mafia', titlu: 'Născut și crescut în Pantelimon', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/B.U.G._Mafia' },
  { an: 1997, artist: 'La Familia', titlu: 'Băieți de cartier', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/La_Familia' },
  { an: 1997, artist: 'B.U.G. Mafia', titlu: 'IV: Deasupra tuturor', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/B.U.G._Mafia' },
  { an: 1997, artist: 'Compact', titlu: 'Pe tine te-am ales', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Compact_(formație)' },
  { an: 1998, artist: '3rei Sud Est', titlu: '3rei Sud Est', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/3rei_Sud_Est' },
  { an: 1998, artist: 'La Familia', titlu: 'Nicăieri nu-i ca acasă', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/La_Familia' },
  { an: 1998, artist: 'Holograf', titlu: 'Supersonic', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Holograf' },
  { an: 1999, artist: 'A.S.I.A.', titlu: 'A.S.I.A.', tip: 'album', gen: 'pop', an_exact: false, verificat: false, sursa: 'https://en.wikipedia.org/wiki/A.S.I.A.' },
  { an: 1999, artist: 'Andre', titlu: 'Noapte de vis', tip: 'album', gen: 'pop', an_exact: false, verificat: false, sursa: 'https://en.wikipedia.org/wiki/Andreea_Antonescu' },
  { an: 1999, artist: 'Hi-Q', titlu: 'UrasQbesc', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Hi-Q' },
  { an: 1999, artist: '3rei Sud Est', titlu: 'Visul meu', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/3rei_Sud_Est' },
  { an: 2000, artist: 'A.S.I.A.', titlu: 'Periculos', tip: 'album', gen: 'pop', an_exact: false, verificat: false, sursa: 'https://en.wikipedia.org/wiki/A.S.I.A.' },
  { an: 2000, artist: 'B.U.G. Mafia', titlu: 'După blocuri', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/B.U.G._Mafia' },
  { an: 2000, artist: 'Akcent', titlu: 'Senzatzia', tip: 'album', gen: 'pop', an_exact: false, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Akcent' },
  { an: 2001, artist: 'Andre', titlu: 'O noapte și-o zi', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://en.wikipedia.org/wiki/Andreea_B%C4%83lan' },
  { an: 2001, artist: 'La Familia', titlu: 'Familiarizează-te', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/La_Familia' },
  { an: 2001, artist: 'Paraziții', titlu: 'Categoria grea', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Paraziții' },
  { an: 2001, artist: 'Hi-Q', titlu: 'Dă muzica mai tare!!!', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Hi-Q' },
  { an: 2002, artist: 'Vama Veche', titlu: 'Am să mă întorc bărbat', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Vama_Veche_(formație)' },
  { an: 2002, artist: 'Akcent', titlu: 'În culori', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Akcent' },
  { an: 2003, artist: 'B.U.G. Mafia', titlu: 'Băieții buni', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/B.U.G._Mafia' },
  { an: 2003, artist: '3rei Sud Est', titlu: 'Symbol', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/3rei_Sud_Est' },
  { an: 2003, artist: 'La Familia', titlu: 'Punct și de la capăt', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/La_Familia' },
  { an: 2004, artist: 'Voltaj', titlu: 'Povestea oricui', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Voltaj' },
  { an: 2004, artist: 'Akcent', titlu: 'Poveste de viață', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Akcent' },
  { an: 2004, artist: 'Hi-Q', titlu: 'Gașca mea', tip: 'piesă', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Hi-Q' },
  { an: 2005, artist: 'Morandi', titlu: 'Reverse', tip: 'album', gen: 'dance', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Morandi' },
  { an: 2005, artist: 'Paraziții', titlu: 'Confort 3', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Paraziții' },
  { an: 2006, artist: 'Morandi', titlu: 'Mind Fields', tip: 'album', gen: 'dance', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Morandi' },
  { an: 2006, artist: 'Vama Veche', titlu: 'Fericire în rate', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Vama_Veche_(formație)' },
  { an: 2006, artist: 'La Familia', titlu: 'O mare familie', tip: 'album', gen: 'hip-hop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/La_Familia' },
  { an: 2007, artist: 'Morandi', titlu: 'N3XT', tip: 'album', gen: 'dance', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Morandi' },
  { an: 2007, artist: 'Iris', titlu: 'Cei ce vor fi', tip: 'album', gen: 'rock', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Iris_(trupă)' },
  { an: 2008, artist: 'Direcția 5', titlu: 'Ambiental cosmic', tip: 'album', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Direcția_5' },
  { an: 2008, artist: 'Hi-Q', titlu: 'Așa-s prietenii', tip: 'piesă', gen: 'pop', an_exact: true, verificat: false, sursa: 'https://ro.wikipedia.org/wiki/Hi-Q' },
]
