import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { resolveActivePlan, canAccess, maxNFCDevices, maxTeamMembers, PLAN_HIERARCHY, normalizePlan } from '@/lib/planPermissions';

/**
 * Returns the current user's active plan, subscription info,
 * and a helper to check feature access.
 *
 * CRITICAL: While loading, canAccess() returns true (open) to prevent
 * premature gate screens. Gates only close once data is confirmed.
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

  // Always pick the highest plan between subscription and profile
  const subPlan = resolveActivePlan(subscription);
  const profilePlan = profiles?.[0]?.plan || 'free';
  const activePlan = (PLAN_HIERARCHY[subPlan] ?? 0) >= (PLAN_HIERARCHY[profilePlan] ?? 0) ? subPlan : profilePlan;

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
    isPro: normalizedPlan === 'professional',
    isSalon: normalizedPlan === 'salon',
    isRestaurant: normalizedPlan === 'restaurant',
    isLawFirm: normalizedPlan === 'lawfirm',
    isCorporate: normalizedPlan === 'corporate',
    isBusiness: isPaid,
    isFree: normalizedPlan === 'free',
  };
}