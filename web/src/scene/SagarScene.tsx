import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, SMAA } from '@react-three/postprocessing'
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
    node: 'DECAL_06_SocialMediaCat_Career', azimuth: -69, distance: 0.70,
    fov: 29, elevation: 0.084, frameRight: 0.105,
  },
  {
    point: FOCUS_POINTS[1], label: 'Freelance — Scriptwriter',
    node: 'DECAL_01_WriterCat_LeftTemple', azimuth: 68, distance: 0.71,
    fov: 29, elevation: 0.085, frameRight: 0.105,
  },
  {
    point: FOCUS_POINTS[2], label: 'Syngene International Ltd. — Research Professional',
    node: 'DECAL_03_LabFlaskCat_Career', azimuth: 68, distance: 0.74,
    fov: 29, elevation: 0.089, frameRight: 0.105,
  },
  {
    point: FOCUS_POINTS[3], label: 'Analytica Chemie Inc. — Synthetic Chemistry R&D',
    node: 'DECAL_02_ScientistCat_RightTemple', azimuth: -69, distance: 0.74,
    fov: 29, elevation: 0.089, frameRight: 0.105,
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
  center: new THREE.Vector3(0, 0.51, 0.07),
  azimuth: 0,
  distance: 1.75,
  fov: 36,
  elevation: 0.08,
  frameRight: 0.19,
}
const WORKS: Pose = {
  center: new THREE.Vector3(0, 0.52, 0.07),
  azimuth: 12,
  distance: 2.05,
  fov: 36,
  elevation: 0.09,
  frameRight: 0.17,
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

function smootherStep(value: number) {
  const t = THREE.MathUtils.clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Progress: -1=hero, 0..3=career stops.
 * The hold region gives each sticker a real pause at its respective text block.
 * Source of truth is the existing DOM anchor order; Kannada and English share it.
 */
function timelineProgress() {
  const positions = CAREER_STOPS.map(({ point }) =>
    document.querySelector<HTMLElement>(`[data-point="${point}"]`)
  )
  if (positions.some((p) => !p)) return -1
  const tops = positions.map((p) => p!.getBoundingClientRect().top + window.scrollY)
  const viewport = window.innerHeight
  const cursor = window.scrollY + viewport * 0.30
  if (cursor < tops[0]) {
    const heroTravel = Math.max(1, tops[0] - viewport * 0.30)
    return -1 + smootherStep(window.scrollY / heroTravel)
  }
  for (let i = 0; i < tops.length - 1; i++) {
    if (cursor <= tops[i + 1]) {
      const fraction = (cursor - tops[i]) / Math.max(1, tops[i + 1] - tops[i])
      // Hold current role, orbit to next sticker, hold next role.
      return i + smootherStep((fraction - 0.24) / 0.55)
    }
  }
  return 3
}

function worksProgress() {
  const el = document.querySelector<HTMLElement>('.wk-gallery')
  if (!el) return 0
  const top = el.getBoundingClientRect().top
  return smootherStep(1 - top / Math.max(1, window.innerHeight))
}

function interpolatePose(a: Pose, b: Pose, t: number): Pose {
  return {
    center: a.center.clone().lerp(b.center, t),
    azimuth: THREE.MathUtils.lerp(a.azimuth, b.azimuth, t),
    distance: THREE.MathUtils.lerp(a.distance, b.distance, t),
    fov: THREE.MathUtils.lerp(a.fov, b.fov, t),
    elevation: THREE.MathUtils.lerp(a.elevation, b.elevation, t),
    frameRight: THREE.MathUtils.lerp(a.frameRight, b.frameRight, t),
  }
}

/** Returns position and look-at point in original GLB coordinates. */
export function cameraFromPose(pose: Pose, mobile: boolean) {
  const angle = THREE.MathUtils.degToRad(pose.azimuth)
  const right = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle))
  const distance = pose.distance * (mobile ? 1.36 : 1)
  const frameRight = pose.frameRight * (mobile ? 0.30 : 1)
  const aim = pose.center.clone().addScaledVector(right, frameRight)
  const position = aim.clone().add(new THREE.Vector3(
    Math.sin(angle) * distance,
    pose.elevation * (mobile ? 1.25 : 1),
    Math.cos(angle) * distance,
  ))
  return { position, aim, fov: pose.fov + (mobile ? 4 : 0) }
}

function SagarAvatarAndCamera() {
  const { scene } = useGLTF(MODEL_URL)
  const { camera } = useThree()
  const lookRef = useRef(new THREE.Vector3())
  const initialized = useRef(false)
  const { avatar, poses } = useMemo(() => {
    const avatar = scene.clone(true)
    avatar.updateMatrixWorld(true)
    const poses: Pose[] = CAREER_STOPS.map((stop) => {
      const mesh = avatar.getObjectByName(stop.node)
      if (!mesh) {
        throw new Error(`Sagar avatar is missing required career sticker: ${stop.node}`)
      }
      const center = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3())
      // Geometry nodes use positions in local GLB space; no extra scale or offset.
      if (!Number.isFinite(center.x)) throw new Error(`Invalid sticker bounds: ${stop.node}`)
      return { center, azimuth: stop.azimuth, distance: stop.distance,
        fov: stop.fov, elevation: stop.elevation, frameRight: stop.frameRight }
    })
    avatar.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.frustumCulled = false // thin decals must not vanish at oblique angles
      }
    })
    return { avatar, poses }
  }, [scene])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    console.table(CAREER_STOPS.map((stop, i) => ({
      experience: stop.label,
      resumeAnchor: stop.point,
      sticker: stop.node,
      center: poses[i].center.toArray().map((v) => v.toFixed(3)).join(', '),
    })))
  }, [poses])

  useFrame((state, delta) => {
    const progress = timelineProgress()
    const fromIndex = Math.floor(progress)
    const toIndex = Math.min(3, fromIndex + 1)
    const t = progress - fromIndex
    const a = fromIndex < 0 ? HOME : poses[fromIndex]
    const b = toIndex < 0 ? HOME : poses[toIndex]
    const chosen = interpolatePose(a, b, t)
    const works = worksProgress()
    const final = works > 0 ? interpolatePose(chosen, WORKS, works) : chosen
    const mobile = window.innerWidth <= 640 || window.matchMedia('(pointer: coarse)').matches
    const desired = cameraFromPose(final, mobile)
    const perspective = state.camera as THREE.PerspectiveCamera

    if (!initialized.current) {
      perspective.position.copy(desired.position)
      lookRef.current.copy(desired.aim)
      initialized.current = true
    } else {
      const follow = 1 - Math.exp(-5.2 * Math.min(delta, 0.08))
      perspective.position.lerp(desired.position, follow)
      lookRef.current.lerp(desired.aim, follow)
    }
    perspective.lookAt(lookRef.current)
    const targetFov = desired.fov
    const nextFov = THREE.MathUtils.lerp(perspective.fov, targetFov, initialized.current ? 0.17 : 1)
    if (Math.abs(perspective.fov - nextFov) > 0.001) {
      perspective.fov = nextFov
      perspective.updateProjectionMatrix()
    }
    camera.updateMatrixWorld()
  })

  return <primitive object={avatar} />
}

export default function SagarScene() {
  return <>
    <GradientBackground />
    <Lights />
    <SagarAvatarAndCamera />
    {/* Keep sticker edges sharp: no depth-of-field blur on career details. */}
    <EffectComposer multisampling={0} stencilBuffer={false}>
      <SMAA />
    </EffectComposer>
  </>
}
