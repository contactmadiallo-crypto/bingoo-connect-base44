import React from 'react';

const NAVY = '#0b2149', ORANGE = '#f97316';

// ── Core Infinity Mark ──
// The "oo" in Bingoo rendered as the infinity symbol — the official brand mark.
export function InfinityMark({ size = 24, color = ORANGE, strokeWidth = 2.5, fill = 'none', glow = false, className = '' }) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 48 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={glow ? { filter: `drop-shadow(0 0 ${size * 0.15}px ${color}88)` } : {}}
    >
      <path d="M 14 12 C 14 6 20 6 24 12 C 28 18 34 18 34 12 C 34 6 28 6 24 12 C 20 18 14 18 14 12 Z" />
    </svg>
  );
}

// ── Bingoo Connect Logo ──
// Always renders "Bing" + infinity "oo" + "CONNECT" — the full brand never reads as "Bing" alone.
// The infinity mark replaces the final "oo" in "Bingoo", and CONNECT is always shown below.
//
// Props:
//   size:       text size key ('text-sm' ... 'text-4xl')
//   light:      white text for dark backgrounds
//   stacked:    CONNECT below wordmark (default true — official brand context)
//   showIcon:   optional infinity mark badge to the left of the wordmark
export function BingooLogo({ size = 'text-xl', light = false, stacked = true, showIcon = false }) {
  const sizeMap = { 'text-sm': 14, 'text-base': 16, 'text-lg': 18, 'text-xl': 20, 'text-2xl': 24, 'text-3xl': 30, 'text-4xl': 36 };
  const px = sizeMap[size] || 20;
  const textColor = light ? '#FFFFFF' : NAVY;
  const infinityColor = light ? '#FFFFFF' : ORANGE;
  const connectColor = light ? 'rgba(255,255,255,0.55)' : `${ORANGE}`;

  // Wordmark: "Bing" + infinity mark (the "oo")
  const wordmark = (
    <div className="flex items-baseline gap-0">
      <span className={`font-black ${size} tracking-tight leading-none`} style={{ color: textColor }}>Bing</span>
      <div className="flex items-center" style={{ marginLeft: -1, marginBottom: px * 0.14 }}>
        <InfinityMark size={px * 1.15} color={infinityColor} strokeWidth={2.5} glow={!light} />
      </div>
    </div>
  );

  // CONNECT label — always present so the brand reads "Bingoo Connect"
  const connectLabel = (
    <span className="font-bold tracking-[0.25em] uppercase leading-none" style={{ color: connectColor, fontSize: Math.max(px * 0.3, 8) }}>
      Connect
    </span>
  );

  // Optional infinity badge icon (for app icon / avatar contexts)
  const iconBadge = showIcon && (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        width: px * 1.8, height: px * 1.8,
        background: `linear-gradient(135deg, ${NAVY}, #061530)`,
        boxShadow: `0 2px 8px ${NAVY}33, inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
    >
      <InfinityMark size={px * 0.9} color={ORANGE} strokeWidth={px * 0.12} glow={true} />
    </div>
  );

  if (stacked) {
    return (
      <div className="flex items-center gap-2.5">
        {iconBadge}
        <div className="flex flex-col items-center leading-none">
          {wordmark}
          <div style={{ marginTop: 1 }}>{connectLabel}</div>
        </div>
      </div>
    );
  }

  // Inline variant: wordmark + CONNECT on the same line (tighter spaces)
  return (
    <div className="flex items-center gap-2.5">
      {iconBadge}
      <div className="flex items-baseline gap-1.5">
        {wordmark}
        <span className="font-bold tracking-[0.2em] uppercase" style={{ color: connectColor, fontSize: Math.max(px * 0.35, 9) }}>
          Connect
        </span>
      </div>
    </div>
  );
}

export default BingooLogo;