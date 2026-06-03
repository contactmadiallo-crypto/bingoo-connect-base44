import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Get started with the basics.',
    features: ['1 Profile', 'Basic links', 'NFC activation', 'Analytics (7 days)'],
    cta: 'Current Plan',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    description: 'For professionals who want more.',
    features: ['3 Profiles', 'Unlimited links', 'Advanced analytics', 'Custom design', 'Lead capture', 'Priority support'],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 29.99,
    description: 'For teams and growing businesses.',
    features: ['10 Profiles', 'Team management', 'White-label options', 'API access', 'Dedicated support', 'Custom domain'],
    cta: 'Upgrade to Business',
    highlight: false,
  },
];

export default function SubscriptionPricing() {
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') return;
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app.');
      return;
    }
    setLoading(plan.id);
    const res = await base44.functions.invoke('createSubscriptionSession', { plan: plan.id });
    setLoading(null);
    if (res.data?.url) window.location.href = res.data.url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-xl font-bold text-slate-900 ml-2">Subscription Plans</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Plans & Pricing</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-3">Choose Your Plan</h2>
          <p className="text-slate-500 max-w-md mx-auto">Unlock more profiles, analytics, and customization. Billed monthly, cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col ${
                plan.highlight ? 'border-blue-500 shadow-xl shadow-blue-100 ring-2 ring-blue-500 scale-105' : 'border-slate-200'
              }`}
            >
              {plan.highlight && (
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-3">Most Popular</span>
              )}
              <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
              <div className="text-4xl font-bold text-slate-900 mb-6">
                {plan.price === 0 ? 'Free' : `$${plan.price}`}
                {plan.price > 0 && <span className="text-base font-normal text-slate-500">/mo</span>}
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={plan.id === 'free' || loading === plan.id}
                className={`w-full ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                variant={plan.highlight ? 'default' : 'outline'}
              >
                {loading === plan.id ? 'Redirecting...' : plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}