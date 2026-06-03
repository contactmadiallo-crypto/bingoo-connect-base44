import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

const STATUS_CONFIG = {
  processing: { label: 'Processing', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-blue-600 bg-blue-50' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'Cancelled', icon: Package, color: 'text-red-600 bg-red-50' },
};

export default function MyOrders() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setSearched(false);
    const res = await base44.functions.invoke('getMyOrders', { email: email.trim() });
    setOrders(res.data?.orders || []);
    setSubmitted(email.trim());
    setSearched(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/shop" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Shop
          </Link>
          <h1 className="text-xl font-bold text-slate-900 ml-2">My Orders</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <Input
            type="email"
            placeholder="Enter your order email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Find Orders'}
          </Button>
        </form>

        {searched && orders.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No orders found for <strong>{submitted}</strong></p>
            <p className="text-sm mt-1">Check your email address or <Link to="/shop" className="text-blue-600 hover:underline">browse the shop</Link>.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{orders.length} order(s) found for <strong>{submitted}</strong></p>
            {orders.map(order => {
              const status = STATUS_CONFIG[order.fulfillment_status] || STATUS_CONFIG.processing;
              const Icon = status.icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900">Order #{order.order_number}</p>
                      <p className="text-xs text-slate-500">{new Date(order.created_date).toLocaleDateString()}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                      <Icon className="w-3.5 h-3.5" />{status.label}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-slate-600">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="font-bold text-slate-900">Total: ${order.total?.toFixed(2)}</span>
                    {order.tracking_number && (
                      <span className="text-xs text-slate-500">Tracking: <strong>{order.tracking_number}</strong></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}