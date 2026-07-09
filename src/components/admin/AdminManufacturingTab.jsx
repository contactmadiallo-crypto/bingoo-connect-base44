import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Factory, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STATUS_FLOW = ['draft', 'ordered', 'in_production', 'quality_check', 'shipped', 'delivered', 'cancelled'];
const PRODUCT_TYPES = ['card', 'metal_card', 'keychain', 'bracelet', 'sticker', 'tag', 'stand', 'badge', 'bundle'];

const statusColor = (s) => ({
  draft: 'bg-slate-100 text-slate-600',
  ordered: 'bg-blue-100 text-blue-700',
  in_production: 'bg-amber-100 text-amber-700',
  quality_check: 'bg-purple-100 text-purple-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}[s] || 'bg-slate-100 text-slate-600');

export default function AdminManufacturingTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order_number: '', product_type: 'card', quantity: 1, supplier: '', supplier_cost: 0, unit_price: 0, status: 'draft', notes: '', estimated_delivery: '' });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-mfg-orders'],
    queryFn: () => base44.entities.ManufacturingOrder.list('-created_date', 100),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.ManufacturingOrder.create({ ...data, margin: (data.unit_price || 0) - (data.supplier_cost || 0) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-mfg-orders'] }); setShowForm(false); },
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ManufacturingOrder.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-mfg-orders'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.ManufacturingOrder.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-mfg-orders'] }),
  });

  const fmtMoney = (cents) => cents ? `$${(cents / 100).toFixed(2)}` : '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><Factory className="w-5 h-5" /> Manufacturing Orders</h2>
          <p className="text-xs text-slate-500">{orders.length} orders tracked</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="w-4 h-4" /> New Order
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900">New Manufacturing Order</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Order Number</Label><Input value={form.order_number} onChange={e => setForm({ ...form, order_number: e.target.value })} placeholder="MFG-000001" /></div>
              <div><Label className="text-xs">Product Type</Label>
                <select className="w-full h-9 rounded-md border border-slate-200 text-sm" value={form.product_type} onChange={e => setForm({ ...form, product_type: e.target.value })}>
                  {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} /></div>
              <div><Label className="text-xs">Supplier</Label><Input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} /></div>
              <div><Label className="text-xs">Supplier Cost (cents)</Label><Input type="number" value={form.supplier_cost} onChange={e => setForm({ ...form, supplier_cost: parseInt(e.target.value) || 0 })} /></div>
              <div><Label className="text-xs">Unit Price (cents)</Label><Input type="number" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: parseInt(e.target.value) || 0 })} /></div>
              <div><Label className="text-xs">Est. Delivery</Label><Input type="date" value={form.estimated_delivery} onChange={e => setForm({ ...form, estimated_delivery: e.target.value })} /></div>
              <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <Button className="w-full bg-slate-900" onClick={() => createMut.mutate(form)} disabled={!form.order_number}>
              Create Order
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Factory className="w-12 h-12 mx-auto mb-2 text-slate-200" />
          <p className="text-sm font-semibold">No manufacturing orders yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-200 text-slate-500">
              <th className="text-left py-2 px-3 font-bold">Order #</th>
              <th className="text-left py-2 px-3 font-bold">Product</th>
              <th className="text-left py-2 px-3 font-bold">Qty</th>
              <th className="text-left py-2 px-3 font-bold">Supplier</th>
              <th className="text-left py-2 px-3 font-bold">Cost</th>
              <th className="text-left py-2 px-3 font-bold">Price</th>
              <th className="text-left py-2 px-3 font-bold">Margin</th>
              <th className="text-left py-2 px-3 font-bold">Status</th>
              <th className="text-left py-2 px-3 font-bold"></th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{o.order_number}</td>
                  <td className="py-2.5 px-3 text-slate-600">{o.product_type}</td>
                  <td className="py-2.5 px-3 text-slate-600">{o.quantity}</td>
                  <td className="py-2.5 px-3 text-slate-600">{o.supplier || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-600">{fmtMoney(o.supplier_cost)}</td>
                  <td className="py-2.5 px-3 text-slate-600">{fmtMoney(o.unit_price)}</td>
                  <td className="py-2.5 px-3 font-bold text-green-600">{fmtMoney(o.margin)}</td>
                  <td className="py-2.5 px-3">
                    <select value={o.status} onChange={e => updateStatusMut.mutate({ id: o.id, status: e.target.value })}
                      className={`text-xs font-bold rounded-full px-2 py-1 border-0 outline-none cursor-pointer ${statusColor(o.status)}`}>
                      {STATUS_FLOW.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <button onClick={() => deleteMut.mutate(o.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}