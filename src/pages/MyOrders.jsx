import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, Search, Cpu, Box, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';
import { localizeShopProduct } from '@/lib/shopI18n';

const STEPS = [
  { key: 'confirmed', labelKey: 'tracking_step_confirmed', Icon: CheckCircle2 },
  { key: 'preparing', labelKey: 'tracking_step_preparing', Icon: Cpu },
  { key: 'ready', labelKey: 'tracking_step_ready', Icon: Box },
  { key: 'shipped', labelKey: 'tracking_step_shipped', Icon: Truck },
  { key: 'delivered', labelKey: 'tracking_step_delivered', Icon: CheckCircle2 },
];

function stepIndex(order) {
  if (order.fulfillment_status === 'delivered') return 4;
  if (order.fulfillment_status === 'shipped') return 3;
  if (order.fulfillment_status === 'ready_to_ship' || order.manufacturing_status === 'ready_to_ship') return 2;
  if (['device_allocated','in_production','programmed','shipped'].includes(order.manufacturing_status)) return 1;
  return order.payment_status === 'paid' ? 0 : -1;
}

export default function MyOrders() {
  const { language } = useI18n();
  const params = new URLSearchParams(window.location.search);
  const [email, setEmail] = useState(params.get('email') || '');
  const [orderNumber] = useState(params.get('order') || '');
  const [submitted, setSubmitted] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name','robots'); document.head.appendChild(meta); }
    meta.setAttribute('content','noindex, nofollow');
    return () => meta.setAttribute('content','index, follow');
  }, []);

  const findOrders = async (lookupEmail = email) => {
    if (!lookupEmail.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await base44.functions.invoke('getMyOrders', { email: lookupEmail.trim(), order_number: orderNumber || undefined });
      if (res.data?.error) throw new Error(res.data.error);
      setOrders(res.data?.orders || []);
      setSubmitted(lookupEmail.trim());
      setSearched(true);
    } catch (e) {
      setError(e.message || t('tracking_load_failed', language)); setOrders([]); setSearched(true);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (email && orderNumber) findOrders(email); }, []);

  return <div className="min-h-screen bg-slate-50">
    <div className="bg-white border-b border-slate-200"><div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
      <Link to="/shop" className="text-slate-600 flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> {t("shop_shop",language)}</Link>
      <h1 className="text-xl font-bold text-slate-900">{t("tracking_title",language)}</h1>
    </div></div>
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-[#071b3d] text-white rounded-3xl p-6 mb-6">
        <p className="text-orange-400 text-xs font-bold tracking-[.2em] uppercase">{t("tracking_shop_label",language)}</p>
        <h2 className="text-2xl font-bold mt-2">{t("tracking_hero",language)}</h2>
        <p className="text-slate-300 mt-2 text-sm">{t("tracking_hero_copy",language)}</p>
      </div>
      <form onSubmit={e => { e.preventDefault(); findOrders(); }} className="flex gap-3 mb-7">
        <Input type="email" placeholder={t("tracking_email_placeholder",language)} value={email} onChange={e=>setEmail(e.target.value)} required className="bg-white"/>
        <Button disabled={loading} className="bg-orange-500 hover:bg-orange-600 gap-2"><Search className="w-4 h-4"/>{loading?t('tracking_checking',language):t('tracking_find_order',language)}</Button>
      </form>
      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-5">{error}</div>}
      {searched && orders.length===0 && <div className="bg-white rounded-2xl border p-10 text-center text-slate-500"><Package className="w-10 h-10 mx-auto mb-3 text-slate-300"/>{t("tracking_none_for",language)} <strong>{submitted}</strong>.</div>}
      <div className="space-y-6">{orders.map(order => {
        const current = stepIndex(order);
        return <div key={order.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b flex flex-wrap justify-between gap-3"><div><p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t("order_number",language)}</p><h3 className="font-bold text-xl">{order.order_number || t('tracking_processing_number',language)}</h3><p className="text-sm text-slate-500">{new Date(order.created_date).toLocaleString()}</p></div><div className="text-right"><p className="font-bold text-xl">${Number(order.total||0).toFixed(2)}</p><span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 font-semibold">{t(`tracking_status_${order.payment_status}`,language) === `tracking_status_${order.payment_status}` ? order.payment_status : t(`tracking_status_${order.payment_status}`,language)}</span></div></div>
          <div className="p-6">
            <div className="grid grid-cols-5 gap-2 mb-7">{STEPS.map((s,i)=><div key={s.key} className="text-center"><div className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center ${i<=current?'bg-orange-500 text-white':'bg-slate-100 text-slate-400'}`}><s.Icon className="w-4 h-4"/></div><p className={`text-[11px] mt-2 ${i<=current?'font-semibold text-slate-800':'text-slate-400'}`}>{t(s.labelKey,language)}</p></div>)}</div>
            <div className="space-y-2 mb-5">{(order.items||[]).map((item,i)=>{const displayItem=localizeShopProduct({id:item.product_id,name:item.product_name},language);return <div key={i} className="flex justify-between text-sm"><span>{displayItem.name} × {item.quantity}</span><span>${Number(item.unit_price*item.quantity).toFixed(2)}</span></div>})}</div>
            {order.tracking_number ? <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-blue-950"><Truck className="w-4 h-4 inline mr-2"/>{order.carrier || t('tracking_carrier',language)} {t('tracking_shipment',language)}</p><p className="text-sm text-blue-700 mt-1">{t("tracking_number",language)}: <strong>{order.tracking_number}</strong></p>{order.estimated_delivery && <p className="text-xs text-blue-600 mt-1">{t("tracking_est_delivery",language)}: {new Date(order.estimated_delivery).toLocaleDateString(language === "fr" ? "fr-FR" : undefined)}</p>}</div>{order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer"><Button className="gap-2">{t("tracking_track_package",language)} <ExternalLink className="w-4 h-4"/></Button></a>}</div> : <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4"><p className="font-semibold text-orange-950"><Clock className="w-4 h-4 inline mr-2"/>{t("tracking_preparing",language)}</p><p className="text-sm text-orange-800 mt-1">{t("tracking_no_number",language)}</p></div>}
          </div>
        </div>;
      })}</div>
    </div>
  </div>;
}