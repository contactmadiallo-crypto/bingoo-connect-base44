import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Search, KeyRound, Crown, User as UserIcon } from 'lucide-react';

const PLAN_OPTIONS = [
  { value: 'free', label: 'Free', price: '$0' },
  { value: 'professional', label: 'Professional', price: '$4.99/mo' },
  { value: 'salon', label: 'Salon', price: '$19.99/mo' },
  { value: 'lawfirm', label: 'Law Firm', price: '$49/mo' },
  { value: 'business', label: 'Business', price: 'Coming Soon' },
];

export default function AdminUsersEntitlementsTab({ activeTab }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(null);

  const isEntitlementsTab = activeTab === 'entitlements';

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['admin-subs-all'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 500),
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['admin-audit-ent'],
    queryFn: () => base44.entities.AdminAuditLog.list('-created_date', 50),
    enabled: isEntitlementsTab,
  });

  const getSubscription = (email) => (subscriptions || []).find(s => s.customer_email === email);

  const handlePlanOverride = async (userEmail, currentPlan, newPlan) => {
    if (currentPlan === newPlan) return;
    setOverrideLoading(userEmail);
    try {
      const existing = getSubscription(userEmail);
      if (existing) {
        await base44.entities.Subscription.update(existing.id, {
          plan: newPlan,
          status: newPlan === 'free' ? 'free' : 'active',
          plan_source: 'admin_override',
        });
      } else {
        await base44.entities.Subscription.create({
          customer_email: userEmail,
          customer_name: (users || []).find(u => u.email === userEmail)?.full_name || userEmail,
          plan: newPlan,
          status: newPlan === 'free' ? 'free' : 'active',
          plan_source: 'admin_override',
        });
      }

      // Log to audit
      await base44.entities.AdminAuditLog.create({
        action: 'plan_override',
        performed_by: (await base44.auth.me()).id,
        performed_by_name: (await base44.auth.me()).full_name,
        performed_by_email: (await base44.auth.me()).email,
        target_type: 'Subscription',
        target_id: existing?.id || userEmail,
        target_name: userEmail,
        old_value: currentPlan,
        new_value: newPlan,
        notes: `Admin manually set plan to ${newPlan}`,
      });

      toast({ title: 'Plan updated', description: `${userEmail} → ${newPlan}` });
      queryClient.invalidateQueries({ queryKey: ['admin-subs-all'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-ent'] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setOverrideLoading(null);
    }
  };

  const filtered = (users || []).filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search users by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">User</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Role</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Current Plan</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Status</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(user => {
                const sub = getSubscription(user.email);
                const currentPlan = sub?.plan || 'free';
                const status = sub?.status || 'free';
                return (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                        {user.role === 'admin' && <Crown className="w-3 h-3 inline mr-1" />}
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700 capitalize">{currentPlan === 'lawfirm' ? 'Law Firm' : currentPlan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                        status === 'past_due' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>{status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={currentPlan}
                        onChange={e => handlePlanOverride(user.email, currentPlan, e.target.value)}
                        disabled={overrideLoading === user.email}
                        className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
                      >
                        {PLAN_OPTIONS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-slate-400">No users found.</div>
        )}
      </div>

      {/* Audit Log (for entitlements tab) */}
      {isEntitlementsTab && auditLogs && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4" /> Recent Override Actions
          </h3>
          <div className="space-y-2">
            {auditLogs.filter(l => l.action === 'plan_override').slice(0, 10).map(log => (
              <div key={log.id} className="flex items-center gap-3 text-xs p-3 bg-slate-50 rounded-lg">
                <UserIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-slate-700">{log.performed_by_name}</span>
                  <span className="text-slate-500"> changed </span>
                  <span className="font-bold text-slate-700">{log.target_name}</span>
                  <span className="text-slate-500"> from </span>
                  <span className="font-semibold text-slate-600">{log.old_value}</span>
                  <span className="text-slate-500"> to </span>
                  <span className="font-semibold text-orange-600">{log.new_value}</span>
                </div>
                <span className="text-slate-400">{new Date(log.created_date).toLocaleDateString()}</span>
              </div>
            ))}
            {auditLogs.filter(l => l.action === 'plan_override').length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No override actions yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}