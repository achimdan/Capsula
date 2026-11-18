// composables/useThreeScene.ts  (app/composables/ on Nuxt 4)
//
// Owns the entire Three.js lifecycle for one canvas so components don't have to:
//   - dynamic import of `three` (keeps it out of SSR and the main bundle)
//   - sizing from the container via ResizeObserver, DPR cap
//   - render loop that pauses when offscreen / tab hidden
//   - WebGL context loss handling
//   - complete disposal on unmount
//
// Usage:
//   const canvas = ref<HTMLCanvasElement | null>(null)
//   const { ready, failed } = useThreeScene(canvas, async ({ THREE, scene, camera, onFrame }) => {
//     const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshNormalMaterial())
//     scene.add(mesh)
//     onFrame((dt) => { mesh.rotation.y += dt })
//   })

import type { Ref } from 'vue'
import type * as ThreeNS from 'three'

type Three = typeof ThreeNS

export interface SceneContext {
  THREE: Three
  scene: ThreeNS.Scene
  camera: ThreeNS.PerspectiveCamera
  renderer: ThreeNS.WebGLRenderer
  canvas: HTMLCanvasElement
  /** True if the user asked the OS for reduced motion. Skip or soften looping animation. */
  reducedMotion: boolean
  /** Register a per-frame callback (delta and elapsed in seconds). Returns an unsubscribe function. */
  onFrame: (cb: (delta: number, elapsed: number) => void) => () => void
  /** Replace the default render call (e.g. to render through an EffectComposer). */
  setRenderFn: (fn: (delta: number) => void) => void
  /** Call after changing something while the loop is paused or in on-demand mode. */
  invalidate: () => void
}

export interface UseThreeSceneOptions {
  /** Max device pixel ratio. Lower it for heavy scenes. Default 2 (1.5 on touch devices). */
  maxDpr?: number
  antialias?: boolean
  alpha?: boolean
  powerPreference?: WebGLPowerPreference
  /** Only render when `invalidate()` is called (static scenes). Default false = continuous. */
  onDemand?: boolean
  fov?: number
  near?: number
  far?: number
}

type SetupResult = undefined | (() => void)

/** Dispose everything reachable from an object: geometries, materials, textures. */
export function disposeObject(root: ThreeNS.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as ThreeNS.Mesh
    mesh.geometry?.dispose?.()
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value && typeof value === 'object' && (value as ThreeNS.Texture).isTexture) {
          (value as ThreeNS.Texture).dispose()
        }
      }
      material.dispose()
    }
  })
}

export function useThreeScene(
  canvasRef: Ref<HTMLCanvasElement | null>,
  setup: (ctx: SceneContext) => SetupResult | Promise<SetupResult> | void | Promise<void>, // eslint-disable-line @typescript-eslint/no-invalid-void-type
  options: UseThreeSceneOptions = {},
) {
  const ready = ref(false)
  const failed = ref(false)

  let teardown: (() => void) | undefined
  let unmounted = false
  let renuntaAsteptare: (() => void) | undefined

  onMounted(async () => {
    // Componentele .client montate la hidratare pot primi canvas-ul abia după onMounted: îl așteptăm.
    const canvas = canvasRef.value ?? await new Promise<HTMLCanvasElement | null>((res) => {
      const stop = watch(canvasRef, (v) => { if (v) { stop(); res(v) } })
      renuntaAsteptare = () => { stop(); res(null) }
    })
    if (!canvas || unmounted) return

    let THREE: Three
    try {
      THREE = await import('three')
    }
    catch (error) {
      console.error('[useThreeScene] failed to load three', error)
      failed.value = true
      return
    }
    if (unmounted) return // component left while three was loading

    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const maxDpr = options.maxDpr ?? (isTouch ? 1.5 : 2)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: ThreeNS.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: options.antialias ?? true,
        alpha: options.alpha ?? false,
        powerPreference: options.powerPreference ?? 'high-performance',
      })
    }
    catch (error) {
      // WebGL disabled or unavailable: let the component show a fallback.
      console.warn('[useThreeScene] WebGL unavailable', error)
      failed.value = true
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(options.fov ?? 50, 1, options.near ?? 0.1, options.far ?? 200)
    camera.position.set(0, 0, 5)

    const frameCallbacks = new Set<(delta: number, elapsed: number) => void>()
    let renderFn: (delta: number) => void = () => renderer.render(scene, camera)

    let running = false
    let visible = true
    let lastTime = performance.now()
    let elapsed = 0
    let needsRender = true
    let contextLost = false

    const tick = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1) // clamp after tab switches
      lastTime = now
      elapsed += delta
      for (const cb of frameCallbacks) cb(delta, elapsed)
      if (!options.onDemand || needsRender) {
        renderFn(delta)
        needsRender = false
      }
    }

    const start = () => {
      if (running || contextLost || unmounted) return
      running = true
      lastTime = performance.now()
      renderer.setAnimationLoop(tick)
    }
    const stop = () => {
      if (!running) return
      running = false
      renderer.setAnimationLoop(null)
    }
    const syncRunning = () => (visible && !document.hidden ? start() : stop())

    const resize = () => {
      const parent = canvas.parentElement ?? canvas
      const width = Math.max(1, parent.clientWidth)
      const height = Math.max(1, parent.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr))
      renderer.setSize(width, height, false) // false: CSS controls the canvas box
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      needsRender = true
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement ?? canvas)

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      syncRunning()
    })
    intersectionObserver.observe(canvas)

    const onVisibility = () => syncRunning()
    document.addEventListener('visibilitychange', onVisibility)

    const onContextLost = (event: Event) => {
      event.preventDefault() // required to allow restoration
      contextLost = true
      stop()
    }
    const onContextRestored = () => {
      contextLost = false
      needsRender = true
      syncRunning()
    }
    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)

    resize()

    let userCleanup: SetupResult
    try {
      userCleanup = (await setup({
        THREE,
        scene,
        camera,
        renderer,
        canvas,
        reducedMotion,
        onFrame: (cb) => {
          frameCallbacks.add(cb)
          return () => frameCallbacks.delete(cb)
        },
        setRenderFn: (fn) => { renderFn = fn },
        invalidate: () => { needsRender = true },
      })) ?? undefined
    }
    catch (error) {
      console.error('[useThreeScene] scene setup failed', error)
      failed.value = true
    }

    teardown = () => {
      stop()
      userCleanup?.()
      frameCallbacks.clear()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      disposeObject(scene)
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss()
    }

    if (unmounted) {
      teardown()
      return
    }

    ready.value = !failed.value
    syncRunning()
  })

  onBeforeUnmount(() => {
    unmounted = true
    renuntaAsteptare?.()
    teardown?.()
    teardown = undefined
  })

  return { ready, failed }
}
