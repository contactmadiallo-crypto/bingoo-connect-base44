import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { getCart, clearCart } from '@/lib/cartStore';

const SHIPPING_COST = 5;

export default function Checkout() {
  const navigate = useNavigate();
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + SHIPPING_COST;

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', country: 'US', notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app.');
      return;
    }
    setLoading(true);
    const res = await base44.functions.invoke('createCheckoutSession', {
      items: cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      shipping_address: form.address,
      city: form.city,
      state: form.state,
      zip_code: form.zip,
      country: form.country,
      order_notes: form.notes,
      subtotal,
      shipping_cost: SHIPPING_COST,
      total,
    });
    setLoading(false);
    if (res.data?.url) {
      clearCart();
      window.location.href = res.data.url;
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Your cart is empty.</p>
          <Link to="/shop"><Button>Go to Shop</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/cart" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <h1 className="text-xl font-bold text-slate-900 ml-2">Checkout</h1>
          <Lock className="w-4 h-4 text-green-500 ml-auto" />
          <span className="text-xs text-slate-500">Secure checkout</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Shipping Information</h2>
            <div>
              <Label>Full Name *</Label>
              <Input name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <Label>Address *</Label>
              <Input name="address" value={form.address} onChange={handleChange} required placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City *</Label>
                <Input name="city" value={form.city} onChange={handleChange} required placeholder="New York" />
              </div>
              <div>
                <Label>State</Label>
                <Input name="state" value={form.state} onChange={handleChange} placeholder="NY" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ZIP Code *</Label>
                <Input name="zip" value={form.zip} onChange={handleChange} required placeholder="10001" />
              </div>
              <div>
                <Label>Country *</Label>
                <Input name="country" value={form.country} onChange={handleChange} required placeholder="US" />
              </div>
            </div>
            <div>
              <Label>Order Notes</Label>
              <Input name="notes" value={form.notes} onChange={handleChange} placeholder="Any special instructions?" />
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{item.name} × {item.quantity}</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm text-slate-500">
                <span>Shipping</span><span>${SHIPPING_COST.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-lg">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 gap-2 h-12 text-base">
              <Lock className="w-4 h-4" />
              {loading ? 'Redirecting to payment...' : `Pay $${total.toFixed(2)} securely`}
            </Button>
            <p className="text-xs text-slate-500 text-center mt-2">You'll be redirected to Stripe for secure payment.</p>
          </div>
        </form>
      </div>
    </div>
  );
}