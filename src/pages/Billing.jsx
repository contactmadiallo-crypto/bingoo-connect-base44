import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle2, AlertTriangle, XCircle, Crown, Zap, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_LABELS } from '@/lib/planPermissions';
import { format } from 'date-fns';

const B = { navy: "#0B2E6B", orange: "#FF7A00", gold: "#FDBA21" };

const PLAN_ICONS = {
  free: <Zap className="w-5 h-5" />,
  pro: <Crown className="w-5 h-5" />,
  business: <Shield className="w-5 h-5" />,
};

const STATUS_CONFIG = {
  active:    { label: 'Active',    icon: CheckCircle2,  color: '#16a34a', bg: '#dcfce7' },
  free:      { label: 'Free',      icon: Zap,           color: '#64748b', bg: '#f1f5f9' },
  past_due:  { label: 'Past Due',  icon: AlertTriangle, color: '#d97706', bg: '#fef9c3' },
  canceled:  { label: 'Canceled',  icon: XCircle,       color: '#dc2626', bg: '#fee2e2' },
};

export default function Billing() {
  const { plan, subscription, isLoading, user } = usePlan();
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const statusKey = subscription?.status || 'free';
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.free;
  const StatusIcon = status.icon;

  const handleUpgrade = async (targetPlan) => {
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app.');
      return;
    }
    setCheckoutLoading(targetPlan);
    try {
      const res = await base44.functions.invoke('createSubscriptionSession', { plan: targetPlan });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageBilling = async () => {
    if (window.self !== window.top) {
      alert('Billing management is only available from the published app.');
      return;
    }
    setCancelLoading(true);
    try {
      const res = await base44.functions.invoke('createBillingPortalSession', {});
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      alert('Could not open billing portal: ' + err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: B.navy }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{ background: 'rgba(11,46,107,0.97)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/bingoo" className="flex items-center gap-1 text-white/60 hover:text-white transition-colors font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="h-5 w-px bg-white/10 mx-1" />
          <img src="https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png"
            alt="Bingoo Connect" className="h-8 w-auto object-contain" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ color: B.navy }}>Billing & Subscription</h1>
          <p className="text-slate-500">Manage your plan and payment details.</p>
        </div>

        {/* Current Plan Card */}
        <div className="rounded-2xl border-2 p-6" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
          <h2 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>Current Plan</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: `${B.navy}15`, color: B.navy }}>
              {PLAN_ICONS[plan] || PLAN_ICONS.free}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-black" style={{ color: B.navy }}>{PLAN_LABELS[plan] || 'Free'} Plan</h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                  style={{ background: status.bg, color: status.color }}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
              </div>
              {subscription?.current_period_end && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {subscription.cancel_at_period_end
                    ? `Cancels on ${format(new Date(subscription.current_period_end), 'MMM d, yyyy')}`
                    : `Renews on ${format(new Date(subscription.current_period_end), 'MMM d, yyyy')}`}
                </p>
              )}
              {subscription?.customer_email && (
                <p className="text-xs text-slate-400 mt-0.5">{subscription.customer_email}</p>
              )}
            </div>
          </div>

          {/* Manage billing portal button */}
          {subscription?.stripe_customer_id && (
            <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleManageBilling} disabled={cancelLoading}
                className="font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {cancelLoading ? 'Opening...' : 'Manage Payment & Cancel'}
              </Button>
            </div>
          )}
        </div>

        {/* Upgrade options */}
        {plan !== 'business' && (
          <div className="rounded-2xl border-2 p-6" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
            <h2 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>Upgrade Your Plan</h2>
            <div className="space-y-3">
              {plan === 'free' && (
                <UpgradeOption
                  planId="pro"
                  title="Pro"
                  price="$4.99/mo"
                  description="NFC devices, analytics, lead collection, custom branding"
                  loading={checkoutLoading === 'pro'}
                  onUpgrade={() => handleUpgrade('pro')}
                  highlight
                />
              )}
              <UpgradeOption
                planId="business"
                title="Business"
                price="$14.99/mo"
                description="Everything in Pro + storefront, appointments, team members, marketplace"
                loading={checkoutLoading === 'business'}
                onUpgrade={() => handleUpgrade('business')}
              />
            </div>
          </div>
        )}

        {/* Feature summary */}
        <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
          <h2 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>Your Plan Includes</h2>
          <PlanFeatures plan={plan} />
        </div>

        {/* Downgrade notice */}
        {(statusKey === 'past_due' || statusKey === 'canceled') && (
          <div className="rounded-2xl p-5 flex gap-3" style={{ background: '#fef9c3', border: '1px solid #fcd34d' }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} />
            <div>
              <p className="font-bold text-sm" style={{ color: '#92400e' }}>Your subscription is {statusKey === 'past_due' ? 'past due' : 'canceled'}</p>
              <p className="text-xs mt-0.5" style={{ color: '#78350f' }}>
                Premium features are locked. Your data is safe. Resubscribe anytime to restore access.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UpgradeOption({ planId, title, price, description, loading, onUpgrade, highlight }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all"
      style={{ borderColor: highlight ? B.orange : '#e2e8f0', background: highlight ? `${B.orange}06` : '#fafafa' }}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-black" style={{ color: B.navy }}>{title}</span>
          <span className="font-bold text-sm" style={{ color: highlight ? B.orange : '#64748b' }}>{price}</span>
        </div>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <Button onClick={onUpgrade} disabled={loading}
        className="font-bold flex-shrink-0 flex items-center gap-1.5"
        style={{ background: highlight ? B.orange : B.navy, color: '#fff', border: 'none' }}>
        {loading ? 'Loading...' : <><span>Upgrade</span><ArrowRight className="w-3.5 h-3.5" /></>}
      </Button>
    </div>
  );
}

const B_local = { navy: "#0B2E6B", orange: "#FF7A00" };

function PlanFeatures({ plan }) {
  const features = {
    free: ['1 personal profile', 'Basic contact sharing', 'QR code', 'Public profile link', 'WhatsApp button'],
    pro: ['Everything in Free', 'Up to 3 NFC devices', 'Full analytics', 'Lead collection', 'Save Contact button', 'Custom colors', 'QR code download', 'Digital resume'],
    business: ['Everything in Pro', 'Up to 25 NFC devices', 'Digital storefront', 'Appointment booking', 'Menu / services section', 'Up to 10 team members', 'Advanced analytics', 'Marketplace listing', 'Lead export'],
  };
  const list = features[plan] || features.free;
  return (
    <ul className="space-y-2">
      {list.map((f, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: B_local.orange }} />
          {f}
        </li>
      ))}
    </ul>
  );
}