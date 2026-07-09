import React from 'react';
import { Nfc } from 'lucide-react';
import { InfinityMark } from '@/components/mockups/brand/InfinityMark';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', ORANGE_LIGHT = '#fb923c';
const BORDER = '#E5EAF2', MUTED = '#64748B';

export const PRODUCT_TYPES = [
  { id: 'card',     label: 'Card',     w: 340, h: 214, hole: false, base: false, layout: 'standard' },
  { id: 'keychain', label: 'Keychain', w: 220, h: 280, hole: true,  base: false, layout: 'standard' },
  { id: 'sticker',  label: 'Sticker',  w: 220, h: 220, hole: false, base: false, layout: 'centered' },
  { id: 'bracelet', label: 'Bracelet', w: 330, h: 140, hole: false, base: false, layout: 'horizontal' },
  { id: 'tag',      label: 'Tag',      w: 195, h: 265, hole: true,  base: false, layout: 'standard' },
  { id: 'stand',    label: 'Stand',    w: 280, h: 170, hole: false, base: true,  layout: 'standard' },
];

function isLightHex(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

// Deterministic QR pattern with proper finder squares
function QrPattern({ size = 76, darkColor = NAVY }) {
  const N = 21;
  const finders = [[0, 0], [0, N - 7], [N - 7, 0]];
  const findFinder = (r, c) => finders.find(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);
  const finderDark = (r, c, fr, fc) => {
    const lr = r - fr, lc = c - fc;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
    return false;
  };
  const dataDark = (r, c) => (r * 7 + c * 13 + r * c * 3) % 100 > 50;
  const isDark = (r, c) => {
    const f = findFinder(r, c);
    return f ? finderDark(r, c, f[0], f[1]) : dataDark(r, c);
  };
  return (
    <div style={{ width: size, height: size, display: 'grid', gridTemplateColumns: `repeat(${N}, 1fr)`, gridTemplateRows: `repeat(${N}, 1fr)`, background: '#fff', gap: 0 }}>
      {Array.from({ length: N * N }).map((_, i) => {
        const r = Math.floor(i / N), c = i % N;
        return <div key={i} style={{ background: isDark(r, c) ? darkColor : 'transparent' }} />;
      })}
    </div>
  );
}

// ── Mini 3D icons for product selector ───────────────────────────────────────
export function ProductTypeIcon({ typeId, active }) {
  const c = active ? NAVY : '#CBD5E1';
  const hl = active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.4)';
  const sh = `0 1px 2px rgba(0,0,0,0.15), inset 0 1px 0 ${hl}`;

  switch (typeId) {
    case 'card':
      return <div style={{ width: 22, height: 14, borderRadius: 3, background: c, boxShadow: sh }} />;
    case 'keychain':
      return (
        <div style={{ position: 'relative', width: 16, height: 26, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid ${c}`, marginBottom: -1 }} />
          <div style={{ width: 16, height: 18, borderRadius: '8px 8px 3px 3px / 7px 7px 3px 3px', background: c, boxShadow: sh }} />
        </div>
      );
    case 'sticker':
      return <div style={{ width: 20, height: 20, borderRadius: '50%', background: c, boxShadow: `${sh}, inset 0 -1px 1px rgba(0,0,0,0.1)` }} />;
    case 'bracelet':
      return <div style={{ width: 24, height: 10, borderRadius: 5, background: c, boxShadow: sh }} />;
    case 'tag':
      return (
        <div style={{ position: 'relative', width: 14, height: 22, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 6, height: 3, borderRadius: 1.5, background: 'rgba(0,0,0,0.25)', marginBottom: 1 }} />
          <div style={{ width: 14, height: 19, borderRadius: '3px 3px 4px 4px', background: c, boxShadow: sh }} />
        </div>
      );
    case 'stand':
      return (
        <div style={{ position: 'relative', width: 22, height: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 18, height: 14, borderRadius: 2, background: c, boxShadow: sh, marginBottom: 1 }} />
          <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: `6px solid ${c}` }} />
          <div style={{ width: 14, height: 2, borderRadius: 1, background: c }} />
        </div>
      );
    default:
      return null;
  }
}

// ── Realistic 3D product preview ─────────────────────────────────────────────
export function ProductPreview({ productType, cardColor, accentColor, logoUrl, nameText, roleText, removeBranding, side, isDark }) {
  const shape = PRODUCT_TYPES.find(p => p.id === productType) || PRODUCT_TYPES[0];
  const isFront = side === 'front';
  const light = isLightHex(cardColor);
  const bg = light ? `linear-gradient(160deg, ${cardColor}, #cbd5e1)` : `linear-gradient(160deg, ${cardColor}, ${NAVY_DEEP})`;
  const textColor = light ? NAVY : '#fff';
  const subOpacity = light ? 0.65 : 0.5;
  const brandColor = light ? NAVY : accentColor;
  const pageBg = isDark ? '#0f1226' : '#F7F9FC';
  const isSmall = shape.w < 240;
  const qrSize = isSmall ? 52 : shape.id === 'bracelet' ? 52 : 76;

  const SHADOW_3D = '0 12px 28px rgba(0,0,0,0.22), 0 4px 10px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.18)';

  const renderLogo = (sz) => logoUrl ? (
    <img src={logoUrl} alt="Logo" className="rounded-xl object-cover" style={{ width: sz, height: sz, background: '#fff', padding: 2 }} />
  ) : (
    <div className="rounded-xl flex items-center justify-center"
      style={{ width: sz, height: sz, background: `linear-gradient(135deg, ${accentColor}, ${ORANGE_LIGHT})`, boxShadow: `0 3px 8px ${accentColor}44, inset 0 1px 0 rgba(255,255,255,0.3)` }}>
      {!removeBranding && <InfinityMark size={sz * 0.45} color="#FFFFFF" strokeWidth={3.5} glow={true} />}
    </div>
  );

  const frontContent = (() => {
    if (shape.layout === 'centered') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
          {renderLogo(isSmall ? 36 : 42)}
          <p className="font-black leading-tight mt-2" style={{ color: textColor, fontSize: isSmall ? 11 : 13 }}>{nameText || 'Your Business Name'}</p>
          <p className="text-[9px] mt-0.5" style={{ color: textColor, opacity: subOpacity }}>{roleText || 'Your Tagline'}</p>
        </div>
      );
    }
    if (shape.layout === 'horizontal') {
      return (
        <div className="flex-1 flex items-center justify-center gap-3 relative z-10 px-4">
          {renderLogo(36)}
          <div className="text-left">
            <p className="font-black leading-tight" style={{ color: textColor, fontSize: 12 }}>{nameText || 'Your Business Name'}</p>
            <p className="text-[8px]" style={{ color: textColor, opacity: subOpacity }}>{roleText || 'Your Tagline'}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex-1 flex flex-col justify-between relative z-10">
        <div className="flex items-start gap-2">
          {renderLogo(isSmall ? 28 : 36)}
          <div>
            <p className="font-black leading-tight" style={{ color: textColor, fontSize: isSmall ? 10 : 13 }}>{nameText || 'Your Business Name'}</p>
            <p className="text-[8px]" style={{ color: textColor, opacity: subOpacity }}>{roleText || 'Your Tagline'}</p>
          </div>
        </div>
        {!removeBranding && (
          <span className="font-bold tracking-wider" style={{ color: brandColor, fontSize: 8, textShadow: light ? 'none' : `0 0 6px ${accentColor}33` }}>BING∞ CONNECT</span>
        )}
      </div>
    );
  })();

  const backContent = (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full">
      <div className="rounded-xl p-2" style={{ background: '#fff', boxShadow: '0 6px 16px rgba(11,33,73,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}>
        <QrPattern size={qrSize} darkColor={NAVY} />
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Nfc className="w-3 h-3" style={{ color: NAVY }} />
        <span className="text-[8px] font-bold tracking-widest" style={{ color: MUTED }}>NFC</span>
      </div>
      {!removeBranding && (
        <div className="absolute bottom-2 flex items-center gap-1 px-2">
          <span className="text-[7px] font-semibold tracking-wider" style={{ color: MUTED }}>POWERED BY</span>
          <InfinityMark size={8} color={NAVY} strokeWidth={3} />
          <span className="text-[7px] font-black tracking-wider" style={{ color: NAVY }}>BING∞ CONNECT</span>
        </div>
      )}
    </div>
  );

  const content = isFront ? frontContent : backContent;
  const bodyBg = isFront ? bg : '#fff';
  const bodyBorder = isFront ? 'none' : `1px solid ${BORDER}`;
  const highlight = isFront
    ? { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)', pointerEvents: 'none' }
    : { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(248,250,252,0.6), transparent)', pointerEvents: 'none' };
  const accentGlow = isFront ? (
    <div style={{ position: 'absolute', top: -15, right: -15, width: 90, height: 90, borderRadius: '50%', background: accentColor, opacity: 0.08, filter: 'blur(36px)', pointerEvents: 'none' }} />
  ) : null;

  // ── Card ──
  if (shape.id === 'card') {
    return (
      <div style={{ width: shape.w, height: shape.h, position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: SHADOW_3D }}>
          {accentGlow}
          <div style={highlight} />
          <div className="flex flex-col h-full p-5">{content}</div>
        </div>
      </div>
    );
  }

  // ── Keychain (teardrop with metallic keyring) ──
  if (shape.id === 'keychain') {
    return (
      <div style={{ width: shape.w, height: shape.h + 26, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #f1f5f9, #94a3b8 40%, #cbd5e1 60%, #64748b)', boxShadow: '0 3px 6px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: -10, zIndex: 20 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: pageBg, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }} />
        </div>
        <div style={{ width: shape.w, height: shape.h, borderRadius: '110px 110px 18px 18px / 90px 90px 18px 18px', overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: SHADOW_3D }}>
          {accentGlow}
          <div style={highlight} />
          <div className="flex flex-col h-full p-5 pt-8">{content}</div>
        </div>
      </div>
    );
  }

  // ── Sticker (beveled circle with glossy arc) ──
  if (shape.id === 'sticker') {
    return (
      <div style={{ width: shape.w, height: shape.h, position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: `${SHADOW_3D}, inset 0 0 0 3px rgba(255,255,255,0.06)` }}>
          {accentGlow}
          <div style={{ ...highlight, borderRadius: '50%' }} />
          {isFront && <div style={{ position: 'absolute', top: 8, left: 25, right: 25, height: 55, background: 'linear-gradient(180deg, rgba(255,255,255,0.22), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />}
          <div className="flex flex-col h-full p-5">{content}</div>
        </div>
      </div>
    );
  }

  // ── Bracelet (silicone wristband with snap button + sheen) ──
  if (shape.id === 'bracelet') {
    return (
      <div style={{ width: shape.w, height: shape.h, position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 70, overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: SHADOW_3D }}>
          <div style={{ position: 'absolute', top: 5, left: 30, right: 30, height: 30, background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent)', borderRadius: 50, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 30, right: 30, height: 22, background: 'linear-gradient(0deg, rgba(0,0,0,0.15), transparent)', borderRadius: 50, pointerEvents: 'none' }} />
          {isFront && (
            <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg, #f1f5f9, #94a3b8 50%, #64748b)', boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.5)', zIndex: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', margin: '4.5px auto', background: 'linear-gradient(135deg, #64748b, #475569)' }} />
            </div>
          )}
          <div className="flex flex-col h-full p-4">{content}</div>
        </div>
      </div>
    );
  }

  // ── Tag (luggage tag with strap loop + slot) ──
  if (shape.id === 'tag') {
    return (
      <div style={{ width: shape.w, height: shape.h + 18, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 50, height: 22, border: '3px solid #94a3b8', borderBottom: 'none', borderRadius: '25px 25px 0 0', marginBottom: -2, zIndex: 15, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
        <div style={{ width: shape.w, height: shape.h, borderRadius: '14px 14px 16px 16px', overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: SHADOW_3D }}>
          <div style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 44, height: 10, borderRadius: 5, background: pageBg, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.35)', zIndex: 5 }} />
          {accentGlow}
          <div style={highlight} />
          <div className="flex flex-col h-full p-4 pt-6">{content}</div>
        </div>
      </div>
    );
  }

  // ── Stand (desktop stand with angled trapezoid base) ──
  if (shape.id === 'stand') {
    return (
      <div style={{ width: shape.w, height: shape.h + 38, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: shape.w, height: shape.h, borderRadius: 12, overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: SHADOW_3D }}>
          {accentGlow}
          <div style={highlight} />
          <div className="flex flex-col h-full p-5">{content}</div>
        </div>
        <div style={{ width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderBottom: '24px solid #374151', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.12))', marginTop: -1 }} />
        <div style={{ width: 120, height: 6, borderRadius: 3, background: 'linear-gradient(180deg, #475569, #334155)', boxShadow: '0 3px 6px rgba(0,0,0,0.15)' }} />
      </div>
    );
  }

  return null;
}