import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  ChevronDown,
  CreditCard,
  Grid2X2,
  KeyRound,
  List,
  Package,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Tag,
  Watch,
} from 'lucide-react';
import { PRODUCTS, COLLECTIONS, isPurchasable } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';
import { InfinityMark } from '@/components/bingoo/ui/BingooBrand';
import FactoryProductMedia from '@/components/shop/FactoryProductMedia';

const NAVY = '#0b2149';
const NAVY_DEEP = '#071A3D';
const ORANGE = '#f97316';

const FEATURED_ORDER = [
  'nfc-metal-card',
  'nfc-wood-card',
  'nfc-luggage-tag',
  'nfc-pet-collar',
  'nfc-key-fob',
  'nfc-silicone-tag',
  'nfc-card',
  'nfc-keychain',
  'nfc-bracelet',
  'nfc-table-stand',
  'nfc-phone-stand',
  'nfc-sticker',
];

const CATEGORIES = [
  { id: 'all', label: 'All Devices', icon: CreditCard, test: () => true },
  { id: 'profile', label: 'Profile Devices', icon: CreditCard, test: (p) => p.flow !== 'asset_protection' && p.category !== 'stand' && !p.id?.includes('bundle') },
  { id: 'premium', label: 'Premium', icon: ShieldCheck, test: (p) => p.collection === 'premium' },
  { id: 'wearables', label: 'Wearables', icon: Watch, test: (p) => p.category === 'bracelet' || p.category === 'badge' },
  { id: 'desk', label: 'Desk & Counter', icon: Store, test: (p) => p.category === 'stand' || p.collection === 'business' },
  { id: 'keys', label: 'Key Accessories', icon: KeyRound, test: (p) => p.category === 'keychain' },
  { id: 'assets', label: 'Asset Protection', icon: Tag, test: (p) => p.flow === 'asset_protection' },
  { id: 'bundles', label: 'Bundles', icon: Package, test: (p) => p.id?.includes('bundle') || p.id?.includes('pack') },
];

const TRUST = [
  { icon: ShieldCheck, title: 'Secure checkout', copy: 'Stripe-hosted payment' },
  { icon: CreditCard, title: 'Retail quantity 1+', copy: 'Buy a single device or more' },
  { icon: Package, title: 'One product identity', copy: 'Same SKU from shelf to order' },
];

function Toggle({ on, value }) {
  return (
    <button type="button" onClick={on} className="h-6 w-10 rounded-full p-1 transition" style={{ background: value ? ORANGE : '#e2e8f0' }}>
      <span className="block h-4 w-4 rounded-full bg-white transition-transform" style={{ transform: value ? 'translateX(16px)' : 'none' }} />
    </button>
  );
}

function ProductCard({ product, added, onAdd, list }) {
  const buy = isPurchasable(product);
  const collection = COLLECTIONS.find((c) => c.id === product.collection);
  const typeLabel = product.flow === 'asset_protection' ? 'Asset Device' : 'Profile Device';

  return (
    <motion.article
      layout
      whileHover={{ y: list ? 0 : -4 }}
      className={`${list ? 'grid md:grid-cols-[300px_1fr]' : 'flex flex-col'} overflow-hidden rounded-[26px] border border-white/10`}
      style={{ background: '#0a0a0a', boxShadow: '0 12px 34px rgba(0,0,0,.28)' }}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[246/284] overflow-hidden">
          <FactoryProductMedia product={product} className="h-full w-full transition-transform duration-300 hover:scale-[1.02]" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[.13em] text-slate-200 backdrop-blur-sm">
              {typeLabel}
            </span>
            {product.badge && (
              <span className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[.13em] text-white" style={{ background: product.availability === 'coming_soon' ? '#475569' : ORANGE }}>
                {product.badge}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col border-t border-white/10 p-5 md:p-6">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[.14em]" style={{ color: ORANGE }}>
          {collection?.label} · {product.bestFor}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xl font-black tracking-tight text-white">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{product.tagline}</p>
        <div className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-300">
          {product.flow === 'asset_protection'
            ? 'Tap / Scan → Lost Mode → Finder → Owner'
            : 'Tap → Profile → Contact → Lead / Booking'}
        </div>

        <div className="mt-6 flex items-end justify-between gap-3">
          {buy ? (
            <>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Price</p>
                <b className="text-[26px] leading-none text-white">${product.price.toFixed(2)}</b>
              </div>
              <div className="flex gap-2">
                <Link to={`/product/${product.id}`} className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-black text-slate-200 transition hover:border-white/40">
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => onAdd(product)}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black text-white transition active:scale-95"
                  style={{ background: added ? '#16a34a' : ORANGE }}
                >
                  {added ? <><Check className="h-3.5 w-3.5" /> Added</> : <><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</>}
                </button>
              </div>
            </>
          ) : (
            <>
              <b className="text-sm text-slate-500">Coming Soon</b>
              <Link to={`/product/${product.id}`} className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-xs font-black text-white" style={{ background: NAVY }}>
                <Bell className="h-3.5 w-3.5" /> Notify Me
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function Shop() {
  const [cart, setCart] = useState(getCartCount());
  const [added, setAdded] = useState(null);
  const [category, setCategory] = useState('all');
  const [best, setBest] = useState(false);
  const [fresh, setFresh] = useState(false);
  const [stock, setStock] = useState(true);
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState('grid');
  const [price, setPrice] = useState(100);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => setCart(getCartCount()), []);

  const countPool = useMemo(() => stock ? PRODUCTS.filter(isPurchasable) : PRODUCTS, [stock]);
  const counts = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.id, countPool.filter(c.test).length])),
    [countPool]
  );

  const items = useMemo(() => {
    const selected = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
    let result = PRODUCTS.filter((p) =>
      selected.test(p) &&
      (!stock || isPurchasable(p)) &&
      (!best || String(p.badge || '').toLowerCase().includes('best')) &&
      (!fresh || String(p.badge || '').toLowerCase().includes('new') || p.availability === 'coming_soon') &&
      (!isPurchasable(p) || p.price <= price)
    );

    if (sort === 'featured') {
      result = [...result].sort((a, b) => FEATURED_ORDER.indexOf(a.id) - FEATURED_ORDER.indexOf(b.id));
    }
    if (sort === 'low') result = [...result].sort((a, b) => (a.price ?? 999) - (b.price ?? 999));
    if (sort === 'high') result = [...result].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [category, best, fresh, stock, sort, price]);

  const add = (product) => {
    if (!isPurchasable(product)) return;
    addToCart(product, 1);
    setCart(getCartCount());
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1400);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <header className="sticky top-0 z-30 border-b border-white/10" style={{ background: NAVY_DEEP }}>
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <InfinityMark size={38} color={ORANGE} strokeWidth={3.4} glow />
            <b className="hidden text-lg tracking-wide text-white sm:block">BINGOO CONNECT</b>
          </Link>
          <nav className="hidden h-full items-center gap-9 text-sm font-bold text-white/70 md:flex">
            <Link to="/#platform" className="hover:text-white">Platform</Link>
            <Link to="/#solutions" className="hover:text-white">Solutions</Link>
            <Link to="/#pricing" className="hover:text-white">Pricing</Link>
            <Link to="/shop" className="relative flex h-full items-center text-white">Shop<span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: ORANGE }} /></Link>
          </nav>
          <Link to="/cart" className="relative p-3 text-white">
            <ShoppingCart className="h-5 w-5" />
            {cart > 0 && <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black" style={{ background: ORANGE }}>{cart}</span>}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 md:py-10">
        <section className="mb-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="grid items-center gap-7 px-6 py-8 md:grid-cols-[1fr_auto] md:px-9 lg:px-10">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[.18em]" style={{ color: ORANGE }}>Official Bingoo hardware store</p>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl" style={{ color: NAVY }}>Choose the device that fits how you connect.</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
                Professional NFC devices, business touchpoints and asset-recovery tags — all connected to the same Bingoo platform.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {TRUST.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex min-w-[190px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <Icon className="h-7 w-7 shrink-0" style={{ color: NAVY }} />
                    <div><b className="block text-xs" style={{ color: NAVY }}>{item.title}</b><span className="text-[11px] text-slate-500">{item.copy}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.id;
            return (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)} className="flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-black" style={{ background: active ? '#fff0e6' : '#fff', borderColor: active ? `${ORANGE}55` : '#e2e8f0', color: active ? ORANGE : NAVY }}>
                <Icon className="h-3.5 w-3.5" /> {c.label} <span className="text-slate-400">{counts[c.id]}</span>
              </button>
            );
          })}
        </div>

        <section className="grid items-start gap-6 lg:grid-cols-[270px_1fr]">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} space-y-4 lg:sticky lg:top-[92px] lg:block`}>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-3 px-2 text-xs font-black uppercase tracking-wider text-slate-400">Device Categories</p>
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = category === c.id;
                return (
                  <button key={c.id} type="button" onClick={() => setCategory(c.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold" style={{ background: active ? '#fff3eb' : 'transparent', color: NAVY }}>
                    <Icon className="h-4 w-4" style={{ color: active ? ORANGE : '#64748b' }} />
                    <span className="flex-1 text-left">{c.label}</span>
                    <span className="text-xs text-slate-400">{counts[c.id]}</span>
                  </button>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b p-4">
                <p className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400">Filters</p>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-semibold"><span>Best Sellers</span><Toggle value={best} on={() => setBest(!best)} /></div>
                  <div className="flex justify-between text-sm font-semibold"><span>New / Coming</span><Toggle value={fresh} on={() => setFresh(!fresh)} /></div>
                  <div className="flex justify-between text-sm font-semibold"><span>In Stock Only</span><Toggle value={stock} on={() => setStock(!stock)} /></div>
                </div>
              </div>
              <div className="p-4">
                <p className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400">Price Range</p>
                <div className="mb-3 flex justify-between text-xs font-black"><span>$0</span><span>${price}+</span></div>
                <input type="range" min="10" max="100" value={price} onChange={(e) => setPrice(+e.target.value)} className="w-full accent-orange-500" />
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black lg:hidden" style={{ color: NAVY }}><SlidersHorizontal className="h-4 w-4" /> Filters</button>
                <span className="text-sm text-slate-500"><b style={{ color: NAVY }}>{items.length}</b> {stock ? 'in-stock devices' : 'devices in this view'}</span>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold">
                    <option value="featured">Featured</option>
                    <option value="low">Price: Low to high</option>
                    <option value="high">Price: High to low</option>
                    <option value="name">Name: A–Z</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
                <div className="hidden overflow-hidden rounded-xl border border-slate-200 sm:flex">
                  <button type="button" onClick={() => setView('grid')} className="flex w-11 items-center justify-center" style={{ color: view === 'grid' ? ORANGE : '#64748b' }}><Grid2X2 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setView('list')} className="flex w-11 items-center justify-center border-l" style={{ color: view === 'list' ? ORANGE : '#64748b' }}><List className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <motion.div layout className={view === 'grid' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-5'}>
              {items.map((product) => (
                <ProductCard key={product.id} product={product} added={added === product.id} onAdd={add} list={view === 'list'} />
              ))}
            </motion.div>

            {!items.length && (
              <div className="mt-4 rounded-3xl border border-dashed bg-white p-12 text-center">
                <PackageSearch className="mx-auto mb-3 text-slate-300" />
                <b style={{ color: NAVY }}>No devices match these filters.</b>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}