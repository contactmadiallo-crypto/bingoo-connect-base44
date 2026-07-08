import React from 'react';

const NAVY = '#0b2149', ORANGE = '#f97316', ORANGE_LIGHT = '#fb923c';

// ── Core Infinity Mark ──
// The last two letters "oo" of Bingoo form the infinity symbol — the official brand mark.
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

// ── Full Bingoo Wordmark ──
// "Bing" + infinity mark replacing "oo"
export function BingooWordmark({ size = 'text-xl', textColor = NAVY, infinityColor = ORANGE, fontWeight = 'black', light = false, showConnect = false }) {
  const sizeMap = { 'text-sm': 14, 'text-base': 16, 'text-lg': 18, 'text-xl': 20, 'text-2xl': 24, 'text-3xl': 30, 'text-4xl': 36 };
  const px = sizeMap[size] || 20;
  const wordmark = (
    <div className="flex items-baseline gap-0">
      <span className={`font-${fontWeight} ${size} tracking-tight`} style={{ color: light ? '#FFFFFF' : textColor }}>Bing</span>
      <div className="flex items-center" style={{ marginLeft: -1, marginBottom: px * 0.12 }}>
        <InfinityMark size={px * 1.1} color={light ? '#FFFFFF' : infinityColor} strokeWidth={2.5} glow={!light} />
      </div>
    </div>
  );
  if (!showConnect) return wordmark;
  return (
    <div className="flex flex-col items-center">
      {wordmark}
      <span className="font-bold tracking-[0.3em] uppercase" style={{ color: light ? 'rgba(255,255,255,0.5)' : `${textColor}99`, fontSize: Math.max(px * 0.28, 8), marginTop: 1 }}>Connect</span>
    </div>
  );
}

// ── Loading Dots Animation ──
// Three dots "..." used as loading/welcome animation
export function LoadingDots({ color = ORANGE, size = 8, className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: size, height: size, background: color,
            animation: `bingoo-dot-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bingoo-dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── App Icon / Favicon Concept ──
// Square icon with gradient background + infinity mark
export function BingooAppIcon({ size = 48, rounded = true, glow = true, imageUrl = null }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="Bingoo" style={{ width: size, height: size }} className={rounded ? 'rounded-xl' : ''} />;
  }
  return (
    <div
      className={`${rounded ? 'rounded-2xl' : ''} flex items-center justify-center relative overflow-hidden`}
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${NAVY}, #071A3D)`,
        boxShadow: glow ? `0 ${size * 0.1}px ${size * 0.3}px ${NAVY}44, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
      }}
    >
      <div className="absolute top-0 right-0 rounded-full opacity-30" style={{ width: size * 0.6, height: size * 0.6, background: ORANGE, filter: `blur(${size * 0.3}px)` }} />
      <InfinityMark size={size * 0.55} color={ORANGE} strokeWidth={size * 0.08} glow={true} className="relative z-10" />
    </div>
  );
}

// ── NFC Stamp / Print Version ──
// Monochrome, clean lines — printable on cards, stickers, keychains
export function BingooStamp({ size = 60, color = NAVY, showText = true, variant = 'outline' }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex items-center justify-center rounded-lg"
        style={{
          width: size, height: size,
          border: variant === 'outline' ? `1.5px solid ${color}` : 'none',
          background: variant === 'filled' ? color : 'transparent',
        }}
      >
        <InfinityMark
          size={size * 0.6}
          color={variant === 'filled' ? '#FFFFFF' : color}
          strokeWidth={size * 0.06}
          fill={variant === 'filled' ? '#FFFFFF' : 'none'}
        />
      </div>
      {showText && (
        <span className="font-black text-[8px] tracking-widest" style={{ color }}>BING∞</span>
      )}
    </div>
  );
}

// ── Logo Lockup (Icon + Wordmark) ──
export function BingooLogo({ size = 40, light = false, showText = true, imageUrl = null }) {
  return (
    <div className="flex items-center gap-2.5">
      <BingooAppIcon size={size} glow={!light} imageUrl={imageUrl} />
      {showText && <BingooWordmark size="text-xl" light={light} textColor={light ? '#FFFFFF' : NAVY} infinityColor={light ? '#FFFFFF' : ORANGE} />}
    </div>
  );
}

export default InfinityMark;