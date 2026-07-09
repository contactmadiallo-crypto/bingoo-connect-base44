import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Nfc, ShoppingCart, Check, Clock, Package, Shield, Save, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { addToCart } from '@/lib/cartStore';
import { getDrafts, saveDraft, deleteDraft } from '@/lib/draftStore';
import { InfinityMark } from '@/components/mockups/brand/InfinityMark';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', ORANGE_LIGHT = '#fb923c';
const BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

// ── Product types with distinct preview shapes ──────────────────────────────
const PRODUCT_TYPES = [
  { id: 'card',     label: 'Card',     w: 340, h: 214, radius: 16,  hole: false, base: false, layout: 'standard' },
  { id: 'keychain', label: 'Keychain', w: 220, h: 280, radius: '110px 110px 24px 24px / 80px 80px 24px 24px', hole: true,  base: false, layout: 'standard' },
  { id: 'sticker',  label: 'Sticker',  w: 220, h: 220, radius: '50%', hole: false, base: false, layout: 'centered' },
  { id: 'bracelet', label: 'Bracelet', w: 330, h: 140, radius: 70,   hole: false, base: false, layout: 'horizontal' },
  { id: 'tag',      label: 'Tag',      w: 195, h: 265, radius: '98px 98px 20px 20px / 72px 72px 20px 20px', hole: true, base: false, layout: 'standard' },
  { id: 'stand',    label: 'Stand',    w: 310, h: 195, radius: 12,   hole: false, base: true,  layout: 'standard' },
];

// ── Expanded color palette (14 options) ──────────────────────────────────────
const CARD_COLORS = [
  { name: 'Navy',      value: '#0b2149' },
  { name: 'Black',     value: '#0F172A' },
  { name: 'Charcoal',  value: '#374151' },
  { name: 'Orange',    value: '#f97316' },
  { name: 'Blue',      value: '#3b82f6' },
  { name: 'Teal',      value: '#0d9488' },
  { name: 'Forest',    value: '#1a4d2e' },
  { name: 'Burgundy',  value: '#7C1D3A' },
  { name: 'Pink',      value: '#ec4899' },
  { name: 'Purple',    value: '#8b5cf6' },
  { name: 'Gold',      value: '#D4AF37' },
  { name: 'Rose Gold', value: '#B76E79' },
  { name: 'Silver',    value: '#94a3b8' },
  { name: 'White',     value: '#F1F5F9' },
];

const ACCENT_COLORS = ['#f97316', '#FFD700', '#FFFFFF', '#22C55E', '#3b82f6', '#ec4899', '#0d9488', '#B76E79'];
const FINISHES = ['Matte', 'Glossy', 'Frosted'];

const UNIT_PRICE = 3.99;
const SETUP_FEE = 25.00;
const REMOVE_BRANDING_FEE = 2.50;
const MIN_QTY = 25;
const MAX_QTY = 500;

// ── Helpers ──────────────────────────────────────────────────────────────────
function isLightHex(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

// Deterministic QR-like pattern with proper finder patterns
function QrPattern({ size = 84, darkColor = NAVY }) {
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
    <div style={{
      width: size, height: size, display: 'grid',
      gridTemplateColumns: `repeat(${N}, 1fr)`, gridTemplateRows: `repeat(${N}, 1fr)`,
      background: '#fff', gap: 0,
    }}>
      {Array.from({ length: N * N }).map((_, i) => {
        const r = Math.floor(i / N), c = i % N;
        return <div key={i} style={{ background: isDark(r, c) ? darkColor : 'transparent' }} />;
      })}
    </div>
  );
}

// ── Shape-aware preview (front + back) ───────────────────────────────────────
function ProductPreview({ productType, cardColor, accentColor, logoUrl, nameText, roleText, removeBranding, side, isDark }) {
  const shape = PRODUCT_TYPES.find(p => p.id === productType) || PRODUCT_TYPES[0];
  const isFront = side === 'front';
  const isSmall = shape.w < 240;
  const light = isLightHex(cardColor);
  const textColor = light ? NAVY : '#fff';
  const subOpacity = light ? 0.65 : 0.5;
  const bgColor = light ? cardColor : `linear-gradient(135deg, ${cardColor}, ${NAVY_DEEP})`;
  const brandColor = light ? NAVY : accentColor;
  const qrSize = isSmall ? 56 : shape.id === 'bracelet' ? 56 : 78;
  const pageBg = isDark ? '#0f1226' : '#F7F9FC';
  const label = PRODUCT_TYPES.find(p => p.id === productType)?.label || 'Card';

  const Hole = () => shape.hole ? (
    <div className="absolute left-1/2 -translate-x-1/2 z-20 rounded-full border-2"
      style={{ width: 14, height: 14, top: 7, borderColor: 'rgba(148,163,184,0.5)', background: pageBg }} />
  ) : null;

  const Base = () => shape.base ? (
    <div className="absolute left-1/2 -translate-x-1/2"
      style={{ width: '55%', height: 6, bottom: -4, background: '#94a3b8', borderRadius: '0 0 4px 4px' }} />
  ) : null;

  // ── BACK ──
  if (!isFront) {
    return (
      <div className="relative flex items-center justify-center" style={{ width: shape.w, height: shape.h + (shape.base ? 8 : 0) }}>
        <Hole />
        <div className="w-full h-full overflow-hidden shadow-2xl flex flex-col items-center justify-center relative"
          style={{ borderRadius: shape.radius, background: '#fff', border: `1px solid ${BORDER}` }}>
          {/* QR with 3D frame */}
          <div className="rounded-xl p-2" style={{ background: '#fff', boxShadow: '0 6px 16px rgba(11,33,73,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}>
            <QrPattern size={qrSize} darkColor={NAVY} />
          </div>
          {/* NFC indicator */}
          <div className="flex items-center gap-1 mt-2">
            <Nfc className="w-3 h-3" style={{ color: NAVY }} />
            <span className="text-[8px] font-bold tracking-widest" style={{ color: MUTED }}>NFC ENABLED</span>
          </div>
          <p className="text-[8px] font-semibold mt-0.5" style={{ color: MUTED }}>
            bingooconnect.com/{(nameText || 'yourprofile').toLowerCase().replace(/\s+/g, '')}
          </p>
          {/* Powered by Bingoo Connect */}
          {!removeBranding && (
            <div className="absolute bottom-2 flex items-center gap-1 px-2">
              <span className="text-[7px] font-semibold tracking-wider" style={{ color: MUTED }}>POWERED BY</span>
              <InfinityMark size={8} color={NAVY} strokeWidth={3} />
              <span className="text-[7px] font-black tracking-wider" style={{ color: NAVY }}>BING∞ CONNECT</span>
            </div>
          )}
        </div>
        <Base />
      </div>
    );
  }

  // ── FRONT ──
  const renderLogo = (sz) => logoUrl ? (
    <img src={logoUrl} alt="Logo" className="rounded-xl object-cover"
      style={{ width: sz, height: sz, background: '#fff', padding: 2 }} />
  ) : (
    <div className="rounded-xl flex items-center justify-center"
      style={{ width: sz, height: sz,
        background: `linear-gradient(135deg, ${accentColor}, ${ORANGE_LIGHT})`,
        boxShadow: `0 3px 8px ${accentColor}44, inset 0 1px 0 rgba(255,255,255,0.3)` }}>
      {!removeBranding && <InfinityMark size={sz * 0.45} color="#FFFFFF" strokeWidth={3.5} glow={true} />}
    </div>
  );

  let content;
  if (shape.layout === 'centered') {
    content = (
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
        {renderLogo(isSmall ? 36 : 42)}
        <p className="font-black leading-tight mt-2" style={{ color: textColor, fontSize: isSmall ? 11 : 13 }}>
          {nameText || 'Your Business Name'}
        </p>
        <p className="text-[9px] mt-0.5" style={{ color: textColor, opacity: subOpacity }}>
          {roleText || 'Your Tagline'}
        </p>
      </div>
    );
  } else if (shape.layout === 'horizontal') {
    content = (
      <div className="flex-1 flex items-center justify-center gap-3 relative z-10 px-4">
        {renderLogo(38)}
        <div className="text-left">
          <p className="font-black leading-tight" style={{ color: textColor, fontSize: 12 }}>
            {nameText || 'Your Business Name'}
          </p>
          <p className="text-[8px]" style={{ color: textColor, opacity: subOpacity }}>
            {roleText || 'Your Tagline'}
          </p>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="flex-1 flex flex-col justify-between relative z-10">
        <div className="flex items-start gap-2">
          {renderLogo(isSmall ? 30 : 38)}
          <div>
            <p className="font-black leading-tight" style={{ color: textColor, fontSize: isSmall ? 10 : 13 }}>
              {nameText || 'Your Business Name'}
            </p>
            <p className="text-[8px]" style={{ color: textColor, opacity: subOpacity }}>
              {roleText || 'Your Tagline'}
            </p>
          </div>
        </div>
        {!removeBranding && (
          <span className="font-bold tracking-wider" style={{ color: brandColor, fontSize: 8, textShadow: light ? 'none' : `0 0 6px ${accentColor}33` }}>
            BING∞ CONNECT
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: shape.w, height: shape.h + (shape.base ? 8 : 0) }}>
      <Hole />
      <div className="w-full h-full overflow-hidden shadow-2xl relative flex flex-col p-4"
        style={{ borderRadius: shape.radius, background: bgColor }}>
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10"
          style={{ background: accentColor, filter: 'blur(36px)' }} />
        {content}
      </div>
      <Base />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function DesignStudio({ isDark }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [productType, setProductType] = useState('card');
  const [logoUrl, setLogoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cardColor, setCardColor] = useState(NAVY);
  const [accentColor, setAccentColor] = useState(ORANGE);
  const [nameText, setNameText] = useState('');
  const [roleText, setRoleText] = useState('');
  const [finish, setFinish] = useState('Matte');
  const [quantity, setQuantity] = useState(50);
  const [removeBranding, setRemoveBranding] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [drafts, setDrafts] = useState([]);

  useEffect(() => { setDrafts(getDrafts()); }, []);

  const subtotal = UNIT_PRICE * quantity;
  const brandingFee = removeBranding ? REMOVE_BRANDING_FEE : 0;
  const total = subtotal + SETUP_FEE + brandingFee;
  const productLabel = PRODUCT_TYPES.find(p => p.id === productType)?.label || 'Card';

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLogoUrl(file_url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDraft = () => {
    saveDraft({
      productType, cardColor, accentColor, nameText, roleText, finish, quantity,
      logoUrl, removeBranding,
      name: `${nameText || 'Untitled'} — ${productLabel}`,
    });
    setDrafts(getDrafts());
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleDeleteDraft = (id) => {
    setDrafts(deleteDraft(id));
  };

  const handleLoadDraft = (d) => {
    setProductType(d.productType || 'card');
    setCardColor(d.cardColor || NAVY);
    setAccentColor(d.accentColor || ORANGE);
    setNameText(d.nameText || '');
    setRoleText(d.roleText || '');
    setFinish(d.finish || 'Matte');
    setQuantity(d.quantity || 50);
    setLogoUrl(d.logoUrl || null);
    setRemoveBranding(d.removeBranding || false);
  };

  const handlePlaceOrder = () => {
    addToCart({
      id: `custom-nfc-${Date.now()}`,
      name: `Custom NFC ${productLabel} (Bulk)${removeBranding ? ' — No Branding' : ''}`,
      price: total,
      image: logoUrl,
      activationCode: 'CUSTOM-BULK',
      customDesign: { productType, cardColor, accentColor, nameText, roleText, finish, quantity, removeBranding },
    }, 1);
    setOrdered(true);
    setTimeout(() => { setOrdered(false); navigate('/cart'); }, 1200);
  };

  const inputCls = `w-full px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-orange-400/40 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-800'}`;
  const labelColor = isDark ? '#fff' : INK;

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: BORDER }}>
      <div className="flex flex-col lg:flex-row">
        {/* ── Left: Controls ── */}
        <div className="lg:w-72 p-5 overflow-y-auto border-b lg:border-b-0 lg:border-r" style={{ background: isDark ? '#13162a' : BG, borderColor: BORDER }}>
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-wider" style={{ color: ORANGE }}>CUSTOM NFC</p>
            <h2 className="text-lg font-black" style={{ color: labelColor }}>Design Studio</h2>
            <p className="text-[10px] mt-1" style={{ color: MUTED }}>Create branded NFC devices for your business</p>
          </div>

          {/* Product Type */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: labelColor }}>Product Type</p>
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_TYPES.map((p) => (
                <button key={p.id} onClick={() => setProductType(p.id)}
                  className="p-2 rounded-lg border-2 text-center transition-all bg-white"
                  style={{ borderColor: productType === p.id ? ORANGE : BORDER }}>
                  <div className="mx-auto mb-1"
                    style={{
                      width: 22, height: p.id === 'sticker' ? 22 : p.id === 'bracelet' ? 12 : p.id === 'keychain' || p.id === 'tag' ? 28 : 16,
                      borderRadius: p.id === 'sticker' ? '50%' : p.id === 'bracelet' ? 6 : p.id === 'keychain' || p.id === 'tag' ? '10px 10px 3px 3px / 7px 7px 3px 3px' : 3,
                      background: productType === p.id ? NAVY : BORDER,
                    }} />
                  <span className="text-[9px] font-bold" style={{ color: productType === p.id ? ORANGE : MUTED }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: labelColor }}>Logo</p>
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed rounded-xl p-4 text-center hover:border-orange-400 transition-colors bg-white"
              style={{ borderColor: BORDER }}>
              {logoUrl ? (
                <div className="flex items-center justify-center gap-2">
                  <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="text-left">
                    <p className="text-[9px] font-bold flex items-center gap-1" style={{ color: '#16a34a' }}><Check className="w-3 h-3" /> Logo uploaded</p>
                    <p className="text-[8px]" style={{ color: MUTED }}>Click to replace</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${NAVY}10` }}>
                    {uploading ? <div className="w-4 h-4 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
                      : <Upload className="w-5 h-5" style={{ color: NAVY }} />}
                  </div>
                  <p className="text-[9px] font-bold" style={{ color: INK }}>{uploading ? 'Uploading...' : 'Upload Logo'}</p>
                  <p className="text-[8px]" style={{ color: MUTED }}>PNG, SVG · Max 2MB</p>
                </>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={handleLogoUpload} />
          </div>

          {/* Card Color */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: labelColor }}>Card Color</p>
            <div className="flex gap-2 flex-wrap">
              {CARD_COLORS.map((c) => (
                <button key={c.value} onClick={() => setCardColor(c.value)}
                  className={`w-8 h-8 rounded-lg cursor-pointer border-2 transition-all ${cardColor === c.value ? 'scale-110 ring-2 ring-slate-300' : ''}`}
                  style={{ background: c.value, borderColor: cardColor === c.value ? INK : '#fff' }} title={c.name} />
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: labelColor }}>Accent Color</p>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button key={c} onClick={() => setAccentColor(c)}
                  className={`w-8 h-8 rounded-lg cursor-pointer border-2 transition-all ${accentColor === c ? 'scale-110 ring-2 ring-slate-300' : ''}`}
                  style={{ background: c, borderColor: accentColor === c ? INK : '#fff' }} />
              ))}
            </div>
          </div>

          {/* Text Fields */}
          <div className="mb-5 space-y-3">
            <div>
              <p className="text-xs font-black mb-1.5" style={{ color: labelColor }}>Name on Card</p>
              <input value={nameText} onChange={(e) => setNameText(e.target.value)} placeholder="e.g. Diallo Law Firm" className={inputCls} />
            </div>
            <div>
              <p className="text-xs font-black mb-1.5" style={{ color: labelColor }}>Role / Tagline</p>
              <input value={roleText} onChange={(e) => setRoleText(e.target.value)} placeholder="e.g. Immigration · Civil · Criminal" className={inputCls} />
            </div>
          </div>

          {/* Finish */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: labelColor }}>Finish</p>
            <div className="grid grid-cols-3 gap-2">
              {FINISHES.map((f) => (
                <button key={f} onClick={() => setFinish(f)}
                  className="px-2 py-2 rounded-lg border text-[9px] font-bold text-center transition-all"
                  style={finish === f ? { background: ORANGE, color: '#fff', borderColor: ORANGE } : { borderColor: BORDER, color: MUTED, background: '#fff' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Remove Branding Toggle */}
          <div className="mb-5">
            <div className="flex items-center justify-between p-3 rounded-xl border-2"
              style={{ borderColor: removeBranding ? ORANGE : BORDER, background: removeBranding ? `${ORANGE}08` : '#fff' }}>
              <div>
                <p className="text-[10px] font-black" style={{ color: labelColor }}>Remove Bingoo Branding</p>
                <p className="text-[8px]" style={{ color: MUTED }}>Hide ∞ logo & "Powered by" text</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black" style={{ color: ORANGE }}>+${REMOVE_BRANDING_FEE.toFixed(2)}</span>
                <button onClick={() => setRemoveBranding(!removeBranding)}
                  className="relative w-9 h-5 rounded-full transition-colors"
                  style={{ background: removeBranding ? ORANGE : '#CBD5E1' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                    style={{ transform: removeBranding ? 'translateX(18px)' : 'translateX(2px)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Saved Drafts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black" style={{ color: labelColor }}>My Drafts</p>
              <button onClick={handleSaveDraft}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
                style={{ background: savedFlash ? '#16a34a' : `${NAVY}10`, color: savedFlash ? '#fff' : NAVY }}>
                {savedFlash ? <><Check className="w-3 h-3" /> Saved</> : <><Save className="w-3 h-3" /> Save Draft</>}
              </button>
            </div>
            {drafts.length === 0 ? (
              <p className="text-[9px] text-center py-3" style={{ color: MUTED }}>No saved drafts yet</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {drafts.map(d => (
                  <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg border" style={{ borderColor: BORDER, background: '#fff' }}>
                    <div className="w-6 h-6 rounded flex-shrink-0" style={{ background: d.cardColor || NAVY }} />
                    <button onClick={() => handleLoadDraft(d)} className="flex-1 text-left min-w-0">
                      <p className="text-[9px] font-bold truncate" style={{ color: INK }}>{d.name || 'Untitled Draft'}</p>
                      <p className="text-[8px]" style={{ color: MUTED }}>{PRODUCT_TYPES.find(p => p.id === d.productType)?.label || 'Card'} · {d.quantity || 50} units</p>
                    </button>
                    <button onClick={() => handleDeleteDraft(d.id)} className="p-1 rounded hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Center: Preview ── */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8"
          style={{ background: isDark ? '#0f1226' : 'linear-gradient(180deg, #F7F9FC, #EDF1F7)' }}>
          <div className="flex items-center justify-between w-full max-w-md mb-6">
            <p className="text-sm font-black" style={{ color: isDark ? '#fff' : INK }}>Live Preview</p>
            <span className="px-2 py-0.5 text-[8px] font-bold rounded-md tracking-wider"
              style={{ color: ORANGE, background: `${ORANGE}18` }}>REAL-TIME</span>
          </div>
          <div className="mb-8 transition-transform hover:scale-105">
            <ProductPreview productType={productType} cardColor={cardColor} accentColor={accentColor}
              logoUrl={logoUrl} nameText={nameText} roleText={roleText} removeBranding={removeBranding}
              side="front" isDark={isDark} />
            <p className="text-center text-[10px] font-bold mt-3" style={{ color: MUTED }}>FRONT</p>
          </div>
          <div className="transition-transform hover:scale-105">
            <ProductPreview productType={productType} cardColor={cardColor} accentColor={accentColor}
              logoUrl={logoUrl} nameText={nameText} roleText={roleText} removeBranding={removeBranding}
              side="back" isDark={isDark} />
            <p className="text-center text-[10px] font-bold mt-3" style={{ color: MUTED }}>BACK</p>
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="lg:w-64 p-5 border-t lg:border-t-0 lg:border-l" style={{ background: isDark ? '#13162a' : '#fff', borderColor: BORDER }}>
          <p className="text-xs font-black mb-4" style={{ color: labelColor }}>Order Summary</p>
          <div className="space-y-3 mb-5">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>Product</span>
              <span className="text-[10px] font-bold" style={{ color: labelColor }}>NFC {productLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>Finish</span>
              <span className="text-[10px] font-bold" style={{ color: labelColor }}>{finish}</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold" style={{ color: MUTED }}>Quantity</span>
                <span className="text-[10px] font-black" style={{ color: ORANGE }}>{quantity} units</span>
              </div>
              <input type="range" min={MIN_QTY} max={MAX_QTY} step={25} value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ background: BG }} />
              <div className="flex justify-between mt-1">
                <span className="text-[8px]" style={{ color: MUTED }}>Min: {MIN_QTY}</span>
                <span className="text-[8px]" style={{ color: MUTED }}>Max: {MAX_QTY}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-3 space-y-2 mb-5" style={{ background: isDark ? '#1a1d33' : BG }}>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>Unit Price</span>
              <span className="text-[10px] font-bold" style={{ color: labelColor }}>${UNIT_PRICE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>Subtotal</span>
              <span className="text-[10px] font-bold" style={{ color: labelColor }}>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>Setup Fee</span>
              <span className="text-[10px] font-bold" style={{ color: labelColor }}>${SETUP_FEE.toFixed(2)}</span>
            </div>
            {removeBranding && (
              <div className="flex justify-between">
                <span className="text-[10px] font-bold" style={{ color: MUTED }}>Remove Branding</span>
                <span className="text-[10px] font-bold" style={{ color: ORANGE }}>+${REMOVE_BRANDING_FEE.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
              <span className="text-xs font-black" style={{ color: labelColor }}>Total</span>
              <span className="text-sm font-black" style={{ color: ORANGE }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={handlePlaceOrder}
            className="w-full py-2.5 text-xs font-black text-white rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: ordered ? '#16a34a' : ORANGE }}>
            {ordered ? <><Check className="w-3.5 h-3.5" /> Added to Cart</> : <><ShoppingCart className="w-3.5 h-3.5" /> Place Order</>}
          </button>

          <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : BORDER }}>
            <div className="flex items-center gap-2"><Clock className="w-3 h-3" style={{ color: NAVY }} /><span className="text-[9px] font-bold" style={{ color: MUTED }}>7-10 business days</span></div>
            <div className="flex items-center gap-2"><Package className="w-3 h-3" style={{ color: NAVY }} /><span className="text-[9px] font-bold" style={{ color: MUTED }}>Free shipping over $200</span></div>
            <div className="flex items-center gap-2"><Shield className="w-3 h-3" style={{ color: NAVY }} /><span className="text-[9px] font-bold" style={{ color: MUTED }}>Quality guarantee</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}