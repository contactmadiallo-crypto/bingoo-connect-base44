import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { resolveActivePlan, canAccess, maxNFCDevices, maxTeamMembers, PLAN_HIERARCHY } from '@/lib/planPermissions';

/**
 * Returns the current user's active plan, subscription info,
 * and a helper to check feature access.
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

  const subscription = subscriptions?.[0] || null;
  // Use subscription plan first, fall back to profile plan
  const subPlan = resolveActivePlan(subscription);
  const profilePlan = profiles?.[0]?.plan || 'free';
  const activePlan = PLAN_HIERARCHY[subPlan] >= PLAN_HIERARCHY[profilePlan] ? subPlan : profilePlan;

  return {
    user,
    subscription,
    plan: activePlan,
    isLoading: loadingUser || loadingSub || loadingProfile,
    canAccess: (featureKey) => canAccess(activePlan, featureKey),
    maxNFCDevices: maxNFCDevices(activePlan),
    maxTeamMembers: maxTeamMembers(activePlan),
    isPro: activePlan === 'pro' || activePlan === 'business',
    isBusiness: activePlan === 'business',
    isFree: activePlan === 'free',
  };
}