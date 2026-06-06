import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, Zap, Star, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const B = {
  navy: "#0B2E6B",
  navyDark: "#071d47",
  orange: "#FF7A00",
  gold: "#FDBA21",
};

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Get started today',
    icon: <Zap className="w-5 h-5" />,
    features: ['1 Profile', '1 NFC device', 'Basic contact info', 'Social links', 'Limited analytics (7 days)'],
    cta: 'Current Plan',
    highlight: false,
    color: B.navy,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 14.99,
    description: 'For professionals',
    icon: <Star className="w-5 h-5" />,
    features: [
      'Everything in Free',
      'Appointment Booking',
      'Lead Collection CRM',
      'Gallery & Portfolio',
      'Full Analytics Dashboard',
      'Custom Branding',
      'QR Code Generator',
      'Up to 5 NFC devices',
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
    color: B.orange,
  },
  {
    id: 'business',
    name: 'Business',
    price: 49.99,
    description: 'For teams & companies',
    icon: <Shield className="w-5 h-5" />,
    features: [
      'Everything in Pro',
      'Unlimited NFC devices',
      'Team Members',
      'Advanced Analytics',
      'Lead Management CRM',
      'Customer Database',
      'AI Assistant',
      'Priority Support',
    ],
    cta: 'Upgrade to Business',
    highlight: false,
    color: B.navy,
  },
  {
    id: 'lawfirm',
    name: 'Law Firm',
    price: 99,
    description: 'For legal professionals',
    icon: <Crown className="w-5 h-5" />,
    features: [
      'Everything in Business',
      'Case Intake Forms',
      'Practice Area Profiles',
      'Staff Profiles',
      'Multi-Language Support',
      'AI Intake Assistant',
      'Client Pipeline Tracking',
      'Legal Consultation Requests',
    ],
    cta: 'Upgrade to Law Firm',
    highlight: false,
    color: B.navyDark,
  },
];

export default function SubscriptionPricing() {
  const [loading, setLoading] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');

  useEffect(() => {
    base44.auth.me().then(user => {
      // Try to get profile plan
      if (user?.id) {
        base44.entities.Profile.filter({ created_by_id: user.id }).then(profiles => {
          if (profiles?.[0]?.plan) setCurrentPlan(profiles[0].plan);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') return;
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    setLoading(plan.id);
    const res = await base44.functions.invoke('createSubscriptionSession', { plan: plan.id });
    setLoading(null);
    if (res.data?.url) window.location.href = res.data.url;
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{ background: "rgba(11,46,107,0.97)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/bingoo" className="flex items-center gap-1 text-white/60 hover:text-white transition-colors font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="h-5 w-px bg-white/10 mx-1" />
          <img
            src="https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png"
            alt="Bingoo Connect"
            className="h-8 w-auto object-contain"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14">
        {/* Title */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: B.gold + "20", color: "#b45309", border: `1px solid ${B.gold}40` }}>
            Plans & Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: B.navy }}>
            Choose Your Plan
          </h1>
          <p className="text-slate-500 max-w-md mx-auto text-lg">Billed monthly. Cancel anytime. NFC device sold separately ($20 one-time).</p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {PLANS.map((plan, i) => {
            const isCurrent = currentPlan === plan.id || (plan.id === 'free' && currentPlan === 'free');
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: plan.highlight ? -10 : -5 }}
                className="rounded-2xl border-2 p-7 flex flex-col relative transition-all"
                style={{
                  borderColor: plan.highlight ? B.orange : "#e2e8f0",
                  background: plan.highlight ? `linear-gradient(145deg, ${B.navy}, #1a4a9e)` : "#fff",
                  boxShadow: plan.highlight ? `0 24px 60px rgba(255,122,0,0.2)` : "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black text-white"
                    style={{ background: B.orange }}>
                    Most Popular
                  </div>
                )}

                {/* Icon & Plan name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: plan.highlight ? "rgba(255,255,255,0.15)" : plan.color + "15", color: plan.highlight ? "#fff" : plan.color }}>
                    {plan.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : "#64748b" }}>{plan.description}</p>
                    <h3 className="font-black text-lg" style={{ color: plan.highlight ? "#fff" : B.navy }}>{plan.name}</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-4xl font-black" style={{ color: plan.highlight ? B.gold : B.navy }}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-sm ml-1" style={{ color: plan.highlight ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>/mo</span>}
                </div>

                {/* Divider */}
                <div className="h-px mb-5" style={{ background: plan.highlight ? "rgba(255,255,255,0.1)" : "#f1f5f9" }} />

                {/* Features */}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm"
                      style={{ color: plan.highlight ? "rgba(255,255,255,0.75)" : "#64748b" }}>
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: plan.highlight ? B.gold : B.orange }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={plan.id === 'free' || loading === plan.id || isCurrent}
                  className="w-full font-bold"
                  style={{
                    background: isCurrent ? (plan.highlight ? "rgba(255,255,255,0.15)" : "#f1f5f9")
                      : plan.highlight ? B.orange : B.navy,
                    color: isCurrent ? (plan.highlight ? "rgba(255,255,255,0.5)" : "#94a3b8") : "#fff",
                    border: "none",
                    cursor: isCurrent || plan.id === 'free' ? "default" : "pointer",
                  }}
                >
                  {loading === plan.id ? 'Redirecting...' : isCurrent ? '✓ Current Plan' : plan.cta}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Guarantee note */}
        <div className="text-center rounded-2xl p-6 border"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}>
          <p className="font-bold text-lg mb-1" style={{ color: B.navy }}>🔒 Secure payments powered by Stripe</p>
          <p className="text-slate-500 text-sm">30-day money-back guarantee · Cancel anytime · No hidden fees</p>
        </div>
      </div>
    </div>
  );
}