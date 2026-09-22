import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Package, Truck, Search, RefreshCw, Cpu, Copy, ExternalLink, FileCheck2 } from 'lucide-react';
import ProductionProofModal from './ProductionProofModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const MFG = ['device_allocated', 'in_production', 'programmed', 'ready_to_ship'];
const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Other'];

export default function AdminManufacturingTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [shipping, setShipping] = useState({});
  const [busy, setBusy] = useState('');
  const [proofOrder, setProofOrder] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-shop-orders'],
    queryFn: () => base44.entities.ShopOrder.list('-created_date', 200),
  });

  const filtered = orders.filter(o => !search || [o.order_number, o.customer_email, o.customer_name, o.tracking_number, ...(o.assigned_device_codes || [])]
    .some(v => String(v || '').toLowerCase().includes(search.toLowerCase())));

  const update = async (order, data) => {
    setBusy(order.id);
    try {
      const res = await base44.functions.invoke('updateShopFulfillment', { order_id: order.id, ...data });
      if (res.data?.error) throw new Error(res.data.error);
      await qc.invalidateQueries({ queryKey: ['admin-shop-orders'] });
    } catch (e) {
      alert(e.message || 'Could not update order.');
    } finally {
      setBusy('');
    }
  };

  const ship = async order => {
    const s = shipping[order.id] || { carrier: order.carrier || '', tracking_number: order.tracking_number || '', estimated_delivery: order.estimated_delivery || '' };
    if (!s.carrier || !s.tracking_number) return alert('Carrier and tracking number are required.');
    await update(order, s);
  };

  return (
    <div className="space-y-5 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2"><Package className="w-5 h-5 text-orange-400" /> Shop Orders & Fulfillment</h2>
          <p className="text-sm text-white/45">{orders.length} shop order{orders.length === 1 ? '' : 's'} · payment → manufacturing → shipment → delivery</p>
        </div>
        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['admin-shop-orders'] })} className="gap-2 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Order #, customer, email, BG device code, tracking…" className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-white/50">Loading Bingoo Shop orders…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 py-16 text-center text-white/45"><Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-bold">No Bingoo Shop orders found</p></div>
      ) : (
        <div className="space-y-5">
          {filtered.map(order => {
            const s = shipping[order.id] || { carrier: order.carrier || '', tracking_number: order.tracking_number || '', estimated_delivery: order.estimated_delivery?.slice(0, 10) || '' };
            return (
              <div key={order.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 md:p-6 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-white/10 pb-4 mb-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1"><span className="font-mono text-orange-300 font-black">{order.order_number || 'Legacy order'}</span><Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">{order.payment_status}</Badge><Badge className="bg-white/10 text-white border border-white/10">{order.fulfillment_status}</Badge></div>
                    <h3 className="font-black text-lg">{order.customer_name || 'Customer'}</h3>
                    <p className="text-sm text-white/45">{order.customer_email}</p>
                    <p className="text-xs text-white/35 mt-1">{order.shipping_address}{order.city ? `, ${order.city}` : ''}{order.state ? `, ${order.state}` : ''} {order.zip_code || ''}</p>
                  </div>
                  <div className="lg:text-right"><p className="text-2xl font-black">${Number(order.total || 0).toFixed(2)}</p><p className="text-xs text-white/35">{order.created_date ? new Date(order.created_date).toLocaleString() : ''}</p></div>
                </div>

                <div className="grid xl:grid-cols-3 gap-5">
                  <div className="rounded-2xl bg-black/10 border border-white/10 p-4">
                    <p className="font-black text-sm mb-3"><Package className="w-4 h-4 inline mr-2 text-orange-400" />Products & NFC</p>
                    {(order.items || []).map((i, k) => <div key={k} className="text-sm text-white/65 mb-1"><strong className="text-white">{i.product_name}</strong> × {i.quantity}</div>)}
                    {(order.items || []).some(i => i.customDesign || String(i.product_id || '').startsWith('studio-')) && <Button size="sm" onClick={() => setProofOrder(order)} className="mt-3 w-full bg-orange-500/15 border border-orange-400/30 text-orange-200 hover:bg-orange-500/25"><FileCheck2 className="w-4 h-4 mr-2" />View Production Design</Button>}
                    {(order.assigned_device_codes || []).length > 0 && <div className="mt-4"><p className="text-[10px] tracking-widest text-white/30 font-black">ALLOCATED NFC DEVICES</p>{order.assigned_device_codes.map(c => <div key={c} className="flex items-center gap-2 mt-2"><span className="font-mono text-orange-300 font-bold">{c}</span><button title="Copy NFC URL" onClick={() => navigator.clipboard.writeText(`https://bingooconnect.com/d/${c}`)}><Copy className="w-3.5 h-3.5 text-white/40 hover:text-white" /></button><a href={`https://bingooconnect.com/d/${c}`} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5 text-white/40 hover:text-white" /></a></div>)}</div>}
                  </div>

                  <div className="rounded-2xl bg-black/10 border border-white/10 p-4">
                    <p className="font-black text-sm mb-2"><Cpu className="w-4 h-4 inline mr-2 text-orange-400" />Manufacturing</p>
                    <p className="text-xs text-white/45 mb-3">Current: <strong className="text-white">{(order.manufacturing_status || 'pending').replaceAll('_', ' ')}</strong></p>
                    <div className="flex flex-wrap gap-2">{MFG.map(m => <Button key={m} size="sm" disabled={busy === order.id} variant="outline" onClick={() => update(order, { manufacturing_status: m })} className={order.manufacturing_status === m ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-500' : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10 hover:text-white'}>{m.replaceAll('_', ' ')}</Button>)}</div>
                  </div>

                  <div className="rounded-2xl bg-black/10 border border-white/10 p-4">
                    <p className="font-black text-sm mb-3"><Truck className="w-4 h-4 inline mr-2 text-orange-400" />Shipment</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select className="h-10 rounded-md px-2 text-sm bg-[#10264d] border border-white/15 text-white" value={s.carrier} onChange={e => setShipping(x => ({ ...x, [order.id]: { ...s, carrier: e.target.value } }))}><option value="">Carrier</option>{CARRIERS.map(c => <option key={c}>{c}</option>)}</select>
                      <Input placeholder="Tracking number" value={s.tracking_number} onChange={e => setShipping(x => ({ ...x, [order.id]: { ...s, tracking_number: e.target.value } }))} className="bg-white/5 border-white/15 text-white placeholder:text-white/30" />
                      <Input type="date" className="col-span-2 bg-white/5 border-white/15 text-white" value={s.estimated_delivery || ''} onChange={e => setShipping(x => ({ ...x, [order.id]: { ...s, estimated_delivery: e.target.value ? new Date(`${e.target.value}T12:00:00`).toISOString() : '' } }))} />
                      <Button className="col-span-2 bg-orange-500 hover:bg-orange-600" disabled={busy === order.id} onClick={() => ship(order)}>{busy === order.id ? 'Saving…' : order.tracking_number ? 'Update Shipment' : 'Mark Shipped + Send Email'}</Button>
                      {order.tracking_url && <a className="col-span-2 text-center text-xs text-orange-300 hover:underline" href={order.tracking_url} target="_blank" rel="noreferrer">Open carrier tracking ↗</a>}
                      {order.fulfillment_status === 'shipped' && <Button className="col-span-2 bg-white/5 border-white/15 text-white" variant="outline" disabled={busy === order.id} onClick={() => update(order, { fulfillment_status: 'delivered' })}>Mark Delivered</Button>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {proofOrder && <ProductionProofModal order={proofOrder} onClose={() => setProofOrder(null)} />}
    </div>
  );
}
