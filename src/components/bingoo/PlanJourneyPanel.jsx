import React, { useState } from 'react';
import { Check, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InfinityMark } from '@/components/mockups/brand/InfinityMark';
import {
  PLAN_PRICES_USD, PLAN_FEATURES, PLAN_LABELS, PLAN_TAGLINES,
  PURCHASABLE_PLANS, COMING_SOON_PLANS, CONTACT_SALES_PLANS,
  PLAN_CONFIG, CUSTOMER_PLAN_IDS, getPlanConfig,
} from '@/lib/planPermissions';

const BUSINESS_TOOL_ROUTES = {
  'Business Public Profile': '/bingoo?view=hub',
  'Design Studio': '/bingoo?view=designstudio',
  'Team Management': '/bingoo?view=team',
  'Services & Product Showcase': '/bingoo?view=services',
  'WhatsApp Booking': '/bingoo?view=appointments',
  'NFC Counter Stand': '/shop',
  'Business Hours': '/bingoo?view=appointments',
  'Staff Cards': '/bingoo?view=team',
  'Customer Inquiry Buttons': '/bingoo?view=leads',
  'Multi-Profile Management': '/bingoo?view=hub',
  'Business QR/NFC Landing': '/bingoo?view=qrwallet',
  'Advanced Analytics': '/bingoo?view=analytics',
  'Lead Export': '/bingoo?view=leads',
};

// Plan metadata (icons, colors, taglines, features, prices) is now sourced
// from PLAN_CONFIG in planPermissions.js — single source of truth.

// ── Generate plan journeys from planPermissions.js — single source of truth ──
// Prices come from PLAN_PRICES_USD, features from PLAN_FEATURES, status from PURCHASABLE/COMING_SOON.
// No hardcoded prices or feature lists — everything derives from the capability map.
function buildPlanJourneys(currentPlan) {
  return CUSTOMER_PLAN_IDS.map(planId => {
    const config = getPlanConfig(planId);
    const isPurchasable = PURCHASABLE_PLANS.includes(planId);
    const isComingSoon = COMING_SOON_PLANS.includes(planId);
    const isContactSales = CONTACT_SALES_PLANS.includes(planId);
    const price = PLAN_PRICES_USD[planId];
    const features = PLAN_FEATURES[planId] || [];
    const tagline = PLAN_TAGLINES[planId] || '';
    const isCurrentPlan = currentPlan === planId;

    const status = planId === 'free' ? 'active' : isPurchasable ? 'active' : isComingSoon ? 'coming_soon' : 'contact_sales';

    let priceStr, period;
    if (isContactSales) { priceStr = 'Custom'; period = ''; }
    else if (price === 0) { priceStr = '$0'; period = 'forever'; }
    else if (price > 0) { priceStr = `$${price}`; period = '/month'; }
    else { priceStr = isComingSoon ? 'Coming Soon' : 'Custom'; period = ''; }

    // Dashboard preview: first 4 feature labels
    const dashboardPreview = features.length > 0
      ? features.slice(0, 4).join(' · ') + (features.length > 4 ? '…' : '')
      : 'Features to be announced.';

    // Next action: context-aware guidance
    let nextAction = null;
    if (isComingSoon) {
      nextAction = `Coming Soon — join the waitlist to be notified when ${PLAN_LABELS[planId] || planId} launches.`;
    } else if (isContactSales) {
      nextAction = 'Contact sales for custom pricing and volume NFC orders.';
    } else if (!isCurrentPlan && isPurchasable) {
      nextAction = `Upgrade to unlock: ${features.slice(0, 3).join(', ')}${features.length > 3 ? '…' : ''}`;
    }

    return {
      id: planId,
      name: PLAN_LABELS[planId] || planId.charAt(0).toUpperCase() + planId.slice(1),
      tagline,
      price: priceStr,
      period,
      icon: config.icon,
      color: config.color.text,
      status,
      included: features,
      locked: [],
      nextAction,
      dashboardPreview,
      isCurrentPlan,
    };
  });
}

export default function PlanJourneyPanel({ isDark, currentPlan, userRole, planSource }) {
  const [selected, setSelected] = useState(currentPlan || 'free');

  // Build plan journeys dynamically from planPermissions.js
  // Extra safety: explicitly filter out 'admin' — it must NEVER appear as a plan option
  const VISIBLE_PLANS = buildPlanJourneys(currentPlan).filter(p => p.id !== 'admin');
  const active = VISIBLE_PLANS.find(p => p.id === selected) || VISIBLE_PLANS[0];

  // Debug: admin-only, ?debug=1
  const showDebug = userRole === 'admin' && new URLSearchParams(window.location.search).get('debug') === '1';

  const t = {
    card: isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200',
    text: isDark ? 'text-white' : 'text-slate-900',
    sub: isDark ? 'text-white/50' : 'text-slate-500',
    locked: isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-100',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <InfinityMark className="w-6 h-6" />
        <div>
          <h2 className={`text-xl font-black ${t.text}`}>Plan Journeys</h2>
          <p className={`text-sm ${t.sub}`}>Explore what each plan unlocks — pick your path</p>
        </div>
      </div>

      {/* Admin-only debug */}
      {showDebug && (
        <div className={`rounded-xl border border-dashed p-3 text-[11px] font-mono space-y-0.5 ${isDark ? 'border-orange-400/40 bg-orange-500/10 text-orange-200' : 'border-orange-300 bg-orange-50 text-orange-900'}`}>
          <p className="font-bold">DEBUG — Plan Journey Audit (admin only)</p>
          <p>userRole: <strong>{userRole || 'unknown'}</strong></p>
          <p>currentPlan: <strong>{currentPlan || 'free'}</strong></p>
          <p>planSource: <strong>{planSource || 'none'}</strong></p>
          <p>visiblePlans: <strong>{VISIBLE_PLANS.map(p => p.id).join(', ')}</strong></p>
          <p>adminInList: <strong>{String(VISIBLE_PLANS.some(p => p.id === 'admin'))}</strong></p>
          <p>dataDriven: <strong>true</strong> (prices from PLAN_PRICES_USD, features from PLAN_FEATURES)</p>
        </div>
      )}

      {/* Plan selector pills */}
      <div className="w-full min-w-0 overflow-x-auto scrollbar-hide pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="flex w-max min-w-full gap-2 px-1 whitespace-nowrap">
          {VISIBLE_PLANS.map(p => (
            <button key={p.id} onClick={() => setSelected(p.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                selected === p.id ? 'text-white shadow-md' : isDark ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-500'
              }`}
              style={selected === p.id ? { background: p.color } : {}}>
              <p.icon className="w-3.5 h-3.5" />
              {p.name}
              {p.isCurrentPlan && <span className="text-[9px] opacity-90">●</span>}
              {p.status === 'coming_soon' && <span className="text-[9px] opacity-70">Soon</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Active plan detail */}
      <div className={`rounded-2xl border p-5 space-y-4 ${t.card}`}>
        {/* Plan header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${active.color}15` }}>
              <active.icon className="w-6 h-6" style={{ color: active.color }} />
            </div>
            <div>
              <h3 className={`text-lg font-black ${t.text}`}>{active.name}</h3>
              {active.tagline && (
                <p className={`text-xs ${t.sub} mb-0.5`}>{active.tagline}</p>
              )}
              <p className={`text-sm font-bold ${active.status === 'coming_soon' ? 'text-amber-500' : active.status === 'contact_sales' ? 'text-blue-500' : ''}`} style={active.status === 'active' ? { color: active.color } : {}}>
                {active.price}{active.period}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            {active.status === 'coming_soon' && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Coming Soon</span>
            )}
            {active.isCurrentPlan && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-100 text-green-700">Your Plan</span>
            )}
            {active.status === 'active' && !active.isCurrentPlan && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: `${active.color}15`, color: active.color }}>Available</span>
            )}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className={`rounded-xl p-3 ${t.locked}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${t.sub}`}>Dashboard Preview</p>
          <p className={`text-xs ${t.sub}`}>{active.dashboardPreview}</p>
        </div>

        {/* Included tools — from PLAN_FEATURES */}
        {active.included.length > 0 && (
          <div>
            <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${t.sub}`}>
              Included Tools {active.isCurrentPlan && <span className="text-green-500 normal-case font-bold">(Unlocked)</span>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {active.included.map(tool => {
                const route = active.isCurrentPlan ? BUSINESS_TOOL_ROUTES[tool] : null;
                const content = (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className={t.text}>{tool}</span>
                    {route && <ExternalLink className={`w-3 h-3 ml-auto ${t.sub}`} />}
                  </>
                );
                return route ? (
                  <Link key={tool} to={route} className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 transition-colors ${isDark ? 'hover:bg-white/8' : 'hover:bg-slate-100'}`}>
                    {content}
                  </Link>
                ) : (
                  <div key={tool} className="flex items-center gap-2 text-xs px-2 py-1.5">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Coming soon placeholder */}
        {active.included.length === 0 && active.status !== 'contact_sales' && (
          <div className={`rounded-xl p-4 ${t.locked}`}>
            <p className={`text-xs text-center ${t.sub}`}>
              This plan is under development.<br />Features will be announced soon.
            </p>
          </div>
        )}

        {/* Next action */}
        {active.nextAction && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: active.color }} />
            <p className={`text-xs font-semibold ${t.text}`}>{active.nextAction}</p>
          </div>
        )}
      </div>
    </div>
  );
}