import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Shield, Truck, RefreshCw } from 'lucide-react';
import { PRODUCTS } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';

const CATEGORIES = [
  { id: 'all',      label: 'All Products' },
  { id: 'card',     label: 'Cards' },
  { id: 'keychain', label: 'Keychains & Fobs' },
  { id: 'tag',      label: 'Tags' },
  { id: 'sticker',  label: 'Stickers' },
  { id: 'stand',    label: 'Stands' },
  { id: 'bracelet', label: 'Bracelets' },
];

// Map URL ?category= param values to internal category IDs
const CATEGORY_PARAM_MAP = {
  cards: 'card', card: 'card',
  keychains: 'keychain', keychain: 'keychain',
  fobs: 'keychain', fob: 'keychain',
  tags: 'tag', tag: 'tag',
  stickers: 'sticker', sticker: 'sticker',
  stands: 'stand', stand: 'stand',
  bracelets: 'bracelet', bracelet: 'bracelet',
};

const BADGE_STYLES = {
  'Best Seller': { background: '#FF7A00', color: '#fff' },
  'New':         { background: '#0B2E6B', color: '#fff' },
  'Premium':     { background: '#1e293b', color: '#fbbf24' },
  'Eco':         { background: '#16a34a', color: '#fff' },
  'Wearable':    { background: '#7c3aed', color: '#fff' },
  'Counter':     { background: '#0B2E6B', color: '#fff' },
  'Desk':        { background: '#0B2E6B', color: '#fff' },
};

export default function Shop() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(getCartCount());
  const [addedId, setAddedId] = useState(null);

  // Read ?category= from URL, map to internal ID, default 'all'
  const paramCategory = new URLSearchParams(location.search).get('category')?.toLowerCase();
  const initialFilter = CATEGORY_PARAM_MAP[paramCategory] || 'all';
  const [filter, setFilter] = useState(initialFilter);

  // Sync if URL changes (e.g. user clicks a dashboard link)
  useEffect(() => {
    const param = new URLSearchParams(location.search).get('category')?.toLowerCase();
    setFilter(CATEGORY_PARAM_MAP[param] || 'all');
  }, [location.search]);

  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setCartCount(getCartCount());
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Nav ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-semibold hover:underline" style={{ color: '#0B2E6B' }}>
              ← Bingoo Connect
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-base font-bold text-slate-900">NFC Shop</h1>
          </div>
          <Link to="/cart">
            <button className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-slate-400 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center" style={{ background: '#FF7A00' }}>
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div style={{ background: 'linear-gradient(135deg, #0B2E6B 0%, #1a4a9e 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
                style={{ background: 'rgba(255,122,0,0.18)', color: '#FDBA21', border: '1px solid rgba(255,122,0,0.35)' }}>
                ✦ Official Bingoo NFC Products
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                Share Your Profile.<br />One Tap.
              </h2>
              <p className="text-blue-200 text-sm md:text-base leading-relaxed max-w-md">
                Premium NFC cards, keychains, stickers, stands, and bracelets — all pre-programmed with your Bingoo digital profile.
              </p>
            </div>
            <div className="flex gap-6 text-xs text-blue-300 md:flex-col md:gap-3">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#FDBA21]" /> Secure Checkout</span>
              <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[#FDBA21]" /> Fast Shipping</span>
              <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-[#FDBA21]" /> 30-Day Returns</span>
            </div>
          </div>
        </div>
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #FF7A00, #FDBA21, #FF7A00)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Category Filters ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
              style={filter === cat.id
                ? { background: '#0B2E6B', color: '#fff', boxShadow: '0 2px 10px rgba(11,46,107,0.3)' }
                : { background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Products Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, idx) => (
            <div
              key={`${product.id}-${idx}`}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Image container — fixed height, object-contain so full product is visible */}
              <div className="relative overflow-hidden bg-slate-50" style={{ height: '220px' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <span
                    className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={BADGE_STYLES[product.badge] || { background: '#1e293b', color: '#fff' }}
                  >
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Card content */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1 leading-tight">{product.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-4">{product.tagline}</p>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex-shrink-0">
                    <span className="text-xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 ml-1">USD</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link to={`/product/${product.id}`}>
                      <button
                        className="px-3 py-2 rounded-xl text-xs font-bold border transition-colors"
                        style={{ borderColor: '#0B2E6B', color: '#0B2E6B', background: '#fff' }}
                      >
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
            { icon: '🔒', title: 'Secure Payment',  sub: 'Stripe-powered checkout' },
            { icon: '🚚', title: 'Fast Shipping',    sub: 'US & international delivery' },
            { icon: '↩️', title: '30-Day Returns',   sub: 'Hassle-free guarantee' },
            { icon: '📲', title: 'Plug & Play',      sub: 'No app needed to receive' },
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