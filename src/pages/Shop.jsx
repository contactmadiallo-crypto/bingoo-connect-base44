import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Infinity as InfinityIcon, Wifi, Share2, ShieldCheck, TrendingUp, Smartphone } from 'lucide-react';
import { PRODUCTS } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';

const FOOTER_FEATURES = [
  { icon: Wifi,        label: 'NFC TECHNOLOGY' },
  { icon: Share2,      label: 'INSTANT SHARING' },
  { icon: ShieldCheck, label: 'SECURE & SMART' },
  { icon: TrendingUp,  label: 'DESIGNED TO GROW' },
];

const qrUrl = (code) => `https://api.qrserver.com/v1/create-qr-code/?size=120x120&bgcolor=ffffff&color=000000&margin=0&data=${encodeURIComponent(code)}`;

export default function Shop() {
  const [cartCount, setCartCount] = useState(getCartCount());
  const [addedId, setAddedId] = useState(null);

  useEffect(() => { setCartCount(getCartCount()); }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setCartCount(getCartCount());
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen" style={{ background: '#f9fafb' }}>

      {/* ── Slim Nav ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-sm font-bold text-slate-800 group-hover:text-[#f59e0b] transition-colors">← Bingoo Connect</span>
            <span className="text-slate-300">|</span>
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">NFC Product Shop</h1>
          </Link>
          <Link to="/cart">
            <button className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-[#f59e0b] transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center" style={{ background: '#f59e0b' }}>
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Product Grid — 2 × 5 matching official mockup ── */}
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 border border-slate-200 rounded-lg overflow-hidden bg-white">

          {PRODUCTS.map((product, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            const isOddOn5 = (idx + 1) % 5 !== 0;
            return (
              <div
                key={product.id}
                className={`flex flex-col p-0 border-slate-200
                  ${idx < PRODUCTS.length - 5 ? 'border-b' : ''}
                  ${isOddOn5 ? 'lg:border-r' : ''}
                  sm:max-lg:border-r sm:max-lg:[&:nth-child(2n)]:border-r-0
                `}
              >
                {/* Header: orange number + uppercase name */}
                <div className="px-4 pt-4 pb-2 flex items-center gap-2 flex-wrap">
                  <span className="text-2xl font-black leading-none" style={{ color: '#f59e0b' }}>{num}</span>
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-800 leading-tight">
                    NFC {product.name.replace('NFC ', '')}
                  </span>
                </div>

                {/* Product + Activation card side by side */}
                <div className="flex items-center justify-center gap-2 px-3 py-2 flex-1" style={{ minHeight: '200px' }}>
                  {/* Product image */}
                  <Link to={`/product/${product.id}`} className="flex-1 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '190px' }}
                    />
                  </Link>

                  {/* White activation backing card */}
                  <div className="w-[88px] flex-shrink-0 bg-white rounded-md border border-slate-200 shadow-sm p-2 flex flex-col items-center gap-1">
                    <span className="text-[7px] font-semibold text-slate-400 uppercase tracking-wide text-center leading-none">Activation Code</span>
                    <span className="text-[10px] font-bold text-slate-800 tracking-wider text-center leading-none">{product.activationCode}</span>
                    <img
                      src={qrUrl(product.activationCode)}
                      alt={`QR ${product.activationCode}`}
                      className="w-14 h-14"
                    />
                    <Smartphone className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
                  </div>
                </div>

                {/* Price + actions */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-900 leading-none">${product.price.toFixed(2)}</span>
                    <span className="text-[9px] text-slate-400 uppercase">USD</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="text-[11px] font-bold px-3 py-2 rounded-lg text-white transition-all"
                    style={{ background: addedId === product.id ? '#16a34a' : '#f59e0b' }}
                  >
                    {addedId === product.id ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Dark Navy Feature Footer Bar ── */}
      <div style={{ background: '#1a202c' }}>
        <div className="max-w-[1400px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          {/* Infinity logo mark */}
          <div className="flex items-center gap-2 pr-4 sm:border-r sm:border-white/10">
            <InfinityIcon className="w-6 h-6" style={{ color: '#f59e0b' }} />
            <span className="text-sm font-black text-white tracking-wide hidden sm:inline">BINGOO<span style={{ color: '#f59e0b' }}> CONNECT</span></span>
          </div>

          {/* Feature badges */}
          {FOOTER_FEATURES.map((feat, i) => (
            <React.Fragment key={feat.label}>
              <div className="flex items-center gap-2 px-4">
                <feat.icon className="w-5 h-5" style={{ color: '#f59e0b' }} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">{feat.label}</span>
              </div>
              {i < FOOTER_FEATURES.length - 1 && (
                <div className="h-6 w-px bg-white/10 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}