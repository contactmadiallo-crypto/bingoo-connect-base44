import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, Zap, Star, Shield, Crown, Users, UtensilsCrossed, Scissors, Building2, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency, CURRENCY_CONFIG, SUPPORTED_CURRENCIES, formatPrice, convertPrice } from '@/hooks/useCurrency';
import { useQuery } from '@tanstack/react-query';

const B = { navy: "#0B2E6B", orange: "#FF7A00", gold: "#FDBA21" };

const PLAN_DEFS = [
  {
    id: 'free',
    name: 'Free',
    priceUSD: 0,
    tagline: 'Get started today',
    icon: <Zap className="w-5 h-5" />,
    color: '#64748b',
    features: ['1 profile', 'Public profile link', 'Basic contact sharing', 'Social links', 'QR code', 'WhatsApp button'],
    cta: 'Current Plan',
  },
  {
    id: 'professional',
    name: 'Professional',
    priceUSD: 4.99,
    tagline: 'For individuals & freelancers',
    icon: <Star className="w-5 h-5" />,
    color: B.orange,
    highlight: true,
    features: [
      'Everything in Free', 'Unlimited profiles', 'Appointment booking',
      'Lead collection & CRM', 'Portfolio & gallery', 'Full analytics dashboard',
      'Custom branding & colors', 'QR code downloads', 'Up to 5 NFC devices', 'Save contact button',
    ],
    cta: 'Get Professional',
  },
  {
    id: 'business',
    name: 'Business',
    priceUSD: 14.99,
    tagline: 'Small teams & enterprises',
    icon: <Building2 className="w-5 h-5" />,
    color: '#6d28d9',
    features: [
      'Everything in Professional', 'Team profiles', 'Advanced CRM pipeline',
      'Lead management & export', 'Up to 10 NFC devices', 'Team analytics',
      'Admin role management', 'Priority support',
    ],
    cta: 'Get Business Plan',
  },
  {
    id: 'salon',
    name: 'Salon',
    priceUSD: 19.99,
    tagline: 'Hair, beauty & wellness',
    icon: <Scissors className="w-5 h-5" />,
    color: '#be185d',
    features: [
      'Salon business profile', 'Staff profiles', 'Service menu', 'Appointment booking',
      'WhatsApp booking button', 'Instagram showcase', 'Google review link',
      'NFC counter stand support', 'Up to 10 NFC devices', 'Advanced analytics', 'Lead export',
    ],
    cta: 'Get Salon Plan',
  },
  {
    id: 'lawfirm',
    name: 'Law Firm',
    priceUSD: 49,
    tagline: 'Legal services & attorneys',
    icon: <Shield className="w-5 h-5" />,
    color: '#0369a1',
    features: [
      'Law firm business profile', 'Attorney profiles', 'Practice areas display',
      'Legal consultation form', 'Appointment booking', 'Lead dashboard & CRM pipeline',
      'Team management (up to 20)', 'Up to 25 NFC devices', 'WhatsApp contact button',
      'Analytics', 'Admin role management',
    ],
    cta: 'Get Law Firm Plan',
  },
];

const PLAN_HIERARCHY = { free: 0, pro: 1, professional: 1, business: 2, salon: 3, lawfirm: 4 };

export default function SubscriptionPricing() {
  const [loading, setLoading] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const highlightPlan = new URLSearchParams(window.location.search).get('highlight');
  const { currency, setCurrency, detectedCurrency, isManualOverride, stripeCheckoutCurrency } = useCurrency();

  // Load admin-configured pricing
  const { data: pricingConfigs = [] } = useQuery({
    queryKey: ['pricing-configs-public'],
    queryFn: () => base44.entities.PricingConfig.filter({ active: true }),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('success') === '1';
    const successPlan = params.get('plan');

    base44.auth.me().then(user => {
      if (!user?.id) return;
      Promise.all([
        base44.entities.Profile.filter({ created_by_id: user.id }).catch(() => []),
        base44.entities.Subscription.filter({ customer_email: user.email }).catch(() => []),
      ]).then(([profiles, subscriptions]) => {
        const profilePlan = profiles?.[0]?.plan || 'free';
        const sub = subscriptions?.[0];
        const subPlan = (sub?.status === 'active' || sub?.status === 'free') ? (sub.plan || 'free') : 'free';
        const activePlan = (PLAN_HIERARCHY[subPlan] || 0) >= (PLAN_HIERARCHY[profilePlan] || 0) ? subPlan : profilePlan;

        if (isSuccess && successPlan) {
          setSuccessMsg(`🎉 You're now on the ${PLAN_DEFS.find(p => p.id === successPlan)?.name || successPlan} plan! Welcome aboard.`);
          if (profiles?.[0]?.id) base44.entities.Profile.update(profiles[0].id, { plan: successPlan });
          setCurrentPlan(successPlan);
        } else {
          setCurrentPlan(activePlan);
        }
      });
    }).catch(() => {});
  }, []);

  // Resolve display price for a plan in current currency
  const getPlanPrice = (planId) => {
    const plan = PLAN_DEFS.find(p => p.id === planId);
    if (!plan || plan.priceUSD === 0) return 0;

    // Check DB config first
    const dbConfig = pricingConfigs.find(c => c.plan_name === planId && c.currency === currency);
    if (dbConfig) return dbConfig.amount;

    // Fallback: convert from USD
    return convertPrice(plan.priceUSD, currency);
  };

  const getStripePriceId = (planId) => {
    const dbConfig = pricingConfigs.find(c => c.plan_name === planId && c.currency === currency);
    return dbConfig?.stripe_price_id || null;
  };

  const isCurrent = (planId) => {
    const normalized = currentPlan === 'pro' ? 'professional' : currentPlan;
    return normalized === planId || currentPlan === planId;
  };

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') return;
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    setLoading(plan.id);
    try {
      const stripePriceId = getStripePriceId(plan.id);
      const amount = getPlanPrice(plan.id);
      const res = await base44.functions.invoke('createSubscriptionSession', {
        plan: plan.id,
        currency: stripeCheckoutCurrency,
        amount_cents: Math.round(amount * (currency === 'XOF' ? 1 : 100)),
        stripe_price_id: stripePriceId || undefined,
        display_currency: currency,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert('Could not start checkout. Please try again.');
        setLoading(null);
      }
    } catch (err) {
      alert('Checkout failed: ' + (err.message || 'Unknown error'));
      setLoading(null);
    }
  };

  const cfg = CURRENCY_CONFIG[currency];

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{ background: 'rgba(11,46,107,0.97)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/bingoo" className="flex items-center gap-1 text-white/60 hover:text-white transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="h-5 w-px bg-white/10 mx-1" />
          <div className="ml-auto flex items-center gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyPicker(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <span>{cfg.flag}</span>
                <span>{currency}</span>
                {isManualOverride && <span className="text-[10px] text-yellow-300 font-black">MANUAL</span>}
                <ChevronDown className="w-3.5 h-3.5 text-white/50" />
              </button>
              <AnimatePresence>
                {showCurrencyPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden shadow-2xl z-50 min-w-[200px]"
                    style={{ background: '#0B2E6B', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    {SUPPORTED_CURRENCIES.map(c => {
                      const cc = CURRENCY_CONFIG[c];
                      const isDetected = c === detectedCurrency;
                      const isSelected = c === currency;
                      return (
                        <button key={c} onClick={() => { setCurrency(c); setShowCurrencyPicker(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-white/10"
                          style={{ color: isSelected ? B.orange : 'rgba(255,255,255,0.75)' }}>
                          <span className="text-base">{cc.flag}</span>
                          <div className="flex-1">
                            <span>{c}</span>
                            <span className="font-normal text-white/40 text-xs ml-2">{cc.name}</span>
                          </div>
                          {isDetected && <span className="text-[10px] text-green-400 font-black">AUTO</span>}
                          {isSelected && <Check className="w-3.5 h-3.5" style={{ color: B.orange }} />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/billing" className="text-white/60 hover:text-white text-sm font-semibold transition-colors">
              Manage Billing →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl text-center font-bold text-white text-lg"
            style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
            {successMsg}
          </motion.div>
        )}

        {/* XOF notice */}
        {currency === 'XOF' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl text-sm font-medium"
            style={{ background: 'rgba(253,186,33,0.12)', border: '1px solid rgba(253,186,33,0.3)', color: '#b45309' }}>
            🌍 Prices displayed in CFA Francs for your convenience. Stripe charges are processed in USD at the current exchange rate.
          </motion.div>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: B.gold + '20', color: '#b45309', border: `1px solid ${B.gold}40` }}>
            Industry Plans & Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: B.navy }}>
            Choose Your Industry Plan
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-lg">
            Tailored features for your profession. Billed monthly. Cancel anytime.
          </p>
          {/* Currency pill */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
            style={{ background: 'rgba(11,46,107,0.06)', color: '#0B2E6B' }}>
            <span>{cfg.flag}</span>
            <span>Showing prices in <strong>{cfg.name} ({currency})</strong></span>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {PLAN_DEFS.map((plan, i) => {
            const current = isCurrent(plan.id);
            const isHighlight = plan.highlight || (highlightPlan && plan.id === highlightPlan.toLowerCase());
            const displayPrice = getPlanPrice(plan.id);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border-2 p-7 flex flex-col relative"
                style={{
                  borderColor: isHighlight ? B.orange : current ? plan.color : '#e2e8f0',
                  background: isHighlight ? `linear-gradient(145deg, ${B.navy}, #1a4a9e)` : '#fff',
                  boxShadow: isHighlight ? '0 24px 60px rgba(255,122,0,0.2)' : current ? `0 8px 32px ${plan.color}18` : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {isHighlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black text-white"
                    style={{ background: B.orange }}>
                    Most Popular
                  </div>
                )}
                {current && !isHighlight && (
                  <div className="absolute -top-3.5 right-4 px-3 py-1 rounded-full text-xs font-black text-white"
                    style={{ background: plan.color }}>
                    ✓ Current
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isHighlight ? 'rgba(255,255,255,0.15)' : plan.color + '15', color: isHighlight ? '#fff' : plan.color }}>
                    {plan.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: isHighlight ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{plan.tagline}</p>
                    <h3 className="font-black text-lg leading-tight" style={{ color: isHighlight ? '#fff' : B.navy }}>{plan.name}</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-4xl font-black" style={{ color: isHighlight ? B.gold : B.navy }}>
                    {plan.priceUSD === 0 ? 'Free' : formatPrice(displayPrice, currency)}
                  </span>
                  {plan.priceUSD > 0 && (
                    <span className="text-sm ml-1" style={{ color: isHighlight ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>/mo</span>
                  )}
                </div>

                <div className="h-px mb-5" style={{ background: isHighlight ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }} />

                {/* Features */}
                <ul className="space-y-2 mb-7 flex-1">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm"
                      style={{ color: isHighlight ? 'rgba(255,255,255,0.78)' : '#475569' }}>
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: isHighlight ? B.gold : plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={plan.id === 'free' || loading === plan.id || current}
                  className="w-full font-bold flex items-center justify-center gap-1.5"
                  style={{
                    background: current
                      ? (isHighlight ? 'rgba(255,255,255,0.15)' : '#f1f5f9')
                      : plan.id === 'free' ? '#f1f5f9'
                      : isHighlight ? B.orange
                      : plan.color,
                    color: current
                      ? (isHighlight ? 'rgba(255,255,255,0.5)' : '#94a3b8')
                      : plan.id === 'free' ? '#94a3b8'
                      : '#fff',
                    border: 'none',
                  }}
                >
                  {loading === plan.id ? 'Redirecting...' : current ? '✓ Current Plan' : (
                    <>{plan.cta} <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Trust footer */}
        <div className="text-center rounded-2xl p-6 border" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
          <p className="font-bold text-lg mb-1" style={{ color: B.navy }}>🔒 Secure payments powered by Stripe</p>
          <p className="text-slate-500 text-sm">30-day money-back guarantee · Cancel anytime · No hidden fees</p>
        </div>
      </div>
    </div>
  );
}