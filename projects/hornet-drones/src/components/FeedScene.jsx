import { useEffect, useRef } from 'react'

/*
 * FEED SCENE — the aircraft's own camera, rendered live on a canvas.
 *
 * A high-oblique view down onto a garden at night: lawn, paved path, hedge,
 * fence with an open gate, and the house wall at the top of frame. A person
 * comes through the gate and walks up the path towards the house, on a loop.
 *
 * What makes it read as a sensor rather than a drawing:
 *  - Thermal is rendered at half resolution and upscaled, then bloomed. A
 *    640 × 512 LWIR core at 30 m gives a soft image; sharp edges are the
 *    give-away of a fake. The person is a filled silhouette with a heat
 *    gradient (core hottest), not outlined limbs.
 *  - Optical (starlight) has heavy grain, a slight blur, an IR-illuminator
 *    hotspot in the centre of frame, and a soft ground shadow.
 *  - Hover drift, a rolling exposure flicker, and per-frame grain.
 *
 * The tracking lock is drawn from the figure's real bounding box, so it
 * follows the person exactly and zooms with the picture.
 */

const W = 384
const H = 240
const FAR = 46 // y of the fence line
const LOOP = 17 // seconds per walk from gate to house

// Depth scale: 1 at the bottom of frame, ~0.42 at the fence.
const depth = (y) => 0.42 + 0.58 * Math.max(0, Math.min(1, (y - FAR) / (H - FAR)))

// The person's track: through the gate (top right), up the paving, to the door.
function walkPoint(t) {
  const u = (t % LOOP) / LOOP
  return {
    x: 260 - u * 74 + Math.sin(u * Math.PI * 2) * 5,
    y: FAR + 10 + u * 176,
    u,
  }
}

function makeNoise(size = 128) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 80 + Math.random() * 130
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return c
}

/** Lawn texture: two octaves of noise so it has both grain and mottling. */
function makeLawn() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, 256, 256)
  const fine = makeNoise(256)
  const coarse = makeNoise(32)
  ctx.globalAlpha = 0.35
  ctx.drawImage(coarse, 0, 0, 256, 256)
  ctx.globalAlpha = 0.25
  ctx.drawImage(fine, 0, 0)
  ctx.globalAlpha = 1
  return c
}

function ground(ctx, mode, lawn, t) {
  const th = mode === 'thermal'

  // Lawn. Thermal: cold, flat, slightly warmer near the house wall. Optical:
  // mid-dark with mottling.
  ctx.fillStyle = th ? '#222' : '#2b2e34'
  ctx.fillRect(0, 0, W, H)
  ctx.globalAlpha = th ? 0.18 : 0.42
  const dx = (t * 1.2) % 256
  for (let x = -256; x < W + 256; x += 256) for (let y = -256; y < H + 256; y += 256) ctx.drawImage(lawn, x + dx, y)
  ctx.globalAlpha = 1
  if (th) {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgba(255,255,255,0.10)')
    g.addColorStop(0.35, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }

  // House wall, warm in thermal, with two windows leaking heat.
  ctx.fillStyle = th ? '#4e4e4e' : '#1c1e23'
  ctx.fillRect(0, 0, W, FAR - 18)
  for (const wx of [66, 198]) {
    ctx.fillStyle = th ? '#9a9a9a' : '#2a2d34'
    ctx.fillRect(wx, 5, 36, 19)
    if (th) {
      const g = ctx.createRadialGradient(wx + 18, 14, 2, wx + 18, 14, 22)
      g.addColorStop(0, 'rgba(255,255,255,0.55)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(wx - 6, 0, 48, 30)
    }
  }
  ctx.fillStyle = th ? '#3c3c3c' : '#24272d'
  ctx.fillRect(0, FAR - 18, W, 5)

  // Paved path: retains a little day heat, so a touch lighter than the lawn.
  ctx.beginPath()
  ctx.moveTo(246, FAR - 13)
  ctx.lineTo(284, FAR - 13)
  ctx.lineTo(266, H)
  ctx.lineTo(118, H)
  ctx.closePath()
  ctx.fillStyle = th ? '#3a3a3a' : '#383c44'
  ctx.fill()
  ctx.strokeStyle = th ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 1
  for (let i = 0; i < 10; i++) {
    const y = FAR - 13 + ((i + 0.5) / 10) ** 1.55 * (H - FAR + 13)
    const k = (y - FAR) / (H - FAR)
    const cx = 265 - k * 74
    const half = 19 + k * 55
    ctx.beginPath()
    ctx.moveTo(cx - half, y)
    ctx.lineTo(cx + half, y)
    ctx.stroke()
  }

  // Hedge down the left: cold, lumpy, overlapping ellipses.
  for (let i = 0; i < 10; i++) {
    const y = FAR + 2 + i * 22
    const s = depth(y)
    ctx.beginPath()
    ctx.ellipse(26 + Math.sin(i * 1.7) * 7, y, 32 * s + 8, 15 * s + 4, 0, 0, Math.PI * 2)
    ctx.fillStyle = th ? '#161616' : '#181a1f'
    ctx.fill()
  }

  // Fence with posts and a gap for the gate; the gate swung inward.
  ctx.strokeStyle = th ? '#5c5c5c' : '#444953'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(58, FAR)
  ctx.lineTo(242, FAR)
  ctx.moveTo(290, FAR)
  ctx.lineTo(W, FAR)
  ctx.stroke()
  ctx.fillStyle = th ? '#6c6c6c' : '#4f545e'
  for (let x = 58; x <= W; x += 23) if (x < 242 || x > 290) ctx.fillRect(x - 1, FAR - 7, 2, 9)
  ctx.strokeStyle = th ? '#7c7c7c' : '#5a606b'
  ctx.beginPath()
  ctx.moveTo(242, FAR)
  ctx.lineTo(233, FAR + 24)
  ctx.stroke()
}

/**
 * The person, as a filled silhouette. Returns the bounding box.
 *
 * Thermal draws it twice: a wide soft bloom underneath, then the body with a
 * radial heat gradient (chest hottest, extremities cooler). Optical draws a
 * dark body with a faint rim and a ground shadow.
 */
function person(ctx, mode, p, t) {
  const th = mode === 'thermal'
  const s = depth(p.y) * 1.2
  const cyc = t * 5.4
  const swing = Math.sin(cyc)
  const bob = Math.abs(Math.cos(cyc)) * 1.1 * s

  const headR = 5 * s
  const shoulderW = 15 * s
  const torsoH = 18 * s
  const legL = 16 * s
  const cx = p.x
  const feetY = p.y
  const hipY = feetY - legL
  const shoulderY = hipY - torsoH - bob
  const headY = shoulderY - headR - 1.2 * s

  const body = () => {
    // Legs: two tapered capsules with a knee bend.
    for (const side of [-1, 1]) {
      const k = swing * side
      const hipX = cx + side * 3.2 * s
      const kneeX = hipX + k * 4 * s
      const kneeY = hipY + legL * 0.5 - Math.max(0, k) * 2 * s
      const footX = hipX + k * 7 * s
      ctx.lineWidth = 5 * s
      ctx.beginPath()
      ctx.moveTo(hipX, hipY)
      ctx.lineTo(kneeX, kneeY)
      ctx.lineTo(footX, feetY)
      ctx.stroke()
    }
    // Arms: capsules swinging opposite to the legs.
    for (const side of [-1, 1]) {
      const k = -swing * side
      const sx = cx + side * (shoulderW / 2 - 1.5 * s)
      ctx.lineWidth = 4 * s
      ctx.beginPath()
      ctx.moveTo(sx, shoulderY + 3 * s)
      ctx.lineTo(sx + side * 2 * s + k * 3.5 * s, shoulderY + 10 * s)
      ctx.lineTo(sx + side * 1.5 * s + k * 6 * s, shoulderY + 15 * s)
      ctx.stroke()
    }
    // Torso: shoulders wider than hips.
    ctx.beginPath()
    ctx.moveTo(cx - shoulderW / 2, shoulderY + 2 * s)
    ctx.quadraticCurveTo(cx, shoulderY - 2 * s, cx + shoulderW / 2, shoulderY + 2 * s)
    ctx.lineTo(cx + shoulderW / 2 - 3 * s, hipY + 2 * s)
    ctx.quadraticCurveTo(cx, hipY + 4 * s, cx - shoulderW / 2 + 3 * s, hipY + 2 * s)
    ctx.closePath()
    ctx.fill()
    // Neck + head.
    ctx.fillRect(cx - 1.6 * s, headY + headR - 1, 3.2 * s, 3 * s)
    ctx.beginPath()
    ctx.arc(cx, headY, headR, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (th) {
    // Bloom: the whole figure, blurred wide and faint.
    ctx.save()
    ctx.shadowColor = 'rgba(255,255,255,0.9)'
    ctx.shadowBlur = 14 * s
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    body()
    ctx.restore()
    // Body: heat gradient centred on the chest, limbs a touch cooler.
    const g = ctx.createRadialGradient(cx, shoulderY + torsoH * 0.35, 1, cx, shoulderY + torsoH * 0.35, torsoH * 1.4)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(0.45, '#f0f0f0')
    g.addColorStop(1, '#c4c4c4')
    ctx.save()
    ctx.shadowColor = 'rgba(255,255,255,0.7)'
    ctx.shadowBlur = 3.5 * s
    ctx.fillStyle = g
    ctx.strokeStyle = '#d2d2d2'
    body()
    ctx.restore()
  } else {
    // Ground shadow from the IR illuminator, then the dark body.
    ctx.fillStyle = 'rgba(0,0,0,0.38)'
    ctx.beginPath()
    ctx.ellipse(cx + 7 * s, feetY + 1, 15 * s, 4.5 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 2 * s
    ctx.fillStyle = '#20232a'
    ctx.strokeStyle = '#1d2026'
    body()
    ctx.restore()
    // Rim light on the head and shoulder facing the illuminator.
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, headY, headR, Math.PI * 1.05, Math.PI * 1.95)
    ctx.stroke()
  }

  return {
    x: cx - shoulderW / 2 - 7 * s,
    y: headY - headR - 4 * s,
    w: shoulderW + 14 * s,
    h: feetY - (headY - headR) + 6 * s,
    range: Math.round(34 - depth(p.y) * 20),
  }
}

function lock(ctx, box, confidence) {
  const x = Math.round(box.x) + 0.5
  const y = Math.round(box.y) + 0.5
  const w = Math.round(box.w)
  const h = Math.round(box.h)
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'
  ctx.lineWidth = 1
  // Corner-only brackets read as a tracker; a full box reads as a crop.
  const c = Math.max(4, Math.min(w, h) * 0.28)
  for (const [px, py, dx, dy] of [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ]) {
    ctx.beginPath()
    ctx.moveTo(px, py + dy * c)
    ctx.lineTo(px, py)
    ctx.lineTo(px + dx * c, py)
    ctx.stroke()
  }
  const label = `HUMAN ${confidence}%`
  ctx.font = 'bold 8px "JetBrains Mono", ui-monospace, monospace'
  ctx.textBaseline = 'middle'
  const tw = ctx.measureText(label).width + 8
  ctx.fillStyle = '#fff'
  ctx.fillRect(x - 0.5, y - 13, tw, 11)
  ctx.fillStyle = '#000'
  ctx.fillText(label, x + 3.5, y - 7.5)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '8px "JetBrains Mono", ui-monospace, monospace'
  const r = `${box.range} m`
  ctx.fillText(r, x + w - ctx.measureText(r).width, y + h + 8)
}

function grain(ctx, mode, noise) {
  ctx.globalCompositeOperation = 'overlay'
  ctx.globalAlpha = mode === 'thermal' ? 0.2 : 0.55
  const ox = Math.floor(Math.random() * 128)
  const oy = Math.floor(Math.random() * 128)
  for (let x = -128; x < W; x += 128) for (let y = -128; y < H; y += 128) ctx.drawImage(noise, x + ox, y + oy)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
}

export default function FeedScene({ mode, paused = false, className = '' }) {
  const canvasRef = useRef(null)
  const modeRef = useRef(mode)
  modeRef.current = mode

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const out = canvas.getContext('2d')
    const noise = makeNoise()
    const lawn = makeLawn()
    // Scene is drawn full size, then thermal is passed through a half-size
    // buffer on the way out. That resample is the sensor's softness.
    const scene = document.createElement('canvas')
    scene.width = W
    scene.height = H
    const sctx = scene.getContext('2d')
    const low = document.createElement('canvas')
    low.width = W / 2
    low.height = H / 2
    const lctx = low.getContext('2d')

    let raf = 0
    let last = 0
    let visible = true
    const t0 = performance.now()

    const frame = (now) => {
      if (now - last < 40) {
        raf = requestAnimationFrame(frame)
        return
      }
      last = now
      const t = (now - t0) / 1000
      const m = modeRef.current
      const th = m === 'thermal'

      sctx.save()
      sctx.clearRect(0, 0, W, H)
      // Hover drift: the aircraft is never perfectly still.
      sctx.translate(Math.sin(t * 0.45) * 2.5, Math.cos(t * 0.32) * 1.8)
      ground(sctx, m, lawn, t)
      const p = walkPoint(t)
      const fade = Math.min(1, p.u * 14, (1 - p.u) * 14)
      sctx.globalAlpha = fade
      const box = person(sctx, m, p, t)
      sctx.globalAlpha = 1
      sctx.restore()

      if (th) {
        lctx.drawImage(scene, 0, 0, W / 2, H / 2)
        out.imageSmoothingEnabled = true
        out.drawImage(low, 0, 0, W, H)
      } else {
        out.drawImage(scene, 0, 0)
        // IR illuminator: a soft hotspot in the centre, falling off to the edges.
        const g = out.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.62)
        g.addColorStop(0, 'rgba(255,255,255,0.10)')
        g.addColorStop(1, 'rgba(0,0,0,0.35)')
        out.fillStyle = g
        out.fillRect(0, 0, W, H)
      }
      // Exposure flicker, barely there.
      out.fillStyle = `rgba(255,255,255,${0.012 + Math.random() * 0.018})`
      out.fillRect(0, 0, W, H)
      grain(out, m, noise)
      if (fade > 0.6) lock(out, box, 97 - Math.round((1 - fade) * 20))

      if (!paused && visible) raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([entry]) => {
      const was = visible
      visible = entry.isIntersecting
      if (visible && !was && !paused) raf = requestAnimationFrame(frame)
    })
    io.observe(canvas)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [paused])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className={className}
      role="img"
      aria-label={
        mode === 'thermal'
          ? 'Thermal view from the aircraft: a person walking up the garden path from the gate, shown white-hot'
          : 'Low-light view from the aircraft: a person walking up the garden path from the gate'
      }
    />
  )
}
