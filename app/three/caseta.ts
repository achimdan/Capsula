// Scena „Casetă 3D”: o casetă audio construită din geometrie (fără model descărcat), cu rolele care
// se învârt când derulezi pista de ani de pe prima pagină. Se încarcă doar din CasetaScena.client.vue.
import type * as T from 'three'
import type { SceneContext } from '~/composables/useThreeScene'
import { progresPin } from '~/utils/ecranTv'
import { imparteProgres, pozitieAn, razeRole, rotireRole } from '~/utils/caseta'
import type { InregistrareCaseta } from '~/data/caseteRo'
import { deseneazaStil, stilEticheta } from './etichete'

const LATIME = 10
const INALTIME = 6.4
const ROLA_X = 2.15
const ROLA_Y = 0.35
// Câtă bandă trece prin cap pe toată pista (unități de scenă): dă câte ture fac rolele.
const BANDA_TOTALA = 90
// Caseta „cântă” încet și când nu derulezi.
const VITEZA_REDARE = 0.35

function dreptunghiRotunjit(THREE: typeof T, w: number, h: number, r: number, cx = 0, cy = 0, cale?: T.Path) {
  const s = cale ?? new THREE.Shape()
  const x = cx - w / 2
  const y = cy - h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

// Eticheta se redesenează când se schimbă înregistrarea de pe bandă (vezi data/caseteRo.ts și three/etichete.ts).
async function eticheta(THREE: typeof T, anMin: number, anMax: number, lw: number, lh: number, fereastra: { w: number, h: number, dy: number }) {
  try {
    await Promise.all([
      document.fonts.load('800 80px "Big Shoulders"'),
      document.fonts.load('500 24px "IBM Plex Mono"'),
    ])
  }
  catch { /* fără fonturi, canvas-ul folosește fonturile de rezervă */ }
  const W = 1024
  const H = Math.round(W * lh / lw)
  const nou = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c }
  // Fondul (hârtia, benzile, fereastra decupată) se desenează o singură dată
  const fond = nou()
  const f = fond.getContext('2d')!
  f.fillStyle = '#EFE6D0'
  f.fillRect(0, 0, W, H)
  f.globalAlpha = 0.06
  for (let i = 0; i < 900; i++) {
    f.fillStyle = i % 2 ? '#5C503F' : '#FFFFFF'
    f.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 3, 1)
  }
  f.globalAlpha = 1
  // Benzile colorate de jos, ca pe etichetele de casete din anii '80–'90
  const benzi = ['#24493C', '#C9A23A', '#24493C']
  benzi.forEach((cul, i) => { f.fillStyle = cul; f.fillRect(0, H * 0.79 + i * H * 0.065, W, H * (i === 1 ? 0.05 : 0.035)) })
  f.fillStyle = '#14211B'
  f.font = '500 20px "IBM Plex Mono", ui-monospace, monospace'
  f.fillText('CAPSULA · ARHIVA ANILOR TĂI', W * 0.05, H * 0.09)
  f.textAlign = 'right'
  f.fillText('C-90', W * 0.95, H * 0.09)
  f.textAlign = 'left'
  f.font = '500 24px "IBM Plex Mono", ui-monospace, monospace'
  f.fillText('A', W * 0.06, H * 0.6)
  const fw = fereastra.w / lw * W
  const fh = fereastra.h / lh * H
  f.globalCompositeOperation = 'destination-out'
  f.beginPath()
  f.roundRect(W / 2 - fw / 2 - 10, H / 2 + fereastra.dy / lh * H - fh / 2 - 10, fw + 20, fh + 20, 30)
  f.fill()
  f.globalCompositeOperation = 'source-over'

  const c = nou()
  const g = c.getContext('2d')!
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const scurteaza = (t: string, max: number) => {
    if (g.measureText(t).width <= max) return t
    while (t.length > 1 && g.measureText(t + '…').width > max) t = t.slice(0, -1)
    return t.trimEnd() + '…'
  }
  const decupeaza = () => {
    g.globalCompositeOperation = 'destination-out'
    g.beginPath()
    g.roundRect(W / 2 - fw / 2 - 10, H / 2 + fereastra.dy / lh * H - fh / 2 - 10, fw + 20, fh + 20, 30)
    g.fill()
    g.globalCompositeOperation = 'source-over'
  }
  // Fără înregistrare: eticheta Capsula. Cu înregistrare: eticheta ei, cu stilul și paleta după index (k).
  function deseneaza(inr: InregistrareCaseta | null, k: number) {
    g.clearRect(0, 0, W, H)
    if (!inr) {
      g.drawImage(fond, 0, 0)
      g.fillStyle = '#14211B'
      g.font = '800 78px "Big Shoulders", "Big Shoulders Display", "Arial Narrow", sans-serif'
      g.fillText('CAPSULA', W * 0.05, H * 0.275)
      g.font = '500 22px "IBM Plex Mono", ui-monospace, monospace'
      g.textAlign = 'right'
      g.fillText(`${anMin} — ${anMax}`, W * 0.95, H * 0.275)
      g.textAlign = 'left'
      tex.needsUpdate = true
      return
    }
    const { stil, paleta, seed } = stilEticheta(k)
    deseneazaStil(g, W, H, stil, paleta, seed)
    g.fillStyle = paleta.cerneala
    g.font = '500 19px "IBM Plex Mono", ui-monospace, monospace'
    g.fillText(`A · ${inr.tip.toUpperCase()} · ${inr.gen.toUpperCase()}`, W * 0.05, H * 0.07)
    g.textAlign = 'right'
    g.fillText(String(inr.an), W * 0.95, H * 0.07)
    g.textAlign = 'left'
    g.font = '800 64px "Big Shoulders", "Big Shoulders Display", "Arial Narrow", sans-serif'
    g.fillText(scurteaza(inr.artist.toUpperCase(), W * 0.9), W * 0.05, H * 0.19)
    g.font = '500 23px "IBM Plex Mono", ui-monospace, monospace'
    g.fillText(scurteaza(inr.titlu, W * 0.9), W * 0.05, H * 0.262)
    decupeaza()
    tex.needsUpdate = true
  }
  deseneaza(null, 0)
  return { tex, deseneaza }
}

function rola(THREE: typeof T, mat: { banda: T.Material, butuc: T.Material, gaura: T.Material }) {
  const grup = new THREE.Group()
  // Banda înfășurată: un cilindru scalat pe x/y după cât de plină e rola
  const banda = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.5, 64), mat.banda)
  banda.rotation.x = Math.PI / 2
  grup.add(banda)
  // Butucul alb, cu dinți: el se vede învârtindu-se
  const butuc = new THREE.Group()
  const inel = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.6, 48), mat.butuc)
  inel.rotation.x = Math.PI / 2
  butuc.add(inel)
  const gaura = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.62, 32), mat.gaura)
  gaura.rotation.x = Math.PI / 2
  butuc.add(gaura)
  const dinte = new THREE.BoxGeometry(0.1, 0.14, 0.64)
  for (let i = 0; i < 6; i++) {
    const d = new THREE.Mesh(dinte, mat.butuc)
    const a = i * Math.PI / 3
    d.position.set(Math.cos(a) * 0.27, Math.sin(a) * 0.27, 0)
    d.rotation.z = a
    butuc.add(d)
  }
  // Spițe pe fața butucului, ca rotirea să se vadă și de departe
  const spita = new THREE.BoxGeometry(0.08, 0.5, 0.04)
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(spita, mat.gaura)
    s.position.set(Math.cos(i * 2.094) * 0.42, Math.sin(i * 2.094) * 0.42, 0.31)
    s.rotation.z = i * 2.094 - Math.PI / 2
    butuc.add(s)
  }
  grup.add(butuc)
  return { grup, banda, butuc }
}

export async function construiesteCaseta(ctx: SceneContext, opt: { anMin: number, anMax: number, casete: (an: number) => { inr: InregistrareCaseta, k: number }[] }) {
  const { THREE, scene, camera, renderer, canvas, onFrame } = ctx
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js')
  const pmrem = new THREE.PMREMGenerator(renderer)
  const mediu = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
  scene.environment = mediu
  scene.environmentIntensity = 0.55

  scene.add(new THREE.HemisphereLight(0xD8D4E8, 0x0B0A10, 0.5))
  const cheie = new THREE.DirectionalLight(0xFFFFFF, 2.2)
  cheie.position.set(-6, 8, 10)
  scene.add(cheie)
  const contur = new THREE.DirectionalLight(0xFFB070, 2.4)
  contur.position.set(9, 3, -6)
  scene.add(contur)

  camera.position.set(0, 0, 24)
  camera.lookAt(0, 0, 0)

  const plastic = new THREE.MeshPhysicalMaterial({ color: 0x1A191F, roughness: 0.38, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.25 })
  const plasticDeschis = new THREE.MeshStandardMaterial({ color: 0x25242B, roughness: 0.5 })
  const metal = new THREE.MeshStandardMaterial({ color: 0xB9B6AE, roughness: 0.3, metalness: 1 })
  const mat = {
    banda: new THREE.MeshStandardMaterial({ color: 0x3A2214, roughness: 0.3, metalness: 0.4 }),
    butuc: new THREE.MeshStandardMaterial({ color: 0xEDE7DA, roughness: 0.45 }),
    gaura: new THREE.MeshStandardMaterial({ color: 0x0E0D12, roughness: 0.7 }),
  }

  const caseta = new THREE.Group()
  scene.add(caseta)

  const extr = (forma: T.Shape, adancime: number) => new THREE.ExtrudeGeometry(forma, { depth: adancime, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 10 })

  // Rama, spatele și fața (fața are fereastra decupată)
  const rama = dreptunghiRotunjit(THREE, LATIME, INALTIME, 0.38) as T.Shape
  rama.holes.push(dreptunghiRotunjit(THREE, LATIME - 0.5, INALTIME - 0.5, 0.2, 0, 0, new THREE.Path()))
  const mRama = new THREE.Mesh(extr(rama, 1), plastic)
  mRama.position.z = -0.5
  caseta.add(mRama)
  const spate = new THREE.Mesh(extr(dreptunghiRotunjit(THREE, LATIME, INALTIME, 0.38) as T.Shape, 0.08), plastic)
  spate.position.z = -0.5
  caseta.add(spate)
  const fereastra = { w: 6, h: 2.1, dy: ROLA_Y }
  const fata = dreptunghiRotunjit(THREE, LATIME, INALTIME, 0.38) as T.Shape
  fata.holes.push(dreptunghiRotunjit(THREE, fereastra.w, fereastra.h, 0.3, 0, fereastra.dy, new THREE.Path()))
  const mFata = new THREE.Mesh(extr(fata, 0.08), plastic)
  mFata.position.z = 0.42
  caseta.add(mFata)

  // Geamul ferestrei
  const geam = new THREE.Mesh(new THREE.PlaneGeometry(fereastra.w, fereastra.h), new THREE.MeshPhysicalMaterial({ color: 0x2A2420, transparent: true, opacity: 0.55, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }))
  geam.position.set(0, fereastra.dy, 0.46)
  caseta.add(geam)

  // Eticheta de hârtie, lipită pe față
  const lw = LATIME - 0.7
  const lh = 4.5
  const lyc = 0.55
  // În spatele rolelor, interiorul casetei e întunecat, ca prin plasticul fumuriu să nu se vadă gri.
  const interior = new THREE.Mesh(new THREE.PlaneGeometry(fereastra.w + 0.4, fereastra.h + 0.4), mat.gaura)
  interior.position.set(0, fereastra.dy, -0.4)
  caseta.add(interior)
  const et = await eticheta(THREE, opt.anMin, opt.anMax, lw, lh, { w: fereastra.w, h: fereastra.h, dy: lyc - fereastra.dy })
  const mEticheta = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), new THREE.MeshStandardMaterial({ map: et.tex, transparent: true, alphaTest: 0.5, roughness: 0.85 }))
  mEticheta.position.set(0, lyc, 0.535)
  caseta.add(mEticheta)

  // Partea de jos, în trapez, cu găurile pentru capul de citire
  const trapez = new THREE.Shape()
  trapez.moveTo(-3.3, -INALTIME / 2 + 0.05)
  trapez.lineTo(3.3, -INALTIME / 2 + 0.05)
  trapez.lineTo(2.75, -INALTIME / 2 + 1.15)
  trapez.lineTo(-2.75, -INALTIME / 2 + 1.15)
  trapez.closePath()
  const mTrapez = new THREE.Mesh(extr(trapez, 0.1), plasticDeschis)
  mTrapez.position.z = 0.48
  caseta.add(mTrapez)
  for (const x of [-1.9, -0.55, 0.55, 1.9]) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(x * x > 1 ? 0.2 : 0.14, x * x > 1 ? 0.2 : 0.14, 0.05, 20), mat.gaura)
    g.rotation.x = Math.PI / 2
    g.position.set(x, -INALTIME / 2 + 0.55, 0.62)
    caseta.add(g)
  }

  // Șuruburile
  const surub = new THREE.CylinderGeometry(0.13, 0.13, 0.05, 20)
  const fanta = new THREE.BoxGeometry(0.18, 0.03, 0.02)
  for (const [x, y] of [[-4.55, 2.75], [4.55, 2.75], [-4.55, -2.75], [4.55, -2.75], [0, -2.15]] as const) {
    const s = new THREE.Mesh(surub, metal)
    s.rotation.x = Math.PI / 2
    s.position.set(x, y, 0.54)
    caseta.add(s)
    const f = new THREE.Mesh(fanta, mat.gaura)
    f.position.set(x, y, 0.57)
    f.rotation.z = (x + y) % 1.3
    caseta.add(f)
  }

  // Rolele, în spatele ferestrei
  const st = rola(THREE, mat)
  const dr = rola(THREE, mat)
  st.grup.position.set(-ROLA_X, ROLA_Y, 0)
  dr.grup.position.set(ROLA_X, ROLA_Y, 0)
  caseta.add(st.grup, dr.grup)

  // Banda maro dintre role: coboară de pe fiecare rolă pe lângă o rolă de ghidaj și trece pe jos, prin dreptul ferestrei.
  const Y_BANDA = -0.6
  const ghidaje = [new THREE.Vector2(-3.75, Y_BANDA), new THREE.Vector2(3.75, Y_BANDA)]
  const fasie = new THREE.BoxGeometry(1, 0.05, 0.42)
  // Puțin mai deschisă și mai lucioasă decât banda de pe role, ca să se vadă prin geamul fumuriu.
  const matFasie = new THREE.MeshStandardMaterial({ color: 0x7A4A2A, roughness: 0.25, metalness: 0.45, emissive: 0x2A140A })
  const jos = new THREE.Mesh(fasie, matFasie)
  jos.scale.x = ghidaje[1]!.x - ghidaje[0]!.x
  jos.position.set(0, Y_BANDA, 0)
  const urcaSt = new THREE.Mesh(fasie, matFasie)
  const urcaDr = new THREE.Mesh(fasie, matFasie)
  caseta.add(jos, urcaSt, urcaDr)
  for (const gh of ghidaje) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 20), mat.butuc)
    r.rotation.x = Math.PI / 2
    r.position.set(gh.x, gh.y + 0.11, 0)
    caseta.add(r)
  }
  // Tangenta din ghidaj la rola de bandă (pe partea dinspre margine), refăcută când rola se umple sau se golește.
  function tangenta(seg: T.Mesh, gh: T.Vector2, cx: number, r: number, semn: number) {
    const vx = gh.x - cx
    const vy = gh.y - ROLA_Y
    const d = Math.hypot(vx, vy)
    const a = Math.atan2(vy, vx) + semn * Math.acos(Math.min(1, r / d))
    const tx = cx + Math.cos(a) * r
    const ty = ROLA_Y + Math.sin(a) * r
    seg.scale.x = Math.hypot(tx - gh.x, ty - gh.y)
    seg.position.set((tx + gh.x) / 2, (ty + gh.y) / 2, 0)
    seg.rotation.z = Math.atan2(ty - gh.y, tx - gh.x)
  }

  // Mouse: caseta se întoarce puțin după cursor (doar pe dispozitive cu mouse)
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
  const fin = matchMedia('(pointer:fine)').matches
  const laMouse = (e: PointerEvent) => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = e.clientY / innerHeight * 2 - 1 }
  if (fin) addEventListener('pointermove', laMouse, { passive: true })

  let pista: HTMLElement | null = null
  let p = 0
  let pAnterior = 0
  let dupaS = 1
  let introS = 1
  let anEticheta: number | null = null
  let cheieEticheta = -2
  let opacitate = -1

  onFrame((dt, t) => {
    // Progresul pistei de ani de pe prima pagină; pe celelalte pagini caseta stă deoparte și estompată.
    if (!pista?.isConnected) pista = document.querySelector<HTMLElement>('[data-caseta-pin]')
    let tinta = p
    let dupa = 1
    let intro = 1
    if (pista) {
      const r = pista.getBoundingClientRect()
      const parti = imparteProgres(progresPin(r.top, r.height, innerHeight), r.height, innerHeight)
      tinta = parti.ani
      intro = parti.intro
      dupa = Math.min(1, Math.max(0, (innerHeight - r.bottom) / (innerHeight * 0.5)))
    }
    const k = Math.min(1, dt * 7)
    p += (tinta - p) * k
    dupaS += (dupa - dupaS) * k
    introS += (intro - introS) * k
    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3)
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3)

    // Banda trece de pe o rolă pe alta: razele după progres, rotirea după cât s-a mișcat banda.
    const raze = razeRole(p)
    st.banda.scale.set(raze.stanga, 1, raze.stanga)
    dr.banda.scale.set(raze.dreapta, 1, raze.dreapta)
    tangenta(urcaSt, ghidaje[0]!, -ROLA_X, raze.stanga, -1)
    tangenta(urcaDr, ghidaje[1]!, ROLA_X, raze.dreapta, 1)
    // Pe etichetă: o înregistrare din anul din dreptul capului de citire; dacă anul are mai multe, se schimbă la câteva secunde.
    const an = pista && introS > 0.5 ? opt.anMin + Math.round(pozitieAn(p, opt.anMax - opt.anMin + 1)) : null
    const lista = an === null ? [] : opt.casete(an)
    const cheie = lista.length ? lista[Math.floor(t / 5) % lista.length]!.k : -1
    if (an !== anEticheta || cheie !== cheieEticheta) {
      anEticheta = an
      cheieEticheta = cheie
      const ales = lista.find(x => x.k === cheie)
      et.deseneaza(ales?.inr ?? null, cheie)
    }
    const lungime = (p - pAnterior) * BANDA_TOTALA + VITEZA_REDARE * dt
    pAnterior = p
    const rot = rotireRole(lungime, p)
    st.butuc.rotation.z -= rot.stanga
    dr.butuc.rotation.z -= rot.dreapta

    // Încadrare: pe pistă caseta stă în partea de sus, deasupra anilor; după pistă, centrată și mai mică.
    const vizH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const vizW = vizH * camera.aspect
    const portret = camera.aspect < 0.85
    const scaraPista = Math.min((portret ? 0.86 : 0.5) * vizW / LATIME, (portret ? 0.34 : 0.44) * vizH / INALTIME)
    const scaraDupa = Math.min((portret ? 0.8 : 0.42) * vizW / LATIME, 0.5 * vizH / INALTIME)
    // Intro: pornim cu fereastra cu role pe tot ecranul, apoi camera se retrage până se vede toată caseta.
    const e = introS * introS * (3 - 2 * introS)
    const scaraAproape = (portret ? 1.6 : 1.12) * vizW / fereastra.w
    const sNormal = scaraPista + (scaraDupa - scaraPista) * dupaS
    const s = scaraAproape * (sNormal / scaraAproape) ** e
    caseta.scale.setScalar(s)
    const yPista = vizH * (portret ? 0.23 : 0.2)
    const yNormal = yPista * (1 - dupaS)
    caseta.position.y = -fereastra.dy * s * (1 - e) + yNormal * e + Math.sin(t * 0.8) * 0.06 * s * e
    caseta.rotation.y = (-0.38 + 0.76 * p + mouse.x * 0.18 + Math.sin(t * 0.3) * 0.04 * dupaS) * e + mouse.x * 0.03 * (1 - e)
    caseta.rotation.x = (0.16 + mouse.y * 0.1 + Math.sin(t * 0.5) * 0.03) * e
    caseta.rotation.z = (-0.03 + 0.06 * p) * e

    const o = Math.round((1 - dupaS * 0.6) * 100) / 100
    if (o !== opacitate) { opacitate = o; canvas.style.opacity = String(o) }
  })

  return () => {
    if (fin) removeEventListener('pointermove', laMouse)
    mediu.dispose()
    scene.environment = null
  }
}
