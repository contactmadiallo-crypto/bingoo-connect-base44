import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Package, Truck, Search, RefreshCw, Cpu, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const MFG = ['device_allocated','in_production','programmed','ready_to_ship'];
const CARRIERS = ['USPS','UPS','FedEx','DHL','Other'];

export default function ShopAdmin() {
  const qc = useQueryClient();
  const [search,setSearch]=useState('');
  const [shipping,setShipping]=useState({});
  const [busy,setBusy]=useState('');
  useEffect(()=>{let m=document.querySelector('meta[name="robots"]');if(!m){m=document.createElement('meta');m.name='robots';document.head.appendChild(m)}m.content='noindex, nofollow';return()=>{m.content='index, follow'}},[]);
  const {data:orders=[],isLoading}=useQuery({queryKey:['shopOrders'],queryFn:()=>base44.entities.ShopOrder.list('-created_date',100)});
  const filtered=orders.filter(o=>!search||[o.order_number,o.customer_email,o.customer_name,o.tracking_number].some(v=>v?.toLowerCase().includes(search.toLowerCase())));

  const update=async(order,data)=>{setBusy(order.id);try{const res=await base44.functions.invoke('updateShopFulfillment',{order_id:order.id,...data});if(res.data?.error)throw new Error(res.data.error);await qc.invalidateQueries({queryKey:['shopOrders']});}finally{setBusy('')}};
  const ship=async order=>{const s=shipping[order.id]||{};if(!s.carrier||!s.tracking_number)return alert('Carrier and tracking number are required.');await update(order,s);};

  return <div className="min-h-screen bg-slate-50 p-6"><div className="max-w-7xl mx-auto">
    <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold">Bingoo Shop Fulfillment</h1><p className="text-sm text-slate-500">Payment → manufacturing → shipment → delivery</p></div><Button variant="outline" onClick={()=>qc.invalidateQueries({queryKey:['shopOrders']})} className="gap-2"><RefreshCw className="w-4 h-4"/>Refresh</Button></div>
    <div className="relative mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Order #, customer, email, tracking…" className="pl-9 bg-white"/></div>
    {isLoading?<div className="py-16 text-center">Loading orders…</div>:<div className="space-y-5">{filtered.map(order=>{
      const s=shipping[order.id]||{carrier:order.carrier||'',tracking_number:order.tracking_number||'',estimated_delivery:order.estimated_delivery?.slice(0,10)||''};
      return <div key={order.id} className="bg-white border rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap justify-between gap-4 border-b pb-4 mb-4"><div><p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{order.order_number||'Legacy order'}</p><h3 className="font-bold text-lg">{order.customer_name}</h3><p className="text-sm text-slate-500">{order.customer_email} · {order.shipping_address}, {order.city} {order.state} {order.zip_code}</p></div><div className="text-right"><p className="font-bold text-lg">${Number(order.total||0).toFixed(2)}</p><div className="flex gap-2 mt-1"><Badge variant="outline">{order.payment_status}</Badge><Badge>{order.fulfillment_status}</Badge></div></div></div>
        <div className="grid lg:grid-cols-3 gap-5">
          <div><p className="font-bold text-sm mb-2"><Package className="w-4 h-4 inline mr-2"/>Products</p>{(order.items||[]).map((i,k)=><p key={k} className="text-sm text-slate-600">{i.product_name} × {i.quantity}</p>)}{(order.assigned_device_codes||[]).length>0&&<div className="mt-3"><p className="text-xs text-slate-400 font-semibold">ALLOCATED NFC</p>{order.assigned_device_codes.map(c=><button key={c} onClick={()=>navigator.clipboard.writeText(`https://bingooconnect.com/d/${c}`)} className="block text-xs font-mono text-blue-600 mt-1">{c} <Copy className="w-3 h-3 inline"/></button>)}</div>}</div>
          <div><p className="font-bold text-sm mb-2"><Cpu className="w-4 h-4 inline mr-2"/>Manufacturing</p><p className="text-xs text-slate-500 mb-3">Current: <strong>{order.manufacturing_status||'pending'}</strong></p><div className="flex flex-wrap gap-2">{MFG.map(m=><Button key={m} size="sm" variant={order.manufacturing_status===m?'default':'outline'} disabled={busy===order.id} onClick={()=>update(order,{manufacturing_status:m})}>{m.replaceAll('_',' ')}</Button>)}</div></div>
          <div><p className="font-bold text-sm mb-2"><Truck className="w-4 h-4 inline mr-2"/>Shipment</p><div className="grid grid-cols-2 gap-2"><select className="h-10 border rounded-md px-2 text-sm" value={s.carrier} onChange={e=>setShipping(x=>({...x,[order.id]:{...s,carrier:e.target.value}}))}><option value="">Carrier</option>{CARRIERS.map(c=><option key={c}>{c}</option>)}</select><Input placeholder="Tracking number" value={s.tracking_number} onChange={e=>setShipping(x=>({...x,[order.id]:{...s,tracking_number:e.target.value}}))}/><Input type="date" className="col-span-2" value={s.estimated_delivery||''} onChange={e=>setShipping(x=>({...x,[order.id]:{...s,estimated_delivery:e.target.value?new Date(`${e.target.value}T12:00:00`).toISOString():''}}))}/><Button className="col-span-2 bg-orange-500 hover:bg-orange-600" disabled={busy===order.id} onClick={()=>ship(order)}>{order.tracking_number?'Update Shipment':'Mark Shipped + Send Email'}</Button>{order.fulfillment_status==='shipped'&&<Button className="col-span-2" variant="outline" onClick={()=>update(order,{fulfillment_status:'delivered'})}>Mark Delivered</Button>}</div></div>
        </div>
      </div>})}</div>}
  </div></div>;
}