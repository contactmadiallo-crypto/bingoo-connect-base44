import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCart, removeFromCart, updateQuantity, getCartTotal } from '@/lib/cartStore';

const SHIPPING = 5.00;

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(getCart());

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "robots"); document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    return () => { meta.setAttribute("content", "index, follow"); };
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + (cart.length > 0 ? SHIPPING : 0);

  const handleRemove = (id) => {
    const updated = removeFromCart(id);
    setCart(updated);
  };

  const handleQty = (id, qty) => {
    const updated = updateQuantity(id, qty);
    setCart(updated);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-6">Add some NFC products to get started!</p>
          <Link to="/shop"><Button className="bg-blue-600 hover:bg-blue-700">Browse Products</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link to="/shop" className="text-sm text-blue-600 hover:underline">← Continue Shopping</Link>
            <h1 className="text-2xl font-bold text-slate-900">Your Cart</h1>
          </div>
          <span className="text-slate-500 text-sm">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-xl flex-shrink-0 overflow-hidden">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{item.name}</h3>
                  <p className="text-blue-600 font-semibold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => handleQty(item.id, item.quantity - 1)} className="px-3 py-2 hover:bg-slate-100">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 py-2 font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => handleQty(item.id, item.quantity + 1)} className="px-3 py-2 hover:bg-slate-100">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-right min-w-[70px]">
                  <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-600 ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Shipping</span>
                  <span>${SHIPPING.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-slate-900 text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2 py-3"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-xs text-slate-500 text-center mt-3">
                🔒 Secure checkout via Stripe
              </p>

              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700">
                  💡 <strong>Bingoo Tip:</strong> Add a Pro subscription for just $4.99/month and unlock full analytics + lead collection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}