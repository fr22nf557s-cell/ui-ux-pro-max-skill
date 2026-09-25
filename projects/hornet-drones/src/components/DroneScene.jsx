import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/*
 * DRONE SCENE — photoreal-leaning quadcopter, React Three Fiber.
 *
 * Code-split (React.lazy from Hero.jsx) so the three.js payload never blocks
 * first paint. Still zero asset downloads: the airframe is generated from
 * lathed/extruded profiles rather than a GLTF, so it stays razor sharp at any
 * resolution and costs nothing to fetch.
 *
 * What actually sells the realism, in order of impact:
 *   1. An IBL environment map (PMREM over RoomEnvironment) — without real
 *      reflections, metal renders as flat grey no matter how many lights.
 *   2. ACES filmic tone mapping, so highlights roll off instead of clipping.
 *   3. Bevelled extrusions instead of boxes — every real edge catches a
 *      specular line, and that line is what reads as "machined".
 *   4. MeshPhysicalMaterial clearcoat on the shell — moulded composite has a
 *      lacquer layer over a matte base, which a single roughness can't fake.
 *   5. Blur discs over the rotors. Real props are never seen as blades.
 */

// ── Palette ────────────────────────────────────────────────────────────────
const SHELL = '#191C22' // composite body
const SHELL_TOP = '#22262F' // upper canopy, a shade lighter for a panel split
const CARBON = '#0F1116' // arms, booms
const METAL = '#6B727C' // anodised aluminium
const RUBBER = '#0E1013'
const GLASS = '#05070B'
const SIGNAL = '#FFFFFF' // nav lights, lens ring, scan pulse

// Motor hubs: X-configuration, front pair swept forward, rear pair wider.
const MOTORS = [
  { id: 'fl', at: [0.86, 0.03, 0.6], root: [0.27, -0.01, 0.2], cw: 1 },
  { id: 'fr', at: [0.86, 0.03, -0.6], root: [0.27, -0.01, -0.2], cw: -1 },
  { id: 'rl', at: [-0.8, 0.03, 0.68], root: [-0.26, -0.01, 0.22], cw: -1 },
  { id: 'rr', at: [-0.8, 0.03, -0.68], root: [-0.26, -0.01, -0.22], cw: 1 },
]

/**
 * Image-based lighting.
 *
 * PMREM pre-filters a procedural room into a mip chain the PBR shader samples
 * for roughness-correct reflections. This one call does more for perceived
 * realism than every light in the scene combined.
 */
function StudioEnvironment() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const target = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = target.texture
    scene.environmentIntensity = 0.34
    pmrem.dispose()
    return () => {
      target.dispose()
      scene.environment = null
    }
  }, [gl, scene])

  return null
}

/** Top-view outline of the fuselage: blunt tail, shoulders, tapered nose. */
function fuselageProfile(scale = 1) {
  const s = new THREE.Shape()
  s.moveTo(0.74 * scale, 0)
  s.bezierCurveTo(0.7 * scale, 0.15 * scale, 0.46 * scale, 0.28 * scale, 0.1 * scale, 0.31 * scale)
  s.bezierCurveTo(-0.26 * scale, 0.34 * scale, -0.52 * scale, 0.3 * scale, -0.62 * scale, 0.2 * scale)
  s.bezierCurveTo(-0.71 * scale, 0.12 * scale, -0.71 * scale, -0.12 * scale, -0.62 * scale, -0.2 * scale)
  s.bezierCurveTo(-0.52 * scale, -0.3 * scale, -0.26 * scale, -0.34 * scale, 0.1 * scale, -0.31 * scale)
  s.bezierCurveTo(0.46 * scale, -0.28 * scale, 0.7 * scale, -0.15 * scale, 0.74 * scale, 0)
  return s
}

/** Extrude a flat profile into a bevelled slab lying in the XZ plane. */
function slab(shape, depth, bevel) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 6,
    curveSegments: 32,
    steps: 1,
  })
  geo.rotateX(-Math.PI / 2) // extrusion runs along Y, not Z
  // Squeeze across the beam: a drone body is a long wedge, not a saucer.
  geo.scale(1, 1, 0.74)
  geo.center()
  geo.computeVertexNormals()
  return geo
}

/** One tapered carbon boom, aimed from the fuselage to its motor hub. */
function Boom({ from, to }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = new THREE.Vector3().subVectors(b, a)
    const length = dir.length()
    // A cylinder's axis is +Y, so rotate that onto the boom direction.
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    )
    const position = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
    return { position, quaternion, length }
  }, [from, to])

  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      {/* Tapered: thicker at the root where the bending load is */}
      <cylinderGeometry args={[0.042, 0.062, length, 20]} />
      <meshPhysicalMaterial color={CARBON} metalness={0.35} roughness={0.42} clearcoat={0.5} clearcoatRoughness={0.3} />
    </mesh>
  )
}

/** Airfoil-ish propeller blade — swept leading edge, thin trailing edge. */
function bladeGeometry() {
  const b = new THREE.Shape()
  b.moveTo(0.07, 0.015)
  b.bezierCurveTo(0.22, 0.062, 0.44, 0.066, 0.6, 0.03)
  b.lineTo(0.63, 0.004)
  b.bezierCurveTo(0.5, -0.016, 0.3, -0.036, 0.09, -0.028)
  b.lineTo(0.07, 0.015)
  const geo = new THREE.ExtrudeGeometry(b, {
    depth: 0.009,
    bevelEnabled: true,
    bevelSize: 0.004,
    bevelThickness: 0.003,
    bevelSegments: 2,
    curveSegments: 20,
    steps: 1,
  })
  geo.rotateX(-Math.PI / 2)
  geo.computeVertexNormals()
  return geo
}

/** Motor can + rotor. The rotor is blades plus a blur disc, never blades alone. */
function Rotor({ at, cw, spin }) {
  const rotor = useRef(null)
  const blur = useRef(null)
  const blade = useMemo(bladeGeometry, [])

  useFrame((_, delta) => {
    if (!rotor.current) return
    rotor.current.rotation.y += delta * spin * cw
    // The disc only earns its opacity while the blades are actually turning.
    if (blur.current) blur.current.material.opacity = spin > 0 ? 0.04 : 0
  })

  return (
    <group position={at}>
      {/* Stator can */}
      <mesh castShadow>
        <cylinderGeometry args={[0.082, 0.092, 0.085, 28]} />
        <meshStandardMaterial color={METAL} metalness={0.95} roughness={0.28} />
      </mesh>
      {/* Bell housing */}
      <mesh position={[0, 0.062, 0]} castShadow>
        <cylinderGeometry args={[0.072, 0.082, 0.045, 28]} />
        <meshStandardMaterial color="#474D56" metalness={0.9} roughness={0.24} />
      </mesh>
      {/* Cooling vent ring */}
      <mesh position={[0, 0.03, 0]}>
        <torusGeometry args={[0.076, 0.009, 10, 32]} />
        <meshStandardMaterial color={CARBON} metalness={0.7} roughness={0.5} />
      </mesh>
      {/* Nav light in the base — the only thing visible from the ground */}
      <mesh position={[0, -0.046, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.042, 0.07, 28]} />
        <meshBasicMaterial color={SIGNAL} transparent opacity={0.8} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      <group ref={rotor} position={[0, 0.095, 0]}>
        {/* Hub */}
        <mesh>
          <cylinderGeometry args={[0.03, 0.034, 0.022, 20]} />
          <meshStandardMaterial color={CARBON} metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Two blades, pitched — a flat blade reads as a paper cut-out */}
        {[0, Math.PI].map((r) => (
          <group key={r} rotation={[0, r, 0]}>
            <mesh geometry={blade} rotation={[0, 0, 0.2 * cw]} castShadow>
              <meshPhysicalMaterial
                color="#1B1E25"
                metalness={0.25}
                roughness={0.35}
                clearcoat={0.8}
                clearcoatRoughness={0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Motion-blur disc: what a spinning prop actually looks like */}
      <mesh ref={blur} position={[0, 0.098, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 48]} />
        <meshBasicMaterial color="#9FB0C8" transparent opacity={0.04} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** Three-axis gimbal and camera head slung under the nose. */
function Gimbal() {
  return (
    <group position={[0.58, -0.18, 0]}>
      {/* Roll yoke */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <torusGeometry args={[0.1, 0.016, 12, 28, Math.PI]} />
        <meshStandardMaterial color={METAL} metalness={0.92} roughness={0.3} />
      </mesh>
      {/* Camera body */}
      <mesh castShadow>
        <sphereGeometry args={[0.11, 32, 24]} />
        <meshPhysicalMaterial color={SHELL} metalness={0.2} roughness={0.42} clearcoat={0.9} clearcoatRoughness={0.15} />
      </mesh>
      {/* Lens barrel, pointing down-forward */}
      <group position={[0.06, -0.02, 0]} rotation={[0, 0, -0.35]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.062, 0.075, 28]} />
          <meshStandardMaterial color={CARBON} metalness={0.75} roughness={0.35} />
        </mesh>
        {/* Lens ring */}
        <mesh position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.049, 0.006, 8, 28]} />
          <meshBasicMaterial color={SIGNAL} toneMapped={false} />
        </mesh>
        {/* Front element: near-black glass with a hard clearcoat highlight */}
        <mesh position={[0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.046, 0.046, 0.008, 28]} />
          <meshPhysicalMaterial color={GLASS} metalness={0.1} roughness={0.03} clearcoat={1} clearcoatRoughness={0.02} />
        </mesh>
      </group>
    </group>
  )
}

function Airframe({ reduce }) {
  const body = useRef(null)
  const hull = useMemo(() => slab(fuselageProfile(1), 0.2, 0.05), [])
  const canopy = useMemo(() => slab(fuselageProfile(0.82), 0.08, 0.05), [])
  const battery = useMemo(() => slab(fuselageProfile(0.42), 0.06, 0.03), [])

  useFrame((state, delta) => {
    if (!body.current) return
    const t = state.clock.elapsedTime

    if (!reduce) {
      // Station-keeping drift: two out-of-phase sines never loop visibly, and
      // the tiny pitch/roll is the aircraft trimming against its own thrust.
      body.current.position.y = Math.sin(t * 1.15) * 0.055
      body.current.rotation.z = Math.sin(t * 0.9) * 0.03
      body.current.rotation.x = Math.cos(t * 0.72) * 0.018
    }

    // Pointer parallax, damped rather than bound: it leads and settles.
    const target = state.pointer.x * 0.4 - 0.5
    body.current.rotation.y = THREE.MathUtils.damp(body.current.rotation.y, target, 3, delta)
  })

  return (
    <group ref={body} rotation={[0, -0.5, 0]} position={[0, 0.05, 0]}>
      {/* Lower hull */}
      <mesh geometry={hull} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={SHELL}
          metalness={0.18}
          roughness={0.44}
          clearcoat={0.85}
          clearcoatRoughness={0.22}
        />
      </mesh>

      {/* Upper canopy, inset — the seam between the two reads as a panel line */}
      <mesh geometry={canopy} position={[0, 0.115, 0]} castShadow>
        <meshPhysicalMaterial
          color={SHELL_TOP}
          metalness={0.22}
          roughness={0.38}
          clearcoat={0.9}
          clearcoatRoughness={0.16}
        />
      </mesh>

      {/* Battery pack, seated in the spine */}
      <mesh geometry={battery} position={[-0.16, 0.175, 0]} castShadow>
        <meshPhysicalMaterial color={CARBON} metalness={0.4} roughness={0.55} clearcoat={0.3} />
      </mesh>

      {/* Status strip */}
      <mesh position={[0.12, 0.166, 0]}>
        <boxGeometry args={[0.34, 0.006, 0.026]} />
        <meshBasicMaterial color={SIGNAL} toneMapped={false} />
      </mesh>

      {/* Forward obstacle-avoidance sensors */}
      {[0.135, -0.135].map((z) => (
        <mesh key={z} position={[0.63, 0.02, z]} castShadow>
          <sphereGeometry args={[0.045, 20, 16]} />
          <meshPhysicalMaterial color={GLASS} metalness={0.15} roughness={0.05} clearcoat={1} />
        </mesh>
      ))}

      {/* Rear beacon */}
      <mesh position={[-0.67, 0.06, 0]}>
        <sphereGeometry args={[0.028, 16, 12]} />
        <meshBasicMaterial color={SIGNAL} toneMapped={false} />
      </mesh>

      <Gimbal />

      {/* Booms, motors and rotors */}
      {MOTORS.map((m) => (
        <group key={m.id}>
          <Boom from={m.root} to={m.at} />
          <Rotor at={m.at} cw={m.cw} spin={reduce ? 0 : 42} />
        </group>
      ))}

      {/* Landing feet: rubber, matte, no reflection */}
      {MOTORS.map((m) => (
        <group key={`foot-${m.id}`} position={[m.at[0] * 0.72, -0.14, m.at[2] * 0.72]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.016, 0.02, 0.085, 12]} />
            <meshStandardMaterial color={CARBON} metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.052, 0]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[0.032, 16, 12]} />
            <meshStandardMaterial color={RUBBER} metalness={0} roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Antennas, raked aft */}
      {[0.16, -0.16].map((z) => (
        <mesh key={z} position={[-0.64, 0.18, z]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.008, 0.01, 0.26, 10]} />
          <meshStandardMaterial color={CARBON} metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

/** Expanding ground pulse — the signature of an active perimeter scan. */
function ScanPulse({ active }) {
  const ring = useRef(null)

  useFrame((state) => {
    if (!ring.current || !active) return
    const t = (state.clock.elapsedTime % 3.4) / 3.4
    const s = 0.45 + t * 1.35
    ring.current.scale.set(s, s, s)
    ring.current.material.opacity = 0.14 * (1 - t)
  })

  return (
    <mesh ref={ring} position={[0, -1.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.93, 0.965, 96]} />
      <meshBasicMaterial color={SIGNAL} transparent opacity={0.14} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

export default function DroneScene({ reduce = false }) {
  return (
    <Canvas
      shadows
      frameloop={reduce ? 'demand' : 'always'}
      dpr={[1, 1.75]} // retina at 3x doubles fragment cost for no visible gain
      camera={{ position: [1.3, 2.1, 4.25], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, camera }) => {
        // Aim down at the airframe — edge-on, a quadcopter reads as a disc.
        camera.lookAt(0, -0.05, 0)
        // Filmic roll-off; without it every specular highlight clips to white.
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.95
        gl.shadowMap.type = THREE.PCFSoftShadowMap
      }}
      style={{ touchAction: 'pan-y' }} // never steal vertical scroll on mobile
    >
      <StudioEnvironment />

      {/* Key light: the only shadow caster, kept tight so the map stays sharp */}
      <directionalLight
        position={[3.2, 5, 2.4]}
        intensity={2.4}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-2.2}
        shadow-camera-right={2.2}
        shadow-camera-top={2.2}
        shadow-camera-bottom={-2.2}
        shadow-bias={-0.0006}
      />
      {/* Cold rim to separate the silhouette from the charcoal page */}
      <directionalLight position={[-3.4, 1.6, -4]} intensity={0.9} color="#9FC4FF" />
      {/* Cool under-fill from the scan pulse below */}
      <pointLight position={[-1.6, -1.5, 1.8]} intensity={7} distance={7} color="#C8D2E2" />

      <Airframe reduce={reduce} />
      <ScanPulse active={!reduce} />

      {/* Shadow catcher: invisible except where the aircraft darkens it */}
      <mesh position={[0, -1.14, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <shadowMaterial transparent opacity={0.22} />
      </mesh>
    </Canvas>
  )
}
