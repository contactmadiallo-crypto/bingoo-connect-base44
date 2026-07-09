import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { KeyRound, Search, Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = ['free', 'professional', 'salon', 'restaurant', 'lawfirm', 'business', 'corporate'];

export default function AdminEntitlementsTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editSub, setEditSub] = useState(null);

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['admin-entitlements'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 200),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, plan, plan_source, status }) => base44.entities.Subscription.update(id, { plan, plan_source, status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-entitlements'] }); setEditSub(null); },
  });

  const filtered = subs.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.customer_email?.toLowerCase().includes(q) || s.customer_name?.toLowerCase().includes(q) || s.plan?.toLowerCase().includes(q);
  });

  const planColor = (plan) => ({
    free: 'bg-slate-100 text-slate-600',
    professional: 'bg-blue-100 text-blue-700',
    salon: 'bg-purple-100 text-purple-700',
    restaurant: 'bg-amber-100 text-amber-700',
    lawfirm: 'bg-indigo-100 text-indigo-700',
    business: 'bg-cyan-100 text-cyan-700',
    corporate: 'bg-green-100 text-green-700',
  }[plan] || 'bg-slate-100 text-slate-600');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><KeyRound className="w-5 h-5" /> Manual Entitlements</h2>
        <p className="text-xs text-slate-500">{subs.length} subscriptions · {subs.filter(s => s.plan_source === 'admin_override').length} admin overrides</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by email, name, or plan..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 outline-none focus:border-slate-400" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-200 text-slate-500">
              <th className="text-left py-2 px-3 font-bold">Customer</th>
              <th className="text-left py-2 px-3 font-bold">Email</th>
              <th className="text-left py-2 px-3 font-bold">Plan</th>
              <th className="text-left py-2 px-3 font-bold">Status</th>
              <th className="text-left py-2 px-3 font-bold">Source</th>
              <th className="text-left py-2 px-3 font-bold">Period End</th>
              <th className="text-left py-2 px-3 font-bold"></th>
            </tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{s.customer_name || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-600">{s.customer_email}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${planColor(s.plan)}`}>{s.plan}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{s.status}</td>
                  <td className="py-2.5 px-3">
                    {s.plan_source === 'admin_override'
                      ? <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1"><Crown className="w-3 h-3" /> Override</span>
                      : <span className="text-[10px] text-slate-400">Stripe</span>}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</td>
                  <td className="py-2.5 px-3">
                    <Button size="sm" variant="ghost" onClick={() => setEditSub(s)} className="h-7 text-xs">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditSub(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900">Edit Entitlement</h3>
              <button onClick={() => setEditSub(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{editSub.customer_email}</p>
              <p className="text-xs text-slate-500">Current: {editSub.plan} ({editSub.status})</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Plan</label>
              <select id="ent-plan-select" className="w-full h-9 rounded-md border border-slate-200 text-sm" defaultValue={editSub.plan}>
                {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Status</label>
              <select id="ent-status-select" className="w-full h-9 rounded-md border border-slate-200 text-sm" defaultValue={editSub.status}>
                <option value="free">Free</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <Button className="w-full bg-slate-900" onClick={() => {
              const plan = document.getElementById('ent-plan-select').value;
              const status = document.getElementById('ent-status-select').value;
              updateMut.mutate({ id: editSub.id, plan, status, plan_source: 'admin_override' });
            }}>
              Save Override
            </Button>
            <p className="text-[10px] text-slate-400 text-center">This will override Stripe billing. Use with caution.</p>
          </div>
        </div>
      )}
    </div>
  );
}