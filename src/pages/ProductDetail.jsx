import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, ArrowLeft, Check, Shield, Truck, RefreshCw, Bell, PackageCheck, Smartphone } from 'lucide-react';
import { PRODUCTS, PERFECT_FOR, COLLECTIONS, isPurchasable } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';
import FactoryProductMedia from '@/components/shop/FactoryProductMedia';
import { InfinityMark } from '@/components/bingoo/ui/BingooBrand';

const NAVY = '#0b2149';
const NAVY_DEEP = '#071A3D';
const ORANGE = '#f97316';

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount());
  const [notified, setNotified] = useState(false);
  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="mb-4 text-lg text-slate-500">Product not found</p>
          <Link to="/shop" className="rounded-xl px-6 py-2.5 font-bold text-white" style={{ background: NAVY }}>Back to Shop</Link>
        </div>
      </div>
    );
  }

  const purchasable = isPurchasable(product);
  const perfectFor = PERFECT_FOR[product.category] || [];
  const collection = COLLECTIONS.find((c) => c.id === product.collection);
  const typeLabel = product.flow === 'asset_protection' ? 'Asset Device' : 'Profile Device';

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setCartCount(getCartCount());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <header className="sticky top-0 z-30 border-b border-white/10" style={{ background: NAVY_DEEP }}>
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <InfinityMark size={36} color={ORANGE} strokeWidth={3.4} glow />
            <b className="hidden text-white sm:block">BINGOO CONNECT</b>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/shop" className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> Shop</Link>
            <Link to="/cart" className="relative flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white">
              <ShoppingCart className="h-4 w-4" /> Cart
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black" style={{ background: ORANGE }}>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-12">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[.12em]">
          <Link to="/shop" className="text-slate-400 hover:text-slate-600">Shop</Link><span className="text-slate-300">/</span>
          <span style={{ color: collection?.accent || ORANGE }}>{collection?.label}</span><span className="text-slate-300">/</span>
          <span style={{ color: NAVY }}>{product.name}</span>
        </div>

        <section className="grid items-start gap-7 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
          <div>
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(11,33,73,.08)]">
              <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] shadow-sm" style={{ color: NAVY }}>{typeLabel}</span>
                {product.badge && <span className="rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-white" style={{ background: purchasable ? ORANGE : '#64748b' }}>{product.badge}</span>}
              </div>
              <FactoryProductMedia product={product} className="h-[420px] w-full md:h-[570px]" showLabel={!purchasable} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><Smartphone className="mb-2 h-5 w-5" style={{ color: ORANGE }} /><b className="block text-xs" style={{ color: NAVY }}>No app required</b><span className="text-[11px] text-slate-500">Tap with a compatible phone</span></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><PackageCheck className="mb-2 h-5 w-5" style={{ color: ORANGE }} /><b className="block text-xs" style={{ color: NAVY }}>Real Bingoo hardware</b><span className="text-[11px] text-slate-500">One SKU across the store</span></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><Shield className="mb-2 h-5 w-5" style={{ color: ORANGE }} /><b className="block text-xs" style={{ color: NAVY }}>Private activation</b><span className="text-[11px] text-slate-500">Codes are never shown publicly</span></div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(11,33,73,.05)] md:p-8 lg:sticky lg:top-[96px]">
            <p className="mb-2 text-xs font-black uppercase tracking-[.16em]" style={{ color: ORANGE }}>{typeLabel} · {product.bestFor}</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{product.name}</h1>
            <p className="mt-3 text-base leading-relaxed text-slate-500">{product.description}</p>

            <div className="my-6 border-y border-slate-100 py-5">
              {purchasable ? (
                <div className="flex items-baseline gap-2"><span className="text-4xl font-black text-slate-950">${product.price.toFixed(2)}</span><span className="text-sm text-slate-400">USD · per device</span></div>
              ) : (
                <div className="flex items-center gap-3"><span className="text-2xl font-black text-slate-400">Price TBA</span><span className="rounded-full bg-slate-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">Coming Soon</span></div>
              )}
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-slate-400">What this device does</p>
              <p className="text-sm font-bold leading-relaxed" style={{ color: NAVY }}>
                {product.flow === 'asset_protection'
                  ? 'Tap / Scan → Lost Mode → Finder sees recovery page → Owner gets reconnected'
                  : 'Tap → Bingoo profile → Contact / lead / booking action'}
              </p>
              {product.flow === 'asset_protection' && <p className="mt-2 text-xs text-slate-500">NFC + QR recovery. This product does not claim GPS tracking.</p>}
            </div>

            <div className="mb-6">
              <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-slate-400">Product Features</p>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: NAVY }}><Check className="h-3 w-3 text-white" /></span>{feature}</li>
                ))}
              </ul>
            </div>

            {perfectFor.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-slate-400">Best for</p>
                <div className="flex flex-wrap gap-2">{perfectFor.map((item) => <span key={item} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold" style={{ color: NAVY }}>{item}</span>)}</div>
              </div>
            )}

            {purchasable && (
              <div className="mb-5 flex flex-wrap items-center gap-4">
                <span className="text-sm font-bold text-slate-700">Quantity</span>
                <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3"><Minus className="h-4 w-4" /></button>
                  <span className="px-5 py-3 font-black">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-4 py-3"><Plus className="h-4 w-4" /></button>
                </div>
                <span className="text-sm text-slate-500">Total <b className="text-slate-950">${(product.price * quantity).toFixed(2)}</b></span>
              </div>
            )}

            {purchasable ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={handleAddToCart} className="flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 text-sm font-black" style={added ? { borderColor: '#16a34a', color: '#16a34a' } : { borderColor: NAVY, color: NAVY }}>
                  {added ? <><Check className="h-4 w-4" /> Added to Cart</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
                </button>
                <button type="button" onClick={handleBuyNow} className="rounded-xl py-3.5 text-sm font-black text-white" style={{ background: ORANGE }}>Buy Now →</button>
              </div>
            ) : (
              <button type="button" onClick={() => { setNotified(true); setTimeout(() => setNotified(false), 3000); }} className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-white" style={{ background: notified ? '#16a34a' : NAVY }}>
                {notified ? <><Check className="h-4 w-4" /> You'll be notified</> : <><Bell className="h-4 w-4" /> Notify Me When Available</>}
              </button>
            )}

            {purchasable && (
              <div className="mt-5 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-green-600" /> Secure Stripe checkout</span>
                <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-blue-600" /> Shipping at checkout</span>
                <span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5 text-orange-500" /> 30-day returns</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
