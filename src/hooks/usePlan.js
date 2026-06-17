import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { resolveActivePlan, canAccess, maxNFCDevices, maxTeamMembers, normalizePlan, PLAN_CAPABILITIES } from '@/lib/planPermissions';

/**
 * Returns the current user's active plan and a capability-based canAccess() helper.
 *
 * PLAN AUTHORITY (in order of precedence):
 * 1. Real Stripe-backed subscription (has stripe_subscription_id OR stripe_customer_id):
 *    - status=active    → use subscription.plan
 *    - status=past_due  → use subscription.plan (grace period)
 *    - status=canceled  → downgrade to free
 * 2. Manual/legacy subscription (no stripe IDs) OR no subscription at all:
 *    - Use whichever is higher: subscription.plan OR Profile.plan
 *    - A canceled manual record does NOT override a valid Profile.plan
 * 3. Free (default when nothing higher resolves)
 *
 * While loading, canAccess() returns true to prevent premature gate screens.
 */

/** Returns true only if this subscription record was created by a real Stripe event. */
function isStripeBacked(sub) {
  return !!(sub?.stripe_subscription_id || sub?.stripe_customer_id);
}

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
  const profilePlan = normalizePlan(profiles?.[0]?.plan || 'free');

  /**
   * Resolve activePlan using the precedence rules above.
   */
  let activePlan;
  if (subscription && isStripeBacked(subscription)) {
    // Real Stripe subscription — it is the sole authority (can downgrade on cancel)
    activePlan = resolveActivePlan(subscription);
  } else {
    // Manual/legacy subscription record or no subscription at all.
    // Take the higher of subscription.plan and Profile.plan — never downgrade manually set plans.
    const subPlan = subscription ? normalizePlan(subscription.plan || 'free') : 'free';
    const subScore = PLAN_CAPABILITIES[subPlan]?.size ?? 0;
    const profileScore = PLAN_CAPABILITIES[profilePlan]?.size ?? 0;
    activePlan = profileScore >= subScore ? profilePlan : subPlan;
  }

  const normalizedPlan = normalizePlan(activePlan || 'free');
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