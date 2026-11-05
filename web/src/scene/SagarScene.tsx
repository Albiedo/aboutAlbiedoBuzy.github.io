import { useMemo, useRef, useEffect, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, DepthOfField, SMAA } from '@react-three/postprocessing'
import * as THREE from 'three'
import Env from './Env'
import { FOCUS_POINTS } from '../data/focusPoints'

/**
 * Sagar avatar camera replacement. The original me.glb stored camera animation
 * tracks and focus-* empties. Sagar's GLB contains the avatar and 9 decal meshes,
 * but no CameraAction, so the four career views are driven by the resume's
 * existing data-point="focus-1" ... "focus-4" DOM anchors instead.
 *
 * IMPORTANT: The model and decal positions are never edited in this component.
 * It only moves the camera. No user input, mesh names or job order are guessed.
 */
const MODEL_URL = `${import.meta.env.BASE_URL}models/sagar-avatar.glb`
useGLTF.preload(MODEL_URL)

type CareerStop = {
  readonly point: string
  readonly node: string
  readonly label: string
  readonly azimuth: number
  readonly distance: number
  readonly fov: number
  readonly elevation: number
  readonly frameRight: number
}

const CAREER_STOPS: readonly CareerStop[] = [
  {
    point: FOCUS_POINTS[0], label: 'Independent — Social Media Content Strategist & Project Manager',
    node: 'DECAL_06_SocialMediaCat_Career', azimuth: -55, distance: 0.83,
    fov: 29, elevation: 0.08, frameRight: 0.12,
  },
  {
    point: FOCUS_POINTS[1], label: 'Freelance — Scriptwriter',
    node: 'DECAL_01_WriterCat_LeftTemple', azimuth: 42, distance: 0.83,
    fov: 29, elevation: 0.085, frameRight: 0.12,
  },
  {
    point: FOCUS_POINTS[2], label: 'Syngene International Ltd. — Research Professional',
    node: 'DECAL_03_LabFlaskCat_Career', azimuth: 52, distance: 0.83,
    fov: 29, elevation: 0.089, frameRight: 0.12,
  },
  {
    point: FOCUS_POINTS[3], label: 'Analytica Chemie Inc. — Synthetic Chemistry R&D',
    node: 'DECAL_02_ScientistCat_RightTemple', azimuth: -56, distance: 0.84,
    fov: 29, elevation: 0.089, frameRight: 0.12,
  },
]

// Pure-data camera stops; angles are deliberately interpolated through the front
// of the face instead of interpolating Cartesian camera positions through the head.
export const CAREER_CAMERA_MAPPING = CAREER_STOPS.map(({ point, node, label }) => ({ point, node, label }))

type Pose = {
  center: THREE.Vector3
  azimuth: number
  distance: number
  fov: number
  elevation: number
  frameRight: number
}

const HOME: Pose = {
  // Center on the real GLB silhouette, instead of offsetting the hero camera.
  center: new THREE.Vector3(-0.048, 0.50, 0.015),
  azimuth: 0,
  distance: 1.95,
  fov: 36,
  elevation: 0.055,
  frameRight: 0,
}
const WORKS: Pose = {
  center: new THREE.Vector3(-0.048, 0.50, 0.015),
  azimuth: 20,
  distance: 1.93,
  fov: 36,
  elevation: 0.06,
  // Shift the framing point right to move the avatar LEFT in Selected Works.
  frameRight: 0.54,
}

function GradientBackground() {
  const uniforms = useMemo(() => ({
    uTop: { value: new THREE.Color('#F5A15E') },
    uBottom: { value: new THREE.Color('#FFD1A8') },
    uSteep: { value: 1.4 },
  }), [])
  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide} depthWrite={false} uniforms={uniforms}
        vertexShader={`varying vec3 vDir; void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`}
        fragmentShader={`uniform vec3 uTop; uniform vec3 uBottom; uniform float uSteep;
          varying vec3 vDir; void main() {
          float t = clamp(vDir.y * uSteep * 0.5 + 0.5, 0.0, 1.0);
          gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);
        }`}
      />
    </mesh>
  )
}

function Lights() {
  return <>
    <Env intensity={0.85} rotationX={0} rotationY={0} rotationZ={0}
      asBackground={false} bgIntensity={0.4} bgBlur={0} />
    <hemisphereLight args={['#ffffff', '#404040', 1.15]} />
    <directionalLight position={[5, 8, 5]} intensity={2.35} color="#ffd9c6" />
    <directionalLight position={[-5, 4, -4]} intensity={2.25} color="#9fc6ff" />
  </>
}

/**
 * Scroll-to-pose timeline. Geometry is measured only when the page layout changes,
 * not 60-120 times a second. Linear travel avoids a stall at every career marker;
 * the damped camera supplies the easing instead.
 */
type ScrollLayout = { tops: number[]; galleryTop: number; valid: boolean }

/**
 * A career sticker stays locked while its corresponding experience is on screen.
 * We transition only after the NEXT experience enters the viewport, never across
 * the empty scrolling distance between résumé entries. Pure scroll function:
 * fast scrolling, slow scrolling and reverse scrolling always reach the same pose.
 */
function timelineProgress(layout: ScrollLayout) {
  if (!layout.valid || layout.tops.length !== CAREER_STOPS.length) return -1

  const viewport = Math.max(1, window.innerHeight)
  const positions = layout.tops
  const scrollY = window.scrollY

  // Homepage -> first résumé entry. End the move before Independent's heading
  // reaches reading position, so the sticker is already settled.
  const firstTop = positions[0] - scrollY
  const intro = THREE.MathUtils.smoothstep(
    (viewport * 0.94 - firstTop) / (viewport * 0.48), 0, 1,
  )
  if (intro < 1) return -1 + intro

  // Hold the current career focus until the following heading comes into view.
  // Transition during the following heading reaches reading view (46vh -> 16vh).
  // The rest of each entry scrolls without any change in framing or focus.
  for (let next = 1; next < positions.length; next++) {
    const nextTop = positions[next] - scrollY
    const transition = THREE.MathUtils.smoothstep(
      (viewport * 0.46 - nextTop) / (viewport * 0.30), 0, 1,
    )
    if (transition < 1) return next - 1 + transition
  }

  // Keep the Analytica molecule sticker focused until Selected Works arrives.
  return CAREER_STOPS.length - 1
}

/** Gallery entrance is continuous with the résumé end, then keeps drifting left. */
function worksProgress(layout: ScrollLayout) {
  if (!Number.isFinite(layout.galleryTop)) return { entrance: 0, drift: 0 }
  const top = layout.galleryTop - window.scrollY
  const entrance = THREE.MathUtils.smoothstep(
    1 - top / Math.max(1, window.innerHeight), 0, 1,
  )
  const drift = THREE.MathUtils.smoothstep(
    -top / Math.max(1, window.innerWidth), 0, 1,
  )
  return { entrance, drift }
}

export function cameraFromPose(pose: Pose, mobile: boolean) {
  const angle = THREE.MathUtils.degToRad(pose.azimuth)
  const right = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle))
  const distance = pose.distance * (mobile ? 1.32 : 1)
  const frameRight = pose.frameRight * (mobile ? 0.5 : 1)
  const aim = pose.center.clone().addScaledVector(right, frameRight)
  const position = aim.clone().add(new THREE.Vector3(
    Math.sin(angle) * distance, pose.elevation, Math.cos(angle) * distance,
  ))
  return { position, aim, fov: pose.fov + (mobile ? 4 : 0) }
}

function SagarAvatarAndCamera({
  focusRef, bokehRef, focusRangeRef,
}: {
  focusRef: MutableRefObject<THREE.Vector3>
  bokehRef: MutableRefObject<number>
  focusRangeRef: MutableRefObject<number>
}) {
  const { scene } = useGLTF(MODEL_URL)
  const { camera } = useThree()
  const lookRef = useRef(new THREE.Vector3())
  const initialized = useRef(false)
  // Reuse working vectors to avoid per-frame garbage collection and scroll stalls.
  const centerRef = useRef(new THREE.Vector3())
  const aimRef = useRef(new THREE.Vector3())
  const desiredPosRef = useRef(new THREE.Vector3())
  const scrollLayout = useRef<ScrollLayout>({ tops: [], galleryTop: Number.NaN, valid: false })

  useEffect(() => {
    const measure = () => {
      const anchors = CAREER_STOPS.map(({ point }) =>
        document.querySelector<HTMLElement>(`[data-point="${point}"]`)
      )
      const gallery = document.querySelector<HTMLElement>('.wk-gallery')
      scrollLayout.current = {
        tops: anchors.every(Boolean) ? anchors.map((node) =>
          node!.getBoundingClientRect().top + window.scrollY
        ) : [],
        galleryTop: gallery ? gallery.getBoundingClientRect().top + window.scrollY : Number.NaN,
        valid: anchors.every(Boolean),
      }
    }
    measure()
    // Résumé translation and gallery track width can change the document layout.
    const observer = new ResizeObserver(measure)
    const resume = document.querySelector<HTMLElement>('.resume')
    const gallery = document.querySelector<HTMLElement>('.wk-gallery')
    if (resume) observer.observe(resume)
    if (gallery) observer.observe(gallery)
    window.addEventListener('resize', measure)
    window.addEventListener('load', measure)
    const nextFrame = requestAnimationFrame(measure)
    return () => {
      cancelAnimationFrame(nextFrame)
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('load', measure)
    }
  }, [])

  const { avatar, poses } = useMemo(() => {
    const avatar = scene.clone(true)
    avatar.updateMatrixWorld(true)
    const poses: Pose[] = CAREER_STOPS.map((stop) => {
      const mesh = avatar.getObjectByName(stop.node)
      if (!mesh) throw new Error(`Missing career sticker: ${stop.node}`)
      const center = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3())
      if (!Number.isFinite(center.x)) throw new Error(`Invalid sticker bounds: ${stop.node}`)
      return {
        center, azimuth: stop.azimuth, distance: stop.distance,
        fov: stop.fov, elevation: stop.elevation, frameRight: stop.frameRight,
      }
    })
    avatar.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      // Decals are mapped directly onto skin: retain their original geometry and art.
      // glTF incorrectly marks several RGBA cat images OPAQUE, which causes bright
      // rectangular patches and fringing. Alpha blend the originals instead.
      const isSticker = obj.name.startsWith('DECAL_') || obj.name.startsWith('Sticker ')
      if (isSticker) {
        const original = Array.isArray(obj.material) ? obj.material : [obj.material]
        const fixed = original.map((source) => {
          const mat = source.clone()
          if (mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshBasicMaterial ||
              mat instanceof THREE.MeshPhysicalMaterial) {
            mat.transparent = true
            mat.alphaTest = 0.025
            mat.depthTest = true
            mat.depthWrite = false
            mat.side = THREE.DoubleSide
            // Resolve tattoo/skin z-fighting without moving tattoos off the skin.
            mat.polygonOffset = true
            mat.polygonOffsetFactor = -2
            mat.polygonOffsetUnits = -3
            mat.needsUpdate = true
          }
          return mat
        })
        obj.material = Array.isArray(obj.material) ? fixed : fixed[0]
        obj.renderOrder = 4
        obj.frustumCulled = false
      } else {
        obj.frustumCulled = false
      }
      obj.castShadow = false
      obj.receiveShadow = false
    })
    return { avatar, poses }
  }, [scene])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    console.table(CAREER_STOPS.map((stop, i) => ({
      experience: stop.label, anchor: stop.point, sticker: stop.node,
      target: poses[i].center.toArray().map((n) => n.toFixed(3)).join(', '),
    })))
  }, [poses])

  useFrame((state, delta) => {
    const scroll = timelineProgress(scrollLayout.current)
    const firstIndex = Math.floor(scroll)
    const secondIndex = Math.min(CAREER_STOPS.length - 1, firstIndex + 1)
    const fraction = scroll - firstIndex
    const from = firstIndex < 0 ? HOME : poses[firstIndex]
    const to = secondIndex < 0 ? HOME : poses[secondIndex]
    const center = centerRef.current.copy(from.center).lerp(to.center, fraction)
    let azimuth = THREE.MathUtils.lerp(from.azimuth, to.azimuth, fraction)
    let distance = THREE.MathUtils.lerp(from.distance, to.distance, fraction)
    let fov = THREE.MathUtils.lerp(from.fov, to.fov, fraction)
    let elevation = THREE.MathUtils.lerp(from.elevation, to.elevation, fraction)
    let frameRight = THREE.MathUtils.lerp(from.frameRight, to.frameRight, fraction)

    const works = worksProgress(scrollLayout.current)
    if (works.entrance > 0) {
      const k = works.entrance
      center.lerp(WORKS.center, k)
      azimuth = THREE.MathUtils.lerp(azimuth, WORKS.azimuth, k)
      distance = THREE.MathUtils.lerp(distance, WORKS.distance, k)
      fov = THREE.MathUtils.lerp(fov, WORKS.fov, k)
      elevation = THREE.MathUtils.lerp(elevation, WORKS.elevation, k)
      frameRight = THREE.MathUtils.lerp(frameRight, WORKS.frameRight, k)
      // Continue the leftward move as the works gallery starts its horizontal phase.
      azimuth -= works.drift * 9
      frameRight += works.drift * 0.08
    }

    const mobile = window.innerWidth <= 640 || window.matchMedia('(pointer: coarse)').matches
    const angle = THREE.MathUtils.degToRad(azimuth)
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    const actualDistance = distance * (mobile ? 1.32 : 1)
    const shift = frameRight * (mobile ? 0.5 : 1)
    const aim = aimRef.current.set(center.x + cos * shift, center.y, center.z - sin * shift)
    const desired = desiredPosRef.current.set(
      aim.x + sin * actualDistance,
      aim.y + elevation,
      aim.z + cos * actualDistance,
    )
    const perspective = state.camera as THREE.PerspectiveCamera
    const desiredFov = fov + (mobile ? 4 : 0)
    // Damping is time-based, so behavior is stable on 30, 60, and 120 Hz displays.
    // One rate-independent spring for the complete transform, no snapped stop frames.
    const follow = 1 - Math.exp(-14.0 * Math.min(delta, 0.08))
    const previousFov = perspective.fov
    if (!initialized.current) {
      perspective.position.copy(desired)
      lookRef.current.copy(aim)
      perspective.fov = desiredFov
      initialized.current = true
    } else {
      perspective.position.lerp(desired, follow)
      lookRef.current.lerp(aim, follow)
      perspective.fov = THREE.MathUtils.lerp(perspective.fov, desiredFov, follow)
    }
    perspective.lookAt(lookRef.current)
    if (Math.abs(perspective.fov - previousFov) > 0.0001) perspective.updateProjectionMatrix()
    camera.updateMatrixWorld()

    // Restore Sen's real selective DoF: focus the active sticker, soften other depths.
    const careerWeight = THREE.MathUtils.smoothstep(scroll, -0.72, -0.02) * (1 - works.entrance)
    // Focus shares the same easing as the camera; it never drops to a neutral
    // or unfocused state between the four career poses.
    focusRef.current.lerp(center, follow)
    // A sticker can span up to ~8cm in depth on the curved forehead/cheek.
    // The former 0.058-unit focus band blurred its own edges. Keep the full
    // sticker sharp, while hair, ears and the opposite cheek recede softly.
    bokehRef.current = THREE.MathUtils.lerp(bokehRef.current, 7.2 * careerWeight, follow)
    focusRangeRef.current = THREE.MathUtils.lerp(
      focusRangeRef.current, THREE.MathUtils.lerp(0.40, 0.135, careerWeight), follow,
    )
  })

  return <primitive object={avatar} />
}

/** Depth-of-field target follows the current decal, as in the original Scene.tsx. */
function CareerDepthOfField({
  focusRef, bokehRef, focusRangeRef,
}: {
  focusRef: MutableRefObject<THREE.Vector3>
  bokehRef: MutableRefObject<number>
  focusRangeRef: MutableRefObject<number>
}) {
  const effectRef = useRef<any>(null)
  useFrame(() => {
    const effect = effectRef.current
    if (!effect) return
    if (effect.target) effect.target.copy(focusRef.current)
    effect.bokehScale = bokehRef.current
    if (effect.cocMaterial) effect.cocMaterial.focusRange = focusRangeRef.current
  })
  return (
    <EffectComposer multisampling={0} stencilBuffer={false} depthBuffer>
      <DepthOfField
        ref={effectRef} target={[0, 0.6, 0]}
        worldFocusRange={0.135} bokehScale={7.2} height={480}
      />
      <SMAA />
    </EffectComposer>
  )
}

export default function SagarScene() {
  const focusRef = useRef(new THREE.Vector3(-0.048, 0.67, 0.15))
  const bokehRef = useRef(0)
  const focusRangeRef = useRef(0.40)
  return <>
    <GradientBackground />
    <Lights />
    <SagarAvatarAndCamera focusRef={focusRef} bokehRef={bokehRef} focusRangeRef={focusRangeRef} />
    <CareerDepthOfField focusRef={focusRef} bokehRef={bokehRef} focusRangeRef={focusRangeRef} />
  </>
}
