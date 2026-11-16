import { CARD, numeFisierCard, textShare, type ContinutCard } from '~/utils/cardScor'

// Cardul de scor desenat în browser (canvas → PNG), apoi trimis cu Web Share (pe telefon) sau descărcat.
// Culorile și fonturile din Banda; fără --signal (accentul rămâne pentru „ești aici” și Random Hit).

const C = { eticheta: '#DCE3DA', polaroid: '#F4F6F1', banda: '#14211B', linie: '#B9C6B6', muted: '#4F5F55' }
const DISPLAY = '"Big Shoulders", "Big Shoulders Display", "Arial Narrow", sans-serif'
const BODY = '"Work Sans", system-ui, sans-serif'
const MONO = '"IBM Plex Mono", ui-monospace, monospace'

// Fără text de probă, browserul cere doar subsetul latin; ă, â, î, ș, ț sunt în latin-ext.
const PROBA = 'AaĂăÂâÎîȘșȚț0123456789'

async function fonturiGata() {
  if (!document.fonts) return
  await Promise.all([
    document.fonts.load(`800 100px ${DISPLAY}`, PROBA),
    document.fonts.load(`500 40px ${BODY}`, PROBA),
    document.fonts.load(`500 28px ${MONO}`, PROBA)
  ]).catch(() => {})
}

function spatiat(ctx: CanvasRenderingContext2D, px: number) {
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`
}

export function deseneazaCard(ctx: CanvasRenderingContext2D, c: ContinutCard) {
  const W = CARD.latime, H = CARD.inaltime, M = 84
  ctx.fillStyle = C.eticheta
  ctx.fillRect(0, 0, W, H)

  // Polaroidul
  ctx.fillStyle = C.polaroid
  ctx.fillRect(M - 24, M - 24, W - 2 * (M - 24), H - 2 * (M - 24))
  ctx.strokeStyle = C.linie
  ctx.lineWidth = 2
  ctx.strokeRect(M - 24, M - 24, W - 2 * (M - 24), H - 2 * (M - 24))

  // Antet: CAPSULA + eticheta jocului
  ctx.fillStyle = C.banda
  ctx.textBaseline = 'alphabetic'
  ctx.font = `800 56px ${DISPLAY}`
  spatiat(ctx, 2)
  ctx.fillText('CAPSULA', M, M + 56)
  ctx.font = `500 26px ${MONO}`
  spatiat(ctx, 4)
  ctx.fillStyle = C.muted
  ctx.textAlign = 'right'
  ctx.fillText(c.eticheta.toUpperCase(), W - M, M + 48)
  ctx.textAlign = 'left'

  // Banda magnetică: o fâșie închisă cu scorul pe ea, ca un contor de casetofon
  const yB = 260, hB = 400
  ctx.fillStyle = C.banda
  ctx.fillRect(M, yB, W - 2 * M, hB)
  ctx.strokeStyle = 'rgba(220,227,218,.12)'
  ctx.lineWidth = 2
  for (let y = yB + 24; y < yB + hB; y += 24) { ctx.beginPath(); ctx.moveTo(M, y); ctx.lineTo(W - M, y); ctx.stroke() }
  ctx.fillStyle = C.eticheta
  ctx.font = `800 300px ${DISPLAY}`
  spatiat(ctx, 0)
  const lScor = ctx.measureText(c.scor).width
  ctx.font = `800 110px ${DISPLAY}`
  const lDin = ctx.measureText(c.din).width
  const x0 = (W - lScor - lDin - 12) / 2
  ctx.font = `800 300px ${DISPLAY}`
  ctx.fillText(c.scor, x0, yB + hB - 80)
  ctx.font = `800 110px ${DISPLAY}`
  ctx.fillStyle = C.linie
  ctx.fillText(c.din, x0 + lScor + 12, yB + hB - 80)

  // Titlul și generația
  ctx.fillStyle = C.banda
  ctx.font = `800 76px ${DISPLAY}`
  ctx.textAlign = 'center'
  ctx.fillText(c.titlu.toUpperCase(), W / 2, 790, W - 2 * M)
  if (c.generatie) {
    ctx.font = `500 34px ${BODY}`
    ctx.fillStyle = C.muted
    ctx.fillText(c.generatie, W / 2, 846)
  }

  // Rundele: anul real și cât de aproape ai fost
  const n = Math.max(1, c.runde.length), gol = 16
  const lat = (W - 2 * M - gol * (n - 1)) / n, yR = 920, hR = 170
  c.runde.forEach((r, i) => {
    const x = M + i * (lat + gol)
    ctx.strokeStyle = C.banda
    ctx.lineWidth = 3
    ctx.strokeRect(x, yR, lat, hR)
    ctx.fillStyle = C.banda
    ctx.font = `800 64px ${DISPLAY}`
    ctx.fillText(r.an, x + lat / 2, yR + 86)
    ctx.font = `500 24px ${MONO}`
    ctx.fillStyle = C.muted
    ctx.fillText(r.nota.toUpperCase(), x + lat / 2, yR + 136)
  })

  // Subsol
  ctx.fillStyle = C.banda
  ctx.font = `500 30px ${BODY}`
  ctx.fillText('Tu în ce an erai?', W / 2, H - M - 52)
  ctx.font = `500 26px ${MONO}`
  ctx.fillStyle = C.muted
  spatiat(ctx, 3)
  ctx.fillText(c.subsol.toUpperCase(), W / 2, H - M - 6)
  spatiat(ctx, 0)
  ctx.textAlign = 'left'
}

export function useCardScor() {
  async function imagine(c: ContinutCard): Promise<Blob> {
    await fonturiGata()
    const canvas = document.createElement('canvas')
    canvas.width = CARD.latime
    canvas.height = CARD.inaltime
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas indisponibil')
    deseneazaCard(ctx, c)
    return await new Promise<Blob>((ok, nu) => canvas.toBlob(b => b ? ok(b) : nu(new Error('png')), 'image/png'))
  }

  function descarcaBlob(blob: Blob, nume: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nume
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  type Pregatit = { fisier: File; date: ShareData }
  let pregatit: Pregatit | null = null
  let inLucru: Promise<Pregatit> | null = null

  async function construieste(c: ContinutCard, scor: number, max: number): Promise<Pregatit> {
    const blob = await imagine(c)
    const fisier = new File([blob], numeFisierCard(scor), { type: 'image/png' })
    return { fisier, date: { files: [fisier], text: textShare(scor, max), url: `${location.origin}/game` } }
  }

  // Desenăm cardul cât se vede ecranul final, ca navigator.share să fie chemat direct din click:
  // după un await lung, browserul poate considera gestul expirat și refuză foaia de share (NotAllowedError).
  function pregateste(c: ContinutCard, scor: number, max: number) {
    pregatit = null
    const p = construieste(c, scor, max)
    inLucru = p
    p.then(r => { if (inLucru === p) pregatit = r }).catch(() => {})
  }

  function uita() {
    pregatit = null
    inLucru = null
  }

  // 'trimis' = foaia de share s-a deschis; 'descarcat' = browserul nu știe să trimită fișiere, am salvat PNG-ul.
  async function distribuie(c: ContinutCard, scor: number, max: number): Promise<'trimis' | 'anulat' | 'descarcat'> {
    // Fără await când cardul e gata: share-ul pleacă în același gest al utilizatorului.
    const { fisier, date } = pregatit ?? await (inLucru ?? construieste(c, scor, max)).catch(() => construieste(c, scor, max))
    if (navigator.canShare?.({ files: [fisier] })) {
      try {
        await navigator.share(date)
        return 'trimis'
      } catch (e) {
        if ((e as DOMException)?.name === 'AbortError') return 'anulat'
      }
    }
    descarcaBlob(fisier, fisier.name)
    return 'descarcat'
  }

  return { imagine, pregateste, uita, distribuie }
}
