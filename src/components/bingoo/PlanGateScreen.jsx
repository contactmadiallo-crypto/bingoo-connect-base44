import { Lock, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FEATURE_DESCRIPTIONS, PLAN_LABELS, COMING_SOON_PLANS } from '@/lib/planPermissions';

const B = { navy: "#0b2149", orange: "#f97316", gold: "#FDBA21" };

/**
 * Full-page gate shown when a user tries to access a feature they don't have.
 * Shows a clean upgrade message, explains which plan unlocks it, and provides an Upgrade button.
 */
export default function PlanGateScreen({ feature, isDark = false }) {
  const info = FEATURE_DESCRIPTIONS[feature] || {
    title: 'Premium Feature',
    upgradeTarget: 'Professional',
    message: 'Upgrade your plan to unlock this feature.',
  };

  const targetPlan = info.upgradeTarget?.toLowerCase().replace(' ', '') || 'professional';

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-6 text-center rounded-2xl ${isDark ? 'bg-white/4' : 'bg-white'}`}
      style={{ border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e2e8f0' }}>

      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: `linear-gradient(135deg, ${B.navy}, #13284f)` }}>
        <Lock className="w-9 h-9 text-white" />
      </div>

      {/* Plan badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black mb-4"
        style={{ background: `${B.gold}20`, color: '#b45309', border: `1px solid ${B.gold}40` }}>
        <Zap className="w-3.5 h-3.5" />
        {info.upgradeTarget} Plan Required
      </div>

      {/* Title */}
      <h2 className="text-2xl font-black mb-2" style={{ color: isDark ? '#fff' : B.navy }}>
        {info.title}
      </h2>

      {/* Message */}
      <p className="text-base max-w-sm leading-relaxed mb-7" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#64748b' }}>
        {info.message}
      </p>

      {/* CTA */}
      {COMING_SOON_PLANS.includes(targetPlan) ? (
        <div className="px-6 py-3 rounded-xl text-sm font-bold" style={{ background: '#f1f5f9', color: '#64748b' }}>
          This plan is coming soon — we'll notify you when it launches.
        </div>
      ) : (
        <Link to={`/plans?highlight=${targetPlan}`}>
          <Button className="font-bold flex items-center gap-2 px-6 py-3 text-base rounded-xl"
            style={{ background: B.orange, color: '#fff', border: 'none' }}>
            Upgrade to {info.upgradeTarget}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      )}

      <Link to="/billing" className="mt-4 text-sm font-semibold hover:underline"
        style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
        Manage current plan
      </Link>
    </div>
  );
}