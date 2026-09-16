import { useRef, useState } from 'react'

/*
 * SITE PLAN
 *
 * The property from above: geofence, house, drive, gate, nest, the patrol
 * route with the aircraft riding it, and the contacts the aircraft knows
 * about. In `editable` mode the geofence vertices are drag handles — the
 * page promises "geofence editing with drag handles", so the mock does it.
 *
 * Coordinates are viewBox units (200 × 150). Pointer positions are mapped
 * back through the SVG's screen CTM, so dragging is exact at any size.
 */

export const DEFAULT_FENCE = [
  [18, 30],
  [120, 12],
  [186, 44],
  [190, 118],
  [126, 142],
  [24, 128],
]

export const ROUTE =
  'M 58 40 C 100 22, 150 26, 168 52 C 184 76, 176 110, 140 124 C 104 138, 52 130, 34 104 C 18 80, 26 52, 58 40 Z'

const CONTACTS = [
  { x: 46, y: 70, known: true },
  { x: 160, y: 66, known: true },
  { x: 112, y: 136, known: false, label: 'S gate' },
]

/** Ray-casting point-in-polygon. */
export function inside([px, py], poly) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

export default function SitePlan({ fence, onFenceChange, editable = false, reduce = false, airborne = false, className = '' }) {
  const svgRef = useRef(null)
  const [drag, setDrag] = useState(null)

  const toLocal = (e) => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const { x, y } = pt.matrixTransform(svg.getScreenCTM().inverse())
    return [Math.max(4, Math.min(196, x)), Math.max(4, Math.min(146, y))]
  }

  const onMove = (e) => {
    if (drag === null) return
    const next = fence.slice()
    next[drag] = toLocal(e)
    onFenceChange(next)
  }

  const flagged = CONTACTS.filter((c) => !c.known && inside([c.x, c.y], fence))
  const fenceD = fence.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ') + ' Z'

  return (
    <div className={className}>
      <svg
        ref={svgRef}
        viewBox="0 0 200 150"
        className={`w-full ${editable ? 'touch-none' : ''}`}
        role="img"
        aria-label="Site plan: geofence around the property, the house, the nest and the aircraft on its patrol route"
        onPointerMove={editable ? onMove : undefined}
        onPointerUp={editable ? () => setDrag(null) : undefined}
        onPointerLeave={editable ? () => setDrag(null) : undefined}
      >
        <defs>
          <pattern id="plan-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0H0V10" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="200" height="150" fill="url(#plan-grid)" />

        {/* Geofence */}
        <path d={fenceD} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeDasharray="4 3" />

        {/* House + drive + gate */}
        <rect x="72" y="52" width="58" height="46" rx="1.5" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
        <path d="M 101 98 L 101 142" stroke="rgba(255,255,255,0.25)" strokeWidth="6" strokeLinecap="round" />
        <text x="101" y="78" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6" fontFamily="JetBrains Mono, monospace" letterSpacing="1">
          HOUSE
        </text>
        <text x="101" y="148" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="5.5" fontFamily="JetBrains Mono, monospace">
          S GATE
        </text>

        {/* Patrol route */}
        <path d={ROUTE} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" strokeDasharray="2 2.5" />

        {/* Nest */}
        <g transform="translate(140 108)">
          <rect x="-4" y="-4" width="8" height="8" transform="rotate(45)" fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="0.9" />
          <text x="7" y="2.5" fill="rgba(255,255,255,0.7)" fontSize="5.5" fontFamily="JetBrains Mono, monospace">
            NEST
          </text>
        </g>

        {/* Contacts: known ones quiet; an unknown one inside the fence pulses */}
        {CONTACTS.map((c) => {
          const flag = !c.known && inside([c.x, c.y], fence)
          return (
            <g key={c.x + ':' + c.y} transform={`translate(${c.x} ${c.y})`}>
              {flag && (
                <circle r="6" fill="none" stroke="#fff" strokeWidth="0.8" className="animate-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
              )}
              <circle r={flag ? 2.6 : 2.2} fill={flag ? '#fff' : 'rgba(255,255,255,0.4)'} />
            </g>
          )
        })}

        {/* Aircraft on route */}
        <g
          className={reduce ? '' : 'animate-patrol'}
          style={reduce ? { transform: 'translate(58px, 40px)' } : { offsetPath: `path("${ROUTE}")`, offsetRotate: 'auto' }}
        >
          <circle r="7" fill="rgba(255,255,255,0.12)" />
          <path d="M -4 -4 L 4 4 M -4 4 L 4 -4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
          <circle r="1.6" fill="#0d0f14" stroke="#fff" strokeWidth="1" />
        </g>

        {/* Fence handles, on top so they always win the pointer */}
        {fence.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            {editable && <circle r="7" fill="transparent" style={{ cursor: 'grab' }} onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(i) }} />}
            <circle
              r={editable ? 3 : 2}
              fill={drag === i ? '#fff' : '#0d0f14'}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        ))}
      </svg>

      <div className="mt-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-wide2">
        <span className="text-white/55">
          {CONTACTS.length} contacts · {flagged.length} flagged
        </span>
        <span className="text-white">{airborne ? 'Intercept' : flagged.length ? 'Patrol · alert' : 'Patrol'}</span>
      </div>
    </div>
  )
}
