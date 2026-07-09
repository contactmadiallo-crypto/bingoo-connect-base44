import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import BingooLayout from '@/components/bingoo/BingooLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Users, DollarSign, AlertCircle, Download, RefreshCw, ArrowRight } from 'lucide-react';

export default function SubscriberMonitoring() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setAuthChecked(true);
      if (u.role !== 'admin' && u.role !== 'super_admin') window.location.href = '/bingoo';
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['monitor-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 500),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: activities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['subscription-activity'],
    queryFn: () => base44.entities.SubscriptionActivity.list('-activity_date', 100),
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  // Set up real-time subscription to activities
  useEffect(() => {
    const unsubscribe = base44.entities.SubscriptionActivity.subscribe(() => {
      refetchActivities();
    });
    return unsubscribe;
  }, [refetchActivities]);

  if (!authChecked) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const monthlyRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const planPrices = { professional: 4.99, salon: 19.99, business: 14.99, lawfirm: 49, pro: 4.99 };
      return sum + (planPrices[s.plan] || 0);
    }, 0);

  const createdToday = activities.filter(a => 
    a.action === 'created' && 
    new Date(a.activity_date).toDateString() === new Date().toDateString()
  ).length;

  const canceledToday = activities.filter(a => 
    a.action === 'canceled' && 
    new Date(a.activity_date).toDateString() === new Date().toDateString()
  ).length;

  const handleExport = () => {
    const csv = [
      ['Customer Email', 'Name', 'Plan', 'Status', 'Renewal Date', 'Amount'].join(','),
      ...subscriptions.map(s => [
        s.customer_email,
        s.customer_name || '',
        s.plan,
        s.status,
        s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '',
        ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredActivities = filterAction === 'all' 
    ? activities 
    : activities.filter(a => a.action === filterAction);

  return (
    <BingooLayout>
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #071A3D 0%, #0b2149 50%, #0f3d8c 100%)" }}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Subscriber Monitoring</h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm">Real-time subscription activity & metrics</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl p-5 border" style={{ background: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase">Active Subscribers</p>
                  <p className="text-3xl font-black text-white mt-1">{activeCount}</p>
                </div>
                <Users className="w-10 h-10 text-green-500 opacity-30" />
              </div>
            </div>

            <div className="rounded-2xl p-5 border" style={{ background: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase">Monthly Revenue</p>
                  <p className="text-3xl font-black text-white mt-1">${monthlyRevenue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-500 opacity-30" />
              </div>
            </div>

            <div className="rounded-2xl p-5 border" style={{ background: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase">New Today</p>
                  <p className="text-3xl font-black text-green-500 mt-1">+{createdToday}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500 opacity-30" />
              </div>
            </div>

            <div className="rounded-2xl p-5 border" style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase">Canceled Today</p>
                  <p className="text-3xl font-black text-red-500 mt-1">-{canceledToday}</p>
                </div>
                <TrendingDown className="w-10 h-10 text-red-500 opacity-30" />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-black text-white">Activity Feed</h2>
                  <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-xs mt-1">Real-time subscription changes</p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterAction}
                    onChange={e => setFilterAction(e.target.value)}
                    className="px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                  >
                    <option value="all">All Actions</option>
                    <option value="created">Created</option>
                    <option value="upgraded">Upgraded</option>
                    <option value="downgraded">Downgraded</option>
                    <option value="canceled">Canceled</option>
                    <option value="past_due">Past Due</option>
                  </select>
                  <Button onClick={handleExport} className="gap-2" style={{ background: "rgba(249,115,22,0.2)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)" }}>
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </div>
              </div>
            </div>

            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>No subscription activity yet</p>
                </div>
              ) : (
                filteredActivities.map(activity => {
                  const actionColors = {
                    created: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e", label: "✅ Created" },
                    upgraded: { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6", label: "📈 Upgraded" },
                    downgraded: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316", label: "📉 Downgraded" },
                    canceled: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444", label: "❌ Canceled" },
                    past_due: { bg: "rgba(244, 63, 94, 0.1)", text: "#F43F5E", label: "⚠️ Past Due" },
                    renewed: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e", label: "🔄 Renewed" }
                  };

                  const color = actionColors[activity.action] || actionColors.created;

                  return (
                    <div key={activity.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: color.bg }}>
                          <ArrowRight className="w-5 h-5" style={{ color: color.text }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-white">{activity.customer_name || activity.customer_email}</span>
                            <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: color.bg, color: color.text }}>
                              {color.label}
                            </span>
                          </div>
                          <p style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm">
                            {activity.action === 'created' && `Signed up for ${activity.plan}`}
                            {activity.action === 'upgraded' && `Upgraded to ${activity.plan} (from ${activity.old_plan})`}
                            {activity.action === 'downgraded' && `Downgraded to ${activity.plan} (from ${activity.old_plan})`}
                            {activity.action === 'canceled' && `Canceled ${activity.plan} subscription`}
                            {activity.action === 'past_due' && `Payment failed - ${activity.plan}`}
                            {activity.action === 'renewed' && `Renewed ${activity.plan} subscription`}
                          </p>
                          {activity.details && (
                            <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs mt-1">{activity.details}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-xs">
                            {new Date(activity.activity_date).toLocaleDateString()}
                          </p>
                          <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-xs">
                            {new Date(activity.activity_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </BingooLayout>
  );
}