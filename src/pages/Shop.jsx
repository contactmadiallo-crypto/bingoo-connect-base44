import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Infinity as InfinityIcon, Wifi, Share2, ShieldCheck, TrendingUp } from 'lucide-react';
import { PRODUCTS } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';

const FOOTER_FEATURES = [
  { icon: Wifi,       label: 'NFC TECHNOLOGY' },
  { icon: Share2,     label: 'INSTANT SHARING' },
  { icon: ShieldCheck,label: 'SECURE & SMART' },
  { icon: TrendingUp, label: 'DESIGNED TO GROW' },
];

export default function Shop() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(getCartCount());
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    setCartCount(getCartCount());
  }, []);

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0 border border-slate-200 rounded-lg overflow-hidden bg-white">

          {PRODUCTS.map((product, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            return (
              <div
                key={product.id}
                className="flex flex-col border-b border-r border-slate-200 last:border-r-0 [&:nth-child(5n)]:border-r-0 pb-4"
              >
                {/* Header: orange number + uppercase name */}
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black" style={{ color: '#f59e0b' }}>{num}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 leading-tight">
                      {product.name.replace('NFC ', '')}
                    </span>
                  </div>
                </div>

                {/* Product image */}
                <Link to={`/product/${product.id}`} className="block flex-1">
                  <div className="relative bg-white flex items-center justify-center px-3" style={{ minHeight: '180px' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      style={{ maxHeight: '180px' }}
                    />
                    {product.badge && (
                      <span
                        className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ background: '#f59e0b', color: '#fff' }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Activation code strip */}
                <div className="mx-4 mt-2 mb-2 px-3 py-1.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Activation</span>
                  <span className="text-[11px] font-bold text-slate-700">{product.activationCode}</span>
                </div>

                {/* Price + actions */}
                <div className="px-4 flex items-center justify-between gap-2">
                  <span className="text-base font-black text-slate-900">${product.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white transition-all"
                    style={{ background: addedId === product.id ? '#16a34a' : '#f59e0b' }}
                  >
                    {addedId === product.id ? '✓' : '+ Cart'}
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