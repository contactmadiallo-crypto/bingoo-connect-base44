import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, AlertCircle, Package, ShoppingBag } from 'lucide-react';

function StatCard({ label, value, sublabel, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        {trend && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
      {sublabel && <p className="text-[10px] text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

export default function AdminOverviewTab() {
  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['admin-subs'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 500),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.ShopOrder.list('-created_date', 100),
  });

  const { data: devices, isLoading: devLoading } = useQuery({
    queryKey: ['admin-devices'],
    queryFn: () => base44.entities.NFCDevice.list('-created_date', 500),
  });

  const { data: tickets, isLoading: tixLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 100),
  });

  if (subsLoading || ordersLoading || devLoading || tixLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const activeSubs = (subscriptions || []).filter(s => s.status === 'active');
  const trialSubs = (subscriptions || []).filter(s => s.status === 'trialing');
  const canceledSubs = (subscriptions || []).filter(s => s.status === 'canceled');
  const pastDueSubs = (subscriptions || []).filter(s => s.status === 'past_due');

  const planPrices = { professional: 4.99, salon: 19.99, lawfirm: 49, business: 14.99, pro: 4.99 };
  const mrr = activeSubs.reduce((sum, s) => sum + (planPrices[s.plan] || 0), 0);
  const arr = mrr * 12;
  const churnRate = subscriptions?.length > 0
    ? ((canceledSubs.length / subscriptions.length) * 100).toFixed(1)
    : 0;
  const failedPayments = pastDueSubs.length;

  const monthlyCount = activeSubs.filter(s => !s.stripe_subscription_id?.includes('yearly')).length;
  const annualCount = activeSubs.filter(s => s.stripe_subscription_id?.includes('yearly')).length;

  const paidOrders = (orders || []).filter(o => o.payment_status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const activeDevices = (devices || []).filter(d => d.status === 'active').length;
  const availableDevices = (devices || []).filter(d => d.status === 'available').length;
  const lostDevices = (devices || []).filter(d => d.status === 'lost').length;

  const openTickets = (tickets || []).filter(t => t.status === 'open').length;

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div>
        <h2 className="text-sm font-black text-slate-800 mb-3 uppercase tracking-wider">Revenue</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Monthly Recurring Revenue" value={`$${mrr.toFixed(2)}`} sublabel={`${activeSubs.length} active subscriptions`} icon={DollarSign} />
          <StatCard label="Annual Run Rate" value={`$${arr.toFixed(0)}`} sublabel="MRR × 12" icon={TrendingUp} />
          <StatCard label="Churn Rate" value={`${churnRate}%`} sublabel={`${canceledSubs.length} canceled`} icon={TrendingDown} trend={-parseFloat(churnRate)} />
          <StatCard label="Failed Payments" value={failedPayments} sublabel="Past due subscriptions" icon={AlertCircle} />
        </div>
      </div>

      {/* Subscription Mix */}
      <div>
        <h2 className="text-sm font-black text-slate-800 mb-3 uppercase tracking-wider">Subscription Mix</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Subscriptions" value={activeSubs.length} icon={CreditCard} />
          <StatCard label="Trialing" value={trialSubs.length} icon={Users} />
          <StatCard label="Monthly Plan" value={monthlyCount} sublabel="Billing monthly" icon={CreditCard} />
          <StatCard label="Annual Plan" value={annualCount} sublabel="Billing yearly" icon={CreditCard} />
        </div>
      </div>

      {/* Plan Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 mb-4">Active Subscriptions by Plan</h3>
        <div className="space-y-3">
          {['professional', 'salon', 'lawfirm', 'business', 'free'].map(plan => {
            const count = activeSubs.filter(s => s.plan === plan).length;
            const pct = activeSubs.length > 0 ? (count / activeSubs.length) * 100 : 0;
            return (
              <div key={plan} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 w-24 capitalize">{plan === 'lawfirm' ? 'Law Firm' : plan}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: plan === 'professional' ? '#f97316' : plan === 'salon' ? '#0b2149' : plan === 'lawfirm' ? '#13284f' : plan === 'business' ? '#fb923c' : '#94a3b8' }}
                  />
                </div>
                <span className="text-xs font-black text-slate-800 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shop + Devices + Support */}
      <div>
        <h2 className="text-sm font-black text-slate-800 mb-3 uppercase tracking-wider">Operations</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Shop Orders (Paid)" value={paidOrders.length} sublabel={`$${(totalRevenue / 100).toFixed(2)} revenue`} icon={ShoppingBag} />
          <StatCard label="Active NFC Devices" value={activeDevices} sublabel={`${availableDevices} available`} icon={Package} />
          <StatCard label="Lost Devices" value={lostDevices} icon={AlertCircle} />
          <StatCard label="Open Support Tickets" value={openTickets} icon={AlertCircle} />
        </div>
      </div>
    </div>
  );
}