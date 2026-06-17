import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { resolveActivePlan, canAccess, maxNFCDevices, maxTeamMembers, normalizePlan } from '@/lib/planPermissions';

/**
 * Returns the current user's active plan and a capability-based canAccess() helper.
 *
 * PLAN AUTHORITY (in order of precedence):
 * 1. Subscription record (billing authority):
 *    - status=active → use subscription.plan
 *    - status=past_due → use subscription.plan (grace period, keep access)
 *    - status=canceled → downgrade to free
 *    - no subscription record → fall through to profile
 * 2. Profile.plan (legacy fallback, used only when no subscription exists):
 *    - Handles users who were manually assigned a plan before subscriptions existed
 *
 * While loading, canAccess() returns true to prevent premature gate screens.
 */
export function usePlan() {
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscriptions, isLoading: loadingSub } = useQuery({
    queryKey: ['my-subscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: profiles, isLoading: loadingProfile } = useQuery({
    queryKey: ['my-profiles-plan', user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });

  const isLoading = loadingUser || loadingSub || loadingProfile;

  const subscription = subscriptions?.[0] || null;

  /**
   * Resolve activePlan:
   * - If a subscription exists, it is the sole billing authority.
   *   resolveActivePlan() handles canceled→free and past_due→keep plan.
   * - If no subscription exists, use Profile.plan as a legacy fallback.
   *   This covers manually-assigned plans and legacy users.
   */
  let activePlan;
  if (subscription) {
    // Subscription exists — it is the authority
    activePlan = resolveActivePlan(subscription);
  } else {
    // No subscription — fall back to profile.plan (legacy users)
    activePlan = normalizePlan(profiles?.[0]?.plan || 'free');
  }

  const normalizedPlan = normalizePlan(activePlan);
  const isPaid = normalizedPlan !== 'free';

  // While loading, return open (true) so no gate screens flash prematurely
  const canAccessFn = (featureKey) => {
    if (isLoading) return true;
    return canAccess(normalizedPlan, featureKey);
  };

  return {
    user,
    subscription,
    plan: normalizedPlan,
    rawPlan: activePlan,
    isLoading,
    canAccess: canAccessFn,
    maxNFCDevices: maxNFCDevices(normalizedPlan),
    maxTeamMembers: maxTeamMembers(normalizedPlan),
    // Convenience booleans — use canAccess() for feature checks, not these
    isPro: normalizedPlan === 'professional',
    isSalon: normalizedPlan === 'salon',
    isRestaurant: normalizedPlan === 'restaurant',
    isLawFirm: normalizedPlan === 'lawfirm',
    isCorporate: normalizedPlan === 'corporate',
    isBusiness: normalizedPlan === 'business',
    isPaid,
    isFree: normalizedPlan === 'free',
  };
}