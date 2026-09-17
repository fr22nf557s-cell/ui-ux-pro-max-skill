/* =====================================================================
   Norvex Property — world.js
   The fly-through. One Three.js scene, six chapters laid out far apart
   in world space. Scroll progress (0-1) picks the chapter and a local
   time t, and the camera glides along that chapter's spline while the
   page fades to black between chapters ("the corridor").

   Chapters
     0  Arrival    above the clouds at dawn, down past the Norvex tower
     1  Residence  penthouse at sunset (Properties)
     2  Office     40th-floor study at dusk (Mortgages)
     3  Study      blueprint of a house that draws itself (Surveying)
     4  Bridge     a suspension bridge at night (Bridging finance)
     5  Terrace    rooftop garden at golden hour (Contact)

   Exposes window.NorvexWorld.create(canvas, quality) -> api
   ===================================================================== */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const CHAMPAGNE = 0xE9D6AE;
const GOLD = 0xC9A96E;
const CHAPTER_GAP = 6000; // world-space distance between chapters

/* ---------- deterministic random ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const x = clamp01((v - a) / (b - a)); return x * x * (3 - 2 * x); };

/* ---------- canvas textures ---------- */
function canvasTexture(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
let glowTex = null;
function glowTexture() {
  if (glowTex) return glowTex;
  glowTex = canvasTexture(256, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.2, 'rgba(255,255,255,0.6)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.14)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  });
  return glowTex;
}
function cloudTexture(seed) {
  return canvasTexture(256, (ctx, s) => {
    const rnd = mulberry32(seed);
    for (let i = 0; i < 28; i += 1) {
      const x = s * 0.5 + (rnd() - 0.5) * s * 0.66, y = s * 0.5 + (rnd() - 0.5) * s * 0.4, r = s * (0.07 + rnd() * 0.17);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); const a = 0.3 + rnd() * 0.4;
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    }
  });
}
function windowTexture(cols, rows, lit, seed) {
  const t = canvasTexture(512, (ctx, s) => {
    const rnd = mulberry32(seed);
    ctx.fillStyle = '#0d131d'; ctx.fillRect(0, 0, s, s);
    const cw = s / cols, rh = s / rows;
    for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) {
      const on = rnd() < lit;
      ctx.fillStyle = on ? `rgba(245,${205 + (rnd() * 30) | 0},${140 + (rnd() * 50) | 0},${0.5 + rnd() * 0.5})` : '#182231';
      ctx.fillRect(c * cw + cw * 0.14, r * rh + rh * 0.18, cw * 0.72, rh * 0.58);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function gradientTexture(stops, vertical) {
  return canvasTexture(256, (ctx, s) => {
    const g = vertical ? ctx.createLinearGradient(0, 0, 0, s) : ctx.createLinearGradient(0, 0, s, 0);
    stops.forEach(([o, c]) => g.addColorStop(o, c)); ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  });
}

/* ---------- sky dome ---------- */
const SKY_VERT = `varying vec3 vDir; void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vDir = wp.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * wp; }`;
const SKY_FRAG = `precision highp float; varying vec3 vDir;
uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uBottom; uniform vec3 uSunDir; uniform vec3 uSunColor; uniform float uSunPower; uniform float uHaze;
void main(){
  vec3 d = normalize(vDir); float h = d.y; vec3 col;
  if (h >= 0.0) col = mix(uHorizon, uTop, pow(h, 0.5)); else col = mix(uHorizon, uBottom, pow(-h, 0.35));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  col += uSunColor * uSunPower * (pow(s, 64.0) * 1.1 + pow(s, 8.0) * 0.35 + pow(s, 1.6) * 0.14 * uHaze);
  gl_FragColor = vec4(col, 1.0);
}`;

/* ---------- reusable builders ---------- */
function box(w, h, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; }
function std(color, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0.05 }, extra || {})); }

function makeCity({ n = 48, spacing = 44, hMin = 8, hMax = 120, seed = 1, lights = 1, color = 0x1a2130, glow = 0xffd9a0, glowSize = 2.4 }) {
  const rnd = mulberry32(seed);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(color, { roughness: 0.9 }), n * n);
  const m = new THREE.Matrix4(); const pts = []; let i = 0;
  for (let gx = 0; gx < n; gx += 1) for (let gz = 0; gz < n; gz += 1) {
    const x = (gx - n / 2) * spacing + (rnd() - 0.5) * 10, z = (gz - n / 2) * spacing + (rnd() - 0.5) * 10;
    const w = 10 + rnd() * 20, d = 10 + rnd() * 20;
    const dist = Math.hypot(gx - n / 2, gz - n / 2) / (n / 2);
    const h = hMin + Math.pow(rnd(), 2.4) * (hMax - hMin) * Math.max(0.15, 1.15 - dist * 0.9);
    m.makeScale(w, h, d); m.setPosition(x, h / 2, z); mesh.setMatrixAt(i, m); i += 1;
    const nl = Math.floor((h / 10) * lights);
    for (let k = 0; k < nl; k += 1) {
      const onX = rnd() < 0.5, side = rnd() < 0.5 ? 1 : -1;
      pts.push(onX ? x + side * w / 2 : x + (rnd() - 0.5) * w, 3 + rnd() * (h - 4), onX ? z + (rnd() - 0.5) * d : z + side * d / 2);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  const points = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)),
    new THREE.PointsMaterial({ color: glow, size: glowSize, map: glowTexture(), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  const g = new THREE.Group(); g.add(mesh, points); return g;
}

function makeClouds({ count, x, y, z, scale, color = 0xffe6cc, opacity = [0.45, 0.9], seed = 7 }) {
  const rnd = mulberry32(seed); const g = new THREE.Group();
  const texs = [cloudTexture(seed), cloudTexture(seed + 11), cloudTexture(seed + 23)];
  for (let i = 0; i < count; i += 1) {
    const mat = new THREE.SpriteMaterial({ map: texs[i % 3], color, transparent: true, opacity: opacity[0] + rnd() * (opacity[1] - opacity[0]), depthWrite: false, rotation: rnd() * Math.PI * 2 });
    const s = new THREE.Sprite(mat);
    s.position.set(x[0] + rnd() * (x[1] - x[0]), y[0] + rnd() * (y[1] - y[0]), z[0] + rnd() * (z[1] - z[0]));
    const sc = scale[0] + rnd() * (scale[1] - scale[0]); s.scale.set(sc, sc * 0.55, 1);
    g.add(s);
  }
  return g;
}

function makeBulbs(positions, { color = 0xffe2b0, size = 2, halo = 10, haloOpacity = 0.35 }) {
  const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const g = new THREE.Group();
  g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color, size, map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color, size: halo, map: glowTexture(), transparent: true, opacity: haloOpacity, depthWrite: false, blending: THREE.AdditiveBlending })));
  return g;
}

/* A room shell: floor, ceiling, three walls, and a glazed wall of mullions at -z */
function makeRoom({ w, h, d, floor, wall, ceiling, mullion = 0x2a2a2e, bay = 4.2 }) {
  const g = new THREE.Group();
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floor); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ceiling); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wall); back.position.set(0, h / 2, d / 2); back.rotation.y = Math.PI; back.receiveShadow = true; g.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wall); left.position.set(-w / 2, h / 2, 0); left.rotation.y = Math.PI / 2; left.receiveShadow = true; g.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wall); right.position.set(w / 2, h / 2, 0); right.rotation.y = -Math.PI / 2; right.receiveShadow = true; g.add(right);
  const mm = std(mullion, { roughness: 0.4, metalness: 0.6 });
  g.add(box(w, 0.28, 0.3, mm, 0, h - 0.14, -d / 2));
  g.add(box(w, 0.08, 0.3, mm, 0, 0.04, -d / 2));
  for (let x = -w / 2; x <= w / 2 + 0.01; x += bay) g.add(box(0.12, h, 0.14, mm, x, h / 2, -d / 2));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0.05, depthWrite: false }));
  glass.position.set(0, h / 2, -d / 2); g.add(glass);
  return g;
}

/* ---------- chapters ---------- */
function chapterArrival(q) {
  const g = new THREE.Group();
  g.add(makeCity({ n: q.cityN, spacing: 46, hMin: 8, hMax: 130, seed: 3, lights: q.lights, color: 0x1b2230, glow: 0xffd3a0 }));
  g.children[0].position.set(0, 0, -700);
  // The Norvex tower
  const tower = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(38, 42, 440, 48, 1, false),
    std(0xffffff, { map: windowTexture(12, 40, 0.45, 5), roughness: 0.35, metalness: 0.5 }));
  shell.material.map.repeat.set(6, 1); shell.position.y = 220; tower.add(shell);
  const rings = new THREE.InstancedMesh(new THREE.TorusGeometry(44, 1.3, 8, 72), std(0xe8dccb, { roughness: 0.6 }), 34);
  const m = new THREE.Matrix4();
  for (let i = 0; i < 34; i += 1) { m.makeRotationX(Math.PI / 2); m.setPosition(0, 14 + i * 12.4, 0); rings.setMatrixAt(i, m); }
  rings.instanceMatrix.needsUpdate = true; tower.add(rings);
  tower.add(box(30, 10, 30, std(0x2a2f3a), 0, 445, 0));
  tower.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 30, 8), std(0xd8ccb8)).translateY(465));
  tower.position.set(0, 0, -640); g.add(tower);
  // a beacon at the tip
  g.add(makeBulbs([0, 480, -640], { color: 0xfff0d0, size: 6, halo: 40, haloOpacity: 0.4 }));
  // podium buildings around the tower base
  const podium = std(0x232a36, { roughness: 0.8 });
  g.add(box(160, 40, 120, podium, -140, 20, -640)); g.add(box(120, 60, 90, podium, 150, 30, -700));
  // clouds
  const clouds = makeClouds({ count: q.clouds, x: [-1600, 1600], y: [400, 560], z: [-1400, 1000], scale: [180, 460], color: 0xffe3c4, opacity: [0.5, 0.95], seed: 9 });
  g.add(clouds);
  const haze = makeClouds({ count: Math.round(q.clouds / 3), x: [-1600, 1600], y: [150, 260], z: [-1600, 600], scale: [300, 700], color: 0xffd0a8, opacity: [0.15, 0.35], seed: 21 });
  g.add(haze);
  const hemi = new THREE.HemisphereLight(0xffe0c0, 0x223044, 1.1); g.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc890, 2.2); sun.position.set(400, 220, -1200); sun.target.position.set(0, 0, -600); g.add(sun, sun.target);
  return {
    group: g, fov: 58,
    path: new THREE.CatmullRomCurve3([new THREE.Vector3(0, 900, 900), new THREE.Vector3(20, 720, 520), new THREE.Vector3(60, 540, 180), new THREE.Vector3(110, 400, -150), new THREE.Vector3(100, 320, -420), new THREE.Vector3(48, 300, -585), new THREE.Vector3(0, 292, -640)]),
    look: new THREE.CatmullRomCurve3([new THREE.Vector3(200, 560, -1600), new THREE.Vector3(150, 480, -1500), new THREE.Vector3(60, 400, -1000), new THREE.Vector3(0, 340, -640), new THREE.Vector3(0, 310, -640), new THREE.Vector3(0, 296, -680), new THREE.Vector3(0, 292, -760)]),
    sky: { top: [0.06, 0.12, 0.28], horizon: [0.98, 0.66, 0.40], bottom: [0.22, 0.20, 0.24], sunDir: [0.35, 0.10, -1], sunColor: [1.0, 0.82, 0.58], sunPower: 1.0, haze: 1.0 },
    fog: { color: [0.84, 0.60, 0.44], density: 0.00052 }, stars: 0.0, sunSprite: 1.0, exposure: 1.0,
    update(t, time) { clouds.position.x = Math.sin(time * 0.05) * 20; haze.position.x = Math.cos(time * 0.04) * 30; },
  };
}

function chapterResidence(q) {
  const g = new THREE.Group();
  const room = makeRoom({ w: 26, h: 4.2, d: 20, floor: std(0x7a5a3c, { roughness: 0.45, metalness: 0.05 }), wall: std(0xe6e0d6, { roughness: 0.95 }), ceiling: std(0xf1ede6, { roughness: 0.95 }), mullion: 0x22252b, bay: 4.33 });
  g.add(room);
  const cream = std(0xe4dccd, { roughness: 0.9 }), dark = std(0x1c1a18, { roughness: 0.35, metalness: 0.2 }), walnut = std(0x4a3524, { roughness: 0.5 });
  const cast = (o) => { o.castShadow = true; o.receiveShadow = true; return o; };
  // lounge
  g.add(cast(box(5.6, 0.02, 3.6, std(0xd9cfbd, { roughness: 1 }), -4, 0.01, -1)));
  g.add(cast(box(4.4, 0.42, 1.05, cream, -4, 0.21, -2.2))); g.add(cast(box(4.4, 0.55, 0.32, cream, -4, 0.62, -2.6)));
  g.add(cast(box(1.05, 0.42, 2.6, cream, -6.6, 0.21, -0.8))); g.add(cast(box(0.32, 0.55, 2.6, cream, -7.0, 0.62, -0.8)));
  g.add(cast(box(1.7, 0.36, 0.9, dark, -4, 0.18, -0.3)));
  g.add(cast(box(0.95, 0.4, 0.95, cream, -1.2, 0.2, 0.6))); g.add(cast(box(0.95, 0.4, 0.95, cream, -6.8, 0.2, 2.4)));
  // dining
  g.add(cast(box(2.8, 0.06, 1.1, walnut, 6, 0.75, -2))); g.add(cast(box(0.08, 0.72, 1.0, walnut, 4.8, 0.36, -2))); g.add(cast(box(0.08, 0.72, 1.0, walnut, 7.2, 0.36, -2)));
  for (let i = 0; i < 3; i += 1) { g.add(cast(box(0.46, 0.9, 0.46, dark, 5 + i, 0.45, -3))); g.add(cast(box(0.46, 0.9, 0.46, dark, 5 + i, 0.45, -1))); }
  // kitchen island + pendants
  g.add(cast(box(3.4, 0.95, 1.15, std(0xe9e4dc, { roughness: 0.3 }), 8, 0.475, 3.5)));
  const pend = std(0xffe6b8, { emissive: 0xffd08a, emissiveIntensity: 1.6 });
  for (let i = -1; i <= 1; i += 1) { g.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), pend).translateX(8 + i * 0.9).translateY(2.0).translateZ(3.5)); g.add(box(0.02, 2.0, 0.02, dark, 8 + i * 0.9, 3.1, 3.5)); }
  // floor lamp + art + plant
  g.add(box(0.05, 1.7, 0.05, dark, -8.5, 0.85, -3.8));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.4, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xfff2dc, emissive: 0xffd9a0, emissiveIntensity: 0.9, side: THREE.DoubleSide })).translateX(-8.5).translateY(1.8).translateZ(-3.8));
  const lamp = new THREE.PointLight(0xffd2a0, 18, 9, 2); lamp.position.set(-8.5, 1.7, -3.8); g.add(lamp);
  g.add(box(2.6, 1.7, 0.05, std(0x1e2430, { roughness: 0.6 }), 0, 2.2, 9.95)); g.add(box(2.7, 1.8, 0.03, std(0xC9A96E), 0, 2.2, 9.98));
  g.add(box(1.8, 1.2, 0.05, std(0x3a2f28, { roughness: 0.6 }), -12.95, 2.1, 2).rotateY(Math.PI / 2));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 12), std(0x2a2a2e)).translateX(11).translateY(0.3).translateZ(-6));
  const leaf = std(0x2f4a33, { roughness: 0.9 });
  [[11, 1.3, -6], [10.6, 1.05, -5.7], [11.4, 1.1, -6.3]].forEach((p) => g.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 10), leaf).translateX(p[0]).translateY(p[1]).translateZ(p[2])));
  // terrace beyond the glass, sea and sun
  g.add(box(26, 0.3, 8, std(0xb8b0a2, { roughness: 0.8 }), 0, -0.15, -14));
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(26, 1.1), new THREE.MeshBasicMaterial({ color: 0xcfe4f5, transparent: true, opacity: 0.18, side: THREE.DoubleSide })).translateY(0.55).translateZ(-18));
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), std(0x1f4b60, { roughness: 0.12, metalness: 0.35 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -60; g.add(sea);
  const streak = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffd8a0, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  streak.scale.set(120, 900, 1); streak.position.set(120, -58, -900); g.add(streak);
  g.add(makeClouds({ count: Math.round(q.clouds / 4), x: [-1500, 1500], y: [120, 260], z: [-2200, -700], scale: [300, 800], color: 0xffcfa0, opacity: [0.2, 0.5], seed: 31 }));
  const hemi = new THREE.HemisphereLight(0xffe4c4, 0x5a4634, 0.9); g.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd0a0, 3.2); sun.position.set(24, 9, -60); sun.target.position.set(0, 0, 2);
  sun.castShadow = q.shadows; sun.shadow.mapSize.set(q.shadowSize, q.shadowSize); sun.shadow.camera.left = -18; sun.shadow.camera.right = 18; sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16; sun.shadow.camera.near = 20; sun.shadow.camera.far = 120; sun.shadow.bias = -0.0008;
  g.add(sun, sun.target);
  return {
    group: g, fov: 62,
    path: new THREE.CatmullRomCurve3([new THREE.Vector3(2.5, 1.6, 8.5), new THREE.Vector3(-1.5, 1.7, 4.5), new THREE.Vector3(1.4, 1.55, 0.5), new THREE.Vector3(0.2, 1.6, -4), new THREE.Vector3(0, 1.6, -9.8), new THREE.Vector3(0, 1.7, -15)]),
    look: new THREE.CatmullRomCurve3([new THREE.Vector3(-2, 1.4, -4), new THREE.Vector3(-4, 1.3, -5), new THREE.Vector3(3, 1.5, -12), new THREE.Vector3(0, 1.7, -25), new THREE.Vector3(2, 1.9, -60), new THREE.Vector3(6, 2.2, -100)]),
    sky: { top: [0.14, 0.20, 0.38], horizon: [1.0, 0.62, 0.32], bottom: [0.30, 0.22, 0.18], sunDir: [0.22, 0.08, -1], sunColor: [1.0, 0.80, 0.55], sunPower: 1.5, haze: 1.1 },
    fog: { color: [0.95, 0.66, 0.42], density: 0.0007 }, stars: 0.0, sunSprite: 1.2, exposure: 1.0,
    update(t, time) { streak.material.opacity = 0.45 + Math.sin(time * 1.3) * 0.08; },
  };
}

function chapterOffice(q) {
  const g = new THREE.Group();
  const roomG = new THREE.Group(); roomG.position.y = 170; g.add(roomG);
  const room = makeRoom({ w: 18, h: 3.4, d: 16, floor: std(0x3b2b21, { roughness: 0.4, metalness: 0.1 }), wall: std(0x20242c, { roughness: 0.9 }), ceiling: std(0x15171d, { roughness: 0.95 }), mullion: 0x12141a, bay: 4.5 });
  roomG.add(room);
  const cast = (o) => { o.castShadow = true; o.receiveShadow = true; return o; };
  const oak = std(0x1a1410, { roughness: 0.35, metalness: 0.15 }), leather = std(0x2a2320, { roughness: 0.6 }), brass = std(0xC9A96E, { roughness: 0.3, metalness: 0.8 });
  roomG.add(cast(box(2.8, 0.08, 1.3, oak, 0, 0.76, -2.6))); roomG.add(cast(box(2.6, 0.7, 1.1, oak, 0, 0.36, -2.6)));
  roomG.add(cast(box(0.7, 1.15, 0.7, leather, 0, 0.58, -1.3)));
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.62, 0.03), new THREE.MeshStandardMaterial({ color: 0x1b2a40, emissive: 0x2a4a70, emissiveIntensity: 0.8 })); screen.position.set(0.3, 1.15, -3.0); roomG.add(screen);
  roomG.add(box(0.06, 0.3, 0.06, oak, 0.3, 0.9, -3.0));
  roomG.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffe0b0, emissive: 0xffc070, emissiveIntensity: 2 })).translateX(-1.0).translateY(1.25).translateZ(-2.8));
  roomG.add(box(0.03, 0.45, 0.03, brass, -1.0, 1.0, -2.8));
  const lamp = new THREE.PointLight(0xffc98a, 30, 9, 2); lamp.position.set(-1.0, 1.35, -2.8); roomG.add(lamp);
  // bookshelf (right wall)
  roomG.add(box(0.4, 3.0, 6, std(0x141210, { roughness: 0.7 }), 8.75, 1.5, 2));
  const books = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.26, 0.05), std(0x6a4a3a), 160);
  const rnd = mulberry32(17); const m = new THREE.Matrix4(); const col = new THREE.Color();
  for (let i = 0; i < 160; i += 1) { const row = Math.floor(i / 32), k = i % 32; m.makeScale(1, 0.8 + rnd() * 0.5, 1); m.setPosition(8.55, 0.45 + row * 0.55, -0.9 + k * 0.185); books.setMatrixAt(i, m); books.setColorAt(i, col.setHSL(0.05 + rnd() * 0.12, 0.35, 0.18 + rnd() * 0.25)); }
  books.instanceMatrix.needsUpdate = true; if (books.instanceColor) books.instanceColor.needsUpdate = true; roomG.add(books);
  for (let r = 0; r < 5; r += 1) roomG.add(box(0.4, 0.04, 6, brass, 8.75, 0.36 + r * 0.55, 2));
  // lounge corner
  roomG.add(cast(box(4.2, 0.02, 3, std(0x2a2622, { roughness: 1 }), -5, 0.01, 1)));
  roomG.add(cast(box(1.0, 0.42, 1.0, leather, -6, 0.21, 0.2))); roomG.add(cast(box(1.0, 0.42, 1.0, leather, -4, 0.21, 0.2)));
  roomG.add(cast(box(1.2, 0.3, 0.6, oak, -5, 0.15, 1.8)));
  roomG.add(box(1.6, 1.1, 0.04, std(0x2c3340, { roughness: 0.6 }), -5, 1.9, 7.95)); roomG.add(box(1.7, 1.2, 0.02, brass, -5, 1.9, 7.97));
  const spot = new THREE.SpotLight(0xffe0bd, 40, 12, 0.7, 0.6, 1.6); spot.position.set(0, 3.3, -1.5); spot.target.position.set(0, 0.8, -2.6); spot.castShadow = q.shadows; spot.shadow.mapSize.set(q.shadowSize / 2, q.shadowSize / 2); roomG.add(spot, spot.target);
  roomG.add(new THREE.HemisphereLight(0x3a4a66, 0x0c0a08, 0.55));
  const moon = new THREE.DirectionalLight(0x7d92c0, 0.7); moon.position.set(-20, 30, -60); moon.target.position.set(0, 0, 0); roomG.add(moon, moon.target);
  // the city below at dusk
  g.add(makeCity({ n: q.cityN, spacing: 40, hMin: 10, hMax: 150, seed: 11, lights: q.lights * 1.6, color: 0x0f131b, glow: 0xffd6a2, glowSize: 3 }));
  g.children[1].position.set(0, 0, -600);
  g.add(makeClouds({ count: Math.round(q.clouds / 5), x: [-1500, 1500], y: [330, 420], z: [-1800, -500], scale: [400, 900], color: 0x6a4a5a, opacity: [0.2, 0.45], seed: 41 }));
  return {
    group: g, fov: 60,
    path: new THREE.CatmullRomCurve3([new THREE.Vector3(-2.5, 171.6, 6.8), new THREE.Vector3(-4, 171.65, 2.5), new THREE.Vector3(-1.2, 171.6, -1.2), new THREE.Vector3(1.6, 171.55, -4.4), new THREE.Vector3(0.6, 171.7, -6.9), new THREE.Vector3(0, 171.8, -9.5)]),
    look: new THREE.CatmullRomCurve3([new THREE.Vector3(0, 171.3, -2.6), new THREE.Vector3(0, 171.2, -2.6), new THREE.Vector3(1, 171.2, -3), new THREE.Vector3(-3, 171.4, -20), new THREE.Vector3(0, 170.4, -60), new THREE.Vector3(0, 150, -160)]),
    sky: { top: [0.02, 0.04, 0.12], horizon: [0.50, 0.28, 0.22], bottom: [0.04, 0.04, 0.08], sunDir: [-0.55, 0.02, -1], sunColor: [1.0, 0.6, 0.4], sunPower: 0.7, haze: 1.4 },
    fog: { color: [0.10, 0.09, 0.15], density: 0.0007 }, stars: 0.55, sunSprite: 0.0, exposure: 1.05,
    update() {},
  };
}

function chapterStudy(q) {
  const g = new THREE.Group();
  const grid = new THREE.GridHelper(140, 70, GOLD, 0x3d3325); grid.material.transparent = true; grid.material.opacity = 0.35; g.add(grid);
  // the house as solid meshes (very faint) + sorted glowing edges
  const parts = [];
  const add = (geo, x, y, z) => { const mm = new THREE.Mesh(geo); mm.position.set(x, y, z); mm.updateMatrix(); parts.push(mm); };
  add(new THREE.BoxGeometry(12, 6, 9), 0, 3, 0);
  const tri = new THREE.Shape(); tri.moveTo(-6.6, 0); tri.lineTo(6.6, 0); tri.lineTo(0, 3.4); tri.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(tri, { depth: 10.2, bevelEnabled: false }); roofGeo.translate(0, 0, -5.1);
  add(roofGeo, 0, 6, 0);
  add(new THREE.BoxGeometry(1, 2.6, 1), 3.6, 7.6, -2);
  [[-4, 2, 4.55], [-1.5, 2, 4.55], [1.5, 2, 4.55], [4, 2, 4.55], [-4, 4.6, 4.55], [4, 4.6, 4.55]].forEach((p) => add(new THREE.BoxGeometry(1.6, 1.7, 0.16), p[0], p[1], p[2]));
  add(new THREE.BoxGeometry(1.2, 2.4, 0.16), -1.5, 1.2, 4.55);
  add(new THREE.BoxGeometry(6, 0.3, 2.2), 0, 0.15, 5.6);
  add(new THREE.BoxGeometry(0.2, 3, 0.2), -2.6, 1.6, 6.5); add(new THREE.BoxGeometry(0.2, 3, 0.2), 2.6, 1.6, 6.5);
  add(new THREE.BoxGeometry(6.2, 0.2, 2.6), 0, 3.1, 5.6);
  const solidMat = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const solids = new THREE.Group(); parts.forEach((p) => { const s = new THREE.Mesh(p.geometry, solidMat); s.position.copy(p.position); solids.add(s); }); g.add(solids);
  const segs = []; const v = new THREE.Vector3(), v2 = new THREE.Vector3();
  parts.forEach((p) => { const e = new THREE.EdgesGeometry(p.geometry, 12); const a = e.attributes.position.array; for (let i = 0; i < a.length; i += 6) { const p1 = v.set(a[i], a[i + 1], a[i + 2]).applyMatrix4(p.matrix).toArray(); const p2 = v2.set(a[i + 3], a[i + 4], a[i + 5]).applyMatrix4(p.matrix).toArray(); segs.push({ y: (p1[1] + p2[1]) / 2, p1, p2 }); } e.dispose(); });
  segs.sort((a, b) => a.y - b.y);
  const arr = new Float32Array(segs.length * 6); segs.forEach((s, i) => { arr.set(s.p1, i * 6); arr.set(s.p2, i * 6 + 3); });
  const edgeGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: CHAMPAGNE, transparent: true, opacity: 0.95 })); g.add(edges);
  const totalVerts = segs.length * 2;
  // scanning plane
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), new THREE.MeshBasicMaterial({ color: CHAMPAGNE, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false })); scan.rotation.x = -Math.PI / 2; g.add(scan);
  const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, 0, -10), new THREE.Vector3(12, 0, -10), new THREE.Vector3(12, 0, 10), new THREE.Vector3(-12, 0, 10)]), new THREE.LineBasicMaterial({ color: CHAMPAGNE, transparent: true, opacity: 0.6 })); g.add(ring);
  // dust
  const rnd = mulberry32(5); const dust = []; for (let i = 0; i < 500; i += 1) dust.push((rnd() - 0.5) * 60, rnd() * 16, (rnd() - 0.5) * 60);
  const dustPts = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(dust, 3)), new THREE.PointsMaterial({ color: CHAMPAGNE, size: 0.12, transparent: true, opacity: 0.45, depthWrite: false })); g.add(dustPts);
  g.add(new THREE.HemisphereLight(0x223040, 0x000000, 0.4));
  const anchors = [
    { key: 'foundations', pos: new THREE.Vector3(6.2, 0.4, 4.6), at: 0.05 },
    { key: 'walls', pos: new THREE.Vector3(6.2, 2.6, -1), at: 0.35 },
    { key: 'roof', pos: new THREE.Vector3(0, 8.8, 1), at: 0.85 },
  ];
  return {
    group: g, fov: 56, anchors,
    path: new THREE.CatmullRomCurve3([new THREE.Vector3(18, 3.2, 18), new THREE.Vector3(21, 4.5, 3), new THREE.Vector3(14, 6.5, -15), new THREE.Vector3(-5, 7.5, -20), new THREE.Vector3(-18, 5.2, -6), new THREE.Vector3(-15, 3.4, 12)]),
    look: new THREE.CatmullRomCurve3([new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 2.8, 0), new THREE.Vector3(0, 3.6, 0), new THREE.Vector3(0, 3.8, 0), new THREE.Vector3(0, 3.2, 0), new THREE.Vector3(0, 2.6, 0)]),
    sky: { top: [0.015, 0.02, 0.045], horizon: [0.05, 0.055, 0.085], bottom: [0.01, 0.012, 0.02], sunDir: [0, 1, 0], sunColor: [0, 0, 0], sunPower: 0, haze: 0 },
    fog: { color: [0.02, 0.025, 0.045], density: 0.012 }, stars: 0.2, sunSprite: 0.0, exposure: 1.1,
    scanProgress: 0,
    update(t, time) {
      const build = smooth(0.08, 0.72, t);
      edgeGeo.setDrawRange(0, Math.floor(totalVerts * build));
      solidMat.opacity = 0.05 * build;
      const sy = 0.2 + 9.2 * smooth(0.12, 0.8, t); scan.position.y = sy; ring.position.y = sy;
      this.scanProgress = smooth(0.12, 0.8, t);
      dustPts.rotation.y = time * 0.02;
    },
  };
}

function chapterBridge(q) {
  const g = new THREE.Group();
  const steel = std(0x2b2f38, { roughness: 0.7, metalness: 0.4 }), asphalt = std(0x1e2128, { roughness: 0.95 });
  g.add(box(20, 1.4, 760, asphalt, 0, 0, 0));
  g.add(box(0.35, 1.0, 760, steel, -9.8, 1.2, 0)); g.add(box(0.35, 1.0, 760, steel, 9.8, 1.2, 0));
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.02, 3.2), new THREE.MeshBasicMaterial({ color: 0xe8d7b0 }), 70);
  const m = new THREE.Matrix4(); for (let i = 0; i < 70; i += 1) { m.makeTranslation(0, 0.72, -370 + i * 10.8); dashes.setMatrixAt(i, m); } dashes.instanceMatrix.needsUpdate = true; g.add(dashes);
  // towers
  [-175, 175].forEach((z) => {
    [-9, 9].forEach((x) => g.add(box(4, 150, 10, steel, x, 5, z)));
    [45, 95, 140].forEach((y) => g.add(box(22, 4, 4, steel, 0, y, z)));
  });
  // cables (piecewise: parabola between towers, straight approach spans)
  const cableY = (z) => { const a = Math.abs(z); if (a <= 175) return 34 + (140 - 34) * Math.pow(z / 175, 2); return 140 - (140 - 2) * Math.min(1, (a - 175) / 195); };
  const cableMat = std(0xC9A96E, { roughness: 0.4, metalness: 0.7, emissive: 0x4a3a1e, emissiveIntensity: 0.6 });
  const hangers = [];
  [-9.4, 9.4].forEach((x) => {
    const pts = []; for (let z = -370; z <= 370; z += 10) pts.push(new THREE.Vector3(x, cableY(z), z));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.45, 6, false), cableMat));
    for (let z = -350; z <= 350; z += 10) { if (Math.abs(Math.abs(z) - 175) < 6) continue; hangers.push(x, cableY(z), z, x, 1.6, z); }
  });
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(hangers, 3)), new THREE.LineBasicMaterial({ color: 0xC9A96E, transparent: true, opacity: 0.5 })));
  // lamps
  const bulbs = []; const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 6), steel, 64); let pi = 0;
  for (let z = -360; z <= 360; z += 24) { [-9.3, 9.3].forEach((x) => { bulbs.push(x, 6.2, z); m.makeTranslation(x, 3.5, z); posts.setMatrixAt(pi, m); pi += 1; }); }
  posts.count = pi; posts.instanceMatrix.needsUpdate = true; g.add(posts);
  g.add(makeBulbs(bulbs, { color: 0xffdca8, size: 2.4, halo: 16, haloOpacity: 0.32 }));
  const refl = bulbs.slice(); for (let i = 1; i < refl.length; i += 3) refl[i] = -70 - (refl[i] + 70);
  const reflPts = makeBulbs(refl, { color: 0xffdca8, size: 3, halo: 20, haloOpacity: 0.18 }); reflPts.children[0].material.opacity = 0.35; g.add(reflPts);
  for (let z = -300; z <= 300; z += 120) { const pl = new THREE.PointLight(0xffd7a8, 60, 70, 2); pl.position.set(0, 7, z); g.add(pl); }
  // water and the far city
  const water = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), std(0x071019, { roughness: 0.2, metalness: 0.5 })); water.rotation.x = -Math.PI / 2; water.position.y = -70; g.add(water);
  const far = makeCity({ n: 30, spacing: 34, hMin: 10, hMax: 140, seed: 23, lights: q.lights * 1.4, color: 0x0b0e14, glow: 0xffd0a0, glowSize: 4 }); far.position.set(0, -40, -1500); g.add(far);
  const cityGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xf2b070, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); cityGlow.scale.set(1400, 420, 1); cityGlow.position.set(0, 40, -1450); g.add(cityGlow);
  g.add(new THREE.HemisphereLight(0x2a3a58, 0x05070c, 0.55));
  const moon = new THREE.DirectionalLight(0x8ea0c8, 0.5); moon.position.set(200, 400, 100); moon.target.position.set(0, 0, 0); g.add(moon, moon.target);
  return {
    group: g, fov: 60,
    path: new THREE.CatmullRomCurve3([new THREE.Vector3(0, 4.6, 340), new THREE.Vector3(-4, 5.8, 150), new THREE.Vector3(3.5, 6.8, -30), new THREE.Vector3(-2.5, 5.2, -190), new THREE.Vector3(0, 4.6, -345)]),
    look: new THREE.CatmullRomCurve3([new THREE.Vector3(0, 30, -400), new THREE.Vector3(2, 40, -600), new THREE.Vector3(-2, 45, -800), new THREE.Vector3(0, 50, -1000), new THREE.Vector3(0, 60, -1400)]),
    sky: { top: [0.008, 0.015, 0.04], horizon: [0.10, 0.09, 0.17], bottom: [0.01, 0.01, 0.02], sunDir: [0, 0.05, -1], sunColor: [0.9, 0.6, 0.35], sunPower: 0.25, haze: 1.6 },
    fog: { color: [0.03, 0.04, 0.08], density: 0.00115 }, stars: 1.0, sunSprite: 0.0, exposure: 1.1,
    update(t, time) { cityGlow.material.opacity = 0.5 + Math.sin(time * 0.8) * 0.05; },
  };
}

function chapterTerrace(q) {
  const g = new THREE.Group();
  const stone = std(0x8f877a, { roughness: 0.85 }), charcoal = std(0x26272b, { roughness: 0.8 }), cream = std(0xe9e1d2, { roughness: 0.9 }), teak = std(0x5a3f28, { roughness: 0.6 });
  const cast = (o) => { o.castShadow = true; o.receiveShadow = true; return o; };
  const slab = box(46, 1, 34, stone, 0, -0.5, 0); slab.receiveShadow = true; g.add(slab);
  // balustrade
  g.add(box(46, 0.08, 0.08, std(0xC9A96E, { metalness: 0.8, roughness: 0.3 }), 0, 1.06, -17));
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 1.05, 0.05), charcoal, 96); const m = new THREE.Matrix4();
  for (let i = 0; i < 96; i += 1) { m.makeTranslation(-23 + i * 0.484, 0.52, -17); posts.setMatrixAt(i, m); } posts.instanceMatrix.needsUpdate = true; g.add(posts);
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(46, 1.0), new THREE.MeshBasicMaterial({ color: 0xcfe4f5, transparent: true, opacity: 0.16, side: THREE.DoubleSide })).translateY(0.52).translateZ(-17.02));
  // pool
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), std(0x1e6b86, { roughness: 0.05, metalness: 0.2 })); pool.rotation.x = -Math.PI / 2; pool.position.set(8, 0.02, -8); g.add(pool);
  const coping = std(0xd9d0c0, { roughness: 0.9 });
  g.add(box(16.6, 0.08, 0.3, coping, 8, 0.04, -12.15)); g.add(box(16.6, 0.08, 0.3, coping, 8, 0.04, -3.85)); g.add(box(0.3, 0.08, 8.6, coping, -0.15, 0.04, -8)); g.add(box(0.3, 0.08, 8.6, coping, 16.15, 0.04, -8));
  const poolStreak = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffd8a0, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })); poolStreak.scale.set(5, 14, 1); poolStreak.position.set(9, 0.1, -8); g.add(poolStreak);
  // loungers
  for (let i = 0; i < 3; i += 1) { const x = 2 + i * 2.2; g.add(cast(box(0.8, 0.3, 2.0, teak, x, 0.3, -1.4))); g.add(cast(box(0.8, 0.12, 2.0, cream, x, 0.5, -1.4))); g.add(cast(box(0.8, 0.7, 0.12, cream, x, 0.8, -0.44))); }
  // sofa set under the pergola
  g.add(cast(box(3.4, 0.45, 1.0, charcoal, -10, 0.25, 4))); g.add(cast(box(3.4, 0.5, 0.3, charcoal, -10, 0.72, 4.4))); g.add(cast(box(3.2, 0.12, 0.9, cream, -10, 0.5, 3.95)));
  g.add(cast(box(1.0, 0.45, 1.0, charcoal, -13, 0.25, 1.5))); g.add(cast(box(1.0, 0.45, 1.0, charcoal, -7, 0.25, 1.5)));
  g.add(cast(box(1.4, 0.34, 0.8, std(0x141414, { roughness: 0.3 }), -10, 0.17, 1.6)));
  const wood = std(0x3a2a1c, { roughness: 0.8 });
  [[-14, 6.5], [-6, 6.5], [-14, -0.5], [-6, -0.5]].forEach((p) => g.add(box(0.22, 3.0, 0.22, wood, p[0], 1.5, p[1])));
  g.add(box(8.6, 0.18, 0.22, wood, -10, 3.05, 6.5)); g.add(box(8.6, 0.18, 0.22, wood, -10, 3.05, -0.5));
  const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.1, 7.4), wood, 20); for (let i = 0; i < 20; i += 1) { m.makeTranslation(-14 + i * 0.42, 3.2, 3); slats.setMatrixAt(i, m); } slats.instanceMatrix.needsUpdate = true; g.add(slats);
  // planters, olives, cypress
  const leaf = std(0x3b4a34, { roughness: 0.95 }), pot = std(0x2b2b2e, { roughness: 0.7 });
  [[-19, -12], [-19, 10], [20, 10], [20, -12], [-2, 12], [12, 12]].forEach((p) => { g.add(cast(box(1.3, 1.0, 1.3, pot, p[0], 0.5, p[1]))); g.add(box(0.12, 1.6, 0.12, wood, p[0], 1.8, p[1])); g.add(cast(new THREE.Mesh(new THREE.SphereGeometry(1.0, 10, 10), leaf).translateX(p[0]).translateY(2.9).translateZ(p[1]))); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 10), leaf).translateX(p[0] + 0.6).translateY(2.5).translateZ(p[1] - 0.4)); });
  const cyp = std(0x1f2b1f, { roughness: 0.95 });
  [[-22, -16], [22, -16], [-22, 16], [22, 16]].forEach((p) => g.add(cast(new THREE.Mesh(new THREE.ConeGeometry(0.9, 7, 8), cyp).translateX(p[0]).translateY(3.5).translateZ(p[1]))));
  // string lights
  const bulbs = []; for (let i = 0; i <= 30; i += 1) { const u = i / 30; const x = -16 + u * 32; const y = 3.3 - Math.sin(u * Math.PI) * 1.1; bulbs.push(x, y, -13.5); }
  g.add(makeBulbs(bulbs, { color: 0xffe0b0, size: 0.35, halo: 2.2, haloOpacity: 0.45 }));
  g.add(new THREE.Line(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(bulbs, 3)), new THREE.LineBasicMaterial({ color: 0x2a2a2e })));
  g.add(box(0.1, 3.4, 0.1, charcoal, -16, 1.7, -13.5)); g.add(box(0.1, 3.4, 0.1, charcoal, 16, 1.7, -13.5));
  // sea, far coast and clouds
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), std(0x2a5f7c, { roughness: 0.1, metalness: 0.35 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -40; g.add(sea);
  const seaStreak = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffcf90, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); seaStreak.scale.set(160, 1100, 1); seaStreak.position.set(60, -38, -1000); g.add(seaStreak);
  const coast = std(0x2a2430, { roughness: 1 }); g.add(box(1600, 60, 200, coast, -900, -10, -2200)); g.add(box(1200, 90, 200, coast, 1100, 5, -2400));
  g.add(makeClouds({ count: Math.round(q.clouds / 4), x: [-1800, 1800], y: [160, 300], z: [-2600, -900], scale: [400, 900], color: 0xffc9a0, opacity: [0.25, 0.55], seed: 51 }));
  g.add(new THREE.HemisphereLight(0xffe2c2, 0x5a4a3a, 0.85));
  const sun = new THREE.DirectionalLight(0xffc48a, 2.8); sun.position.set(30, 7, -120); sun.target.position.set(0, 0, 0);
  sun.castShadow = q.shadows; sun.shadow.mapSize.set(q.shadowSize, q.shadowSize); sun.shadow.camera.left = -26; sun.shadow.camera.right = 26; sun.shadow.camera.top = 22; sun.shadow.camera.bottom = -22; sun.shadow.camera.near = 60; sun.shadow.camera.far = 200; sun.shadow.bias = -0.0008;
  g.add(sun, sun.target);
  return {
    group: g, fov: 60,
    path: new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.6, 15), new THREE.Vector3(1.5, 1.7, 8.5), new THREE.Vector3(-2.5, 1.6, 2.5), new THREE.Vector3(-4.5, 1.65, -6), new THREE.Vector3(-2, 1.7, -12), new THREE.Vector3(0, 1.75, -15)]),
    look: new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.5, -6), new THREE.Vector3(-5, 1.4, -9), new THREE.Vector3(6, 1.0, -9), new THREE.Vector3(2, 1.5, -30), new THREE.Vector3(0, 2.2, -100), new THREE.Vector3(0, 3.5, -200)]),
    sky: { top: [0.10, 0.18, 0.36], horizon: [1.0, 0.70, 0.38], bottom: [0.24, 0.20, 0.18], sunDir: [0.15, 0.045, -1], sunColor: [1.0, 0.82, 0.58], sunPower: 1.7, haze: 1.2 },
    fog: { color: [0.92, 0.66, 0.44], density: 0.00085 }, stars: 0.0, sunSprite: 1.4, exposure: 1.0,
    update(t, time) { poolStreak.material.opacity = 0.4 + Math.sin(time * 1.1) * 0.1; seaStreak.material.opacity = 0.45 + Math.sin(time * 0.7) * 0.06; },
  };
}

/* ---------- the world ---------- */
function create(canvas, quality) {
  const q = Object.assign({ dpr: 1.5, shadows: true, shadowSize: 2048, clouds: 150, cityN: 50, lights: 1, antialias: true }, quality || {});
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: q.antialias, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.dpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = q.shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 12000);
  const skyMat = new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false, uniforms: {
    uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uBottom: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunColor: { value: new THREE.Color() }, uSunPower: { value: 1 }, uHaze: { value: 1 },
  } });
  skyMat.toneMapped = false;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 16), skyMat); sky.renderOrder = -10; scene.add(sky);
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xfff1d6, transparent: true, opacity: 0.95, depthWrite: false, fog: false })); sunSprite.scale.set(420, 420, 1); scene.add(sunSprite);
  const sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffc890, transparent: true, opacity: 0.35, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); sunHalo.scale.set(1500, 1500, 1); scene.add(sunHalo);
  const rnd = mulberry32(99); const starPos = []; for (let i = 0; i < 1400; i += 1) { const th = rnd() * Math.PI * 2, ph = Math.acos(rnd() * 0.96 + 0.04); starPos.push(Math.sin(ph) * Math.cos(th) * 4500, Math.cos(ph) * 4500, Math.sin(ph) * Math.sin(th) * 4500); }
  const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3)), new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })); scene.add(stars);
  scene.fog = new THREE.FogExp2(0x000000, 0.0005);

  const chapters = [chapterArrival(q), chapterResidence(q), chapterOffice(q), chapterStudy(q), chapterBridge(q), chapterTerrace(q)];
  chapters.forEach((c, i) => { c.group.position.x = i * CHAPTER_GAP; c.group.visible = i === 0; scene.add(c.group); c.length = c.path.getLength(); });

  const state = { progress: 0, active: -1, t: 0, pointer: { x: 0, y: 0 }, raf: 0, disposed: false, width: 1, height: 1 };
  const clock = new THREE.Clock();
  const tmpPos = new THREE.Vector3(), tmpLook = new THREE.Vector3(), sunDir = new THREE.Vector3();

  function applyChapter(i) {
    const c = chapters[i];
    chapters.forEach((ch, k) => { ch.group.visible = k === i; });
    const s = c.sky;
    skyMat.uniforms.uTop.value.setRGB(...s.top); skyMat.uniforms.uHorizon.value.setRGB(...s.horizon); skyMat.uniforms.uBottom.value.setRGB(...s.bottom);
    skyMat.uniforms.uSunDir.value.set(...s.sunDir).normalize(); skyMat.uniforms.uSunColor.value.setRGB(...s.sunColor); skyMat.uniforms.uSunPower.value = s.sunPower; skyMat.uniforms.uHaze.value = s.haze;
    scene.fog.color.setRGB(...c.fog.color); scene.fog.density = c.fog.density;
    stars.material.opacity = c.stars;
    sunSprite.visible = c.sunSprite > 0; sunHalo.visible = c.sunSprite > 0;
    sunSprite.scale.set(420 * c.sunSprite, 420 * c.sunSprite, 1); sunHalo.scale.set(1500 * c.sunSprite, 1500 * c.sunSprite, 1);
    renderer.toneMappingExposure = c.exposure;
    camera.fov = c.fov * (state.height > state.width ? 1.28 : 1); camera.updateProjectionMatrix();
    state.active = i;
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    state.width = w; state.height = h;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    if (state.active >= 0) camera.fov = chapters[state.active].fov * (h > w ? 1.28 : 1);
    camera.updateProjectionMatrix();
  }

  function frame() {
    if (state.disposed) return;
    state.raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const time = clock.getElapsedTime();
    const N = chapters.length;
    const scaled = clamp01(state.progress) * N;
    const i = Math.min(N - 1, Math.floor(scaled));
    const t = clamp01(scaled - i);
    if (i !== state.active) applyChapter(i);
    const c = chapters[i]; state.t = t;
    c.path.getPointAt(t, tmpPos); c.look.getPointAt(t, tmpLook);
    const sway = c.length * 0.00035;
    tmpPos.y += Math.sin(time * 0.7) * sway; tmpPos.x += Math.cos(time * 0.5) * sway * 0.6;
    tmpPos.x += c.group.position.x; tmpLook.x += c.group.position.x;
    camera.position.copy(tmpPos); camera.lookAt(tmpLook);
    camera.rotateY(-state.pointer.x * 0.035); camera.rotateX(-state.pointer.y * 0.025);
    sky.position.copy(camera.position);
    sunDir.copy(skyMat.uniforms.uSunDir.value).multiplyScalar(3600);
    sunSprite.position.copy(camera.position).add(sunDir); sunHalo.position.copy(sunSprite.position);
    stars.position.copy(camera.position);
    c.update(t, time);
    renderer.render(scene, camera);
  }

  const onPointer = (e) => { if (e.pointerType === 'touch') return; state.pointer.x = (e.clientX / window.innerWidth - 0.5) * 2; state.pointer.y = (e.clientY / window.innerHeight - 0.5) * 2; };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('resize', resize);
  resize(); applyChapter(0); frame();

  const api = {
    chapterCount: chapters.length,
    setProgress(p) { state.progress = p; },
    getProgress() { return state.progress; },
    chapter() { return state.active; },
    localT() { return state.t; },
    scanProgress() { const c = chapters[state.active]; return c && c.scanProgress != null ? c.scanProgress : 0; },
    anchors(i) { return chapters[i].anchors || []; },
    project(v) {
      const c = chapters[state.active]; const p = v.clone(); p.x += c.group.position.x; p.project(camera);
      return { x: (p.x + 1) / 2 * state.width, y: (1 - p.y) / 2 * state.height, visible: p.z < 1 && Math.abs(p.x) < 1.1 && Math.abs(p.y) < 1.1 };
    },
    resize,
    dispose() {
      state.disposed = true; cancelAnimationFrame(state.raf);
      window.removeEventListener('pointermove', onPointer); window.removeEventListener('resize', resize);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []); mats.forEach((mm) => { Object.values(mm).forEach((val) => { if (val && val.isTexture) val.dispose(); }); mm.dispose(); }); });
      renderer.dispose();
    },
  };
  return api;
}

window.NorvexWorld = { create, THREE };
document.dispatchEvent(new CustomEvent('norvex:world-ready'));
