import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, Zap, Star, Shield, Crown, Users, UtensilsCrossed, Scissors, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const B = { navy: "#0B2E6B", orange: "#FF7A00", gold: "#FDBA21" };

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    tagline: 'Get started today',
    icon: <Zap className="w-5 h-5" />,
    color: '#64748b',
    bg: '#f8fafc',
    features: ['1 profile', 'Public profile link', 'Basic contact sharing', 'Social links', 'QR code', 'WhatsApp button'],
    cta: 'Current Plan',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 4.99,
    tagline: 'For individuals & freelancers',
    icon: <Star className="w-5 h-5" />,
    color: B.orange,
    bg: `linear-gradient(145deg, ${B.navy}, #1a4a9e)`,
    highlight: true,
    features: [
      'Everything in Free',
      'Appointment booking',
      'Lead collection CRM',
      'Gallery & portfolio',
      'Full analytics dashboard',
      'Custom branding & colors',
      'QR code download',
      'Up to 5 NFC devices',
      'Instagram integration',
      'Save contact button',
    ],
    cta: 'Get Professional',
  },
  {
    id: 'salon',
    name: 'Salon',
    price: 19.99,
    tagline: 'Hair, beauty & wellness',
    icon: <Scissors className="w-5 h-5" />,
    color: '#be185d',
    bg: '#fff',
    features: [
      'Salon business profile',
      'Staff profiles',
      'Service menu',
      'Appointment booking',
      'WhatsApp booking button',
      'Instagram showcase',
      'Google review link',
      'NFC counter stand support',
      'Up to 10 NFC devices',
      'Advanced analytics',
      'Lead export',
    ],
    cta: 'Get Salon Plan',
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    price: 29.99,
    tagline: 'Food, drinks & hospitality',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    color: '#c2410c',
    bg: '#fff',
    features: [
      'Restaurant business profile',
      'Digital menu',
      'Food ordering link',
      'Delivery link integration',
      'WhatsApp order button',
      'Google review link',
      'NFC table stand support',
      'Up to 10 NFC devices',
      'Advanced analytics',
      'Lead export',
    ],
    cta: 'Get Restaurant Plan',
  },
  {
    id: 'lawfirm',
    name: 'Law Firm',
    price: 49,
    tagline: 'Legal services & attorneys',
    icon: <Shield className="w-5 h-5" />,
    color: '#0369a1',
    bg: '#fff',
    features: [
      'Law firm business profile',
      'Attorney profiles',
      'Practice areas display',
      'Legal consultation form',
      'Appointment booking',
      'Lead dashboard & CRM pipeline',
      'Team management (up to 20)',
      'Up to 25 NFC devices',
      'WhatsApp contact button',
      'Analytics',
      'Admin role management',
    ],
    cta: 'Get Law Firm Plan',
  },
  {
    id: 'corporate',
    name: 'Corporate Team',
    price: 99,
    tagline: 'Teams, enterprises & orgs',
    icon: <Building2 className="w-5 h-5" />,
    color: '#6d28d9',
    bg: '#fff',
    features: [
      'Employee profiles',
      'Team NFC cards (up to 50)',
      'Clock in / clock out',
      'Attendance dashboard',
      'Team analytics',
      'Admin role management',
      'CRM pipeline',
      'Lead export',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Get Corporate Plan',
  },
];

export default function SubscriptionPricing() {
  const [loading, setLoading] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('success') === '1';
    const successPlan = params.get('plan');

    base44.auth.me().then(user => {
      if (!user?.id) return;

      // Load both profile plan AND subscription to determine true active plan
      Promise.all([
        base44.entities.Profile.filter({ created_by_id: user.id }).catch(() => []),
        base44.entities.Subscription.filter({ customer_email: user.email }).catch(() => []),
      ]).then(([profiles, subscriptions]) => {
        const profilePlan = profiles?.[0]?.plan || 'free';
        const sub = subscriptions?.[0];
        const subPlan = (sub?.status === 'active' || sub?.status === 'free') ? (sub.plan || 'free') : 'free';

        // Pick the higher plan between subscription and profile
        const HIERARCHY = { free: 0, pro: 1, professional: 1, salon: 2, restaurant: 3, lawfirm: 4, business: 4, corporate: 5 };
        const activePlan = (HIERARCHY[subPlan] || 0) >= (HIERARCHY[profilePlan] || 0) ? subPlan : profilePlan;

        if (isSuccess && successPlan) {
          setSuccessMsg(`🎉 You're now on the ${PLANS.find(p => p.id === successPlan)?.name || successPlan} plan! Welcome aboard.`);
          if (profiles?.[0]?.id) base44.entities.Profile.update(profiles[0].id, { plan: successPlan });
          setCurrentPlan(successPlan);
        } else {
          setCurrentPlan(activePlan);
        }
      });
    }).catch(() => {});
  }, []);

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') return;
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    setLoading(plan.id);
    try {
      const res = await base44.functions.invoke('createSubscriptionSession', { plan: plan.id });
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

  const isCurrent = (planId) => {
    const normalized = currentPlan === 'pro' ? 'professional' : currentPlan;
    return normalized === planId || currentPlan === planId;
  };

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
          <div className="ml-auto">
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
        </div>

        {/* Plans grid — 3+3 layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {PLANS.map((plan, i) => {
            const current = isCurrent(plan.id);
            const isHighlight = plan.highlight;
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
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-sm ml-1" style={{ color: isHighlight ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>/mo</span>}
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
                    opacity: (plan.id === 'free' || current) ? 1 : 1,
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