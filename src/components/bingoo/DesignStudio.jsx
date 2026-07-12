import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Nfc, ShoppingCart, Check, Clock, Package, Shield, Save, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { addToCart } from '@/lib/cartStore';
import { getDrafts, saveDraft, deleteDraft } from '@/lib/draftStore';
import { InfinityMark } from '@/components/mockups/brand/InfinityMark';
import { PRODUCT_TYPES, ProductTypeIcon, ProductPreview } from '@/components/bingoo/designStudio/ProductPreview';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', ORANGE_LIGHT = '#fb923c';
const BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

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

// ── Pre-designed templates for quick start ──
const TEMPLATES = [
  { id: 'corp_navy',   name: 'Corporate Navy',  cardColor: '#0b2149', accentColor: '#f97316', finish: 'Matte' },
  { id: 'clean_white', name: 'Clean White',     cardColor: '#F1F5F9', accentColor: '#3b82f6', finish: 'Glossy' },
  { id: 'bold_black',  name: 'Bold Black',      cardColor: '#0F172A', accentColor: '#FFD700', finish: 'Matte' },
  { id: 'vibrant_org', name: 'Vibrant Orange',  cardColor: '#f97316', accentColor: '#FFFFFF', finish: 'Glossy' },
  { id: 'elegant_burg',name: 'Elegant Burgundy', cardColor: '#7C1D3A', accentColor: '#FFD700', finish: 'Matte' },
  { id: 'tech_blue',   name: 'Tech Blue',       cardColor: '#3b82f6', accentColor: '#FFFFFF', finish: 'Frosted' },
];

const UNIT_PRICE = 3.99;
const SETUP_FEE = 25.00;
const REMOVE_BRANDING_FEE = 2.50;
const MIN_QTY = 25;
const MAX_QTY = 500;

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
  const [nfcDestination, setNfcDestination] = useState('');
  const [activeTemplate, setActiveTemplate] = useState(null);
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
      productType, cardColor, accentColor, nameText, roleText, nfcDestination, finish, quantity,
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
    setNfcDestination(d.nfcDestination || '');
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
      customDesign: { productType, cardColor, accentColor, nameText, roleText, nfcDestination, finish, quantity, removeBranding },
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

          {/* Templates */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: labelColor }}>Quick Templates</p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => {
                  setCardColor(t.cardColor); setAccentColor(t.accentColor); setFinish(t.finish);
                  setActiveTemplate(t.id);
                }}
                  className="p-1.5 rounded-lg border-2 text-center transition-all"
                  style={{ borderColor: activeTemplate === t.id ? ORANGE : BORDER, background: '#fff' }}>
                  <div className="w-full h-8 rounded mb-1" style={{ background: t.cardColor }}>
                    <div className="w-full h-1.5 rounded-t" style={{ background: t.accentColor }} />
                  </div>
                  <span className="text-[8px] font-bold" style={{ color: activeTemplate === t.id ? ORANGE : MUTED }}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Type */}
          <div className="mb-5">
            <p className="text-xs font-black mb-2" style={{ color: labelColor }}>Product Type</p>
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_TYPES.map((p) => (
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
            <div>
              <p className="text-xs font-black mb-1.5" style={{ color: labelColor }}>NFC Destination URL</p>
              <input value={nfcDestination} onChange={(e) => setNfcDestination(e.target.value)} placeholder="/p/yourusername or any URL" className={inputCls} />
              <p className="text-[9px] mt-1" style={{ color: MUTED }}>Where the NFC card links to when tapped</p>
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