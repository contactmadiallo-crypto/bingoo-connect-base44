import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Nfc, ShoppingCart, Infinity as InfinityIcon, Check, Clock, Package, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { addToCart } from '@/lib/cartStore';
import { InfinityMark } from '@/components/mockups/brand/InfinityMark';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', ORANGE_LIGHT = '#fb923c';
const BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

const PRODUCT_TYPES = [
  { id: 'card', label: 'Card', w: 1, h: 0.63 },
  { id: 'keychain', label: 'Keychain', w: 1, h: 1.0 },
  { id: 'sticker', label: 'Sticker', w: 1, h: 1.0 },
];

const CARD_COLORS = [
  { name: 'Navy', value: '#0b2149' },
  { name: 'Black', value: '#0F172A' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'White', value: '#F1F5F9' },
];

const ACCENT_COLORS = ['#f97316', '#FFD700', '#FFFFFF', '#22C55E', '#3b82f6', '#ec4899'];

const FINISHES = ['Matte', 'Glossy', 'Frosted'];

const UNIT_PRICE = 3.99;
const SETUP_FEE = 25.00;
const MIN_QTY = 25;
const MAX_QTY = 500;

function CardPreview({ productType, cardColor, accentColor, logoUrl, nameText, roleText, side }) {
  const isFront = side === 'front';
  const w = 340, h = 214;

  if (!isFront) {
    return (
      <div className="rounded-2xl shadow-xl flex items-center justify-center"
        style={{ width: w, height: h, background: BG, border: `1px solid ${BORDER}` }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${NAVY}10` }}>
            <Nfc className="w-7 h-7" style={{ color: NAVY }} />
          </div>
          <p className="text-xs font-bold" style={{ color: MUTED }}>Tap your phone here to share</p>
          <p className="text-[10px] mt-1" style={{ color: MUTED }}>bingooconnect.com/{(nameText || 'yourprofile').toLowerCase().replace(/\s+/g, '')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between p-6"
      style={{ width: w, height: h, background: `linear-gradient(135deg, ${cardColor}, ${NAVY_DEEP})` }}>
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: accentColor, filter: 'blur(50px)' }} />
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-start gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover" style={{ background: '#fff', padding: 2 }} />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${ORANGE_LIGHT})`, boxShadow: `0 3px 8px ${accentColor}44, inset 0 1px 0 rgba(255,255,255,0.3)` }}>
              <InfinityMark size={20} color="#FFFFFF" strokeWidth={3.5} glow={true} />
            </div>
          )}
          <div>
            <p className="text-white font-black text-base leading-tight">{nameText || 'Your Business Name'}</p>
            <p className="text-white/50 text-xs">{roleText || 'Your Tagline'}</p>
          </div>
        </div>
        {/* QR code placeholder */}
        <div className="w-14 h-14 bg-white rounded-lg p-1.5">
          <div className="w-full h-full rounded grid grid-cols-6 gap-px p-0.5" style={{ background: NAVY }}>
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between relative z-10">
        <span className="font-black text-xs tracking-wider" style={{ color: accentColor, textShadow: `0 0 8px ${accentColor}44` }}>
          BING∞ CONNECT
        </span>
        <Nfc className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
      </div>
    </div>
  );
}

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
  const [ordered, setOrdered] = useState(false);

  const subtotal = UNIT_PRICE * quantity;
  const total = subtotal + SETUP_FEE;

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

  const handlePlaceOrder = () => {
    addToCart({
      id: `custom-nfc-${Date.now()}`,
      name: `Custom NFC ${PRODUCT_TYPES.find(p => p.id === productType)?.label} (Bulk)`,
      price: total,
      image: logoUrl,
      activationCode: 'CUSTOM-BULK',
      customDesign: { productType, cardColor, accentColor, nameText, roleText, finish, quantity },
    }, 1);
    setOrdered(true);
    setTimeout(() => { setOrdered(false); navigate('/cart'); }, 1200);
  };

  const panelBg = isDark ? 'bg-[#13162a]' : 'bg-white';
  const panelBorder = isDark ? 'border-white/8' : `border-[${BORDER}]`;
  const headText = isDark ? 'text-white' : `text-[${INK}]`;
  const mutedText = isDark ? 'text-white/40' : `text-[${MUTED}]`;
  const inputCls = `w-full px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-orange-400/40 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-800'}`;

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: BORDER }}>
      <div className="flex flex-col lg:flex-row">
        {/* ── Left: Controls ── */}
        <div className="lg:w-72 p-5 overflow-y-auto border-b lg:border-b-0 lg:border-r" style={{ background: isDark ? '#13162a' : BG, borderColor: BORDER }}>
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-wider" style={{ color: ORANGE }}>CUSTOM NFC</p>
            <h2 className="text-lg font-black" style={{ color: isDark ? '#fff' : INK }}>Design Studio</h2>
            <p className="text-[10px] mt-1" style={{ color: MUTED }}>Create branded NFC devices for your business</p>
          </div>

          {/* Product Type */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: isDark ? '#fff' : INK }}>Product Type</p>
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_TYPES.map((p) => (
                <button key={p.id} onClick={() => setProductType(p.id)}
                  className={`p-2 rounded-lg border-2 text-center transition-all ${productType === p.id ? 'bg-white' : 'bg-white'}`}
                  style={{ borderColor: productType === p.id ? ORANGE : BORDER }}>
                  <div className="w-full h-8 rounded mb-1" style={{ background: productType === p.id ? NAVY : BORDER }} />
                  <span className="text-[9px] font-bold" style={{ color: productType === p.id ? ORANGE : MUTED }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: isDark ? '#fff' : INK }}>Logo</p>
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
            <p className="text-xs font-black mb-2" style={{ color: isDark ? '#fff' : INK }}>Card Color</p>
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
            <p className="text-xs font-black mb-2" style={{ color: isDark ? '#fff' : INK }}>Accent Color</p>
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
              <p className="text-xs font-black mb-1.5" style={{ color: isDark ? '#fff' : INK }}>Name on Card</p>
              <input value={nameText} onChange={(e) => setNameText(e.target.value)} placeholder="e.g. Diallo Law Firm" className={inputCls} />
            </div>
            <div>
              <p className="text-xs font-black mb-1.5" style={{ color: isDark ? '#fff' : INK }}>Role / Tagline</p>
              <input value={roleText} onChange={(e) => setRoleText(e.target.value)} placeholder="e.g. Immigration · Civil · Criminal" className={inputCls} />
            </div>
          </div>

          {/* Finish */}
          <div className="mb-2">
            <p className="text-xs font-black mb-2" style={{ color: isDark ? '#fff' : INK }}>Finish</p>
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
            <CardPreview productType={productType} cardColor={cardColor} accentColor={accentColor}
              logoUrl={logoUrl} nameText={nameText} roleText={roleText} side="front" />
            <p className="text-center text-[10px] font-bold mt-2" style={{ color: MUTED }}>FRONT</p>
          </div>
          <div className="transition-transform hover:scale-105">
            <CardPreview productType={productType} cardColor={cardColor} accentColor={accentColor}
              logoUrl={logoUrl} nameText={nameText} roleText={roleText} side="back" />
            <p className="text-center text-[10px] font-bold mt-2" style={{ color: MUTED }}>BACK</p>
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="lg:w-64 p-5 border-t lg:border-t-0 lg:border-l" style={{ background: isDark ? '#13162a' : '#fff', borderColor: BORDER }}>
          <p className="text-xs font-black mb-4" style={{ color: isDark ? '#fff' : INK }}>Order Summary</p>
          <div className="space-y-3 mb-5">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>Product</span>
              <span className="text-[10px] font-bold" style={{ color: isDark ? '#fff' : INK }}>NFC {PRODUCT_TYPES.find(p => p.id === productType)?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>Finish</span>
              <span className="text-[10px] font-bold" style={{ color: isDark ? '#fff' : INK }}>{finish}</span>
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
              <span className="text-[10px] font-bold" style={{ color: isDark ? '#fff' : INK }}>${UNIT_PRICE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>Subtotal</span>
              <span className="text-[10px] font-bold" style={{ color: isDark ? '#fff' : INK }}>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>Setup Fee</span>
              <span className="text-[10px] font-bold" style={{ color: isDark ? '#fff' : INK }}>${SETUP_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
              <span className="text-xs font-black" style={{ color: isDark ? '#fff' : INK }}>Total</span>
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