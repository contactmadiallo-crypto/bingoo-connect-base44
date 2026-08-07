import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Infinity as InfinityIcon, Check, ArrowRight, Bell } from 'lucide-react';
import { PRODUCTS, COLLECTIONS, isPurchasable } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';
import { InfinityMark } from '@/components/bingoo/ui/BingooBrand';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', GOLD = '#FDBA21';

// ── Category selector tabs ──────────────────────────────────────────────────
const TABS = [
  { id: 'all', label: 'All Devices' },
  { id: 'professional', label: 'Professional' },
  { id: 'business', label: 'Business' },
  { id: 'asset', label: 'Asset Protection' },
  { id: 'premium', label: 'Premium' },
];

// ── Premium Metal Card Visual (CSS-based, flagship) ─────────────────────────
function PremiumCardThumb({ size = 160 }) {
  const h = size * 0.63;
  const markSize = Math.round(size * 0.22);
  return (
    <div className="relative rounded-xl flex items-center justify-center overflow-hidden"
      style={{
        width: size, height: h,
        background: `radial-gradient(ellipse 60% 40% at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 60%),
                     linear-gradient(135deg, #090d16 0%, #121622 30%, #0a0e18 60%, #0e1220 100%)`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.8) 1px, rgba(255,255,255,0.8) 2px)' }} />
      <div className="absolute" style={{
        width: markSize * 2, height: markSize * 2, borderRadius: '50%',
        background: `radial-gradient(circle, ${ORANGE}30 0%, transparent 70%)`, filter: 'blur(12px)',
      }} />
      <div className="relative flex flex-col items-center gap-1">
        <InfinityMark size={markSize} color={ORANGE} strokeWidth={3.5} glow />
        <span className="font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 7 }}>
          Bingoo Connect
        </span>
      </div>
    </div>
  );
}

// ── Coming Soon placeholder visual ──────────────────────────────────────────
function ComingSoonThumb({ name }) {
  return (
    <div className="relative rounded-xl flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: 180, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 4px 4px, #0b2149 1px, transparent 0)', backgroundSize: '20px 20px' }} />
      <div className="relative flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#0b2149' }}>
          <InfinityMark size={28} color={ORANGE} strokeWidth={3.5} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Coming Soon</span>
      </div>
      <span className="absolute bottom-2 right-3 text-[10px] font-bold text-slate-300 truncate max-w-[80%]">{name}</span>
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd, added }) {
  const purchasable = isPurchasable(product);
  const collection = COLLECTIONS.find(c => c.id === product.collection);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border-2 border-slate-200 bg-white flex flex-col overflow-hidden transition-all hover:shadow-lg"
      style={{ borderColor: purchasable ? '#e2e8f0' : '#f1f5f9' }}>

      {/* Image area */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative bg-slate-50 flex items-center justify-center overflow-hidden" style={{ minHeight: 180 }}>
          {product.image ? (
            <img src={product.image} alt={product.name} loading="lazy" decoding="async"
              className="w-full object-contain p-4 transition-transform duration-300 hover:scale-105"
              style={{ maxHeight: 180, aspectRatio: '1' }} />
          ) : (
            <ComingSoonThumb name={product.name} />
          )}
          {product.badge && (
            <span className="absolute top-2 left-2 z-10 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ background: product.availability === 'coming_soon' ? '#64748b' : ORANGE }}>
              {product.badge}
            </span>
          )}
          {!purchasable && (
            <span className="absolute top-2 right-2 z-10 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ background: '#94a3b8' }}>
              Coming Soon
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: (collection?.accent || NAVY) + '12', color: collection?.accent || NAVY }}>
            {collection?.label?.split(' ')[0]}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">{product.bestFor}</span>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-black text-sm mb-1 hover:text-orange-600 transition-colors" style={{ color: NAVY }}>{product.name}</h3>
        </Link>
        <p className="text-slate-500 text-xs leading-relaxed mb-3 flex-1 line-clamp-2">{product.tagline}</p>

        <div className="flex items-center justify-between gap-2 mt-auto">
          {purchasable ? (
            <>
              <span className="text-lg font-black text-slate-900">${product.price.toFixed(2)}</span>
              <div className="flex gap-1.5">
                <Link to={`/product/${product.id}`}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors">
                  View
                </Link>
                <button
                  onClick={() => onAdd(product)}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-white transition-all flex items-center gap-1 active:scale-95"
                  style={{ background: added ? '#16a34a' : ORANGE }}>
                  {added ? <><Check className="w-3 h-3" /> Added</> : '+ Cart'}
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-xs font-bold text-slate-400">Price TBA</span>
              <Link to={`/product/${product.id}`}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-white transition-all flex items-center gap-1"
                style={{ background: '#94a3b8' }}>
                <Bell className="w-3 h-3" /> Notify Me
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Shop Page ───────────────────────────────────────────────────────────
export default function Shop() {
  const [cartCount, setCartCount] = useState(getCartCount());
  const [addedId, setAddedId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { setCartCount(getCartCount()); }, []);

  const handleAdd = (product) => {
    addToCart(product, 1);
    setCartCount(getCartCount());
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const visibleProducts = activeTab === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.collection === activeTab);
  const activeCollection = COLLECTIONS.find(c => c.id === activeTab);

  // Grid columns logic: 2-product categories get a centered 2-col layout
  const productCount = visibleProducts.length;
  const gridCols = productCount <= 2
    ? 'grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
      {/* ── Nav ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group min-w-0">
            <InfinityIcon className="w-5 h-5 flex-shrink-0" style={{ color: ORANGE }} />
            <span className="text-sm font-bold text-slate-800 group-hover:text-slate-600 transition-colors whitespace-nowrap">← Bingoo Connect</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <h1 className="text-sm font-black uppercase tracking-wider hidden sm:block" style={{ color: NAVY }}>NFC Device Store</h1>
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

      {/* ── Hero ── */}
      <div className="max-w-[1400px] mx-auto px-4 pt-6">
        <div className="rounded-3xl overflow-hidden relative"
          style={{ background: `linear-gradient(145deg, ${NAVY_DEEP} 0%, ${NAVY} 50%, #13284f 100%)` }}>
          {/* Glow accents */}
          <div className="absolute pointer-events-none" style={{ width: 400, height: 400, top: '-30%', left: '-10%', background: `radial-gradient(circle, ${ORANGE}18 0%, transparent 70%)`, filter: 'blur(40px)' }} />
          <div className="absolute pointer-events-none" style={{ width: 300, height: 300, bottom: '-20%', right: '-5%', background: `radial-gradient(circle, ${GOLD}12 0%, transparent 70%)`, filter: 'blur(30px)' }} />

          <div className="relative grid md:grid-cols-2 gap-6 items-center p-8 md:p-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <InfinityIcon className="w-6 h-6" style={{ color: ORANGE }} />
                <span className="text-white font-black text-lg">Bing<span style={{ color: ORANGE }}>∞</span> Connect</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                Hardware built for<br />every connection.
              </h1>
              <p className="text-white/60 text-sm md:text-base mb-6 max-w-md leading-relaxed">
                Share your profile, connect your business or protect valuable assets with Bingoo NFC devices.
              </p>
              <div className="flex flex-wrap gap-2">
                {TABS.filter(t => t.id !== 'all').map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="px-4 py-2 rounded-full text-xs font-bold transition-all"
                    style={{
                      background: activeTab === tab.id ? ORANGE : 'rgba(255,255,255,0.08)',
                      color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.6)',
                      border: `1px solid ${activeTab === tab.id ? ORANGE : 'rgba(255,255,255,0.15)'}`,
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <PremiumCardThumb size={260} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Selector ── */}
      <div className="max-w-[1400px] mx-auto px-4 pt-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-5 py-2.5 rounded-full text-sm font-bold transition-all"
                style={{
                  background: isActive ? ORANGE : '#fff',
                  color: isActive ? '#fff' : NAVY,
                  border: `2px solid ${isActive ? ORANGE : '#e2e8f0'}`,
                  boxShadow: isActive ? `0 4px 14px ${ORANGE}30` : 'none',
                }}>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {activeCollection && (
          <div className="mb-5 text-center">
            <h2 className="text-xl font-black mb-1" style={{ color: NAVY }}>{activeCollection.label}</h2>
            <p className="text-slate-500 text-sm">{activeCollection.headline}</p>
            <p className="text-slate-400 text-xs mt-1">Best for: {activeCollection.bestFor}</p>
          </div>
        )}

        <motion.div layout className={`${gridCols} gap-4`}>
          {visibleProducts.map(product => (
            <ProductCard key={product.id} product={product} onAdd={handleAdd} added={addedId === product.id} />
          ))}
        </motion.div>

        {/* ── Profile Device vs Asset Device comparison ── */}
        <div className="mt-12 grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl p-6 border-2" style={{ borderColor: ORANGE + '30', background: '#fff' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4"
              style={{ background: ORANGE + '15', color: ORANGE }}>
              Profile Device
            </div>
            <p className="text-sm font-bold mb-3" style={{ color: NAVY }}>
              Tap → Profile → Contact → Lead → Booking
            </p>
            <p className="text-slate-500 text-xs mb-3">
              Profile devices open your professional Bingoo profile when tapped. Visitors see your contact info, links, and booking options.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['NFC Card', 'Metal Card', 'Wood Card', 'Keychain', 'Bracelet', 'Sticker', 'Table Stand'].map(item => (
                <span key={item} className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: NAVY + '08', color: NAVY }}>{item}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-6 border-2" style={{ borderColor: '#ef444430', background: '#fff' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4"
              style={{ background: '#ef444415', color: '#ef4444' }}>
              Asset Device
            </div>
            <p className="text-sm font-bold mb-3" style={{ color: NAVY }}>
              Tap / Scan → Lost Mode → Finder → Owner Reconnected
            </p>
            <p className="text-slate-500 text-xs mb-3">
              Asset devices open a Lost Mode recovery page when tapped. Finders see your safe contact info — never your private details. NFC + QR recovery, not GPS tracking.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Luggage Tag', 'Pet Collar Tag', 'Silicone Tag', 'Key Fob'].map(item => (
                <span key={item} className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: NAVY + '08', color: NAVY }}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="mt-12 text-center">
          <h3 className="font-black text-lg mb-2" style={{ color: NAVY }}>One profile. Multiple devices.</h3>
          <p className="text-slate-500 text-sm mb-4">Update your Bingoo profile anytime — every NFC device reflects the change instantly.</p>
          <Link to="/plans"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: NAVY }}>
            Explore Subscription Plans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}