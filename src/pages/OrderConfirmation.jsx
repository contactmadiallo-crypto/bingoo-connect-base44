import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, Package, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { clearCart } from '@/lib/cartStore';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';
import { localizeShopProduct } from '@/lib/shopI18n';

export default function OrderConfirmation() {
  const { language } = useI18n();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "robots"); document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    return () => { meta.setAttribute("content", "index, follow"); };
  }, []);
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
          <h1 className="text-xl font-bold text-slate-900 mb-2">{t("order_no_order",language)}</h1>
          <p className="text-slate-500 mb-6">{t("order_no_order_copy",language)}</p>
          <div className="flex flex-col gap-3">
            <Link to="/my-orders"><Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2"><Package className="w-4 h-4" /> {t("order_my_orders",language)}</Button></Link>
            <Link to="/shop"><Button variant="outline" className="w-full">{t("order_back_shop",language)}</Button></Link>
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
          <h1 className="text-xl font-bold text-slate-900 mb-2">{t("order_not_found",language)}</h1>
          <p className="text-slate-500 mb-6">{t("order_not_found_copy",language)}</p>
          <div className="flex flex-col gap-3">
            <Link to="/my-orders"><Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2"><Package className="w-4 h-4" /> {t("order_check_orders",language)}</Button></Link>
            <Link to="/shop"><Button variant="outline" className="w-full gap-2">{t("order_continue_shopping",language)} <ArrowRight className="w-4 h-4" /></Button></Link>
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("order_confirmed",language)}</h1>
          <p className="text-slate-500 mb-6">
            {t("order_confirmed_copy",language)} <strong>{order.customer_email}</strong>.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 text-sm space-y-2">
            {order.order_number && <p className="font-semibold text-slate-800">{t("order_number",language)} #{order.order_number}</p>}
            <p className="text-slate-500">{t("order_total_paid",language)}: <span className="font-medium text-slate-700">${order.total?.toFixed(2)}</span></p>
            {order.shipping_address && (
              <p className="text-slate-500">{t("order_shipping_to",language)}: <span className="font-medium text-slate-700">{order.shipping_address}, {order.city}</span></p>
            )}
            {order.items?.length > 0 && (
              <div className="pt-1 border-t border-slate-200 space-y-1">
                {order.items.map((item, i) => { const displayItem = localizeShopProduct({ id: item.product_id, name: item.product_name }, language); return (
                  <p key={i} className="text-slate-500">{displayItem.name} × {item.quantity}</p>
                ); })}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Link to={`/my-orders?order=${encodeURIComponent(order.order_number || '')}&email=${encodeURIComponent(order.customer_email || '')}`}><Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2"><Package className="w-4 h-4" /> {t("order_track",language)}</Button></Link>
            <Link to="/shop"><Button variant="outline" className="w-full gap-2">{t("order_continue_shopping",language)} <ArrowRight className="w-4 h-4" /></Button></Link>
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("order_payment_processing",language)}</h1>
        <p className="text-slate-500 mb-4">
          {t("order_payment_processing_copy",language)}
        </p>
        <p className="text-xs text-slate-400 mb-6">{t("order_id",language)}: {orderId}</p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => loadOrder(orderId)}
            className="w-full gap-2"
          >
            <RefreshCw className="w-4 h-4" /> {t("order_check_payment",language)}
          </Button>
          <Link to="/my-orders"><Button variant="outline" className="w-full gap-2"><Package className="w-4 h-4" /> {t("order_my_orders",language)}</Button></Link>
        </div>
      </div>
    </div>
  );
}