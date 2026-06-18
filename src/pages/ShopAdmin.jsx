import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Package, Truck, CheckCircle2, Clock, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const FULFILLMENT_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ShopAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "robots"); document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    return () => { meta.setAttribute("content", "index, follow"); };
  }, []);
  const [editingId, setEditingId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['shopOrders'],
    queryFn: () => base44.entities.ShopOrder.list('-created_date', 100),
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShopOrder.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopOrders'] }),
  });

  const filtered = orders.filter(o =>
    !search ||
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = (order, status) => {
    updateOrder.mutate({ id: order.id, data: { fulfillment_status: status } });
  };

  const handleSaveTracking = (order) => {
    updateOrder.mutate({ id: order.id, data: { tracking_number: trackingInput, fulfillment_status: 'shipped' } });
    setEditingId(null);
    setTrackingInput('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Shop Admin</h1>
          <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['shopOrders'] })} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by order #, email, or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3" />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-slate-900">#{order.order_number}</p>
                    <p className="text-sm text-slate-500">{order.customer_name} · {order.customer_email}</p>
                    <p className="text-xs text-slate-400">{new Date(order.created_date).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge className={STATUS_COLORS[order.fulfillment_status] || 'bg-slate-100 text-slate-600'}>
                      {order.fulfillment_status}
                    </Badge>
                    <Badge variant="outline">{order.payment_status}</Badge>
                    <span className="font-bold text-slate-900">${order.total?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-sm text-slate-600 mb-3 space-y-0.5">
                  {(order.items || []).map((item, i) => (
                    <span key={i} className="mr-3">{item.product_name} ×{item.quantity}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {FULFILLMENT_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(order, s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        order.fulfillment_status === s
                          ? `${STATUS_COLORS[s]} border-transparent`
                          : 'border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}

                  {editingId === order.id ? (
                    <div className="flex gap-2 items-center ml-2">
                      <Input
                        value={trackingInput}
                        onChange={e => setTrackingInput(e.target.value)}
                        placeholder="Tracking number"
                        className="h-8 text-sm w-44"
                      />
                      <Button size="sm" onClick={() => handleSaveTracking(order)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(order.id); setTrackingInput(order.tracking_number || ''); }}
                      className="ml-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Truck className="w-3 h-3" />
                      {order.tracking_number ? `Tracking: ${order.tracking_number}` : 'Add Tracking'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}