import React from 'react';
import { Nfc } from 'lucide-react';
import { InfinityMark } from '@/components/mockups/brand/InfinityMark';

// ── Brand constants ──────────────────────────────────────────────────────────
const NAVY = '#0b2149';
const NAVY_DEEP = '#071A3D';
const ORANGE = '#f97316';
const ORANGE_LIGHT = '#fb923c';
const BORDER = '#E5EAF2';
const MUTED = '#64748B';

// ── Device physical shapes ───────────────────────────────────────────────────
// Each device has a canonical physical geometry. The renderer adapts the
// template's graphic system to this geometry — every product is NOT treated
// as a rectangular business card.
export const PRODUCT_TYPES = [
  { id: 'card',       label: 'Card',       w: 340, h: 214, hole: false, base: false, shape: 'card' },
  { id: 'keychain',   label: 'Key Fob',    w: 220, h: 280, hole: true,  base: false, shape: 'teardrop' },
  { id: 'sticker',    label: 'Sticker',    w: 220, h: 220, hole: false, base: false, shape: 'circle' },
  { id: 'bracelet',   label: 'Bracelet',   w: 330, h: 140, hole: false, base: false, shape: 'band' },
  { id: 'tag',        label: 'Tag',        w: 195, h: 265, hole: true,  base: false, shape: 'tag' },
  { id: 'stand',      label: 'Table Stand',w: 280, h: 170, hole: false, base: true,  shape: 'stand' },
  { id: 'metal_card', label: 'Metal Card', w: 340, h: 214, hole: false, base: false, shape: 'card' },
  { id: 'wood_card',  label: 'Wood Card',  w: 340, h: 214, hole: false, base: false, shape: 'card' },
];

// ── Color utilities ──────────────────────────────────────────────────────────
function isLightHex(hex) {
  const c = (hex || '#fff').replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

function hexToRgba(hex, a) {
  const c = (hex || '#000').replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Deterministic QR pattern ─────────────────────────────────────────────────
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

// ── Mini 3D icons for device selector ─────────────────────────────────────────
export function ProductTypeIcon({ typeId, active }) {
  const c = active ? NAVY : '#CBD5E1';
  const hl = active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.4)';
  const sh = `0 1px 2px rgba(0,0,0,0.15), inset 0 1px 0 ${hl}`;

  switch (typeId) {
    case 'card':
    case 'metal_card':
    case 'wood_card':
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

// ── Logo rendering (preserves aspect ratio, never distorted) ──────────────────
function LogoImage({ src, alt = 'Logo', style }) {
  return (
    <img src={src} alt={alt} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', ...style }} />
  );
}

function LogoPlaceholder({ size, accentColor, removeBranding }) {
  return (
    <div className="rounded-xl flex items-center justify-center"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${accentColor}, ${ORANGE_LIGHT})`, boxShadow: `0 3px 8px ${hexToRgba(accentColor, 0.27)}, inset 0 1px 0 rgba(255,255,255,0.3)` }}>
      {!removeBranding && <InfinityMark size={size * 0.45} color="#FFFFFF" strokeWidth={3.5} glow={true} />}
    </div>
  );
}

// ── Template graphic systems ─────────────────────────────────────────────────
// Each template defines a distinct visual language. The base color is part
// of the graphic system (panels, gradients), NOT a solid device recolor.
// The accent color controls deliberate graphic accents and separators.

const TEMPLATES = {
  // Modern: clean split — light bg, accent vertical bar, logo panel right
  modern: {
    isDark: false,
    textOnPanel: false,
    cardBackground: (cardColor, accentColor) => (
      <>
        <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 0 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '100%', background: `linear-gradient(160deg, ${cardColor}, #ffffff)`, zIndex: 0 }} />
        <div style={{ position: 'absolute', right: '40%', top: 0, width: 3, height: '100%', background: accentColor, zIndex: 1 }} />
      </>
    ),
    // Layout: content left, logo right
    layout: 'split-right-logo',
  },
  // Minimal: maximum whitespace, thin accent bottom, small logo corner
  minimal: {
    isDark: false,
    textOnPanel: false,
    cardBackground: (cardColor, accentColor) => (
      <>
        <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 0 }} />
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 6, background: `linear-gradient(90deg, ${accentColor}, ${cardColor})`, zIndex: 0 }} />
      </>
    ),
    layout: 'corner-logo',
  },
  // Corporate: dark navy, professional, logo panel right
  corporate: {
    isDark: true,
    textOnPanel: true,
    cardBackground: (cardColor, accentColor) => (
      <>
        <div style={{ position: 'absolute', inset: 0, background: NAVY_DEEP, zIndex: 0 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, width: '38%', height: '100%', background: `linear-gradient(160deg, ${cardColor}, ${NAVY_DEEP})`, zIndex: 0 }} />
        <div style={{ position: 'absolute', right: '38%', top: 0, width: 3, height: '100%', background: accentColor, zIndex: 1 }} />
      </>
    ),
    layout: 'split-right-logo',
  },
  // Creative: bold geometric, accent circle with logo, cardColor circle bottom
  creative: {
    isDark: false,
    textOnPanel: false,
    cardBackground: (cardColor, accentColor) => (
      <>
        <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 0 }} />
        <div style={{ position: 'absolute', right: -50, top: -60, width: 170, height: 170, borderRadius: '50%', background: accentColor, zIndex: 0 }} />
        <div style={{ position: 'absolute', right: 18, bottom: -70, width: 140, height: 140, borderRadius: '50%', background: hexToRgba(cardColor, 0.5), zIndex: 0 }} />
      </>
    ),
    layout: 'circle-logo',
  },
};

// ── Content rendering for card-shaped devices (card, metal_card, wood_card) ──
function CardContent({ templateId, cardColor, accentColor, logoUrl, nameText, holderName, roleText, phone, email, website, tagline, removeBranding, shape }) {
  const tpl = TEMPLATES[templateId] || TEMPLATES.modern;
  const textColor = tpl.isDark ? '#fff' : NAVY;
  const subColor = tpl.isDark ? 'rgba(255,255,255,0.65)' : 'rgba(11,33,73,0.65)';
  const isWood = shape.id === 'wood_card';
  const isMetal = shape.id === 'metal_card';

  const logoBox = (w, h, extra = {}) => (
    <div style={{ width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...extra }}>
      {logoUrl
        ? <LogoImage src={logoUrl} style={{ maxWidth: '90%', maxHeight: '90%' }} />
        : <LogoPlaceholder size={Math.min(w, h)} accentColor={accentColor} removeBranding={removeBranding} />}
    </div>
  );

  const contactInfo = (
    <div className="space-y-0.5">
      {phone && <p className="font-semibold" style={{ color: subColor, fontSize: 8 }}>☎ {phone}</p>}
      {email && <p className="font-semibold truncate" style={{ color: subColor, fontSize: 8 }}>✉ {email}</p>}
      {website && <p className="font-semibold truncate" style={{ color: subColor, fontSize: 8 }}>◉ {website}</p>}
    </div>
  );

  const taglineBlock = (
    <div className="flex items-stretch gap-1.5">
      <div style={{ width: 2, background: accentColor, borderRadius: 2, flexShrink: 0 }} />
      <p className="font-semibold tracking-[0.18em] leading-[1.2]" style={{ color: subColor, fontSize: 7 }}>
        {(tagline || 'CONNECT · SHARE · GROW').toUpperCase().split('·').map((s, i) => <React.Fragment key={i}>{i > 0 && <br/>}{s.trim()}</React.Fragment>)}
      </p>
    </div>
  );

  const identity = (
    <>
      <p className="font-black tracking-tight" style={{ color: textColor, fontSize: 13 }}>{nameText || 'Your Company'}</p>
      <div className="mt-6">
        <p className="font-black leading-none" style={{ color: textColor, fontSize: 22 }}>{holderName || 'Your Name'}</p>
        <p className="font-semibold mt-1" style={{ color: subColor, fontSize: 9 }}>{roleText || 'Your Role'}</p>
      </div>
    </>
  );

  // ── Modern / Corporate: split with logo right ──
  if (tpl.layout === 'split-right-logo') {
    return (
      <div className="relative z-10 h-full">
        <div className="absolute inset-y-0 left-0 w-[60%] p-5 flex flex-col justify-between">
          <div>{identity}</div>
          <div className="flex items-end justify-between gap-3">{contactInfo}{taglineBlock}</div>
        </div>
        <div className="absolute inset-y-0 right-0 w-[40%] p-4 flex items-center justify-center">
          {logoBox('100%', '100%')}
        </div>
      </div>
    );
  }

  // ── Minimal: corner logo, centered content ──
  if (tpl.layout === 'corner-logo') {
    return (
      <div className="relative z-10 h-full p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>{identity}</div>
          {logoBox(64, 64, { borderRadius: 12, border: `1px solid ${hexToRgba(accentColor, 0.3)}`, background: '#fff', padding: 4, flexShrink: 0 })}
        </div>
        <div className="flex items-end justify-between gap-4">{contactInfo}{taglineBlock}</div>
      </div>
    );
  }

  // ── Creative: circle logo top-right, content left ──
  if (tpl.layout === 'circle-logo') {
    return (
      <div className="relative z-10 h-full">
        <div className="absolute inset-y-0 left-0 w-[58%] p-5 flex flex-col justify-between">
          <div>{identity}</div>
          <div>{contactInfo}</div>
        </div>
        <div className="absolute inset-y-0 right-0 w-[42%] flex items-center justify-center">
          <div style={{ width: 130, height: 130, borderRadius: '50%', overflow: 'hidden', background: '#fff', border: `4px solid ${accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
            {logoBox('100%', '100%')}
          </div>
        </div>
        <div className="absolute right-4 bottom-4 z-10">{taglineBlock}</div>
      </div>
    );
  }

  return null;
}

// ── Content for vertical devices (keychain, tag, stand) ──────────────────────
function VerticalContent({ templateId, cardColor, accentColor, logoUrl, nameText, holderName, roleText, phone, email, website, tagline, removeBranding, shape, isSmall }) {
  const tpl = TEMPLATES[templateId] || TEMPLATES.modern;
  const textColor = tpl.isDark ? '#fff' : NAVY;
  const subColor = tpl.isDark ? 'rgba(255,255,255,0.65)' : 'rgba(11,33,73,0.6)';
  const logoSize = isSmall ? 40 : 48;

  const logoBox = (sz) => (
    <div style={{ width: sz, height: sz, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 10, flexShrink: 0 }}>
      {logoUrl
        ? <LogoImage src={logoUrl} style={{ maxWidth: '90%', maxHeight: '90%' }} />
        : <LogoPlaceholder size={sz} accentColor={accentColor} removeBranding={removeBranding} />}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center text-center relative z-10 px-2 pt-1">
      {logoBox(logoSize)}
      <p className="font-black leading-tight mt-2" style={{ color: textColor, fontSize: isSmall ? 10 : 12 }}>{nameText || 'Your Company'}</p>
      {holderName && <p className="font-bold leading-tight mt-0.5" style={{ color: textColor, fontSize: isSmall ? 8 : 9 }}>{holderName}</p>}
      <p className="text-[8px] mt-0.5" style={{ color: subColor }}>{roleText || 'Your Role'}</p>
      {(phone || email || website) && (
        <div className="mt-1.5 space-y-0.5">
          {phone && <p className="text-[7px] font-medium" style={{ color: subColor }}>☎ {phone}</p>}
          {email && <p className="text-[7px] font-medium truncate max-w-[160px]" style={{ color: subColor }}>✉ {email}</p>}
          {website && <p className="text-[7px] font-medium truncate max-w-[160px]" style={{ color: subColor }}>◉ {website}</p>}
        </div>
      )}
      {!removeBranding && (
        <span className="font-bold tracking-wider mt-1.5" style={{ color: tpl.isDark ? accentColor : NAVY, fontSize: 7 }}>BING∞ CONNECT</span>
      )}
    </div>
  );
}

// ── Content for horizontal devices (bracelet) ────────────────────────────────
function HorizontalContent({ templateId, cardColor, accentColor, logoUrl, nameText, holderName, roleText, phone, email, website, tagline, removeBranding, shape }) {
  const tpl = TEMPLATES[templateId] || TEMPLATES.modern;
  const textColor = tpl.isDark ? '#fff' : NAVY;
  const subColor = tpl.isDark ? 'rgba(255,255,255,0.65)' : 'rgba(11,33,73,0.6)';

  const logoBox = (sz) => (
    <div style={{ width: sz, height: sz, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 8, flexShrink: 0 }}>
      {logoUrl
        ? <LogoImage src={logoUrl} style={{ maxWidth: '90%', maxHeight: '90%' }} />
        : <LogoPlaceholder size={sz} accentColor={accentColor} removeBranding={removeBranding} />}
    </div>
  );

  return (
    <div className="flex-1 flex items-center justify-center gap-3 relative z-10 px-4">
      {logoBox(36)}
      <div className="text-left min-w-0">
        <p className="font-black leading-tight truncate" style={{ color: textColor, fontSize: 12 }}>{nameText || 'Your Company'}</p>
        {holderName && <p className="font-bold leading-tight truncate" style={{ color: textColor, fontSize: 9 }}>{holderName}</p>}
        <p className="text-[8px]" style={{ color: subColor }}>{roleText || 'Your Role'}</p>
        {phone && <p className="text-[7px] font-medium truncate" style={{ color: subColor }}>☎ {phone}</p>}
      </div>
    </div>
  );
}

// ── Content for centered devices (sticker) ───────────────────────────────────
function CenteredContent({ templateId, cardColor, accentColor, logoUrl, nameText, holderName, roleText, phone, email, website, tagline, removeBranding, shape }) {
  const tpl = TEMPLATES[templateId] || TEMPLATES.modern;
  const textColor = tpl.isDark ? '#fff' : NAVY;
  const subColor = tpl.isDark ? 'rgba(255,255,255,0.65)' : 'rgba(11,33,73,0.6)';

  const logoBox = (sz) => (
    <div style={{ width: sz, height: sz, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {logoUrl
        ? <LogoImage src={logoUrl} style={{ maxWidth: '90%', maxHeight: '90%' }} />
        : <LogoPlaceholder size={sz} accentColor={accentColor} removeBranding={removeBranding} />}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
      {logoBox(48)}
      <p className="font-black leading-tight mt-2" style={{ color: textColor, fontSize: 11 }}>{nameText || 'Your Company'}</p>
      {holderName && <p className="font-bold leading-tight mt-0.5" style={{ color: textColor, fontSize: 9 }}>{holderName}</p>}
      <p className="text-[8px] mt-0.5" style={{ color: subColor }}>{roleText || 'Your Role'}</p>
      {!removeBranding && (
        <span className="font-bold tracking-wider mt-1.5" style={{ color: tpl.isDark ? accentColor : NAVY, fontSize: 7 }}>BING∞</span>
      )}
    </div>
  );
}

// ── Back side content (QR + activation code) ──────────────────────────────────
function BackContent({ activationCode, qrSize, removeBranding }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full px-2">
      <div className="rounded-lg p-1.5" style={{ background: '#fff', boxShadow: '0 4px 12px rgba(11,33,73,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}>
        <QrPattern size={qrSize} darkColor={NAVY} />
      </div>
      <p className="font-black tracking-widest mt-2" style={{ color: NAVY, fontSize: 11 }}>{activationCode || 'BG-000001'}</p>
      <p className="text-[8px] font-bold mt-0.5" style={{ color: MUTED }}>Scan to activate</p>
      <div className="flex items-center gap-1 mt-1.5">
        <Nfc className="w-3 h-3" style={{ color: NAVY }} />
        <span className="text-[7px] font-bold tracking-widest" style={{ color: MUTED }}>NFC CHIP</span>
      </div>
      {!removeBranding && (
        <div className="absolute bottom-2 flex items-center gap-1 px-2">
          <InfinityMark size={8} color={NAVY} strokeWidth={3} />
          <span className="text-[7px] font-black tracking-wider" style={{ color: NAVY }}>BING∞</span>
        </div>
      )}
    </div>
  );
}

// ── Finish effects ───────────────────────────────────────────────────────────
function FinishLayers({ finish, isFront }) {
  if (!isFront) {
    return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(248,250,252,0.6), transparent)', pointerEvents: 'none', zIndex: 2 }} />;
  }
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        background: finish === 'Glossy' ? 'linear-gradient(180deg, rgba(255,255,255,0.28), transparent 55%)'
          : finish === 'Frosted' ? 'linear-gradient(180deg, rgba(255,255,255,0.15), transparent)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)',
        pointerEvents: 'none', zIndex: 2 }} />
      {finish === 'Glossy' && (
        <div style={{ position: 'absolute', top: 0, left: '10%', width: '35%', height: '100%', background: 'linear-gradient(75deg, transparent 20%, rgba(255,255,255,0.10) 50%, transparent 80%)', pointerEvents: 'none', zIndex: 3 }} />
      )}
      {finish === 'Frosted' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)', pointerEvents: 'none', zIndex: 1 }} />
      )}
    </>
  );
}

// ── Canonical Product Preview renderer ───────────────────────────────────────
// One renderer used by: Live Preview, template thumbnails, cart preview,
// saved design, checkout/order frozen design, Admin Production Proof,
// and manufacturer export. All derive from this same design specification.
export function ProductPreview({
  productType, cardColor, accentColor, logoUrl, nameText, roleText, removeBranding,
  side, isDark, brandPattern, finish, holderName, activationCode, phone, email,
  website, tagline, templateId = 'modern',
}) {
  const shape = PRODUCT_TYPES.find(p => p.id === productType) || PRODUCT_TYPES[0];
  const isFront = side !== 'back';
  const tpl = TEMPLATES[templateId] || TEMPLATES.modern;
  const pageBg = isDark ? '#0f1226' : '#F7F9FC';
  const isSmall = shape.w < 240;
  const qrSize = isSmall ? 52 : shape.shape === 'band' ? 52 : 76;
  const isCardShape = shape.shape === 'card';

  const SHADOW_3D = '0 12px 28px rgba(0,0,0,0.22), 0 4px 10px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.18)';

  // Template background graphic system (only on front)
  const templateBg = isFront ? tpl.cardBackground(cardColor || '#F1F5F9', accentColor || ORANGE) : null;

  // Accent glow
  const accentGlow = isFront ? (
    <div style={{ position: 'absolute', top: -15, right: -15, width: 90, height: 90, borderRadius: '50%', background: accentColor || ORANGE, opacity: 0.08, filter: 'blur(36px)', pointerEvents: 'none', zIndex: 0 }} />
  ) : null;

  // Content
  const contentProps = {
    templateId, cardColor, accentColor, logoUrl, nameText, holderName, roleText,
    phone, email, website, tagline, removeBranding, shape,
  };

  const frontContent = isCardShape
    ? <CardContent {...contentProps} />
    : shape.shape === 'circle'
    ? <CenteredContent {...contentProps} />
    : shape.shape === 'band'
    ? <HorizontalContent {...contentProps} />
    : <VerticalContent {...contentProps} isSmall={isSmall} />;

  const content = isFront ? frontContent : <BackContent activationCode={activationCode} qrSize={qrSize} removeBranding={removeBranding} />;

  const bodyBg = '#fff';
  const bodyBorder = isFront ? 'none' : `1px solid ${BORDER}`;

  // ── Card shapes (card, metal_card, wood_card) ──
  if (isCardShape) {
    return (
      <div style={{ width: shape.w, height: shape.h, position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: SHADOW_3D }}>
          {templateBg}
          {accentGlow}
          <FinishLayers finish={finish} isFront={isFront} />
          {isFront
            ? <div className="h-full relative z-10">{content}</div>
            : <div className="flex flex-col h-full p-5">{content}</div>}
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
          {templateBg}
          {accentGlow}
          <FinishLayers finish={finish} isFront={isFront} />
          <div className="flex flex-col h-full p-5 pt-8">{content}</div>
        </div>
      </div>
    );
  }

  // ── Sticker (beveled circle) ──
  if (shape.id === 'sticker') {
    return (
      <div style={{ width: shape.w, height: shape.h, position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: `${SHADOW_3D}, inset 0 0 0 3px rgba(255,255,255,0.06)` }}>
          {templateBg}
          {accentGlow}
          <FinishLayers finish={finish} isFront={isFront} />
          {isFront && <div style={{ position: 'absolute', top: 8, left: 25, right: 25, height: 55, background: 'linear-gradient(180deg, rgba(255,255,255,0.22), transparent)', borderRadius: '50%', pointerEvents: 'none', zIndex: 2 }} />}
          <div className="flex flex-col h-full p-5">{content}</div>
        </div>
      </div>
    );
  }

  // ── Bracelet (silicone wristband with snap button) ──
  if (shape.id === 'bracelet') {
    return (
      <div style={{ width: shape.w, height: shape.h, position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 70, overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: SHADOW_3D }}>
          <div style={{ position: 'absolute', top: 5, left: 30, right: 30, height: 30, background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent)', borderRadius: 50, pointerEvents: 'none', zIndex: 2 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 30, right: 30, height: 22, background: 'linear-gradient(0deg, rgba(0,0,0,0.15), transparent)', borderRadius: 50, pointerEvents: 'none', zIndex: 2 }} />
          {templateBg}
          {accentGlow}
          <FinishLayers finish={finish} isFront={isFront} />
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

  // ── Tag (luggage tag with strap loop) ──
  if (shape.id === 'tag') {
    return (
      <div style={{ width: shape.w, height: shape.h + 18, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 50, height: 22, border: '3px solid #94a3b8', borderBottom: 'none', borderRadius: '25px 25px 0 0', marginBottom: -2, zIndex: 15, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
        <div style={{ width: shape.w, height: shape.h, borderRadius: '14px 14px 16px 16px', overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: SHADOW_3D }}>
          <div style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 44, height: 10, borderRadius: 5, background: pageBg, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.35)', zIndex: 5 }} />
          {templateBg}
          {accentGlow}
          <FinishLayers finish={finish} isFront={isFront} />
          <div className="flex flex-col h-full p-4 pt-6">{content}</div>
        </div>
      </div>
    );
  }

  // ── Stand (desktop stand with angled base) ──
  if (shape.id === 'stand') {
    return (
      <div style={{ width: shape.w, height: shape.h + 38, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: shape.w, height: shape.h, borderRadius: 12, overflow: 'hidden', position: 'relative', background: bodyBg, border: bodyBorder, boxShadow: SHADOW_3D }}>
          {templateBg}
          {accentGlow}
          <FinishLayers finish={finish} isFront={isFront} />
          <div className="flex flex-col h-full p-5">{content}</div>
        </div>
        <div style={{ width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderBottom: '24px solid #374151', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.12))', marginTop: -1 }} />
        <div style={{ width: 120, height: 6, borderRadius: 3, background: 'linear-gradient(180deg, #475569, #334155)', boxShadow: '0 3px 6px rgba(0,0,0,0.15)' }} />
      </div>
    );
  }

  return null;
}