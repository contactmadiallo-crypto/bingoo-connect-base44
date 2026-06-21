import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Check, Shield, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';

const CATEGORIES = [
  { id: 'all',      label: 'All Products' },
  { id: 'card',     label: 'Cards' },
  { id: 'keychain', label: 'Keychains' },
  { id: 'sticker',  label: 'Stickers' },
  { id: 'stand',    label: 'Stands' },
  { id: 'bracelet', label: 'Bracelets' },
  { id: 'bundle',   label: 'Bundles' },
  { id: 'bulk',     label: 'Corporate' },
];

const BADGE_STYLES = {
  'Best Seller': 'bg-[#FF7A00] text-white',
  'New':         'bg-[#0B2E6B] text-white',
  'Save $13':    'bg-emerald-600 text-white',
  'Corporate':   'bg-slate-800 text-white',
};

export default function Shop() {
  const [cartCount, setCartCount] = useState(getCartCount());
  const [addedId, setAddedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setCartCount(getCartCount());
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen" style={{ background: '#f5f7fb' }}>

      {/* ── Top Nav ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-[#0B2E6B] font-semibold hover:underline">← Bingoo Connect</Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-bold text-slate-900">NFC Shop</h1>
          </div>
          <Link to="/cart">
            <button className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:border-[#0B2E6B] transition-colors text-sm font-semibold text-slate-700">
              <ShoppingCart className="w-4 h-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center" style={{ background: '#FF7A00' }}>
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, #0B2E6B 0%, #1a4a9e 60%, #0f3080 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-bold tracking-widest uppercase"
              style={{ background: 'rgba(255,122,0,0.15)', color: '#FDBA21', border: '1px solid rgba(255,122,0,0.3)' }}>
              ✦ Smart NFC Technology
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
              Share Your World<br />with One Tap
            </h2>
            <p className="text-blue-200 text-base mb-6 leading-relaxed">
              Professional NFC products that share your digital profile instantly. No app required for recipients.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-blue-300">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#FDBA21]" /> Secure Payments</span>
              <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[#FDBA21]" /> Fast Shipping</span>
              <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-[#FDBA21]" /> 30-Day Returns</span>
            </div>
          </div>
        </div>
        {/* Gold accent bar */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #FF7A00, #FDBA21, #FF7A00)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Category Filters ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border"
              style={filter === cat.id
                ? { background: '#0B2E6B', color: '#fff', border: '1px solid #0B2E6B', boxShadow: '0 2px 12px rgba(11,46,107,0.25)' }
                : { background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Products Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col group transition-all hover:shadow-xl hover:-translate-y-0.5 duration-200"
            >
              {/* Image */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/40" style={{ aspectRatio: '4/3' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_STYLES[product.badge] || 'bg-slate-800 text-white'}`}>
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1 leading-tight">{product.name}</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed flex-1">{product.tagline || product.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 ml-1">USD</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/product/${product.id}`}>
                      <button className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:border-[#0B2E6B] hover:text-[#0B2E6B] transition-colors">
                        Details
                      </button>
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
                      style={{ background: addedId === product.id ? '#16a34a' : '#FF7A00' }}
                    >
                      {addedId === product.id ? '✓ Added' : '+ Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Trust Bar ── */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔒', title: 'Secure Payment', sub: 'Stripe-powered checkout' },
            { icon: '🚚', title: 'Fast Shipping', sub: 'US & international delivery' },
            { icon: '↩️', title: '30-Day Returns', sub: 'Hassle-free guarantee' },
            { icon: '📲', title: 'Plug & Play', sub: 'No app needed to receive' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-bold text-slate-900 text-sm">{item.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}