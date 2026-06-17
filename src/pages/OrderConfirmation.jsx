import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, Package, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { clearCart } from '@/lib/cartStore';

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  // Poll once after a short delay to give the webhook time to mark the order paid
  const [polled, setPolled] = useState(false);

  const loadOrder = async (orderId) => {
    try {
      const record = await base44.entities.ShopOrder.get(orderId);
      setOrder(record || null);
      return record;
    } catch {
      setOrder(null);
      return null;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');

    if (!orderId) {
      setLoading(false);
      return;
    }

    loadOrder(orderId).then(record => {
      setLoading(false);
      // If stripe redirected here (success_url was hit) but webhook hasn't fired yet,
      // poll once after 3 seconds to catch the paid status update.
      if (record && record.payment_status !== 'paid' && !polled) {
        setPolled(true);
        setTimeout(() => loadOrder(orderId), 3000);
      }
    });
  }, []);

  // Clear cart only when we confirm a paid order — not before
  useEffect(() => {
    if (order?.payment_status === 'paid') {
      clearCart();
    }
  }, [order?.payment_status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id');

  // ── No order_id in URL ─────────────────────────────────────────────────
  if (!orderId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <XCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">No order found</h1>
          <p className="text-slate-500 mb-6">We couldn't find your order. If you completed payment, check My Orders.</p>
          <div className="flex flex-col gap-3">
            <Link to="/my-orders"><Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2"><Package className="w-4 h-4" /> My Orders</Button></Link>
            <Link to="/shop"><Button variant="outline" className="w-full">Back to Shop</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Order not found in DB ──────────────────────────────────────────────
  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Order not found</h1>
          <p className="text-slate-500 mb-6">We couldn't load your order details. If payment went through, it will appear in My Orders within a few minutes.</p>
          <div className="flex flex-col gap-3">
            <Link to="/my-orders"><Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2"><Package className="w-4 h-4" /> Check My Orders</Button></Link>
            <Link to="/shop"><Button variant="outline" className="w-full gap-2">Continue Shopping <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment confirmed (paid) ───────────────────────────────────────────
  if (order.payment_status === 'paid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-500 mb-6">
            Thank you for your purchase. We'll send a confirmation email to <strong>{order.customer_email}</strong> shortly.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 text-sm space-y-2">
            {order.order_number && <p className="font-semibold text-slate-800">Order #{order.order_number}</p>}
            <p className="text-slate-500">Total paid: <span className="font-medium text-slate-700">${order.total?.toFixed(2)}</span></p>
            {order.shipping_address && (
              <p className="text-slate-500">Shipping to: <span className="font-medium text-slate-700">{order.shipping_address}, {order.city}</span></p>
            )}
            {order.items?.length > 0 && (
              <div className="pt-1 border-t border-slate-200 space-y-1">
                {order.items.map((item, i) => (
                  <p key={i} className="text-slate-500">{item.product_name} × {item.quantity}</p>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/my-orders"><Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2"><Package className="w-4 h-4" /> Track My Order</Button></Link>
            <Link to="/shop"><Button variant="outline" className="w-full gap-2">Continue Shopping <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment pending / processing (webhook hasn't fired yet) ───────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Processing</h1>
        <p className="text-slate-500 mb-4">
          Your payment is being verified. This usually takes less than a minute.
        </p>
        <p className="text-xs text-slate-400 mb-6">Order ID: {orderId}</p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => loadOrder(orderId)}
            className="w-full gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Check Payment Status
          </Button>
          <Link to="/my-orders"><Button variant="outline" className="w-full gap-2"><Package className="w-4 h-4" /> My Orders</Button></Link>
        </div>
      </div>
    </div>
  );
}