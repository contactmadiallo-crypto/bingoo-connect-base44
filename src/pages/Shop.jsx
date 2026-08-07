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

function InfinityBadge({ size = 30, dark = true }) {
  return (
    <div className="flex items-center justify-center rounded-xl" style={{ width: size + 14, height: size + 14, background: dark ? NAVY : '#fff' }}>
      <InfinityMark size={size} color={ORANGE} strokeWidth={3.4} glow={dark} />
    </div>
  );
}

function CardDevice({ premium = false, wood = false }) {
  return (
    <div className="relative w-[78%] max-w-[250px] aspect-[1.58/1] rounded-[20px] overflow-hidden"
      style={{
        background: wood
          ? 'linear-gradient(135deg,#3c281e,#70503a 45%,#2c1d16)'
          : premium
            ? 'linear-gradient(145deg,#080b12,#171c27 48%,#090c13)'
            : `linear-gradient(145deg,${NAVY_DEEP},${NAVY} 55%,#153761)`,
        boxShadow: '0 24px 55px rgba(11,33,73,.28), inset 0 1px 0 rgba(255,255,255,.1)',
      }}>
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(90deg,transparent 0,transparent 2px,rgba(255,255,255,.9) 3px)' }} />
      <div className="relative h-full flex flex-col items-center justify-center gap-2">
        <InfinityMark size={58} color={ORANGE} strokeWidth={3.4} glow />
        <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.22em]">Bingoo Connect</p>
      </div>
    </div>
  );
}

function KeychainDevice() {
  return (
    <div className="relative w-[170px] h-[190px] flex items-end justify-center">
      <div className="absolute top-0 w-16 h-16 rounded-full border-[8px] border-slate-400" style={{ boxShadow: 'inset 0 2px 5px rgba(0,0,0,.25)' }} />
      <div className="absolute top-[49px] w-6 h-12 rounded-full bg-slate-400" />
      <div className="w-[132px] h-[132px] rounded-full flex items-center justify-center" style={{ background: `linear-gradient(145deg,${NAVY_DEEP},#153761)`, boxShadow: '0 20px 40px rgba(11,33,73,.28)' }}>
        <InfinityMark size={48} color={ORANGE} strokeWidth={3.5} glow />
      </div>
    </div>
  );
}

function BraceletDevice() {
  return (
    <div className="relative w-[240px] h-[150px] flex items-center justify-center">
      <div className="absolute w-[210px] h-[92px] rounded-[50%] border-[28px]" style={{ borderColor: NAVY, boxShadow: '0 18px 45px rgba(11,33,73,.2)' }} />
      <div className="relative z-10 w-[100px] h-[58px] rounded-2xl flex items-center justify-center" style={{ background: '#0d2b55', boxShadow: '0 8px 22px rgba(0,0,0,.24)' }}>
        <InfinityMark size={38} color={ORANGE} strokeWidth={3.3} glow />
      </div>
    </div>
  );
}

function StickerDevice() {
  return (
    <div className="flex gap-5 items-center justify-center">
      {[0, 1].map(i => (
        <div key={i} className="w-[105px] h-[105px] rounded-full flex items-center justify-center" style={{ background: `linear-gradient(145deg,${NAVY_DEEP},#153761)`, boxShadow: '0 15px 35px rgba(11,33,73,.22)' }}>
          <InfinityMark size={40} color={ORANGE} strokeWidth={3.4} glow />
        </div>
      ))}
    </div>
  );
}

function StandDevice({ phone = false }) {
  return (
    <div className="relative w-[220px] h-[190px] flex items-end justify-center">
      <div className="absolute bottom-0 w-[170px] h-8 rounded-[50%]" style={{ background: NAVY, boxShadow: '0 15px 30px rgba(11,33,73,.18)' }} />
      {phone ? (
        <div className="absolute bottom-7 w-[95px] h-[145px] rounded-[28px] border-[8px] border-slate-900 rotate-[-8deg]" style={{ background: '#172033' }}>
          <div className="absolute inset-3 rounded-xl" style={{ background: 'linear-gradient(180deg,#152a4e,#0a1428)' }} />
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-12 h-10 rounded-b-xl" style={{ background: NAVY }} />
        </div>
      ) : (
        <div className="absolute bottom-7 w-[150px] h-[105px] rounded-xl border-[7px] border-slate-300 flex items-center justify-center" style={{ background: `linear-gradient(145deg,${NAVY_DEEP},#153761)` }}>
          <InfinityMark size={40} color={ORANGE} strokeWidth={3.4} glow />
        </div>
      )}
    </div>
  );
}

function TagDevice({ pet = false, luggage = false }) {
  if (pet) {
    return (
      <div className="relative w-[250px] h-[170px] flex items-center justify-center">
        <div className="absolute w-[230px] h-10 rounded-full rotate-[-6deg]" style={{ background: '#1d334f' }} />
        <div className="relative z-10 w-[110px] h-[110px] rounded-full flex items-center justify-center" style={{ background: `linear-gradient(145deg,${NAVY_DEEP},#173761)`, boxShadow: '0 18px 38px rgba(11,33,73,.25)' }}>
          <InfinityMark size={44} color={ORANGE} strokeWidth={3.4} glow />
        </div>
      </div>
    );
  }

  if (luggage) {
    return (
      <div className="relative w-[155px] h-[205px] rounded-[24px] flex flex-col items-center justify-center" style={{ background: `linear-gradient(145deg,${NAVY_DEEP},#173761)`, boxShadow: '0 22px 46px rgba(11,33,73,.25)' }}>
        <div className="absolute -top-7 w-9 h-12 rounded-t-xl border-[7px] border-slate-700 border-b-0" />
        <InfinityMark size={42} color={ORANGE} strokeWidth={3.4} glow />
        <div className="mt-4 grid grid-cols-5 gap-1 w-16">
          {Array.from({ length: 25 }).map((_, i) => <span key={i} className={`h-2 ${i % 3 === 0 || i % 7 === 0 ? 'bg-white' : 'bg-white/20'}`} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[145px] h-[175px] rounded-[48%_48%_42%_42%] flex items-center justify-center" style={{ background: `linear-gradient(145deg,${NAVY_DEEP},#173761)`, boxShadow: '0 20px 40px rgba(11,33,73,.25)' }}>
      <div className="absolute -top-4 w-8 h-8 rounded-full border-[7px] border-slate-400" />
      <InfinityMark size={44} color={ORANGE} strokeWidth={3.4} glow />
    </div>
  );
}

function DeviceVisual({ product }) {
  if (product.availability === 'coming_soon') {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <InfinityBadge size={34} />
          <p className="mt-3 text-[11px] font-black uppercase tracking-[.16em] text-slate-400">Coming Soon</p>
        </div>
      </div>
    );
  }

  if (product.id === 'nfc-metal-card') return <CardDevice premium />;
  if (product.id === 'nfc-wood-card') return <CardDevice wood />;
  if (product.category === 'card') return <CardDevice />;
  if (product.id === 'nfc-keychain' || product.id === 'nfc-key-fob') return <KeychainDevice />;
  if (product.category === 'bracelet') return <BraceletDevice />;
  if (product.category === 'sticker') return <StickerDevice />;
  if (product.id === 'nfc-table-stand') return <StandDevice />;
  if (product.id === 'nfc-phone-stand') return <StandDevice phone />;
  if (product.id === 'nfc-pet-collar') return <TagDevice pet />;
  if (product.id === 'nfc-luggage-tag') return <TagDevice luggage />;
  if (product.category === 'tag') return <TagDevice />;
  return <InfinityBadge size={38} />;
}

function FlagshipCardVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] aspect-[1.58/1] rounded-[28px] overflow-hidden"
      style={{ background: 'linear-gradient(145deg,#090d16 0%,#151a27 45%,#080c14 100%)', boxShadow: '0 35px 90px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08)' }}>
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'repeating-linear-gradient(90deg,transparent 0,transparent 2px,rgba(255,255,255,.9) 3px)' }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${ORANGE}22, transparent 32%)` }} />
      <div className="relative h-full flex flex-col items-center justify-center gap-3">
        <InfinityMark size={88} color={ORANGE} strokeWidth={3.4} glow />
        <p className="text-white font-black tracking-[0.2em] uppercase text-sm">Bingoo Connect</p>
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: .26 }}
      className="group rounded-[30px] bg-white border border-slate-200 overflow-hidden flex flex-col"
      style={{ boxShadow: '0 10px 35px rgba(11,33,73,.07)' }}>
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-[310px] flex items-center justify-center overflow-hidden px-6" style={{ background: 'linear-gradient(180deg,#fbfcfe 0%,#f5f7fa 100%)' }}>
          <DeviceVisual product={product} />

          <div className="absolute top-5 left-5 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ background: '#fff', color: isAsset ? '#dc2626' : ORANGE, border: '1px solid #dbe3ed' }}>
              {isAsset ? 'Asset Device' : 'Profile Device'}
            </span>
            {product.badge && (
              <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white" style={{ background: purchasable ? ORANGE : '#64748b' }}>
                {product.badge}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <div className="grid grid-cols-[1fr_auto] gap-4 items-start mb-2">
          <p className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-400 leading-snug">{product.bestFor || collection?.label}</p>
          <span className="text-[10px] font-bold text-slate-400 text-right max-w-[120px]">{collection?.label}</span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="text-xl font-black leading-tight mb-2 transition-colors group-hover:text-orange-600" style={{ color: NAVY }}>{product.name}</h3>
        </Link>
        <p className="text-sm text-slate-500 leading-relaxed mb-5 min-h-[44px] line-clamp-2">{product.tagline}</p>

        <div className="rounded-2xl px-4 py-3 mb-5 text-[12px] font-black"
          style={{ background: isAsset ? '#fff7ed' : '#f8fafc', color: isAsset ? '#c2410c' : '#475569' }}>
          {isAsset ? 'Tap / Scan → Lost Mode → Finder → Owner' : 'Tap → Profile → Contact → Lead / Booking'}
        </div>

        <div className="flex items-end justify-between gap-3 mt-auto">
          {purchasable ? (
            <>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Price</p>
                <p className="text-[30px] leading-none font-black text-slate-900">${product.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/product/${product.id}`} className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-black text-slate-700 hover:border-slate-400 transition-colors">View</Link>
                <button onClick={() => onAdd(product)} className="px-4 py-3 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition-all active:scale-95" style={{ background: added ? '#16a34a' : ORANGE }}>
                  {added ? <><Check className="w-3.5 h-3.5" /> Added</> : '+ Cart'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Availability</p>
                <p className="text-sm font-black text-slate-500">Coming Soon</p>
              </div>
              <Link to={`/product/${product.id}`} className="px-4 py-3 rounded-xl text-xs font-black text-white flex items-center gap-1.5" style={{ background: NAVY }}>
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
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: ORANGE }}>{cartCount}</span>}
          </Link>
        </div>
      </header>

      <main>
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6 md:pt-10">
          <div className="rounded-[34px] overflow-hidden relative" style={{ background: `linear-gradient(135deg,${NAVY_DEEP} 0%,${NAVY} 55%,#173665 100%)` }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 75% 40%,${ORANGE}20,transparent 28%)` }} />
            <div className="relative grid md:grid-cols-[1.1fr_.9fr] gap-8 items-center px-6 py-10 md:px-12 md:py-14">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[.14em] mb-5" style={{ background: 'rgba(255,255,255,.08)', color: '#fff', border: '1px solid rgba(255,255,255,.12)' }}>
                  <PackageSearch className="w-3.5 h-3.5" /> Bingoo NFC Device Store
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-[.98] tracking-tight mb-5">Hardware for every<br /><span style={{ color: ORANGE }}>Bingoo connection.</span></h1>
                <p className="max-w-xl text-white/65 text-base md:text-lg leading-relaxed mb-7">Professional cards, business tap points, team hardware and asset-protection devices — all connected to the same Bingoo platform.</p>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-white/65">
                  <span className="px-3 py-2 rounded-full bg-white/8 border border-white/10">NFC + QR</span>
                  <span className="px-3 py-2 rounded-full bg-white/8 border border-white/10">Profile Devices</span>
                  <span className="px-3 py-2 rounded-full bg-white/8 border border-white/10">Asset Protection</span>
                  <span className="px-3 py-2 rounded-full bg-white/8 border border-white/10">Stripe Checkout</span>
                </div>
              </div>
              <div className="hidden md:block"><FlagshipCardVisual /></div>
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
                  <button key={filter.id} onClick={() => setActiveFilter(filter.id)} className="shrink-0 px-4 py-2.5 rounded-full text-sm font-black flex items-center gap-2 transition-all"
                    style={{ background: active ? ORANGE : '#fff', color: active ? '#fff' : NAVY, border: `1px solid ${active ? ORANGE : '#dbe3ed'}`, boxShadow: active ? '0 8px 20px rgba(249,115,22,.2)' : 'none' }}>
                    <Icon className="w-4 h-4" /> {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: NAVY }}>{STORE_FILTERS.find(f => f.id === activeFilter)?.label}</h2>
              <p className="text-slate-500 text-sm mt-1">{visibleProducts.length} device{visibleProducts.length === 1 ? '' : 's'} in this view</p>
            </div>
            <div className="inline-flex self-start sm:self-auto rounded-xl border border-slate-200 bg-white p-1">
              {[['all', 'All'], ['available', 'Available'], ['coming', 'Coming Soon']].map(([id, label]) => (
                <button key={id} onClick={() => setAvailability(id)} className="px-3 py-2 rounded-lg text-xs font-black" style={{ background: availability === id ? NAVY : 'transparent', color: availability === id ? '#fff' : '#64748b' }}>{label}</button>
              ))}
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleProducts.map(product => <StoreProductCard key={product.id} product={product} added={addedId === product.id} onAdd={handleAdd} />)}
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
          <div className="rounded-[30px] px-6 py-8 md:px-9 md:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5" style={{ background: `linear-gradient(135deg,${NAVY},#163565)` }}>
            <div>
              <p className="text-white font-black text-2xl">Need hardware for a team or business?</p>
              <p className="text-white/60 text-sm mt-2 max-w-2xl">Use Business and Teams for reception stands, employee badges, event hardware and future corporate packs.</p>
            </div>
            <Link to="/contact-support" className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm text-white" style={{ background: ORANGE }}>Talk to Bingoo <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </section>
      </main>
    </div>
  );
}
