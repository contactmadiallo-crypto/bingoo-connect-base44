import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  Check,
  CreditCard,
  Crown,
  Infinity as InfinityIcon,
  KeyRound,
  PackageSearch,
  PawPrint,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tag,
  Users,
  Watch,
} from 'lucide-react';
import { PRODUCTS, COLLECTIONS, isPurchasable } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';
import { InfinityMark } from '@/components/bingoo/ui/BingooBrand';

const NAVY = '#0b2149';
const NAVY_DEEP = '#071A3D';
const ORANGE = '#f97316';
const GOLD = '#FDBA21';

const STORE_FILTERS = [
  { id: 'all', label: 'All Devices', icon: Store, test: () => true },
  { id: 'cards', label: 'Digital Cards', icon: CreditCard, test: p => p.category === 'card' },
  { id: 'wearables', label: 'Wearables', icon: Watch, test: p => p.category === 'bracelet' || p.category === 'badge' },
  { id: 'keys', label: 'Keychains & Fobs', icon: KeyRound, test: p => p.category === 'keychain' },
  { id: 'tags', label: 'Smart Tags', icon: Tag, test: p => p.category === 'tag' },
  { id: 'business', label: 'Business Stands', icon: Store, test: p => p.category === 'stand' || p.collection === 'business' },
  { id: 'teams', label: 'Teams & Events', icon: Users, test: p => p.category === 'badge' || p.id?.includes('team') || p.id?.includes('event') },
  { id: 'asset', label: 'Asset Protection', icon: ShieldCheck, test: p => p.flow === 'asset_protection' },
  { id: 'pet-travel', label: 'Pet & Travel', icon: PawPrint, test: p => ['nfc-pet-collar', 'nfc-luggage-tag', 'travel-bundle'].includes(p.id) },
  { id: 'premium', label: 'Premium', icon: Crown, test: p => p.collection === 'premium' },
];

function FlagshipCardVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] aspect-[1.58/1] rounded-[28px] overflow-hidden"
      style={{
        background: 'linear-gradient(145deg,#090d16 0%,#151a27 45%,#080c14 100%)',
        boxShadow: '0 35px 90px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08)',
      }}>
      <div className="absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg,transparent 0,transparent 2px,rgba(255,255,255,.9) 3px)' }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${ORANGE}22, transparent 32%)` }} />
      <div className="relative h-full flex flex-col items-center justify-center gap-3">
        <InfinityMark size={88} color={ORANGE} strokeWidth={3.4} glow />
        <div className="text-center">
          <p className="text-white font-black tracking-[0.2em] uppercase text-sm">Bingoo Connect</p>
          <p className="text-white/35 text-[10px] tracking-[0.24em] uppercase mt-1">Premium NFC</p>
        </div>
      </div>
    </div>
  );
}

function ProductPlaceholder({ product }) {
  const isPremium = product.collection === 'premium';
  return (
    <div className="w-full h-full min-h-[240px] flex items-center justify-center p-6"
      style={{ background: isPremium ? 'linear-gradient(145deg,#0b0f18,#1a2131)' : 'linear-gradient(145deg,#f8fafc,#eef2f7)' }}>
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: isPremium ? 'rgba(255,255,255,.07)' : NAVY }}>
          <InfinityMark size={32} color={ORANGE} strokeWidth={3.2} />
        </div>
        <p className={`text-xs font-black uppercase tracking-[0.16em] ${isPremium ? 'text-white/50' : 'text-slate-400'}`}>Coming Soon</p>
      </div>
    </div>
  );
}

function StoreProductCard({ product, added, onAdd }) {
  const purchasable = isPurchasable(product);
  const collection = COLLECTIONS.find(c => c.id === product.collection);
  const isAsset = product.flow === 'asset_protection';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: .28 }}
      className="group rounded-[26px] bg-white border border-slate-200 overflow-hidden flex flex-col"
      style={{ boxShadow: '0 8px 30px rgba(11,33,73,.06)' }}>
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-[245px] overflow-hidden" style={{ background: '#f7f9fc' }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : <ProductPlaceholder product={product} />}

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ background: '#fff', color: collection?.accent || NAVY, border: '1px solid #e2e8f0' }}>
              {isAsset ? 'Asset Device' : 'Profile Device'}
            </span>
            {product.badge && (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                style={{ background: purchasable ? ORANGE : '#64748b' }}>
                {product.badge}
              </span>
            )}
          </div>

          {!purchasable && (
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider">
              Coming Soon
            </span>
          )}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{product.bestFor || collection?.label}</p>
          <span className="text-[10px] font-bold text-slate-400">{collection?.label}</span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-black leading-tight mb-2 transition-colors group-hover:text-orange-600" style={{ color: NAVY }}>
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">{product.tagline}</p>

        <div className="rounded-xl px-3 py-2 mb-4 text-xs font-semibold"
          style={{ background: isAsset ? '#fff7ed' : '#f8fafc', color: isAsset ? '#c2410c' : '#475569' }}>
          {isAsset ? 'Tap / Scan → Lost Mode → Finder → Owner' : 'Tap → Profile → Contact → Lead / Booking'}
        </div>

        <div className="flex items-center justify-between gap-3 mt-auto">
          {purchasable ? (
            <>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Price</p>
                <p className="text-2xl font-black text-slate-900">${product.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/product/${product.id}`}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-700 hover:border-slate-400 transition-colors">
                  View
                </Link>
                <button
                  onClick={() => onAdd(product)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition-all active:scale-95"
                  style={{ background: added ? '#16a34a' : ORANGE }}>
                  {added ? <><Check className="w-3.5 h-3.5" /> Added</> : '+ Cart'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Availability</p>
                <p className="text-sm font-black text-slate-500">Not yet for sale</p>
              </div>
              <Link to={`/product/${product.id}`}
                className="px-4 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5"
                style={{ background: NAVY }}>
                <Bell className="w-3.5 h-3.5" /> Notify Me
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function Shop() {
  const [cartCount, setCartCount] = useState(getCartCount());
  const [addedId, setAddedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [availability, setAvailability] = useState('all');

  useEffect(() => setCartCount(getCartCount()), []);

  const visibleProducts = useMemo(() => {
    const filter = STORE_FILTERS.find(f => f.id === activeFilter) || STORE_FILTERS[0];
    return PRODUCTS.filter(product => {
      if (!filter.test(product)) return false;
      if (availability === 'available' && !isPurchasable(product)) return false;
      if (availability === 'coming' && isPurchasable(product)) return false;
      return true;
    });
  }, [activeFilter, availability]);

  const handleAdd = product => {
    if (!isPurchasable(product)) return;
    addToCart(product, 1);
    setCartCount(getCartCount());
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <div className="min-h-screen" style={{ background: '#f6f8fb' }}>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <InfinityIcon className="w-5 h-5 flex-shrink-0" style={{ color: ORANGE }} />
            <span className="font-black text-slate-900 whitespace-nowrap">Bingoo Connect</span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-xs font-black uppercase tracking-[0.14em] hidden sm:inline" style={{ color: NAVY }}>Device Store</span>
          </Link>
          <Link to="/cart" className="relative flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white font-bold text-sm text-slate-800">
            <ShoppingCart className="w-4 h-4" /> Cart
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: ORANGE }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main>
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6 md:pt-10">
          <div className="rounded-[34px] overflow-hidden relative"
            style={{ background: `linear-gradient(135deg,${NAVY_DEEP} 0%,${NAVY} 55%,#173665 100%)` }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 75% 40%,${ORANGE}20,transparent 28%)` }} />
            <div className="relative grid md:grid-cols-[1.1fr_.9fr] gap-8 items-center px-6 py-10 md:px-12 md:py-14">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[.14em] mb-5"
                  style={{ background: 'rgba(255,255,255,.08)', color: '#fff', border: '1px solid rgba(255,255,255,.12)' }}>
                  <PackageSearch className="w-3.5 h-3.5" /> Real Bingoo NFC Hardware
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-[.98] tracking-tight mb-5">
                  Devices for every<br /><span style={{ color: ORANGE }}>Bingoo connection.</span>
                </h1>
                <p className="max-w-xl text-white/65 text-base md:text-lg leading-relaxed mb-7">
                  Professional cards, business tap points, team hardware and asset-protection devices — all connected to the same Bingoo platform.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-white/65">
                  <span className="px-3 py-2 rounded-full bg-white/8 border border-white/10">NFC + QR</span>
                  <span className="px-3 py-2 rounded-full bg-white/8 border border-white/10">Stripe Checkout</span>
                  <span className="px-3 py-2 rounded-full bg-white/8 border border-white/10">Profile + Asset Devices</span>
                  <span className="px-3 py-2 rounded-full bg-white/8 border border-white/10">No app required to tap</span>
                </div>
              </div>
              <div className="hidden md:block">
                <FlagshipCardVisual />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <div className="mb-7">
            <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400 mb-3">Shop by device type</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {STORE_FILTERS.map(filter => {
                const Icon = filter.icon;
                const active = activeFilter === filter.id;
                return (
                  <button key={filter.id} onClick={() => setActiveFilter(filter.id)}
                    className="shrink-0 px-4 py-2.5 rounded-full text-sm font-black flex items-center gap-2 transition-all"
                    style={{
                      background: active ? ORANGE : '#fff',
                      color: active ? '#fff' : NAVY,
                      border: `1px solid ${active ? ORANGE : '#dbe3ed'}`,
                      boxShadow: active ? '0 8px 20px rgba(249,115,22,.2)' : 'none',
                    }}>
                    <Icon className="w-4 h-4" /> {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: NAVY }}>
                {STORE_FILTERS.find(f => f.id === activeFilter)?.label}
              </h2>
              <p className="text-slate-500 text-sm mt-1">{visibleProducts.length} device{visibleProducts.length === 1 ? '' : 's'} in this view</p>
            </div>
            <div className="inline-flex self-start sm:self-auto rounded-xl border border-slate-200 bg-white p-1">
              {[
                ['all', 'All'],
                ['available', 'Available'],
                ['coming', 'Coming Soon'],
              ].map(([id, label]) => (
                <button key={id} onClick={() => setAvailability(id)}
                  className="px-3 py-2 rounded-lg text-xs font-black"
                  style={{ background: availability === id ? NAVY : 'transparent', color: availability === id ? '#fff' : '#64748b' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleProducts.map(product => (
              <StoreProductCard key={product.id} product={product} added={addedId === product.id} onAdd={handleAdd} />
            ))}
          </motion.div>

          {visibleProducts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <PackageSearch className="w-9 h-9 mx-auto mb-3 text-slate-300" />
              <p className="font-black" style={{ color: NAVY }}>No devices in this filter yet.</p>
              <p className="text-sm text-slate-500 mt-1">Try another device category or availability filter.</p>
            </div>
          )}
        </section>

        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-[28px] bg-white border border-slate-200 p-6 md:p-7">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-4" style={{ background: `${ORANGE}12`, color: ORANGE }}>Profile Devices</span>
              <h3 className="text-xl font-black mb-2" style={{ color: NAVY }}>Built to create connections.</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Cards, bracelets, keychains and business stands open a Bingoo professional or business profile when tapped.</p>
              <p className="text-sm font-black" style={{ color: NAVY }}>Tap → Profile → Contact → Lead → Booking</p>
            </div>
            <div className="rounded-[28px] bg-white border border-slate-200 p-6 md:p-7">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-4" style={{ background: '#ef444412', color: '#ef4444' }}>Asset Devices</span>
              <h3 className="text-xl font-black mb-2" style={{ color: NAVY }}>Built to help items find their way back.</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Luggage, pet and asset tags open a safe recovery page. NFC + QR recovery only — not GPS tracking.</p>
              <p className="text-sm font-black" style={{ color: NAVY }}>Tap / Scan → Lost Mode → Finder → Owner Reconnected</p>
            </div>
          </div>
        </section>

        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16">
          <div className="rounded-[30px] px-6 py-8 md:px-9 md:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            style={{ background: `linear-gradient(135deg,${NAVY},#163565)` }}>
            <div>
              <p className="text-white font-black text-2xl">Need hardware for a team or business?</p>
              <p className="text-white/60 text-sm mt-2 max-w-2xl">Use the Business and Teams categories for reception stands, employee badges, event hardware and future corporate packs.</p>
            </div>
            <Link to="/contact-support" className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm text-white" style={{ background: ORANGE }}>
              Talk to Bingoo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
