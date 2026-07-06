/**
 * BingooLogo — official Bingoo Connect brand logo.
 *
 * Premium glassmorphic SVG: deep-navy gradient panel with an orange radial
 * glow, glass highlight strip, "Bing∞" wordmark (infinity = "oo"), the
 * orange+red circle cluster, orange "CONNECT" + divider, and three dots that
 * pulse left-to-right as a loading indicator.
 *
 * `BINGOO_LOGO_URL` exports the static PNG asset for favicon / PWA / OG use.
 *
 * Props:
 *  - className: sizing (height-driven, e.g. "h-12 w-12")
 *  - animated:  enable dot loading animation (default true)
 */
export const BINGOO_LOGO_URL =
  "https://media.base44.com/images/public/692bd9007b93ba81de543346/be18e28ad_image.png";

const DOT_STYLE_ID = "bingoo-logo-dots";

export default function BingooLogo({ className = "h-10 w-10", animated = true }) {
  return (
    <>
      {animated && (
        <style>{`
          @keyframes bingoo-dot-wave {
            0%, 100% { opacity: 0.2; }
            35%, 65% { opacity: 1; }
          }
          #${DOT_STYLE_ID} .bingoo-dot-1 { animation: bingoo-dot-wave 1.5s ease-in-out infinite; }
          #${DOT_STYLE_ID} .bingoo-dot-2 { animation: bingoo-dot-wave 1.5s ease-in-out infinite 0.25s; }
          #${DOT_STYLE_ID} .bingoo-dot-3 { animation: bingoo-dot-wave 1.5s ease-in-out infinite 0.5s; }
          @media (prefers-reduced-motion: reduce) {
            #${DOT_STYLE_ID} .bingoo-dot-1,
            #${DOT_STYLE_ID} .bingoo-dot-2,
            #${DOT_STYLE_ID} .bingoo-dot-3 { animation: none; opacity: 0.75; }
          }
        `}</style>
      )}
      <svg
        id={animated ? DOT_STYLE_ID : undefined}
        viewBox="0 0 200 200"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Bingoo Connect"
      >
        <defs>
          {/* Deep navy glass gradient */}
          <linearGradient id="bg-navy-glass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b2149" />
            <stop offset="55%" stopColor="#0e2755" />
            <stop offset="100%" stopColor="#13284f" />
          </linearGradient>
          {/* Orange glow bleeding from top-right */}
          <radialGradient id="orange-glow" cx="80%" cy="16%" r="58%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.30" />
            <stop offset="55%" stopColor="#f97316" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          {/* Glass specular highlight (top sheen) */}
          <linearGradient id="glass-hl" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          {/* Orange orb with subtle 3D shading */}
          <radialGradient id="orange-orb" cx="34%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </radialGradient>
        </defs>

        {/* Glassmorphic navy panel */}
        <rect x="6" y="6" width="188" height="188" rx="42" fill="url(#bg-navy-glass)" />
        <rect x="6" y="6" width="188" height="188" rx="42" fill="url(#orange-glow)" />
        <rect x="6" y="6" width="188" height="188" rx="42" fill="url(#glass-hl)" />
        {/* Hairline orange-tinted glass border */}
        <rect
          x="6.75" y="6.75" width="186.5" height="186.5" rx="41.25"
          fill="none" stroke="#f97316" strokeOpacity="0.20" strokeWidth="1.5"
        />

        {/* Circle cluster icon (top-right) */}
        <circle cx="152" cy="52" r="19" fill="url(#orange-orb)" />
        <circle cx="136" cy="45" r="9.5" fill="#e11d48" fillOpacity="0.90" />
        <circle cx="141" cy="63" r="7.5" fill="#e11d48" fillOpacity="0.82" />

        {/* "Bing" + infinity "oo" wordmark */}
        <text
          x="100" y="120" textAnchor="middle"
          fill="#ffffff" fontSize="37" fontWeight="800"
          fontFamily="'Plus Jakarta Sans', Inter, system-ui, sans-serif"
          letterSpacing="-1"
        >
          Bing<tspan dx="1" dy="-2" fontSize="42">&#8734;</tspan>
        </text>

        {/* "CONNECT" in orange */}
        <text
          x="100" y="147" textAnchor="middle"
          fill="#f97316" fontSize="14.5" fontWeight="700"
          fontFamily="Inter, system-ui, sans-serif" letterSpacing="6"
        >
          CONNECT
        </text>

        {/* Orange divider line */}
        <rect x="62" y="156" width="76" height="3" rx="1.5" fill="#f97316" />

        {/* Three dots — animated loading wave left → right */}
        <circle
          cx="86" cy="172" r="4.5" fill="#ffffff"
          className={animated ? "bingoo-dot-1" : ""}
          style={animated ? undefined : { opacity: 0.7 }}
        />
        <circle
          cx="100" cy="172" r="4.5" fill="#ffffff"
          className={animated ? "bingoo-dot-2" : ""}
          style={animated ? undefined : { opacity: 0.7 }}
        />
        <circle
          cx="114" cy="172" r="4.5" fill="#ffffff"
          className={animated ? "bingoo-dot-3" : ""}
          style={animated ? undefined : { opacity: 0.7 }}
        />
      </svg>
    </>
  );
}