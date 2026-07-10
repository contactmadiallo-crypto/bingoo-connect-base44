import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Infinity as InfinityIcon, Wifi, Share2, ShieldCheck, TrendingUp, Check } from 'lucide-react';
import { PRODUCTS } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316';

const FOOTER_FEATURES = [
  { icon: Wifi,        label: 'NFC TECHNOLOGY' },
  { icon: Share2,      label: 'INSTANT SHARING' },
  { icon: ShieldCheck, label: 'SECURE & SMART' },
  { icon: TrendingUp,  label: 'DESIGNED TO GROW' },
];

function ProductTile({ product, idx, onAdd, added }) {
  const num = String(idx + 1).padStart(2, '0');
  return (
    <div className="flex flex-col bg-white border-b border-r border-slate-200 last:border-r-0 pb-4 transition-shadow hover:shadow-lg">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black" style={{ color: ORANGE }}>{num}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 leading-tight">
            {product.name.replace('NFC ', '')}
          </span>
        </div>
      </div>

      <Link to={`/product/${product.id}`} className="block flex-1">
        <div className="relative flex items-center justify-center px-3 overflow-hidden"
          style={{ minHeight: '180px', background: `linear-gradient(135deg, ${NAVY}08, ${ORANGE}06)` }}>
          <img src={product.image} alt={product.name}
            loading="lazy" decoding="async"
            className="w-full object-contain transition-transform duration-300 hover:scale-105"
            style={{ maxHeight: '180px', aspectRatio: '1' }} />
          {product.badge && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide text-white"
              style={{ background: ORANGE }}>
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      <div className="mx-4 mt-2 mb-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Activation</span>
        <span className="text-[11px] font-bold" style={{ color: NAVY }}>{product.activationCode}</span>
      </div>

      <div className="px-4 flex items-center justify-between gap-2">
        <span className="text-base font-black text-slate-900">${product.price.toFixed(2)}</span>
        <button
          onClick={() => onAdd(product)}
          className="text-xs font-bold px-3.5 py-2 rounded-lg text-white transition-all flex items-center gap-1 active:scale-95"
          style={{ background: added ? '#16a34a' : ORANGE }}>
          {added ? <><Check className="w-3.5 h-3.5" /> Added</> : '+ Cart'}
        </button>
      </div>
    </div>
  );
}

export default function Shop() {
  const [cartCount, setCartCount] = useState(getCartCount());
  const [addedId, setAddedId] = useState(null);

  useEffect(() => { setCartCount(getCartCount()); }, []);

  const handleAdd = (product) => {
    addToCart(product, 1);
    setCartCount(getCartCount());
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
      {/* ── Nav ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group min-w-0">
            <InfinityIcon className="w-5 h-5 flex-shrink-0" style={{ color: ORANGE }} />
            <span className="text-sm font-bold text-slate-800 group-hover:text-slate-600 transition-colors whitespace-nowrap">← Bingoo Connect</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <h1 className="text-sm font-black uppercase tracking-wider hidden sm:block" style={{ color: NAVY }}>NFC Product Shop</h1>
          </Link>
          <Link to="/cart">
            <button className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-slate-400 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center" style={{ background: ORANGE }}>
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="max-w-[1400px] mx-auto px-4 pt-6">
        <div className="rounded-2xl overflow-hidden flex items-center justify-between px-6 py-5"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <InfinityIcon className="w-6 h-6" style={{ color: ORANGE }} />
              <span className="text-white font-black text-lg">Bing<span style={{ color: ORANGE }}>∞</span> Connect</span>
            </div>
            <p className="text-white/60 text-xs">Premium NFC hardware with infinity branding · Tap to share your profile</p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            {FOOTER_FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-1.5">
                <f.icon className="w-4 h-4" style={{ color: ORANGE }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {PRODUCTS.map((product, idx) => (
            <ProductTile key={product.id} product={product} idx={idx} onAdd={handleAdd} added={addedId === product.id} />
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: NAVY }}>
        <div className="max-w-[1400px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <InfinityIcon className="w-5 h-5" style={{ color: ORANGE }} />
            <span className="text-sm font-black text-white tracking-wide">BING<span style={{ color: ORANGE }}>∞</span> CONNECT</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {FOOTER_FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-1.5">
                <f.icon className="w-4 h-4" style={{ color: ORANGE }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}