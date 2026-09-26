import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Package, Truck, Search, RefreshCw, Cpu, Copy, ExternalLink, FileCheck2, Factory, ShieldCheck, Plus, Globe2 } from 'lucide-react';
import ProductionProofModal from './ProductionProofModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

const MFG = ['device_allocated', 'in_production', 'programmed', 'ready_to_ship'];
const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Other'];

export default function AdminManufacturingTab() {
  const { language } = useI18n();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [shipping, setShipping] = useState({});
  const [busy, setBusy] = useState('');
  const [proofOrder, setProofOrder] = useState(null);
  const [section, setSection] = useState('queue');
  const [partnerForm, setPartnerForm] = useState({ legal_name:'', country_code:'US', currency:'USD', city:'', nfc_encoding:true, uv_printing:true, packaging:true });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-shop-orders'],
    queryFn: () => base44.entities.ShopOrder.list('-created_date', 200),
  });

  const { data: jobs = [] } = useQuery({ queryKey:['admin-production-jobs'], queryFn:()=>base44.entities.ProductionJob.list('-created_date',300) });
  const { data: partners = [] } = useQuery({ queryKey:['admin-manufacturing-partners'], queryFn:()=>base44.entities.ManufacturingPartner.list('-created_date',200) });
  const { data: qcRecords = [] } = useQuery({ queryKey:['admin-production-qc'], queryFn:()=>base44.entities.QualityControlRecord.list('-created_date',500) });

  const refreshOps = async()=>{ await Promise.all(['admin-shop-orders','admin-production-jobs','admin-manufacturing-partners','admin-production-qc'].map(queryKey=>qc.invalidateQueries({queryKey:[queryKey]}))); };
  const operation = async(payload)=>{ setBusy(payload.job_id||payload.order_id||payload.partner_id||'operation'); try{ const res=await base44.functions.invoke('manageManufacturingOperations',payload); if(res.data?.error) throw new Error(res.data.error); await refreshOps(); return res.data; } catch(e){ alert(e.message || t("mfg_operation_failed",language)); } finally{ setBusy(''); } };
  const createPartner = async()=>{ if(!partnerForm.legal_name.trim()) return alert(t("mfg_partner_name_required",language)); const ok=await operation({action:'create_partner',...partnerForm}); if(ok) setPartnerForm({ legal_name:'', country_code:'US', currency:'USD', city:'', nfc_encoding:true, uv_printing:true, packaging:true }); };

  const filtered = orders.filter(o => !search || [o.order_number, o.customer_email, o.customer_name, o.tracking_number, ...(o.assigned_device_codes || [])]
    .some(v => String(v || '').toLowerCase().includes(search.toLowerCase())));

  const update = async (order, data) => {
    setBusy(order.id);
    try {
      const res = await base44.functions.invoke('updateShopFulfillment', { order_id: order.id, ...data });
      if (res.data?.error) throw new Error(res.data.error);
      await qc.invalidateQueries({ queryKey: ['admin-shop-orders'] });
    } catch (e) {
      alert(e.message || t("mfg_update_failed",language));
    } finally {
      setBusy('');
    }
  };

  const ship = async order => {
    const s = shipping[order.id] || { carrier: order.carrier || '', tracking_number: order.tracking_number || '', estimated_delivery: order.estimated_delivery || '' };
    if (!s.carrier || !s.tracking_number) return alert(t("mfg_tracking_required",language));
    await update(order, s);
  };

  return (
    <div className="space-y-5 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2"><Factory className="w-5 h-5 text-orange-400" /> {t("mfg_title",language)}</h2>
          <p className="text-sm text-white/45">{t("mfg_flow",language)}</p>
        </div>
        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['admin-shop-orders'] })} className="gap-2 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
          <RefreshCw className="w-4 h-4" /> {t("mfg_refresh",language)}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[
        [t("mfg_paid_orders",language),orders.filter(o=>o.payment_status==="paid").length],[t("mfg_production_jobs",language),jobs.length],[t("mfg_approved_partners",language),partners.filter(p=>p.status==="approved").length],[t("mfg_qc_passed",language),qcRecords.filter(q=>q.status==="passed").length]
      ].map(([label,value])=><div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-4"><p className="text-2xl font-black">{value}</p><p className="text-xs text-white/40">{label}</p></div>)}</div>

      <div className="flex gap-2 overflow-x-auto">{[["queue",t("mfg_queue",language)],["partners",t("mfg_partners",language)]].map(([id,label])=><Button key={id} size="sm" onClick={()=>setSection(id)} className={section===id?'bg-orange-500 hover:bg-orange-600':'bg-white/5 border border-white/15 text-white hover:bg-white/10'}>{label}</Button>)}</div>

      {section==='partners' && <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><h3 className="font-black flex items-center gap-2 mb-4"><Plus className="w-4 h-4 text-orange-400"/>{t("mfg_add_partner",language)}</h3><div className="grid md:grid-cols-4 gap-3"><Input placeholder={t("mfg_legal_name",language)} value={partnerForm.legal_name} onChange={e=>setPartnerForm(x=>({...x,legal_name:e.target.value}))} className="bg-white/5 border-white/15 text-white"/><Input placeholder={t("mfg_city",language)} value={partnerForm.city} onChange={e=>setPartnerForm(x=>({...x,city:e.target.value}))} className="bg-white/5 border-white/15 text-white"/><Input placeholder={t("mfg_country",language)} maxLength={2} value={partnerForm.country_code} onChange={e=>setPartnerForm(x=>({...x,country_code:e.target.value.toUpperCase()}))} className="bg-white/5 border-white/15 text-white"/><Input placeholder={t("mfg_currency",language)} maxLength={3} value={partnerForm.currency} onChange={e=>setPartnerForm(x=>({...x,currency:e.target.value.toUpperCase()}))} className="bg-white/5 border-white/15 text-white"/></div><div className="flex flex-wrap gap-4 mt-3 text-xs text-white/60">{[["nfc_encoding",t("mfg_nfc_encoding",language)],["uv_printing",t("mfg_uv_printing",language)],["packaging",t("mfg_packaging",language)]].map(([key,label])=><label key={key} className="flex items-center gap-2"><input type="checkbox" checked={partnerForm[key]} onChange={e=>setPartnerForm(x=>({...x,[key]:e.target.checked}))}/>{label}</label>)}</div><Button onClick={createPartner} disabled={!!busy} className="mt-4 bg-orange-500 hover:bg-orange-600"><Plus className="w-4 h-4 mr-2"/>{t("mfg_create_pending",language)}</Button></div>
        <div className="grid md:grid-cols-2 gap-4">{partners.map(p=><div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex justify-between gap-3"><div><p className="font-black flex items-center gap-2"><Globe2 className="w-4 h-4 text-orange-400"/>{p.display_name||p.legal_name}</p><p className="text-xs text-white/40">{p.partner_code} · {p.city?`${p.city}, `:''}{p.country_code} · {p.currency}</p></div><Badge className="bg-white/10 text-white">{p.status}</Badge></div><p className="text-xs text-white/50 mt-3">{[p.nfc_encoding&&t("mfg_nfc_encoding",language),p.uv_printing&&t("mfg_uv_printing",language),p.laser_engraving&&t("mfg_laser",language),p.packaging&&t("mfg_packaging",language)].filter(Boolean).join(' · ')||t("mfg_capabilities_pending",language)}</p>{p.status==='pending_review'&&<Button size="sm" onClick={()=>operation({action:'set_partner_status',partner_id:p.id,status:'approved'})} className="mt-3 bg-emerald-600 hover:bg-emerald-700"><ShieldCheck className="w-4 h-4 mr-2"/>{t("mfg_approve",language)}</Button>}{p.status==='approved'&&<Button size="sm" variant="outline" onClick={()=>operation({action:'set_partner_status',partner_id:p.id,status:'suspended'})} className="mt-3 bg-white/5 border-white/15 text-white">{t("mfg_suspend",language)}</Button>}</div>)}</div>
      </div>}

      {section==='queue' && <><div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("mfg_search",language)} className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-white/50">{t("mfg_loading_orders",language)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 py-16 text-center text-white/45"><Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-bold">{t("mfg_no_orders",language)}</p></div>
      ) : (
        <div className="space-y-5">
          {filtered.map(order => {
            const s = shipping[order.id] || { carrier: order.carrier || '', tracking_number: order.tracking_number || '', estimated_delivery: order.estimated_delivery?.slice(0, 10) || '' };
            return (
              <div key={order.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 md:p-6 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-white/10 pb-4 mb-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1"><span className="font-mono text-orange-300 font-black">{order.order_number || t("mfg_legacy_order",language)}</span><Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">{order.payment_status}</Badge><Badge className="bg-white/10 text-white border border-white/10">{order.fulfillment_status}</Badge></div>
                    <h3 className="font-black text-lg">{order.customer_name || t("mfg_customer",language)}</h3>
                    <p className="text-sm text-white/45">{order.customer_email}</p>
                    <p className="text-xs text-white/35 mt-1">{order.shipping_address}{order.city ? `, ${order.city}` : ''}{order.state ? `, ${order.state}` : ''} {order.zip_code || ''}{order.country ? ` · ${order.country}` : ''}</p>{order.shipping_zone&&<p className="text-[11px] text-orange-200/70 mt-1">{order.shipping_zone.replaceAll('_',' ')} · {order.shipping_service} · ${Number(order.shipping_cost||0).toFixed(2)} · {order.shipping_eta_min_days}-{order.shipping_eta_max_days} {t("mfg_days",language)}{order.duties_terms==="DAP"?` · ${t("mfg_duties_delivery",language)}`:""}</p>}
                  </div>
                  <div className="lg:text-right"><p className="text-2xl font-black">${Number(order.total || 0).toFixed(2)}</p><p className="text-xs text-white/35">{order.created_date ? new Date(order.created_date).toLocaleString() : ''}</p></div>
                </div>

                <div className="grid xl:grid-cols-3 gap-5">
                  <div className="rounded-2xl bg-black/10 border border-white/10 p-4">
                    <p className="font-black text-sm mb-3"><Package className="w-4 h-4 inline mr-2 text-orange-400" />{t("mfg_products_nfc",language)}</p>
                    {(order.items || []).map((i, k) => <div key={k} className="text-sm text-white/65 mb-1"><strong className="text-white">{i.product_name}</strong> × {i.quantity}</div>)}
                    {(order.items || []).some(i => i.customDesign || String(i.product_id || '').startsWith('studio-')) && <Button size="sm" onClick={() => setProofOrder(order)} className="mt-3 w-full bg-orange-500/15 border border-orange-400/30 text-orange-200 hover:bg-orange-500/25"><FileCheck2 className="w-4 h-4 mr-2" />{t("mfg_view_design",language)}</Button>}
                    {(order.assigned_device_codes || []).length > 0 && <div className="mt-4"><p className="text-[10px] tracking-widest text-white/30 font-black">{t("mfg_allocated_devices",language)}</p>{order.assigned_device_codes.map(c => <div key={c} className="flex items-center gap-2 mt-2"><span className="font-mono text-orange-300 font-bold">{c}</span><button title={t("mfg_copy_url",language)} onClick={() => navigator.clipboard.writeText(`https://bingooconnect.com/d/${c}`)}><Copy className="w-3.5 h-3.5 text-white/40 hover:text-white" /></button><a href={`https://bingooconnect.com/d/${c}`} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5 text-white/40 hover:text-white" /></a></div>)}</div>}
                  </div>

                  <div className="rounded-2xl bg-black/10 border border-white/10 p-4">
                    <p className="font-black text-sm mb-2"><Cpu className="w-4 h-4 inline mr-2 text-orange-400" />{t("mfg_manufacturing",language)}</p>
                    <p className="text-xs text-white/45 mb-3">{t("mfg_current",language)}: <strong className="text-white">{(order.manufacturing_status || 'pending').replaceAll('_', ' ')}</strong> · {t("mfg_backbone",language)} <strong className="text-white">{order.production_backbone_status||'legacy'}</strong></p>
                    {!(order.production_job_ids||[]).length && order.payment_status==='paid' && <Button size="sm" disabled={!!busy} onClick={()=>operation({action:'ensure_backbone',order_id:order.id})} className="mb-3 bg-orange-500 hover:bg-orange-600">{t("mfg_create_job",language)}</Button>}
                    {(order.production_job_ids||[]).map(id=>{const job=jobs.find(j=>j.id===id); if(!job)return null; const next={draft:'assigned',assigned:'accepted',accepted:'artwork_review',artwork_review:'in_production',in_production:'encoding',encoding:'quality_control',quality_control:'ready_to_ship',ready_to_ship:'shipped',shipped:'completed'}[job.status]; return <div key={id} className="rounded-xl border border-white/10 p-3 mb-2"><p className="font-mono text-xs text-orange-300">{job.job_number}</p><p className="text-xs text-white/50 mt-1">{t("mfg_status",language)}: <strong className="text-white">{job.status.replaceAll('_',' ')}</strong>{job.partner_code?` · ${job.partner_code}`:''}</p>{!job.partner_id&&<select className="mt-2 w-full h-9 rounded-md px-2 text-xs bg-[#10264d] border border-white/15" defaultValue="" onChange={e=>e.target.value&&operation({action:'assign_partner',job_id:job.id,partner_id:e.target.value})}><option value="">{t("mfg_assign_facility",language)}</option>{partners.filter(p=>p.status==='approved').map(p=><option key={p.id} value={p.id}>{p.display_name||p.legal_name} · {p.country_code}</option>)}</select>}{job.status==='quality_control'&&<Button size="sm" onClick={()=>operation({action:'pass_qc',job_id:job.id})} className="mt-2 bg-emerald-600 hover:bg-emerald-700"><ShieldCheck className="w-3.5 h-3.5 mr-1"/>{t("mfg_qc_attest",language)}</Button>}{next && !(job.status==='draft'&&!job.partner_id) && <Button size="sm" variant="outline" onClick={()=>operation({action:'transition_job',job_id:job.id,status:next})} className="mt-2 bg-white/5 border-white/15 text-white">{t("mfg_move_to",language)} {next.replaceAll('_',' ')}</Button>}</div>})}
                    {(order.production_job_ids||[]).length===0&&<div className="flex flex-wrap gap-2">{MFG.map(m => <Button key={m} size="sm" disabled={busy === order.id} variant="outline" onClick={() => update(order, { manufacturing_status: m })} className={order.manufacturing_status === m ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-500' : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10 hover:text-white'}>{m.replaceAll('_', ' ')}</Button>)}</div>}
                  </div>

                  <div className="rounded-2xl bg-black/10 border border-white/10 p-4">
                    <p className="font-black text-sm mb-3"><Truck className="w-4 h-4 inline mr-2 text-orange-400" />{t("mfg_shipment",language)}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select className="h-10 rounded-md px-2 text-sm bg-[#10264d] border border-white/15 text-white" value={s.carrier} onChange={e => setShipping(x => ({ ...x, [order.id]: { ...s, carrier: e.target.value } }))}><option value="">{t("mfg_carrier",language)}</option>{CARRIERS.map(c => <option key={c}>{c}</option>)}</select>
                      <Input placeholder={t("mfg_tracking_number",language)} value={s.tracking_number} onChange={e => setShipping(x => ({ ...x, [order.id]: { ...s, tracking_number: e.target.value } }))} className="bg-white/5 border-white/15 text-white placeholder:text-white/30" />
                      <Input type="date" className="col-span-2 bg-white/5 border-white/15 text-white" value={s.estimated_delivery || ''} onChange={e => setShipping(x => ({ ...x, [order.id]: { ...s, estimated_delivery: e.target.value ? new Date(`${e.target.value}T12:00:00`).toISOString() : '' } }))} />
                      <Button className="col-span-2 bg-orange-500 hover:bg-orange-600" disabled={busy === order.id} onClick={() => ship(order)}>{busy === order.id ? t("mfg_saving",language) : order.tracking_number ? t("mfg_update_shipment",language) : t("mfg_mark_shipped",language)}</Button>
                      {order.tracking_url && <a className="col-span-2 text-center text-xs text-orange-300 hover:underline" href={order.tracking_url} target="_blank" rel="noreferrer">{t("mfg_open_tracking",language)} ↗</a>}
                      {order.fulfillment_status === 'shipped' && <Button className="col-span-2 bg-white/5 border-white/15 text-white" variant="outline" disabled={busy === order.id} onClick={() => update(order, { fulfillment_status: 'delivered' })}>{t("mfg_mark_delivered",language)}</Button>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>}
      {proofOrder && <ProductionProofModal order={proofOrder} onClose={() => setProofOrder(null)} />}
    </div>
  );
}
