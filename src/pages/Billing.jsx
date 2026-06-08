import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle2, AlertTriangle, XCircle, Crown, Zap, Shield, ArrowRight, RefreshCw, Star, Scissors, UtensilsCrossed, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useFeatures } from '@/hooks/useFeatures';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_LABELS, PLAN_FEATURES, normalizePlan } from '@/lib/planPermissions';
import { format } from 'date-fns';

const B = { navy: "#0B2E6B", orange: "#FF7A00", gold: "#FDBA21" };

const PLAN_ICONS = {
  free:         <Zap className="w-5 h-5" />,
  professional: <Star className="w-5 h-5" />,
  pro:          <Star className="w-5 h-5" />,
  salon:        <Scissors className="w-5 h-5" />,
  restaurant:   <UtensilsCrossed className="w-5 h-5" />,
  lawfirm:      <Shield className="w-5 h-5" />,
  business:     <Shield className="w-5 h-5" />,
  corporate:    <Building2 className="w-5 h-5" />,
};



const ALL_PLANS = [
  { id: 'professional', name: 'Professional', price: '$4.99/mo' },
  { id: 'salon',        name: 'Salon',        price: '$19.99/mo' },
  { id: 'restaurant',   name: 'Restaurant',   price: '$29.99/mo' },
  { id: 'lawfirm',      name: 'Law Firm',     price: '$49/mo' },
  { id: 'corporate',    name: 'Corporate',    price: '$99/mo' },
];

const BILLING_HIERARCHY = {
  free: 0, professional: 1, pro: 1,
  salon: 2, restaurant: 2, business: 2,
  lawfirm: 3, corporate: 4,
};

const STATUS_CONFIG = {
  active:   { label: 'Active',    icon: CheckCircle2,  color: '#16a34a', bg: '#dcfce7' },
  free:     { label: 'Free',      icon: Zap,           color: '#64748b', bg: '#f1f5f9' },
  past_due: { label: 'Past Due',  icon: AlertTriangle, color: '#d97706', bg: '#fef9c3' },
  canceled: { label: 'Canceled',  icon: XCircle,       color: '#dc2626', bg: '#fee2e2' },
};

export default function Billing() {
  const { toast } = useToast();
  const { plan, subscription, isLoading } = usePlan();
  const { features, plan: featurePlan } = useFeatures();
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const statusKey = subscription?.status || 'free';
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.free;
  const StatusIcon = status.icon;

  const handleUpgrade = async (planId) => {
    if (window.self !== window.top) {
      toast({ title: 'Info', description: 'Checkout is only available from the published app.', variant: 'destructive' });
      return;
    }
    setCheckoutLoading(planId);
    try {
      const res = await base44.functions.invoke('createSubscriptionSession', { plan: planId });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      toast({ title: 'Checkout Failed', description: err.message, variant: 'destructive' });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageBilling = async () => {
    if (window.self !== window.top) {
      toast({ title: 'Info', description: 'Billing management is only available from the published app.', variant: 'destructive' });
      return;
    }
    setPortalLoading(true);
    try {
      const res = await base44.functions.invoke('createBillingPortalSession', {});
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      toast({ title: 'Portal Error', description: err.message, variant: 'destructive' });
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: B.navy }} />
      </div>
    );
  }

  const normalizedPlan = normalizePlan(plan);
  const planFeatures = PLAN_FEATURES[normalizedPlan] || PLAN_FEATURES.free;

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{ background: 'rgba(11,46,107,0.97)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/bingoo" className="flex items-center gap-1 text-white/60 hover:text-white transition-colors font-semibold text-sm">
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

        {/* Current Plan */}
        <div className="rounded-2xl border-2 p-6" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
          <h2 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>Current Plan</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${B.navy}15`, color: B.navy }}>
              {PLAN_ICONS[normalizedPlan] || PLAN_ICONS.free}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-black" style={{ color: B.navy }}>
                  {PLAN_LABELS[normalizedPlan] || 'Free'} Plan
                </h3>
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

          {subscription?.stripe_customer_id && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}
                className="font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {portalLoading ? 'Opening...' : 'Manage Payment & Cancel'}
              </Button>
            </div>
          )}
        </div>

        {/* Plan features */}
        <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
          <h2 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>Your Plan Includes</h2>
          <ul className="space-y-2">
            {planFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: B.orange }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade options — show all higher-tier plans */}
        {ALL_PLANS.filter(p => (BILLING_HIERARCHY[p.id] ?? 0) > (BILLING_HIERARCHY[normalizedPlan] ?? 0)).length > 0 && (
          <div className="rounded-2xl border-2 p-6" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
            <h2 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>
              {normalizedPlan === 'free' ? 'Upgrade Your Plan' : 'Upgrade to a Higher Plan'}
            </h2>
            <div className="space-y-3">
              {ALL_PLANS.filter(p => (BILLING_HIERARCHY[p.id] ?? 0) > (BILLING_HIERARCHY[normalizedPlan] ?? 0)).map(p => (
                <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all"
                  style={{ borderColor: p.id === 'professional' ? B.orange : '#e2e8f0', background: p.id === 'professional' ? `${B.orange}06` : '#fafafa' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#f1f5f9', color: B.navy }}>
                    {PLAN_ICONS[p.id] || <Zap className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm" style={{ color: B.navy }}>{p.name}</span>
                      <span className="font-bold text-sm" style={{ color: p.id === 'professional' ? B.orange : '#64748b' }}>{p.price}</span>
                    </div>
                  </div>
                  <Button onClick={() => handleUpgrade(p.id)} disabled={checkoutLoading === p.id}
                    className="font-bold flex-shrink-0 flex items-center gap-1.5 text-sm"
                    style={{ background: p.id === 'professional' ? B.orange : B.navy, color: '#fff', border: 'none' }}>
                    {checkoutLoading === p.id ? 'Loading...' : <><span>Upgrade</span><ArrowRight className="w-3.5 h-3.5" /></>}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View all plans link */}
        <div className="text-center">
          <Link to="/plans" className="text-sm font-bold hover:underline" style={{ color: B.navy }}>
            View all plans & feature comparison →
          </Link>
        </div>

        {/* Downgrade notice */}
        {(statusKey === 'past_due' || statusKey === 'canceled') && (
          <div className="rounded-2xl p-5 flex gap-3" style={{ background: '#fef9c3', border: '1px solid #fcd34d' }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} />
            <div>
              <p className="font-bold text-sm" style={{ color: '#92400e' }}>
                Your subscription is {statusKey === 'past_due' ? 'past due' : 'canceled'}
              </p>
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