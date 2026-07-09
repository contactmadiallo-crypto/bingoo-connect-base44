import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CreditCard, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRODUCT_TYPES = ['card', 'metal_card', 'keychain', 'bracelet', 'sticker', 'tag', 'stand', 'badge', 'bundle'];

export default function AdminProductsTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', product_type: 'card', category: 'nfc_hardware', price: 0, supplier_cost: 0, stripe_product_id: '', is_active: true, is_coming_soon: false, stock_count: 0, sort_order: 0 });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.ProductCatalogItem.list('sort_order', 100),
  });

  const saveMut = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, margin: (data.price || 0) - (data.supplier_cost || 0) };
      return editId
        ? base44.entities.ProductCatalogItem.update(editId, payload)
        : base44.entities.ProductCatalogItem.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setShowForm(false); setEditId(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.ProductCatalogItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const toggleActiveMut = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.ProductCatalogItem.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const fmtMoney = (cents) => cents ? `$${(cents / 100).toFixed(2)}` : '—';

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name || '', description: p.description || '', product_type: p.product_type || 'card', category: p.category || 'nfc_hardware', price: p.price || 0, supplier_cost: p.supplier_cost || 0, stripe_product_id: p.stripe_product_id || '', is_active: p.is_active !== false, is_coming_soon: p.is_coming_soon || false, stock_count: p.stock_count || 0, sort_order: p.sort_order || 0 });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Product Catalog</h2>
          <p className="text-xs text-slate-500">{products.length} products · {products.filter(p => p.is_active).length} active</p>
        </div>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ name: '', description: '', product_type: 'card', category: 'nfc_hardware', price: 0, supplier_cost: 0, stripe_product_id: '', is_active: true, is_coming_soon: false, stock_count: 0, sort_order: 0 }); setShowForm(true); }} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-3 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900">{editId ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Product Type</Label>
                <select className="w-full h-9 rounded-md border border-slate-200 text-sm" value={form.product_type} onChange={e => setForm({ ...form, product_type: e.target.value })}>
                  {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label className="text-xs">Price (cents)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} /></div>
              <div><Label className="text-xs">Supplier Cost (cents)</Label><Input type="number" value={form.supplier_cost} onChange={e => setForm({ ...form, supplier_cost: parseInt(e.target.value) || 0 })} /></div>
              <div><Label className="text-xs">Stripe Product ID</Label><Input value={form.stripe_product_id} onChange={e => setForm({ ...form, stripe_product_id: e.target.value })} /></div>
              <div><Label className="text-xs">Stock Count</Label><Input type="number" value={form.stock_count} onChange={e => setForm({ ...form, stock_count: parseInt(e.target.value) || 0 })} /></div>
              <div><Label className="text-xs">Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
              <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={form.is_coming_soon} onChange={e => setForm({ ...form, is_coming_soon: e.target.checked })} /> Coming Soon</label>
            </div>
            <Button className="w-full bg-slate-900" onClick={() => saveMut.mutate(form)} disabled={!form.name}>
              {editId ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-200 text-slate-500">
              <th className="text-left py-2 px-3 font-bold">Name</th>
              <th className="text-left py-2 px-3 font-bold">Type</th>
              <th className="text-left py-2 px-3 font-bold">Price</th>
              <th className="text-left py-2 px-3 font-bold">Cost</th>
              <th className="text-left py-2 px-3 font-bold">Margin</th>
              <th className="text-left py-2 px-3 font-bold">Stock</th>
              <th className="text-left py-2 px-3 font-bold">Stripe</th>
              <th className="text-left py-2 px-3 font-bold">Status</th>
              <th className="text-left py-2 px-3 font-bold"></th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => openEdit(p)}>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}{p.is_coming_soon && <span className="ml-2 text-amber-600">(Soon)</span>}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.product_type}</td>
                  <td className="py-2.5 px-3 text-slate-600">{fmtMoney(p.price)}</td>
                  <td className="py-2.5 px-3 text-slate-600">{fmtMoney(p.supplier_cost)}</td>
                  <td className="py-2.5 px-3 font-bold text-green-600">{fmtMoney(p.margin)}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.stock_count || 0}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[10px]">{p.stripe_product_id ? '✓' : '—'}</td>
                  <td className="py-2.5 px-3">
                    <button onClick={e => { e.stopPropagation(); toggleActiveMut.mutate({ id: p.id, is_active: !p.is_active }); }}
                      className={`text-xs font-bold rounded-full px-2 py-1 ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="py-2.5 px-3">
                    <button onClick={e => { e.stopPropagation(); deleteMut.mutate(p.id); }} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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