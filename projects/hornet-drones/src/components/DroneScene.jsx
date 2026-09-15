import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * DRONE SCENE — Three.js via React Three Fiber.
 *
 * This file is code-split (imported with React.lazy from Hero.jsx) so the
 * ~600KB three.js payload never blocks first paint. The model is built from
 * primitives on purpose: zero asset downloads, instant LCP, and it stays
 * perfectly on-brand because every material is a token colour.
 *
 * Motion budget: exactly three moving things — rotor spin, body hover,
 * ground scan pulse. Pointer parallax is a lerp, never a hard bind.
 */

const CARBON = '#2B3240'
const SHELL = '#3C4553'
const AMBER = '#F59E0B'

// Motor tip coordinates (x, z). Everything else is derived from these.
const TIPS = [
  [0.95, 0.72],
  [-0.95, 0.72],
  [0.95, -0.72],
  [-0.95, -0.72],
]

/** A single carbon arm, stretched and aimed from the fuselage to its motor tip. */
function Arm({ x, z }) {
  const len = Math.hypot(x, z)
  // A box's local +X is rotated onto the (x, z) direction by atan2(-z, x).
  const rotY = Math.atan2(-z, x)
  return (
    <mesh position={[x / 2, -0.02, z / 2]} rotation={[0, rotY, 0]} castShadow>
      <boxGeometry args={[len, 0.07, 0.11]} />
      <meshStandardMaterial color={CARBON} metalness={0.55} roughness={0.42} />
    </mesh>
  )
}

/** Motor pod + counter-rotating blade pair. */
function Rotor({ x, z, spin, direction }) {
  const blades = useRef(null)

  useFrame((_, delta) => {
    // delta-based so the spin rate is frame-rate independent.
    if (blades.current) blades.current.rotation.y += delta * spin * direction
  })

  return (
    <group position={[x, 0.02, z]}>
      {/* Motor housing */}
      <mesh>
        <cylinderGeometry args={[0.1, 0.12, 0.14, 20]} />
        <meshStandardMaterial color={SHELL} metalness={0.65} roughness={0.35} />
      </mesh>
      {/* Amber status ring on the pod — the only light visible from the ground */}
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.055, 0.085, 24]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Blades: two thin boxes crossed at 90°, translucent to fake motion blur */}
      <group ref={blades} position={[0, 0.12, 0]}>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} rotation={[0, r, 0]}>
            <boxGeometry args={[0.72, 0.006, 0.07]} />
            <meshStandardMaterial
              color="#5A6577"
              metalness={0.4}
              roughness={0.6}
              transparent
              opacity={0.55}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Expanding ground pulse — the visual signature of an active perimeter scan. */
function ScanPulse({ active }) {
  const ring = useRef(null)

  useFrame((state) => {
    if (!ring.current || !active) return
    // 3.2s loop: scale 0.4 -> 2.4 while fading out. Pure math, no timers.
    const t = (state.clock.elapsedTime % 3.2) / 3.2
    const s = 0.4 + t * 2
    ring.current.scale.set(s, s, s)
    ring.current.material.opacity = 0.5 * (1 - t)
  })

  return (
    <mesh ref={ring} position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.92, 0.96, 96]} />
      <meshBasicMaterial color={AMBER} transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Drone({ reduce }) {
  const body = useRef(null)

  useFrame((state, delta) => {
    if (!body.current) return
    const t = state.clock.elapsedTime

    if (!reduce) {
      // Idle hover: two out-of-phase sines so the drift never looks like a loop.
      body.current.position.y = Math.sin(t * 1.15) * 0.07
      body.current.rotation.z = Math.sin(t * 0.9) * 0.035
      body.current.rotation.x = Math.cos(t * 0.7) * 0.022
    }

    // Pointer parallax: ease 8% of the remaining distance each frame (damped
    // lerp), which stays smooth at any frame rate and never snaps.
    const targetY = state.pointer.x * 0.42 - 0.35
    body.current.rotation.y = THREE.MathUtils.damp(body.current.rotation.y, targetY, 3, delta)
  })

  return (
    <group ref={body} rotation={[0, -0.35, 0]}>
      {/* Lower chassis */}
      <mesh castShadow>
        <boxGeometry args={[1.35, 0.2, 0.62]} />
        <meshStandardMaterial color={CARBON} metalness={0.6} roughness={0.38} />
      </mesh>
      {/* Upper shell, inset for a machined step */}
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.1, 0.14, 0.5]} />
        <meshStandardMaterial color={SHELL} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Amber light bar down the spine */}
      <mesh position={[0, 0.235, 0]}>
        <boxGeometry args={[0.72, 0.012, 0.04]} />
        <meshBasicMaterial color={AMBER} />
      </mesh>

      {/* Gimballed sensor head: dark sphere + glowing amber lens */}
      <group position={[0.52, -0.16, 0]}>
        <mesh>
          <sphereGeometry args={[0.185, 32, 32]} />
          <meshStandardMaterial color="#1A1F2A" metalness={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[0.12, -0.02, 0]}>
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
      </group>

      {/* Arms + rotors. Diagonal pairs counter-rotate, like a real quad. */}
      {TIPS.map(([x, z], i) => (
        <group key={`${x}${z}`}>
          <Arm x={x} z={z} />
          <Rotor x={x} z={z} spin={reduce ? 0 : 26} direction={i === 0 || i === 3 ? 1 : -1} />
        </group>
      ))}

      {/* Landing skids */}
      {[-0.22, 0.22].map((z) => (
        <mesh key={z} position={[0, -0.34, z]}>
          <boxGeometry args={[0.8, 0.035, 0.035]} />
          <meshStandardMaterial color="#232A36" metalness={0.45} roughness={0.55} />
        </mesh>
      ))}
    </group>
  )
}

export default function DroneScene({ reduce = false }) {
  return (
    <Canvas
      // `demand` renders a single frame for reduced-motion users, then stops.
      frameloop={reduce ? 'demand' : 'always'}
      dpr={[1, 1.75]} // cap DPR: retina at 3x doubles fragment cost for no visible gain
      camera={{ position: [0, 0.55, 4.8], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'pan-y' }} // never steal vertical scroll on mobile
    >
      {/* Cool ambient fill keeps the shadows blue-black rather than muddy grey */}
      <ambientLight intensity={0.9} color="#8FA0BC" />
      {/* Sky/ground fill: keeps top faces bright and undersides charcoal, which
          is what makes an unlit-by-HDRI metal read as metal at all. */}
      <hemisphereLight args={['#C7D6F0', '#0B0C10', 1.5]} />
      {/* Key light, crisp white */}
      <directionalLight position={[4, 6, 4]} intensity={3.2} color="#FFFFFF" />
      {/* Two amber practicals: one under-glow, one rear rim */}
      <pointLight position={[-2.4, -1.4, 2.2]} intensity={22} distance={10} color={AMBER} />
      <pointLight position={[2.6, 1.8, -2.4]} intensity={16} distance={10} color={AMBER} />
      {/* Cold back-rim separates the silhouette from the charcoal page */}
      <directionalLight position={[-3, 2, -5]} intensity={2.2} color="#9FC4FF" />

      <Drone reduce={reduce} />
      <ScanPulse active={!reduce} />
    </Canvas>
  )
}
