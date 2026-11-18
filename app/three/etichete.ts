// Etichetele casetei: fiecare trupă/piesă primește o etichetă a ei, ca pe casetele goale din anii '80–'90
// (dungi, crom, apus sintetic, confetti Memphis, egalizator...). Stilul și paleta vin din indexul înregistrării,
// așa că două înregistrări nu ajung niciodată la aceeași combinație (12 stiluri × 14 palete, vezi stilEticheta).

export interface Paleta { fond: string, a: string, b: string, c: string, cerneala: string }

export const PALETE: Paleta[] = [
  { fond: '#EFE6D0', a: '#24493C', b: '#C9A23A', c: '#B5462E', cerneala: '#14211B' },
  { fond: '#14112B', a: '#FF4FA3', b: '#2DE2E6', c: '#F9C80E', cerneala: '#F4F1FA' },
  { fond: '#D9DCE1', a: '#1B1D22', b: '#8A9099', c: '#C0392B', cerneala: '#111317' },
  { fond: '#2B1640', a: '#FF7B54', b: '#FFB26B', c: '#FFD56F', cerneala: '#FFF4E0' },
  { fond: '#CFEBDD', a: '#1E6F5C', b: '#289672', c: '#FF8E8E', cerneala: '#0F2E26' },
  { fond: '#1F3A93', a: '#F2C14E', b: '#F78154', c: '#FFFFFF', cerneala: '#FFFFFF' },
  { fond: '#FFD1E8', a: '#7B2CBF', b: '#FF6FA8', c: '#3A86FF', cerneala: '#2A0E3A' },
  { fond: '#C9B88F', a: '#3F4A2B', b: '#8C3B2E', c: '#E8DCC0', cerneala: '#231F17' },
  { fond: '#E63946', a: '#111111', b: '#F1FAEE', c: '#FFB703', cerneala: '#FFFFFF' },
  { fond: '#0B4F6C', a: '#FBB13C', b: '#F2F2F2', c: '#20BF55', cerneala: '#FFFFFF' },
  { fond: '#E4DDF4', a: '#5E4AE3', b: '#F25F5C', c: '#247BA0', cerneala: '#1D1640' },
  { fond: '#FFD23F', a: '#1A1A1A', b: '#EE4266', c: '#3BCEAC', cerneala: '#1A1A1A' },
  { fond: '#1B3B2F', a: '#E07A1F', b: '#F4E9CD', c: '#9DBF9E', cerneala: '#F4E9CD' },
  { fond: '#BDE0FE', a: '#023047', b: '#FB8500', c: '#FFFFFF', cerneala: '#023047' },
]

export const STILURI = ['dungi', 'diagonale', 'apus', 'memphis', 'grila', 'crom', 'egalizator', 'cercuri', 'blocuri', 'puncte', 'valuri', 'impartit'] as const
export type Stil = typeof STILURI[number]

// Indexul k → (stil, paletă). Perechea (k mod 12, 5k mod 14) se repetă abia după 84 de înregistrări.
export function stilEticheta(k: number): { stil: Stil, paleta: Paleta, seed: number } {
  const i = Math.abs(Math.trunc(k))
  return { stil: STILURI[i % STILURI.length]!, paleta: PALETE[(i * 5) % PALETE.length]!, seed: i * 9973 + 17 }
}

function aleator(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

type G = CanvasRenderingContext2D

// Desenele de fond. Partea de sus (sub 0.33 din înălțime) rămâne liberă pentru scris.
export function deseneazaStil(g: G, W: number, H: number, stil: Stil, p: Paleta, seed: number) {
  const rnd = aleator(seed)
  const sus = H * 0.34
  g.fillStyle = p.fond
  g.fillRect(0, 0, W, H)
  switch (stil) {
    case 'dungi': {
      ;[p.a, p.b, p.c].forEach((cul, i) => { g.fillStyle = cul; g.fillRect(0, H * 0.78 + i * H * 0.07, W, H * 0.05) })
      break
    }
    case 'diagonale': {
      g.save()
      g.beginPath(); g.rect(0, sus, W, H - sus); g.clip()
      ;[p.a, p.b, p.c, p.a].forEach((cul, i) => {
        g.fillStyle = cul
        g.beginPath()
        const x = W * 0.45 + i * 70
        g.moveTo(x, H); g.lineTo(x + 55, H); g.lineTo(x + 55 + H, 0); g.lineTo(x + H, 0); g.closePath(); g.fill()
      })
      g.restore()
      break
    }
    case 'apus': {
      const gr = g.createLinearGradient(0, sus, 0, H)
      gr.addColorStop(0, p.c); gr.addColorStop(0.5, p.b); gr.addColorStop(1, p.a)
      g.fillStyle = gr
      g.beginPath(); g.arc(W * 0.5, H * 1.02, H * 0.62, Math.PI, 0); g.fill()
      g.fillStyle = p.fond
      for (let i = 0; i < 7; i++) g.fillRect(0, H * 0.62 + i * i * 4.2 + i * 6, W, 3 + i * 1.6)
      break
    }
    case 'memphis': {
      const cul = [p.a, p.b, p.c]
      for (let i = 0; i < 46; i++) {
        const x = rnd() * W
        const y = sus + rnd() * (H - sus)
        g.fillStyle = cul[i % 3]!
        g.strokeStyle = cul[(i + 1) % 3]!
        g.lineWidth = 6
        const f = i % 4
        if (f === 0) { g.beginPath(); g.arc(x, y, 6 + rnd() * 10, 0, Math.PI * 2); g.fill() }
        else if (f === 1) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 24, y + 6); g.lineTo(x + 8, y + 26); g.closePath(); g.fill() }
        else if (f === 2) { g.beginPath(); for (let k = 0; k < 4; k++) g.quadraticCurveTo(x + k * 18 + 9, y + (k % 2 ? 14 : -14), x + k * 18 + 18, y); g.stroke() }
        else { g.fillRect(x, y, 18, 18) }
      }
      break
    }
    case 'grila': {
      const orizont = H * 0.6
      g.strokeStyle = p.a; g.lineWidth = 2.5
      for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(W / 2 + i * 22, orizont); g.lineTo(W / 2 + i * 150, H); g.stroke() }
      for (let i = 0; i < 9; i++) { const y = orizont + (H - orizont) * (i / 8) ** 1.8; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke() }
      g.fillStyle = p.b; g.fillRect(0, orizont - 3, W, 6)
      break
    }
    case 'crom': {
      const gr = g.createLinearGradient(0, 0, 0, H)
      gr.addColorStop(0, '#F4F5F7'); gr.addColorStop(0.45, p.fond); gr.addColorStop(0.5, '#9AA0A8'); gr.addColorStop(1, '#ECEEF1')
      g.fillStyle = gr; g.fillRect(0, 0, W, H)
      g.fillStyle = p.a; g.fillRect(0, H * 0.82, W, H * 0.12)
      g.fillStyle = p.c; g.fillRect(W * 0.06, H * 0.82, W * 0.1, H * 0.12)
      break
    }
    case 'egalizator': {
      const n = 26
      const lat = W / n
      for (let i = 0; i < n; i++) {
        const h = (0.2 + rnd() * 0.8) * (H - sus) * 0.9
        const gr = g.createLinearGradient(0, H, 0, H - h)
        gr.addColorStop(0, p.a); gr.addColorStop(0.6, p.b); gr.addColorStop(1, p.c)
        g.fillStyle = gr
        for (let y = H - 8; y > H - h; y -= 13) g.fillRect(i * lat + 4, y - 9, lat - 8, 9)
      }
      break
    }
    case 'cercuri': {
      ;[p.a, p.b, p.c, p.a, p.b].forEach((cul, i) => {
        g.strokeStyle = cul; g.lineWidth = 22
        g.beginPath(); g.arc(W * 1.02, H * 1.05, 120 + i * 40, 0, Math.PI * 2); g.stroke()
      })
      break
    }
    case 'blocuri': {
      g.fillStyle = p.a; g.fillRect(0, sus, W * 0.07, H - sus)
      g.fillStyle = p.b; g.fillRect(W * 0.07, sus, W * 0.025, H - sus)
      for (let i = 0; i < 4; i++) { g.fillStyle = [p.a, p.b, p.c, p.a][i]!; g.fillRect(W * 0.86 + (i % 2) * 64, H * 0.8 + Math.floor(i / 2) * 44 - 40, 56, 36) }
      break
    }
    case 'puncte': {
      for (let y = sus; y < H; y += 22) {
        for (let x = 0; x < W; x += 22) {
          const r = 1 + 8 * ((y - sus) / (H - sus)) * (0.6 + 0.4 * Math.sin(x / 90))
          g.fillStyle = (Math.floor(x / 22) + Math.floor(y / 22)) % 3 === 0 ? p.b : p.a
          g.beginPath(); g.arc(x + 11, y + 11, r, 0, Math.PI * 2); g.fill()
        }
      }
      break
    }
    case 'valuri': {
      ;[p.a, p.b, p.c].forEach((cul, i) => {
        g.strokeStyle = cul; g.lineWidth = 14
        g.beginPath()
        for (let x = 0; x <= W; x += 8) g.lineTo(x, H * (0.82 + i * 0.06) + Math.sin(x / 70 + i) * 16)
        g.stroke()
      })
      break
    }
    case 'impartit': {
      g.fillStyle = p.a
      g.beginPath(); g.moveTo(W * 0.55, H); g.lineTo(W, H * 0.35); g.lineTo(W, H); g.closePath(); g.fill()
      g.fillStyle = p.b
      g.beginPath(); g.moveTo(W * 0.68, H); g.lineTo(W, H * 0.55); g.lineTo(W, H); g.closePath(); g.fill()
      g.fillStyle = p.c; g.fillRect(0, H * 0.92, W * 0.5, H * 0.03)
      break
    }
  }
}
