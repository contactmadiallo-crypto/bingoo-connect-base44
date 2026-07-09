import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle2, AlertTriangle, XCircle, Zap, Shield, ArrowRight, RefreshCw, Star, Scissors, Building2, UtensilsCrossed, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_LABELS, PLAN_FEATURES, PLAN_HIERARCHY, normalizePlan, PURCHASABLE_PLANS, COMING_SOON_PLANS } from '@/lib/planPermissions';
import { isAdminSwitcher, isProtectedTestAccount } from '@/lib/testAccounts';
import { format } from 'date-fns';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import BingooLayout from '@/components/bingoo/BingooLayout';

const B = { navy: "#0b2149", orange: "#f97316", gold: "#FDBA21" };

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

const PRICING = {
  professional: { monthly: '$4.99/mo',  annual: '$53.89/yr' },
  salon:        { monthly: '$19.99/mo', annual: '$215.89/yr' },
  lawfirm:      { monthly: '$49/mo',    annual: '$529.20/yr' },
  business:     { monthly: '$14.99/mo', annual: '$161.89/yr' },
  restaurant:   { monthly: '$29.99/mo', annual: '$323.89/yr' },
  corporate:    { monthly: '$99/mo',    annual: '$1,069.20/yr' },
};

const STATUS_CONFIG = {
  active:   { label: 'Active',    icon: CheckCircle2,  color: '#16a34a', bg: '#dcfce7' },
  free:     { label: 'Free',      icon: Zap,           color: '#64748b', bg: '#f1f5f9' },
  past_due: { label: 'Past Due',  icon: AlertTriangle, color: '#d97706', bg: '#fef9c3' },
  canceled: { label: 'Canceled',  icon: XCircle,       color: '#dc2626', bg: '#fee2e2' },
  trialing: { label: 'Trial',     icon: Star,          color: '#2563eb', bg: '#eff6ff' },
};

export default function Billing() {
  const { toast } = useToast();

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "robots"); document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    return () => { meta.setAttribute("content", "index, follow"); };
  }, []);

  const { user, plan, subscription, isLoading } = usePlan();
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [adminSwitching, setAdminSwitching] = useState(null);

  const effectivePlan = normalizePlan(plan);
  const protectedAccount = isProtectedTestAccount(user?.email);
  const adminSwitcher = isAdminSwitcher(user?.email);

  // Protected test accounts always show "Active" — they never lose access
  const statusKey = protectedAccount
    ? 'active'
    : (subscription?.status || (effectivePlan !== 'free' ? 'active' : 'free'));
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.free;
  const StatusIcon = status.icon;

  const handleUpgrade = async (planId) => {
    if (window.self !== window.top) {
      toast({ title: 'Info', description: 'Checkout is only available from the published app.', variant: 'destructive' });
      return;
    }
    setCheckoutLoading(planId);
    try {
      const res = await base44.functions.invoke('createSubscriptionSession', { plan: planId, billing_cycle: billingCycle });
      if (res.data?.url) window.location.href = res.data.url;
      else if (res.data?.updated) toast({ title: 'Plan Updated', description: res.data.message });
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

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const handleCancelSubscription = () => setShowCancelConfirm(true);
  const doCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const res = await base44.functions.invoke('cancelSubscription', {});
      if (res.data?.success) {
        toast({ title: 'Subscription Canceled', description: 'Your plan will remain active until the end of the current billing period.' });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast({ title: 'Cancellation Failed', description: res.data?.error || 'Please try again.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Cancellation Failed', description: err.message, variant: 'destructive' });
    } finally {
      setCancelLoading(false);
      setShowCancelConfirm(false);
    }
  };

  // Admin test switcher — update Subscription entity directly (no Stripe needed)
  const handleAdminSwitch = async (planId) => {
    setAdminSwitching(planId);
    try {
      const subs = await base44.entities.Subscription.filter({ customer_email: user.email });
      if (subs[0]) {
        await base44.entities.Subscription.update(subs[0].id, {
          plan: planId,
          status: 'active',
          plan_source: 'admin_override',
        });
      } else {
        await base44.entities.Subscription.create({
          customer_email: user.email,
          customer_name: user.full_name || '',
          plan: planId,
          status: 'active',
          plan_source: 'admin_override',
        });
      }
      toast({ title: 'Plan Switched', description: `Now testing: ${PLAN_LABELS[planId]}` });
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      toast({ title: 'Switch Failed', description: err.message, variant: 'destructive' });
    } finally {
      setAdminSwitching(null);
    }
  };

  const planFeatures = PLAN_FEATURES[effectivePlan] || PLAN_FEATURES.free;
  const purchasableUpgrades = PURCHASABLE_PLANS
    .filter(id => (PLAN_HIERARCHY[id] ?? 0) > (PLAN_HIERARCHY[effectivePlan] ?? 0))
    .map(id => ({ id, name: PLAN_LABELS[id], ...PRICING[id] }));
  const comingSoonPlans = COMING_SOON_PLANS.map(id => ({ id, name: PLAN_LABELS[id] }));

  return (
    <BingooLayout accountPlan={effectivePlan}>
      <div className="min-h-screen" style={{ background: '#f8fafc' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-6 h-6 animate-spin" style={{ color: B.navy }} />
          </div>
        ) : (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
          <div>
            <h1 className="text-3xl font-black mb-1" style={{ color: B.navy }}>Billing</h1>
            <p className="text-slate-500">Manage your plan and payment details.</p>
          </div>

          {/* Admin Test Switcher */}
          {adminSwitcher && (
            <div className="rounded-2xl border-2 p-6" style={{ background: '#fffbeb', borderColor: '#fbbf24' }}>
              <h2 className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: '#92400e' }}>Admin Test Switcher</h2>
              <p className="text-xs text-amber-700 mb-4">Switch between plans for testing. No payment required.</p>
              <div className="flex flex-wrap gap-2">
                {['free', 'professional', 'salon', 'lawfirm', 'business', 'corporate', 'restaurant'].map(p => (
                  <Button key={p} onClick={() => handleAdminSwitch(p)} disabled={adminSwitching === p}
                    className="font-bold text-xs"
                    variant={effectivePlan === p ? 'default' : 'outline'}>
                    {adminSwitching === p ? '...' : PLAN_LABELS[p]}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Current Plan */}
          <div className="rounded-2xl border-2 p-6" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
            <h2 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>Current Plan</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${B.navy}15`, color: B.navy }}>
                {PLAN_ICONS[effectivePlan] || PLAN_ICONS.free}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl font-black" style={{ color: B.navy }}>
                    {PLAN_LABELS[effectivePlan] || 'Free'} Plan
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

            {subscription?.stripe_customer_id && !adminSwitcher && (
              <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}
                  className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {portalLoading ? 'Opening...' : 'Manage Payment'}
                </Button>
                {statusKey === 'active' && !subscription?.cancel_at_period_end && (
                  <Button variant="outline" onClick={handleCancelSubscription} disabled={cancelLoading}
                    className="font-semibold flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                    <XCircle className="w-4 h-4" />
                    {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
                  </Button>
                )}
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

          {/* Billing cycle toggle + Upgrade options */}
          {purchasableUpgrades.length > 0 && (
            <div className="rounded-2xl border-2 p-6" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  {effectivePlan === 'free' ? 'Upgrade Your Plan' : 'Upgrade to a Higher Plan'}
                </h2>
                {/* Monthly/Annual toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#f1f5f9' }}>
                  <button onClick={() => setBillingCycle('monthly')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: billingCycle === 'monthly' ? B.navy : 'transparent', color: billingCycle === 'monthly' ? '#fff' : '#64748b' }}>
                    Monthly
                  </button>
                  <button onClick={() => setBillingCycle('annual')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    style={{ background: billingCycle === 'annual' ? B.navy : 'transparent', color: billingCycle === 'annual' ? '#fff' : '#64748b' }}>
                    Annual <span style={{ color: billingCycle === 'annual' ? B.orange : '#16a34a' }}>-10%</span>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {purchasableUpgrades.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
                    style={{ borderColor: p.id === 'professional' ? B.orange : '#e2e8f0', background: p.id === 'professional' ? `${B.orange}06` : '#fafafa' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#f1f5f9', color: B.navy }}>
                      {PLAN_ICONS[p.id] || <Zap className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm" style={{ color: B.navy }}>{p.name}</span>
                        <span className="font-bold text-xs" style={{ color: p.id === 'professional' ? B.orange : '#64748b' }}>
                          {billingCycle === 'annual' ? p.annual : p.monthly}
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => handleUpgrade(p.id)} disabled={checkoutLoading === p.id}
                      className="font-bold flex-shrink-0 flex items-center gap-1 text-xs px-3"
                      style={{ background: p.id === 'professional' ? B.orange : B.navy, color: '#fff', border: 'none' }}>
                      {checkoutLoading === p.id ? '...' : <><span>Upgrade</span><ArrowRight className="w-3 h-3" /></>}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coming soon plans */}
          {comingSoonPlans.length > 0 && (
            <div className="rounded-2xl border p-6" style={{ background: '#fafafa', borderColor: '#e2e8f0' }}>
              <h2 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>Coming Soon</h2>
              <div className="space-y-3">
                {comingSoonPlans.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-4 rounded-xl border opacity-60"
                    style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                      {PLAN_ICONS[p.id] || <Zap className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <span className="font-black text-sm text-slate-500">{p.name}</span>
                      <span className="text-xs text-slate-400 ml-2">Coming soon</span>
                    </div>
                    <Button disabled
                      className="font-bold flex-shrink-0 flex items-center gap-1 text-xs px-3 opacity-50"
                      style={{ background: '#94a3b8', color: '#fff', border: 'none' }}>
                      <Lock className="w-3 h-3" /><span>Soon</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View all plans link */}
          <div className="text-center">
            <Link to="/plans" className="text-sm font-bold hover:underline" style={{ color: B.navy }}>
              View all plans
            </Link>
          </div>

          {/* Downgrade notice — NOT shown for protected test accounts */}
          {(statusKey === 'past_due' || statusKey === 'canceled') && !protectedAccount && (
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
        )}
        <ConfirmDialog
          open={showCancelConfirm}
          onOpenChange={setShowCancelConfirm}
          title="Cancel your subscription?"
          description="You will keep access until the end of your current billing period."
          confirmLabel="Cancel Subscription"
          onConfirm={doCancelSubscription}
        />
      </div>
    </BingooLayout>
  );
}