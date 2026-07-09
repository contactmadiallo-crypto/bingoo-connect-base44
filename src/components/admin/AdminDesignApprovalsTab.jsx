import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Palette, Check, X, Eye } from 'lucide-react';

const STATUS_LABELS = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600' },
  submitted: { label: 'Submitted', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  in_production: { label: 'In Production', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Shipped', color: 'bg-cyan-100 text-cyan-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export default function AdminDesignApprovalsTab() {
  const qc = useQueryClient();

  const { data: designs = [], isLoading } = useQuery({
    queryKey: ['admin-designs'],
    queryFn: () => base44.entities.DeviceDesign.filter({ status: 'submitted' }, '-created_date'),
  });

  const { data: allDesigns = [] } = useQuery({
    queryKey: ['admin-designs-all'],
    queryFn: () => base44.entities.DeviceDesign.list('-created_date', 50),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }) => base44.entities.DeviceDesign.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-designs'] }); qc.invalidateQueries({ queryKey: ['admin-designs-all'] }); },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><Palette className="w-5 h-5" /> Design Approvals</h2>
        <p className="text-xs text-slate-500">{designs.length} pending approval · {allDesigns.length} total designs</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>
      ) : designs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Palette className="w-12 h-12 mx-auto mb-2 text-slate-200" />
          <p className="text-sm font-semibold">No designs pending approval</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-sm text-slate-900">{d.product_type}</p>
                  <p className="text-xs text-slate-500">{d.color || 'No color'} · {d.finish || 'matte'}</p>
                </div>
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${STATUS_LABELS[d.status]?.color}`}>{STATUS_LABELS[d.status]?.label}</span>
              </div>
              {d.logo_url && <img src={d.logo_url} alt="Design logo" className="w-full h-24 object-contain rounded-lg bg-slate-50" />}
              {d.custom_text && <p className="text-xs text-slate-600">Text: "{d.custom_text}"</p>}
              <p className="text-xs text-slate-500">Qty: {d.quantity || 1}</p>
              {d.notes && <p className="text-xs text-slate-400 italic">"{d.notes}"</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => updateMut.mutate({ id: d.id, status: 'approved' })}
                  className="flex-1 flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button onClick={() => updateMut.mutate({ id: d.id, status: 'rejected' })}
                  className="flex-1 flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {allDesigns.length > 0 && (
        <div className="pt-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">All Designs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-200 text-slate-500">
                <th className="text-left py-2 px-3 font-bold">Product</th>
                <th className="text-left py-2 px-3 font-bold">Color</th>
                <th className="text-left py-2 px-3 font-bold">Finish</th>
                <th className="text-left py-2 px-3 font-bold">Qty</th>
                <th className="text-left py-2 px-3 font-bold">Status</th>
              </tr></thead>
              <tbody>
                {allDesigns.map(d => (
                  <tr key={d.id} className="border-b border-slate-100">
                    <td className="py-2 px-3 font-bold text-slate-900">{d.product_type}</td>
                    <td className="py-2 px-3 text-slate-600">{d.color || '—'}</td>
                    <td className="py-2 px-3 text-slate-600">{d.finish || '—'}</td>
                    <td className="py-2 px-3 text-slate-600">{d.quantity || 1}</td>
                    <td className="py-2 px-3"><span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${STATUS_LABELS[d.status]?.color}`}>{STATUS_LABELS[d.status]?.label || d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}