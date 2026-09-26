import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import BingooLayout from '@/components/bingoo/BingooLayout';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Users, DollarSign, AlertCircle, Download, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

export default function SubscriberMonitoring() {
  const { language } = useI18n();
  const [authChecked, setAuthChecked] = useState(false);
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    base44.auth.me().then(u => {
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
            <h1 className="text-3xl font-black text-white mb-2">{t('subs_monitor_title',language)}</h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm">{t('subs_monitor_subtitle',language)}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl p-5 border" style={{ background: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase">{t('subs_active',language)}</p>
                  <p className="text-3xl font-black text-white mt-1">{activeCount}</p>
                </div>
                <Users className="w-10 h-10 text-green-500 opacity-30" />
              </div>
            </div>

            <div className="rounded-2xl p-5 border" style={{ background: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase">{t('subs_monthly_revenue',language)}</p>
                  <p className="text-3xl font-black text-white mt-1">${monthlyRevenue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-500 opacity-30" />
              </div>
            </div>

            <div className="rounded-2xl p-5 border" style={{ background: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase">{t('subs_new_today',language)}</p>
                  <p className="text-3xl font-black text-green-500 mt-1">+{createdToday}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500 opacity-30" />
              </div>
            </div>

            <div className="rounded-2xl p-5 border" style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase">{t('subs_canceled_today',language)}</p>
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
                  <h2 className="text-xl font-black text-white">{t('subs_activity_feed',language)}</h2>
                  <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-xs mt-1">{t('subs_changes',language)}</p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterAction}
                    onChange={e => setFilterAction(e.target.value)}
                    className="px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                  >
                    <option value="all">{t("subs_all_actions",language)}</option>
                    <option value="created">{t("subs_created",language)}</option>
                    <option value="upgraded">{t("subs_upgraded",language)}</option>
                    <option value="downgraded">{t("subs_downgraded",language)}</option>
                    <option value="canceled">{t("subs_canceled",language)}</option>
                    <option value="past_due">{t("subs_past_due",language)}</option>
                  </select>
                  <Button onClick={handleExport} className="gap-2" style={{ background: "rgba(249,115,22,0.2)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)" }}>
                    <Download className="w-4 h-4" /> {t("subs_export",language)}
                  </Button>
                </div>
              </div>
            </div>

            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>{t('subs_no_activity',language)}</p>
                </div>
              ) : (
                filteredActivities.map(activity => {
                  const actionColors = {
                    created: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e", label: `✅ ${t("subs_created",language)}` },
                    upgraded: { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6", label: `📈 ${t("subs_upgraded",language)}` },
                    downgraded: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316", label: `📉 ${t("subs_downgraded",language)}` },
                    canceled: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444", label: `❌ ${t("subs_canceled",language)}` },
                    past_due: { bg: "rgba(244, 63, 94, 0.1)", text: "#F43F5E", label: `⚠️ ${t("subs_past_due",language)}` },
                    renewed: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e", label: `🔄 ${t("subs_renewed",language)}` }
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
                            {activity.action === 'created' && `${t("subs_signed_up_for",language)} ${activity.plan}`}
                            {activity.action === 'upgraded' && `${t("subs_upgraded_to",language)} ${activity.plan} (${t("subs_from",language)} ${activity.old_plan})`}
                            {activity.action === 'downgraded' && `${t("subs_downgraded_to",language)} ${activity.plan} (${t("subs_from",language)} ${activity.old_plan})`}
                            {activity.action === 'canceled' && `${t("subs_canceled_plan",language)} · ${activity.plan}`}
                            {activity.action === 'past_due' && `${t("subs_payment_failed",language)} · ${activity.plan}`}
                            {activity.action === 'renewed' && `${t("subs_renewed_plan",language)} · ${activity.plan}`}
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