/**
 * SVG fallback drone.
 *
 * Rendered instead of the WebGL scene when the GPU/context is unavailable.
 * Everything animates with SMIL/CSS only, so it costs nothing on the main
 * thread and still reads as "a machine holding position".
 */
export default function DroneSVG({ reduce = false }) {
  const dur = (s) => (reduce ? '0s' : s)

  return (
    <svg
      viewBox="0 0 520 360"
      className="h-full w-full"
      role="img"
      aria-label="Illustration of the Hornet perimeter drone hovering above an active scan ring"
    >
      <defs>
        <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2F3C" />
          <stop offset="100%" stopColor="#0E1015" />
        </linearGradient>
        <radialGradient id="lens">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#D6DCE6" />
          <stop offset="100%" stopColor="#D6DCE6" stopOpacity="0" />
        </radialGradient>
        <filter id="bloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground scan rings — staggered so one is always expanding */}
      {[0, 1.6].map((delay) => (
        <ellipse key={delay} cx="260" cy="300" rx="40" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="1.5">
          <animate attributeName="rx" values="30;170" dur={dur('3.2s')} begin={`${delay}s`} repeatCount="indefinite" />
          <animate attributeName="ry" values="9;50" dur={dur('3.2s')} begin={`${delay}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.55;0" dur={dur('3.2s')} begin={`${delay}s`} repeatCount="indefinite" />
        </ellipse>
      ))}

      {/* Whole airframe bobs as one unit */}
      <g>
        {!reduce && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 -6; 0 6; 0 -6"
            dur="4.4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            keyTimes="0;0.5;1"
          />
        )}

        {/* Arms */}
        <g stroke="#20252F" strokeWidth="9" strokeLinecap="round">
          <path d="M215 175 L130 140" />
          <path d="M305 175 L390 140" />
          <path d="M215 190 L130 225" />
          <path d="M305 190 L390 225" />
        </g>

        {/* Rotor discs: a spinning dashed circle reads as blur at any size */}
        {[
          [130, 140],
          [390, 140],
          [130, 225],
          [390, 225],
        ].map(([cx, cy], i) => (
          <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`}>
            <ellipse rx="46" ry="13" fill="#9FC4FF" opacity="0.06" />
            <g>
              <ellipse rx="44" ry="12" fill="none" stroke="#3B4250" strokeWidth="2" strokeDasharray="10 16" />
              {!reduce && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0"
                  to={i % 2 === 0 ? '360' : '-360'}
                  dur="0.7s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            <circle r="7" fill="url(#hull)" stroke="#2A2F3C" />
            <circle r="3" fill="#FFFFFF" opacity="0.9">
              {!reduce && <animate attributeName="opacity" values="0.35;1;0.35" dur="2.2s" repeatCount="indefinite" />}
            </circle>
          </g>
        ))}

        {/* Fuselage */}
        <rect x="200" y="162" width="120" height="42" rx="12" fill="url(#hull)" stroke="#2A2F3C" />
        <rect x="216" y="150" width="88" height="20" rx="8" fill="#1C202A" stroke="#2A2F3C" />
        <rect x="232" y="156" width="56" height="3" rx="1.5" fill="#FFFFFF" />

        {/* Sensor gimbal + lens bloom */}
        <circle cx="260" cy="212" r="18" fill="#0C0E13" stroke="#2A2F3C" />
        <circle cx="260" cy="212" r="9" fill="url(#lens)" filter="url(#bloom)">
          {!reduce && <animate attributeName="r" values="7;10;7" dur="2.8s" repeatCount="indefinite" />}
        </circle>
      </g>
    </svg>
  )
}
