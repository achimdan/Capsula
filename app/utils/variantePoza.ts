// Variantele unei poze, făcute în browser înainte de upload (doar client). Canvasul nu copiază EXIF, deci nici locația GPS.
// Safari fără encoder WebP primește JPEG.
import { LATIMI_POZA, marimeVarianta, type ExtPoza, type LatimePoza } from './pozeProprii'

const CALITATE = 0.82

function blobDinCanvas(c: HTMLCanvasElement, tip: string): Promise<Blob> {
  return new Promise((ok, nu) => c.toBlob(b => (b ? ok(b) : nu(new Error('Poza nu a putut fi micșorată.'))), tip, CALITATE))
}

export async function variantePoza(sursa: Blob): Promise<{ ext: ExtPoza, variante: { latime: LatimePoza, blob: Blob }[] }> {
  // imageOrientation: rotirea din EXIF se aplică înainte să-l pierdem.
  const bmp = await createImageBitmap(sursa, { imageOrientation: 'from-image' })
  try {
    let ext: ExtPoza = 'webp'
    const variante: { latime: LatimePoza, blob: Blob }[] = []
    for (const latime of LATIMI_POZA) {
      const { width, height } = marimeVarianta(bmp.width, bmp.height, latime)
      const c = document.createElement('canvas')
      c.width = width
      c.height = height
      const ctx = c.getContext('2d')
      if (!ctx) throw new Error('Canvas indisponibil')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(bmp, 0, 0, width, height)
      let blob = ext === 'webp' ? await blobDinCanvas(c, 'image/webp') : await blobDinCanvas(c, 'image/jpeg')
      if (blob.type !== 'image/webp' && ext === 'webp') {
        ext = 'jpg'
        if (blob.type !== 'image/jpeg') blob = await blobDinCanvas(c, 'image/jpeg')
      }
      variante.push({ latime, blob })
    }
    return { ext, variante }
  } finally {
    bmp.close()
  }
}
