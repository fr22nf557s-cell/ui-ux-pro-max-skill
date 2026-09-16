import { useEffect, useRef } from 'react'

/*
 * FEED SCENE — the aircraft's own camera, rendered live on a canvas.
 *
 * An oblique view down onto a garden at night: lawn, paved path, hedge,
 * fence with a gate, and the house wall at the top. A person comes through
 * the gate and walks up the path towards the house, on a loop.
 *
 * Two palettes, same geometry:
 *  - thermal: LWIR in white-hot. Warm = bright. The person is the hottest
 *    thing in frame (head > torso > limbs), the paving holds a little day
 *    heat, the hedge and lawn are cold, the house wall is warm and its
 *    windows warmer. No shadows — thermal cameras do not see them.
 *  - optical: starlight low-light. Grainy, low contrast, the person a dark
 *    figure with a faint edge, and a soft shadow on the ground.
 *
 * The tracking lock is drawn here too, from the figure's real bounding
 * box, so it follows the person exactly and zooms with the picture.
 *
 * Deliberately low resolution (384 × 240) and upscaled: a 640 × 512 thermal
 * core does not produce a crisp image, and the softness is what makes it
 * read as a sensor rather than a drawing.
 */

const W = 384
const H = 240
const FAR = 44 // y of the fence line: everything above is "far"
const LOOP = 16 // seconds for one walk from gate to house

// Depth scale: 1 at the bottom of frame, ~0.4 at the fence.
const depth = (y) => 0.4 + 0.6 * Math.max(0, Math.min(1, (y - FAR) / (H - FAR)))

// The path the person walks, in scene coords: through the gate, up the paving.
function walkPoint(t) {
  const u = (t % LOOP) / LOOP // 0 → 1
  const x = 262 - u * 70 + Math.sin(u * Math.PI * 2) * 6
  const y = FAR + 8 + u * 175
  return { x, y, u }
}

function makeNoise() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(128, 128)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 120
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return c
}

function drawGround(ctx, mode, noise, t) {
  const th = mode === 'thermal'
  // Lawn: cold and flat in thermal, mid-dark in starlight.
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, th ? '#1c1c1c' : '#2a2d33')
  g.addColorStop(1, th ? '#262626' : '#33373e')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // Lawn texture: the noise tile at low alpha, drifting slightly so it never
  // reads as a fixed pattern.
  ctx.globalAlpha = th ? 0.08 : 0.16
  ctx.drawImage(noise, -((t * 2) % 128), 0, 128, 128)
  for (let x = -128; x < W + 128; x += 128) for (let y = 0; y < H; y += 128) ctx.drawImage(noise, x + ((t * 1.5) % 128) - 128, y)
  ctx.globalAlpha = 1

  // House wall along the top, warm in thermal, with two windows.
  ctx.fillStyle = th ? '#4a4a4a' : '#1d1f24'
  ctx.fillRect(0, 0, W, FAR - 16)
  ctx.fillStyle = th ? '#8a8a8a' : '#2b2e35'
  ctx.fillRect(70, 6, 34, 18)
  ctx.fillRect(196, 6, 34, 18)
  if (th) {
    // Window glow: heat leaking through glass.
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillRect(76, 10, 22, 10)
    ctx.fillRect(202, 10, 22, 10)
  }
  // Step / threshold strip below the wall.
  ctx.fillStyle = th ? '#3a3a3a' : '#262930'
  ctx.fillRect(0, FAR - 16, W, 4)

  // Paved path: a trapezoid from the gate (top right) widening to the bottom.
  ctx.beginPath()
  ctx.moveTo(248, FAR - 12)
  ctx.lineTo(282, FAR - 12)
  ctx.lineTo(262, H)
  ctx.lineTo(126, H)
  ctx.closePath()
  ctx.fillStyle = th ? '#3b3b3b' : '#3b3f47'
  ctx.fill()
  // Paving joints
  ctx.strokeStyle = th ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 1
  for (let i = 0; i < 9; i++) {
    const y = FAR - 12 + ((i + 0.5) / 9) ** 1.6 * (H - FAR + 12)
    const s = depth(y)
    const cx = 265 - ((y - FAR) / (H - FAR)) * 70
    const half = (17 + ((y - FAR) / (H - FAR)) * 51) * 0.5 + 8
    ctx.beginPath()
    ctx.moveTo(cx - half * s * 2, y)
    ctx.lineTo(cx + half * s * 2, y)
    ctx.stroke()
  }

  // Hedge down the left: cold, lumpy.
  for (let i = 0; i < 9; i++) {
    const y = FAR + 4 + i * 24
    const s = depth(y)
    ctx.beginPath()
    ctx.ellipse(28 + Math.sin(i * 1.7) * 6, y, 30 * s + 8, 14 * s + 4, 0, 0, Math.PI * 2)
    ctx.fillStyle = th ? '#151515' : '#1a1c21'
    ctx.fill()
  }

  // Fence line with posts, and a gap for the gate where the path starts.
  ctx.strokeStyle = th ? '#5a5a5a' : '#454a54'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(60, FAR)
  ctx.lineTo(244, FAR)
  ctx.moveTo(288, FAR)
  ctx.lineTo(W, FAR)
  ctx.stroke()
  for (let x = 60; x <= W; x += 23) {
    if (x > 244 && x < 288) continue
    ctx.fillStyle = th ? '#6a6a6a' : '#50555f'
    ctx.fillRect(x - 1, FAR - 6, 2, 8)
  }
  // The open gate, swung inward.
  ctx.strokeStyle = th ? '#7a7a7a' : '#5a606b'
  ctx.beginPath()
  ctx.moveTo(244, FAR)
  ctx.lineTo(236, FAR + 22)
  ctx.stroke()
}

function drawPerson(ctx, mode, p, t) {
  const th = mode === 'thermal'
  const s = depth(p.y) * 1.15
  const swing = Math.sin(t * 5.2) // walking cycle
  const bob = Math.abs(Math.cos(t * 5.2)) * 1.2 * s

  // Proportions in scene units at s = 1.
  const headR = 5.2 * s
  const torsoW = 11 * s
  const torsoH = 17 * s
  const legL = 15 * s
  const armL = 12 * s
  const cx = p.x
  const feetY = p.y
  const hipY = feetY - legL
  const shoulderY = hipY - torsoH
  const headY = shoulderY - headR - 1.5 * s - bob

  if (!th) {
    // Ground shadow, only in optical.
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.beginPath()
    ctx.ellipse(cx + 6 * s, feetY + 1, 14 * s, 4 * s, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const limb = (x1, y1, x2, y2, w, color) => {
    ctx.strokeStyle = color
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  if (th) {
    // Heat bloom around the whole figure, then the parts hottest last.
    ctx.shadowColor = 'rgba(255,255,255,0.85)'
    ctx.shadowBlur = 7 * s
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0)'
    ctx.shadowBlur = 0
  }

  const limbColor = th ? '#b9b9b9' : '#1f2227'
  const torsoColor = th ? '#e6e6e6' : '#23262c'
  const headColor = th ? '#ffffff' : '#262930'

  // Legs
  limb(cx - 2 * s, hipY, cx - 2 * s + swing * 6 * s, feetY, 4.2 * s, limbColor)
  limb(cx + 2 * s, hipY, cx + 2 * s - swing * 6 * s, feetY, 4.2 * s, limbColor)
  // Torso
  ctx.fillStyle = torsoColor
  ctx.beginPath()
  ctx.roundRect(cx - torsoW / 2, shoulderY - bob, torsoW, torsoH + bob, 4 * s)
  ctx.fill()
  // Arms
  limb(cx - torsoW / 2, shoulderY + 2 * s - bob, cx - torsoW / 2 - 3 * s - swing * 5 * s, shoulderY + armL - bob, 3.4 * s, limbColor)
  limb(cx + torsoW / 2, shoulderY + 2 * s - bob, cx + torsoW / 2 + 3 * s + swing * 5 * s, shoulderY + armL - bob, 3.4 * s, limbColor)
  // Head
  ctx.fillStyle = headColor
  ctx.beginPath()
  ctx.arc(cx, headY, headR, 0, Math.PI * 2)
  ctx.fill()

  if (!th) {
    // Faint rim light on the figure so it separates from the lawn.
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, headY, headR, Math.PI * 1.1, Math.PI * 1.9)
    ctx.stroke()
  }
  ctx.shadowBlur = 0

  return {
    x: cx - torsoW / 2 - 8 * s,
    y: headY - headR - 3 * s,
    w: torsoW + 16 * s,
    h: feetY - (headY - headR) + 5 * s,
    range: Math.round(34 - depth(p.y) * 20), // metres, roughly
  }
}

function drawLock(ctx, box, confidence) {
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 1
  ctx.strokeRect(Math.round(box.x) + 0.5, Math.round(box.y) + 0.5, Math.round(box.w), Math.round(box.h))
  // Label chip
  const label = `HUMAN ${confidence}%`
  ctx.font = 'bold 8px "JetBrains Mono", ui-monospace, monospace'
  const tw = ctx.measureText(label).width + 8
  ctx.fillStyle = '#fff'
  ctx.fillRect(Math.round(box.x), Math.round(box.y) - 12, tw, 11)
  ctx.fillStyle = '#000'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, Math.round(box.x) + 4, Math.round(box.y) - 6.5)
  // Range, under the box
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = '8px "JetBrains Mono", ui-monospace, monospace'
  ctx.fillText(`${box.range} m`, Math.round(box.x) + Math.round(box.w) - ctx.measureText(`${box.range} m`).width, Math.round(box.y + box.h) + 8)
}

function drawGrain(ctx, mode, noise) {
  ctx.globalCompositeOperation = 'overlay'
  ctx.globalAlpha = mode === 'thermal' ? 0.22 : 0.5
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
    const ctx = canvas.getContext('2d')
    const noise = makeNoise()
    let raf = 0
    let last = 0
    let visible = true
    const t0 = performance.now()

    // Draw only while on screen. Off screen the loop parks itself and the
    // observer restarts it, so a reader further down the page pays nothing.
    const io = new IntersectionObserver(([entry]) => {
      const wasVisible = visible
      visible = entry.isIntersecting
      if (visible && !wasVisible && !paused) raf = requestAnimationFrame(frame)
    })
    io.observe(canvas)

    const frame = (now) => {
      // ~24 fps is plenty for a "sensor" and keeps the panel cheap to run.
      if (now - last < 40) {
        raf = requestAnimationFrame(frame)
        return
      }
      last = now
      const t = (now - t0) / 1000
      const m = modeRef.current

      ctx.save()
      // Hover drift: the aircraft is never perfectly still.
      ctx.translate(Math.sin(t * 0.45) * 2.5, Math.cos(t * 0.32) * 1.8)
      drawGround(ctx, m, noise, t)
      const p = walkPoint(t)
      // Fade the figure in at the gate and out at the door so the loop has no cut.
      const fade = Math.min(1, p.u * 12, (1 - p.u) * 12)
      ctx.globalAlpha = fade
      const box = drawPerson(ctx, m, p, t)
      ctx.globalAlpha = 1
      if (fade > 0.6) drawLock(ctx, box, 97 - Math.round((1 - fade) * 20))
      ctx.restore()
      drawGrain(ctx, m, noise)

      if (!paused && visible) raf = requestAnimationFrame(frame)
    }
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
