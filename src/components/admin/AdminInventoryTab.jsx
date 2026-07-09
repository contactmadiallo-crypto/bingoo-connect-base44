import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Package, Factory, CreditCard, Palette, Check, X, Plus, Truck } from 'lucide-react';

function StatusBadge({ status }) {
  const colors = {
    available: 'bg-slate-100 text-slate-600',
    assigned: 'bg-blue-100 text-blue-700',
    active: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-red-100 text-red-700',
    replaced: 'bg-purple-100 text-purple-700',
    draft: 'bg-slate-100 text-slate-600',
    ordered: 'bg-blue-100 text-blue-700',
    in_production: 'bg-orange-100 text-orange-700',
    quality_check: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    submitted: 'bg-blue-100 text-blue-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminInventoryTab({ activeTab }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newProduct, setNewProduct] = useState(null);

  // NFC Inventory
  const { data: devices, isLoading: devLoading } = useQuery({
    queryKey: ['admin-nfc-inv'],
    queryFn: () => base44.entities.NFCDevice.list('-created_date', 500),
    enabled: activeTab === 'inventory',
  });

  // Manufacturing
  const { data: mfgOrders, isLoading: mfgLoading } = useQuery({
    queryKey: ['admin-mfg'],
    queryFn: () => base44.entities.ManufacturingOrder.list('-created_date', 100),
    enabled: activeTab === 'manufacturing',
  });

  // Products
  const { data: products, isLoading: prodLoading } = useQuery({
    queryKey: ['admin-products-cat'],
    queryFn: () => base44.entities.ProductCatalogItem.list('sort_order', 100),
    enabled: activeTab === 'products',
  });

  // Design Approvals
  const { data: designs, isLoading: designLoading } = useQuery({
    queryKey: ['admin-designs'],
    queryFn: () => base44.entities.DeviceDesign.filter({ status: 'submitted' }, '-created_date', 50),
    enabled: activeTab === 'designs',
  });

  const handleDesignAction = async (designId, action) => {
    try {
      await base44.entities.DeviceDesign.update(designId, { status: action === 'approve' ? 'approved' : 'rejected' });
      await base44.entities.AdminAuditLog.create({
        action: `design_${action}`,
        performed_by: (await base44.auth.me()).id,
        performed_by_name: (await base44.auth.me()).full_name,
        target_type: 'DeviceDesign',
        target_id: designId,
        notes: `Design ${action}d`,
      });
      toast({ title: `Design ${action}d` });
      queryClient.invalidateQueries({ queryKey: ['admin-designs'] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct?.name || !newProduct?.price) return;
    try {
      await base44.entities.ProductCatalogItem.create({
        ...newProduct,
        price: Math.round(parseFloat(newProduct.price) * 100),
        supplier_cost: newProduct.supplier_cost ? Math.round(parseFloat(newProduct.supplier_cost) * 100) : 0,
        margin: newProduct.supplier_cost
          ? Math.round(parseFloat(newProduct.price) * 100) - Math.round(parseFloat(newProduct.supplier_cost) * 100)
          : Math.round(parseFloat(newProduct.price) * 100),
        is_active: true,
        is_coming_soon: newProduct.is_coming_soon || false,
      });
      toast({ title: 'Product created' });
      setNewProduct(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products-cat'] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const isLoading = devLoading || mfgLoading || prodLoading || designLoading;
  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  // ── NFC INVENTORY ──
  if (activeTab === 'inventory') {
    const byStatus = (s) => (devices || []).filter(d => d.status === s).length;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {['available', 'assigned', 'active', 'lost', 'replaced'].map(s => (
            <div key={s} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-slate-900">{byStatus(s)}</p>
              <p className="text-xs font-bold text-slate-500 capitalize mt-1">{s}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Device Code</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Type</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Status</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Profile</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(devices || []).slice(0, 50).map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700">{d.device_code}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{d.device_type}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{d.profile_id ? 'Linked' : '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(d.created_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── MANUFACTURING ──
  if (activeTab === 'manufacturing') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Order #</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Product</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Qty</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Supplier</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Cost → Price</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Margin</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(mfgOrders || []).map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">{o.order_number}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{o.product_type?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">{o.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">{o.supplier || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    ${(o.supplier_cost / 100).toFixed(2)} → ${(o.unit_price / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-600 text-xs">${(o.margin / 100).toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!mfgOrders || mfgOrders.length === 0) && (
          <div className="text-center py-12 text-sm text-slate-400">
            <Factory className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            No manufacturing orders yet.
          </div>
        )}
      </div>
    );
  }

  // ── PRODUCTS ──
  if (activeTab === 'products') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setNewProduct({ name: '', product_type: 'card', price: '', supplier_cost: '', category: 'nfc_hardware', is_coming_soon: false })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {newProduct && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-800">New Product</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <input placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              <select value={newProduct.product_type} onChange={e => setNewProduct({ ...newProduct, product_type: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
                {['card', 'metal_card', 'keychain', 'bracelet', 'sticker', 'tag', 'stand', 'badge', 'bundle'].map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
              <input placeholder="Price ($)" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              <input placeholder="Supplier Cost ($)" type="number" value={newProduct.supplier_cost} onChange={e => setNewProduct({ ...newProduct, supplier_cost: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={newProduct.is_coming_soon} onChange={e => setNewProduct({ ...newProduct, is_coming_soon: e.target.checked })} />
                Coming Soon
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveProduct} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold">Save</button>
              <button onClick={() => setNewProduct(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Product</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Type</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Price</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Cost</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Margin</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Stock</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(products || []).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-700">{p.name}</td>
                    <td className="px-4 py-3 capitalize text-slate-600 text-xs">{p.product_type?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">${(p.price / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">${p.supplier_cost ? (p.supplier_cost / 100).toFixed(2) : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 text-xs">{p.margin ? `$${(p.margin / 100).toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.stock_count || 0}</td>
                    <td className="px-4 py-3">
                      {p.is_coming_soon
                        ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 uppercase">Coming Soon</span>
                        : <StatusBadge status={p.is_active ? 'active' : 'cancelled'} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!products || products.length === 0) && (
            <div className="text-center py-12 text-sm text-slate-400">
              <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No products in catalog yet.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DESIGN APPROVALS ──
  if (activeTab === 'designs') {
    return (
      <div className="space-y-4">
        {(designs || []).length === 0 && (
          <div className="text-center py-16 text-sm text-slate-400">
            <Palette className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            No designs pending approval.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(designs || []).map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{d.product_type?.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-400">Qty: {d.quantity} • {d.finish}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              {d.custom_text && <p className="text-xs text-slate-600 mb-2">Text: "{d.custom_text}"</p>}
              {d.color && <div className="flex items-center gap-2 mb-2"><span className="text-xs text-slate-500">Color:</span><div className="w-4 h-4 rounded border border-slate-200" style={{ background: d.color }} /></div>}
              {d.logo_url && <img src={d.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-contain border border-slate-200 mb-2" />}
              {d.notes && <p className="text-xs text-slate-500 mb-3">{d.notes}</p>}
              <div className="flex gap-2">
                <button onClick={() => handleDesignAction(d.id, 'approve')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold">
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button onClick={() => handleDesignAction(d.id, 'reject')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold">
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}