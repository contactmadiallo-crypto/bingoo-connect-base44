import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, ArrowLeft, Check, Shield, Truck, RefreshCw, Infinity as InfinityIcon, Nfc } from 'lucide-react';
import { PRODUCTS, PRODUCT_OPTIONS, PERFECT_FOR, ACTIVATION_STEPS, ASSET_PROTECTION_STEPS } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316';

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount());
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(0);

  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F9FC' }}>
        <div className="text-center">
          <p className="text-slate-500 mb-4 text-lg">Product not found</p>
          <Link to="/shop">
            <button className="px-6 py-2.5 rounded-xl font-bold text-white" style={{ background: NAVY }}>Back to Shop</button>
          </Link>
        </div>
      </div>
    );
  }

  const options = PRODUCT_OPTIONS[product.category] || { colors: [], materials: [] };
  const perfectFor = PERFECT_FOR[product.category] || [];

  const handleAddToCart = () => {
    addToCart({ ...product, color: options.colors[selectedColor]?.name, material: options.materials[selectedMaterial]?.name }, quantity);
    setCartCount(getCartCount());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, color: options.colors[selectedColor]?.name, material: options.materials[selectedMaterial]?.name }, quantity);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
      {/* ── Nav ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/shop" className="flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: NAVY }}>
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <Link to="/cart">
            <button className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:border-slate-400 transition-colors text-sm font-semibold text-slate-700">
              <ShoppingCart className="w-4 h-4" /> Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center" style={{ background: ORANGE }}>{cartCount}</span>
              )}
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
          {/* ── Product Image ── */}
          <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200"
            style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
            <div className="relative p-6 flex items-center justify-center" style={{ minHeight: '320px' }}>
              <img src={product.image} alt={product.name} className="w-full h-auto rounded-2xl object-cover" style={{ maxHeight: '340px' }} />
              {product.badge && (
                <span className="absolute top-5 left-5 text-xs font-bold px-3 py-1 rounded-full text-white uppercase tracking-wide" style={{ background: ORANGE }}>
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <InfinityIcon className="w-5 h-5" style={{ color: ORANGE }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ORANGE }}>Bingoo NFC</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-tight">{product.name}</h1>
            <p className="text-slate-500 text-sm mb-5 leading-relaxed">{product.description}</p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl md:text-4xl font-black text-slate-900">${product.price.toFixed(2)}</span>
              <span className="text-slate-400 text-sm">USD · per unit</span>
            </div>

            {/* Color Options */}
            {options.colors.length > 0 && (
              <div className="rounded-2xl border border-slate-200 p-4 mb-4 bg-white">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Color</p>
                <div className="flex gap-3">
                  {options.colors.map((c, i) => (
                    <button key={c.value} onClick={() => setSelectedColor(i)}
                      className={`w-9 h-9 rounded-xl cursor-pointer border-2 transition-all ${selectedColor === i ? 'border-slate-900 scale-110 ring-2 ring-slate-200' : 'border-white hover:border-slate-300'}`}
                      style={{ background: c.value }} title={c.name} />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">{options.colors[selectedColor]?.name}</p>
              </div>
            )}

            {/* Material Options */}
            {options.materials.length > 0 && (
              <div className="rounded-2xl border border-slate-200 p-4 mb-4 bg-white">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Material</p>
                <div className="flex flex-wrap gap-2">
                  {options.materials.map((m, i) => (
                    <button key={m.value} onClick={() => setSelectedMaterial(i)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedMaterial === i ? 'text-white' : 'border border-slate-200 text-slate-600 bg-white hover:border-slate-300'}`}
                      style={selectedMaterial === i ? { background: NAVY } : {}}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="rounded-2xl border border-slate-200 p-4 mb-4 bg-white">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">What's Included</p>
              <ul className="space-y-2">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-slate-700 text-sm">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: NAVY }}>
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Perfect For */}
            {perfectFor.length > 0 && (
              <div className="rounded-2xl border border-slate-200 p-4 mb-4 bg-white">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Perfect For</p>
                <div className="flex flex-wrap gap-2">
                  {perfectFor.map((t) => (
                    <span key={t} className="px-2.5 py-1 text-xs font-bold rounded-lg" style={{ background: `${NAVY}08`, color: NAVY }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-bold text-slate-700">Quantity</span>
              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <span className="px-5 py-2.5 font-black text-slate-900 text-base min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <span className="text-slate-500 text-sm">Total: <span className="font-bold text-slate-900">${(product.price * quantity).toFixed(2)}</span></span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-5">
              <button onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-all"
                style={added ? { borderColor: '#16a34a', color: '#16a34a', background: '#f0fdf4' } : { borderColor: NAVY, color: NAVY, background: '#fff' }}>
                {added ? <><Check className="w-4 h-4" /> Added to Cart</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
              </button>
              <button onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, #e06800)` }}>
                Buy Now →
              </button>
            </div>

            {/* Trust + Activation */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500" /> Secure Stripe Checkout</span>
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-500" /> Fast Shipping</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 text-orange-400" /> 30-Day Returns</span>
            </div>

            {product.flow === 'asset_protection' ? (
              <>
                {/* Asset Protection Banner */}
                <div className="rounded-2xl p-4 mb-4" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-orange-400" />
                    <p className="text-sm font-black text-white">Asset Protection Tag</p>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    This tag uses Bingoo's <strong className="text-white">Asset Protection flow</strong> — not a personal profile.
                    When someone taps your lost tag, they see your safe recovery contact info, not your personal details.
                  </p>
                  <Link to="/my-nfc-devices" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-orange-400 hover:underline">
                    Learn about Asset Protection →
                  </Link>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> How It Works</p>
                  {ASSET_PROTECTION_STEPS.map((s, i) => (
                    <p key={i} className="text-xs text-slate-700 font-medium mb-1.5 flex items-start gap-2">
                      <span className="font-black flex-shrink-0" style={{ color: ORANGE }}>{i + 1}.</span> {s}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Nfc className="w-3.5 h-3.5" /> Activation Steps</p>
                {ACTIVATION_STEPS.map((s, i) => (
                  <p key={i} className="text-xs text-slate-700 font-medium mb-1.5 flex items-start gap-2">
                    <span className="font-black flex-shrink-0" style={{ color: ORANGE }}>{i + 1}.</span> {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}