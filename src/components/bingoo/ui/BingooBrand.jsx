import React from 'react';

const NAVY = '#0b2149', ORANGE = '#f97316', ORANGE_LIGHT = '#fb923c';

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

export function BingooLogo({ size = 'text-xl', light = false, showConnect = false }) {
  const sizeMap = { 'text-sm': 14, 'text-base': 16, 'text-lg': 18, 'text-xl': 20, 'text-2xl': 24, 'text-3xl': 30 };
  const px = sizeMap[size] || 20;
  const wordmark = (
    <div className="flex items-baseline gap-0">
      <span className={`font-black ${size} tracking-tight`} style={{ color: light ? '#FFFFFF' : NAVY }}>Bing</span>
      <div className="flex items-center" style={{ marginLeft: -1, marginBottom: px * 0.12 }}>
        <InfinityMark size={px * 1.1} color={light ? '#FFFFFF' : ORANGE} strokeWidth={2.5} glow={!light} />
      </div>
    </div>
  );
  if (!showConnect) return wordmark;
  return (
    <div className="flex flex-col items-center">
      {wordmark}
      <span className="font-bold tracking-[0.3em] uppercase" style={{ color: light ? 'rgba(255,255,255,0.5)' : `${NAVY}99`, fontSize: Math.max(px * 0.28, 8), marginTop: 1 }}>Connect</span>
    </div>
  );
}

export default BingooLogo;