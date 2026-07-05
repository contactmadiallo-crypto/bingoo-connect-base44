import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, ArrowLeft, Check, Shield, Truck, RefreshCw } from 'lucide-react';
import { PRODUCTS } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';

const BADGE_STYLES = {
  'Best Seller': 'bg-[#FF7A00] text-white',
  'New':         'bg-[#0B2E6B] text-white',
  'Save $13':    'bg-emerald-600 text-white',
  'Corporate':   'bg-slate-800 text-white',
};

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount());

  const product = PRODUCTS.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4 text-lg">Product not found</p>
          <Link to="/shop">
            <button className="px-6 py-2.5 rounded-xl font-bold text-white" style={{ background: '#0B2E6B' }}>
              Back to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen" style={{ background: '#f5f7fb' }}>

      {/* ── Nav ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/shop" className="flex items-center gap-1.5 text-sm font-semibold text-[#0B2E6B] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <Link to="/cart">
            <button className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:border-[#0B2E6B] transition-colors text-sm font-semibold text-slate-700">
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

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* ── Product Image ── */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="relative p-6 bg-gradient-to-br from-slate-50 to-blue-50/40">
              <img src={product.image} alt={product.name} className="w-full h-auto rounded-2xl object-cover" />
              {product.badge && (
                <span className={`absolute top-5 left-5 text-xs font-bold px-3 py-1 rounded-full ${BADGE_STYLES[product.badge] || 'bg-slate-800 text-white'}`}>
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#FF7A00' }}>Bingoo NFC</p>
            <h1 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{product.name}</h1>
            <p className="text-slate-500 text-base mb-5 leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-slate-900">${product.price.toFixed(2)}</span>
              <span className="text-slate-400 text-sm">USD · per unit</span>
            </div>

            {/* Features */}
            <div className="rounded-2xl border border-slate-200 p-5 mb-6 bg-white">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">What's Included</p>
              <ul className="space-y-2.5">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-slate-700 text-sm">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#0B2E6B' }}>
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-bold text-slate-700">Quantity</span>
              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <span className="px-5 py-2.5 font-black text-slate-900 text-base min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <span className="text-slate-500 text-sm">
                Total: <span className="font-bold text-slate-900">${(product.price * quantity).toFixed(2)}</span>
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-all"
                style={added
                  ? { borderColor: '#16a34a', color: '#16a34a', background: '#f0fdf4' }
                  : { borderColor: '#0B2E6B', color: '#0B2E6B', background: '#fff' }
                }
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #FF7A00, #e06800)' }}
              >
                Buy Now →
              </button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500" /> Secure Stripe Checkout</span>
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-500" /> Fast Shipping</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 text-orange-400" /> 30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}