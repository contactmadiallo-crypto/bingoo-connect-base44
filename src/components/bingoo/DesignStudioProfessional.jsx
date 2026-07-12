import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ShoppingCart, Check, Save, Trash2, Nfc } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { addToCart } from '@/lib/cartStore';
import { getDrafts, saveDraft, deleteDraft } from '@/lib/draftStore';
import { InfinityMark } from '@/components/mockups/brand/InfinityMark';
import { PRODUCT_TYPES, ProductTypeIcon, ProductPreview } from '@/components/bingoo/designStudio/ProductPreview';

const NAVY = '#0b2149', ORANGE = '#f97316';
const BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

const CARD_COLORS = [
  { name: 'Navy', value: '#0b2149' },
  { name: 'Black', value: '#0F172A' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Burgundy', value: '#7C1D3A' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'White', value: '#F1F5F9' },
];

const ACCENT_COLORS = ['#f97316', '#FFD700', '#FFFFFF', '#22C55E', '#3b82f6', '#ec4899'];
const FINISHES = ['Matte', 'Glossy'];

const UNIT_PRICE = 4.99;
const MIN_QTY = 1;
const MAX_QTY = 5;

/**
 * DesignStudioProfessional — Simplified single-card customization for Professional plan.
 * - No bulk ordering (1-5 units only)
 * - No remove-branding option
 * - QR/NFC destination field
 * - Basic color/logo/text customization
 */
export default function DesignStudioProfessional({ isDark, profile }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [productType, setProductType] = useState('card');
  const [logoUrl, setLogoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cardColor, setCardColor] = useState(NAVY);
  const [accentColor, setAccentColor] = useState(ORANGE);
  const [nameText, setNameText] = useState(profile?.display_name || '');
  const [roleText, setRoleText] = useState(profile?.job_title || '');
  const [nfcDestination, setNfcDestination] = useState(profile?.username ? `${window.location.origin}/p/${profile.username}` : '');
  const [finish, setFinish] = useState('Matte');
  const [quantity, setQuantity] = useState(1);
  const [ordered, setOrdered] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [drafts, setDrafts] = useState([]);

  useEffect(() => { setDrafts(getDrafts().filter(d => d._mode === 'pro')); }, []);

  const subtotal = UNIT_PRICE * quantity;
  const total = subtotal;
  const productLabel = PRODUCT_TYPES.find(p => p.id === productType)?.label || 'Card';

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLogoUrl(file_url);
    } catch (err) { console.error('Upload failed:', err); }
    finally { setUploading(false); }
  };

  const handleSaveDraft = () => {
    saveDraft({
      _mode: 'pro',
      productType, cardColor, accentColor, nameText, roleText, nfcDestination, finish, quantity, logoUrl,
      name: `${nameText || 'Untitled'} — ${productLabel} (Personal)`,
    });
    setDrafts(getDrafts().filter(d => d._mode === 'pro'));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleLoadDraft = (d) => {
    setProductType(d.productType || 'card');
    setCardColor(d.cardColor || NAVY);
    setAccentColor(d.accentColor || ORANGE);
    setNameText(d.nameText || '');
    setRoleText(d.roleText || '');
    setNfcDestination(d.nfcDestination || '');
    setFinish(d.finish || 'Matte');
    setQuantity(d.quantity || 1);
    setLogoUrl(d.logoUrl || null);
  };

  const handlePlaceOrder = () => {
    addToCart({
      id: `custom-nfc-pro-${Date.now()}`,
      name: `Personal NFC ${productLabel} (${quantity})`,
      price: total,
      image: logoUrl,
      activationCode: 'CUSTOM-PERSONAL',
      customDesign: { productType, cardColor, accentColor, nameText, roleText, nfcDestination, finish, quantity, _mode: 'pro' },
    }, 1);
    setOrdered(true);
    setTimeout(() => { setOrdered(false); navigate('/cart'); }, 1200);
  };

  const inputCls = `w-full px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-orange-400/40 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-800'}`;
  const labelColor = isDark ? '#fff' : INK;

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: BORDER }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${NAVY}, #071A3D)` }}>
        <InfinityMark className="w-8 h-8" />
        <div>
          <h2 className="text-white font-black text-base">Personal Card Studio</h2>
          <p className="text-white/50 text-[10px]">Design your custom NFC card — Professional plan</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left: Controls */}
        <div className="lg:w-72 p-5 overflow-y-auto border-b lg:border-b-0 lg:border-r" style={{ background: isDark ? '#13162a' : BG, borderColor: BORDER }}>
          {/* Product Type */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: labelColor }}>Product Type</p>
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_TYPES.slice(0, 6).map((p) => (
                <button key={p.id} onClick={() => setProductType(p.id)}
                  className="p-2 rounded-lg border-2 text-center transition-all bg-white flex flex-col items-center justify-center min-h-[48px]"
                  style={{ borderColor: productType === p.id ? ORANGE : BORDER }}>
                  <div className="flex items-center justify-center h-7 mb-1">
                    <ProductTypeIcon typeId={p.id} active={productType === p.id} />
                  </div>
                  <span className="text-[9px] font-bold" style={{ color: productType === p.id ? ORANGE : MUTED }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: labelColor }}>Logo (Optional)</p>
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed rounded-xl p-3 text-center hover:border-orange-400 transition-colors bg-white"
              style={{ borderColor: BORDER }}>
              {logoUrl ? (
                <div className="flex items-center justify-center gap-2">
                  <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                  <p className="text-[9px] font-bold" style={{ color: '#16a34a' }}>✓ Uploaded</p>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-xl mx-auto mb-1 flex items-center justify-center" style={{ background: `${NAVY}10` }}>
                    {uploading ? <div className="w-3 h-3 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
                      : <Upload className="w-4 h-4" style={{ color: NAVY }} />}
                  </div>
                  <p className="text-[9px] font-bold" style={{ color: INK }}>{uploading ? 'Uploading...' : 'Upload'}</p>
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
              <input value={nameText} onChange={(e) => setNameText(e.target.value)} placeholder="Your Name" className={inputCls} />
            </div>
            <div>
              <p className="text-xs font-black mb-1.5" style={{ color: labelColor }}>Role / Title</p>
              <input value={roleText} onChange={(e) => setRoleText(e.target.value)} placeholder="e.g. Consultant" className={inputCls} />
            </div>
            <div>
              <p className="text-xs font-black mb-1.5" style={{ color: labelColor }}>NFC Destination URL</p>
              <input value={nfcDestination} onChange={(e) => setNfcDestination(e.target.value)} placeholder="/p/yourusername" className={inputCls} />
              <p className="text-[9px] mt-1" style={{ color: MUTED }}>Where the NFC card links to when tapped</p>
            </div>
          </div>

          {/* Finish */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: labelColor }}>Finish</p>
            <div className="grid grid-cols-2 gap-2">
              {FINISHES.map((f) => (
                <button key={f} onClick={() => setFinish(f)}
                  className="px-2 py-2 rounded-lg border text-[9px] font-bold text-center transition-all"
                  style={finish === f ? { background: ORANGE, color: '#fff', borderColor: ORANGE } : { borderColor: BORDER, color: MUTED, background: '#fff' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Drafts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black" style={{ color: labelColor }}>My Drafts</p>
              <button onClick={handleSaveDraft}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
                style={{ background: savedFlash ? '#16a34a' : `${NAVY}10`, color: savedFlash ? '#fff' : NAVY }}>
                {savedFlash ? <><Check className="w-3 h-3" /> Saved</> : <><Save className="w-3 h-3" /> Save</>}
              </button>
            </div>
            {drafts.length === 0 ? (
              <p className="text-[9px] text-center py-3" style={{ color: MUTED }}>No saved drafts</p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {drafts.map(d => (
                  <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg border" style={{ borderColor: BORDER, background: '#fff' }}>
                    <div className="w-6 h-6 rounded flex-shrink-0" style={{ background: d.cardColor || NAVY }} />
                    <button onClick={() => handleLoadDraft(d)} className="flex-1 text-left min-w-0">
                      <p className="text-[9px] font-bold truncate" style={{ color: INK }}>{d.name || 'Draft'}</p>
                    </button>
                    <button onClick={() => setDrafts(deleteDraft(d.id))} className="p-1"><Trash2 className="w-3 h-3 text-red-400" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Preview */}
        <div className="flex-1 flex flex-col items-center justify-center p-6"
          style={{ background: isDark ? '#0f1226' : 'linear-gradient(180deg, #F7F9FC, #EDF1F7)' }}>
          <div className="flex items-center gap-2 w-full max-w-md mb-4">
            <Nfc className="w-4 h-4" style={{ color: ORANGE }} />
            <p className="text-sm font-black" style={{ color: isDark ? '#fff' : INK }}>Live Preview</p>
          </div>
          <div className="mb-6 transition-transform hover:scale-105">
            <ProductPreview productType={productType} cardColor={cardColor} accentColor={accentColor}
              logoUrl={logoUrl} nameText={nameText} roleText={roleText} removeBranding={false}
              side="front" isDark={isDark} />
            <p className="text-center text-[10px] font-bold mt-3" style={{ color: MUTED }}>FRONT</p>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:w-56 p-5 border-t lg:border-t-0 lg:border-l" style={{ background: isDark ? '#13162a' : '#fff', borderColor: BORDER }}>
          <p className="text-xs font-black mb-4" style={{ color: labelColor }}>Order Summary</p>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between"><span className="text-[10px] font-bold" style={{ color: MUTED }}>Product</span><span className="text-[10px] font-bold" style={{ color: labelColor }}>NFC {productLabel}</span></div>
            <div className="flex justify-between"><span className="text-[10px] font-bold" style={{ color: MUTED }}>Finish</span><span className="text-[10px] font-bold" style={{ color: labelColor }}>{finish}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>Quantity</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(Math.max(MIN_QTY, quantity - 1))} className="w-6 h-6 rounded-lg border font-black" style={{ borderColor: BORDER }}>−</button>
                <span className="text-[10px] font-black" style={{ color: ORANGE }}>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(MAX_QTY, quantity + 1))} className="w-6 h-6 rounded-lg border font-black" style={{ borderColor: BORDER }}>+</button>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-3 space-y-2 mb-4" style={{ background: isDark ? '#1a1d33' : BG }}>
            <div className="flex justify-between"><span className="text-[10px] font-bold" style={{ color: MUTED }}>Unit</span><span className="text-[10px] font-bold" style={{ color: labelColor }}>${UNIT_PRICE.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
              <span className="text-xs font-black" style={{ color: labelColor }}>Total</span>
              <span className="text-sm font-black" style={{ color: ORANGE }}>${total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={handlePlaceOrder}
            className="w-full py-2.5 text-xs font-black text-white rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: ordered ? '#16a34a' : ORANGE }}>
            {ordered ? <><Check className="w-3.5 h-3.5" /> Added!</> : <><ShoppingCart className="w-3.5 h-3.5" /> Order Card</>}
          </button>
          <p className="text-[9px] text-center mt-3" style={{ color: MUTED }}>7-10 business days · Free shipping</p>
        </div>
      </div>
    </div>
  );
}