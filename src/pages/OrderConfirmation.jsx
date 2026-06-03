import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      base44.functions.invoke('verifyStripeSession', { session_id: sessionId })
        .then(res => { setOrder(res.data?.order || null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-500 mb-6">
          Thank you for your purchase. We'll send you a confirmation email shortly.
        </p>

        {order && (
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 text-sm space-y-1">
            <p className="font-semibold text-slate-800">Order #{order.order_number}</p>
            <p className="text-slate-500">Total: <span className="font-medium text-slate-700">${order.total?.toFixed(2)}</span></p>
            <p className="text-slate-500">Shipping to: <span className="font-medium text-slate-700">{order.shipping_address}, {order.city}</span></p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link to="/my-orders">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              <Package className="w-4 h-4" /> Track My Order
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" className="w-full gap-2">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}