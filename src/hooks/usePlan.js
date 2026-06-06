import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { resolveActivePlan, canAccess, maxNFCDevices, maxTeamMembers } from '@/lib/planPermissions';

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

  const subscription = subscriptions?.[0] || null;
  const activePlan = resolveActivePlan(subscription);

  return {
    user,
    subscription,
    plan: activePlan,
    isLoading: loadingUser || loadingSub,
    canAccess: (featureKey) => canAccess(activePlan, featureKey),
    maxNFCDevices: maxNFCDevices(activePlan),
    maxTeamMembers: maxTeamMembers(activePlan),
    isPro: activePlan === 'pro' || activePlan === 'business',
    isBusiness: activePlan === 'business',
    isFree: activePlan === 'free',
  };
}