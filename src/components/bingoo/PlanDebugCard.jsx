import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlan } from '@/hooks/usePlan';
import { useFeatures } from '@/hooks/useFeatures';
import { PLAN_LABELS } from '@/lib/planPermissions';
import { Bug, CheckCircle2, Lock, Loader2 } from 'lucide-react';

/**
 * PlanDebugCard — visible account-plan debug check for admin/testing.
 *
 * Shows the three sources of plan truth side-by-side so a tester can verify
 * that the app's resolved plan matches the Subscription (billing) plan and
 * that selecting a profile category does NOT unlock paid features.
 *
 *   1. Account email + role
 *   2. Subscription plan (billing source — admin/billing uses this)
 *   3. Profile category (presentation only — profile.plan)
 *   4. App resolved plan (getUserFeatures — what gates use)
 *   5. Unlocked features list
 */
export default function PlanDebugCard() {
  const { user, subscription, plan, planSource, isTestAccount } = usePlan();
  const { features, loading: featuresLoading } = useFeatures();

  const { data: profiles } = useQuery({
    queryKey: ['debug-my-profiles', user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });

  const profileCategory = profiles?.[0]?.plan || '—';
  const subPlan = subscription?.plan || 'free';
  const subStatus = subscription?.status || 'free';

  const plansMatch = (plan || 'free') === subPlan;

  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-4 sm:p-6 shadow-sm">
      <h2 className="font-black text-slate-900 text-lg mb-1 flex items-center gap-2">
        <Bug className="w-5 h-5 text-orange-600" /> Plan & Entitlements (Debug)
      </h2>
      <p className="text-slate-500 text-xs mb-5">
        Diagnostic view for QA. Verifies profile category never grants paid access — only the subscription (billing) source does.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        {/* Account */}
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1">Account Email</p>
          <p className="font-bold text-slate-900 break-all">{user?.email || '—'}</p>
          <p className="text-xs text-slate-500 mt-1">Role: {user?.role || 'user'}</p>
        </div>

        {/* Subscription (billing source) */}
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1">
            Subscription Plan (Billing Source)
          </p>
          <p className="font-bold text-slate-900">
            {PLAN_LABELS[subPlan] || subPlan} <span className="text-xs font-normal text-slate-500">· {subStatus}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Source: {planSource || 'none'} {isTestAccount && '· test account'}
          </p>
        </div>

        {/* Profile category (presentation only) */}
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1">
            Profile Category (Presentation Only)
          </p>
          <p className="font-bold text-slate-900">{PLAN_LABELS[profileCategory] || profileCategory}</p>
          <p className="text-xs text-slate-500 mt-1">Does NOT unlock paid features.</p>
        </div>

        {/* App resolved plan */}
        <div className={`rounded-xl p-3 ${plansMatch ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${plansMatch ? 'text-emerald-500' : 'text-red-500'}`}>
            App Resolved Plan (Feature Gates)
          </p>
          <p className="font-bold text-slate-900">{PLAN_LABELS[plan] || plan}</p>
          <p className={`text-xs mt-1 flex items-center gap-1 ${plansMatch ? 'text-emerald-600' : 'text-red-600'}`}>
            {plansMatch ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {plansMatch ? 'Matches billing' : 'MISMATCH — should match billing'}
          </p>
        </div>
      </div>

      {/* Unlocked features */}
      <div className="mt-4">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-2">
          Unlocked Features ({featuresLoading ? '…' : features.length})
        </p>
        {featuresLoading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {features.length === 0 ? (
              <span className="text-xs text-slate-400">No paid features unlocked (Free plan).</span>
            ) : (
              features.map(f => (
                <span key={f} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                  {f}
                </span>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}