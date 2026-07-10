import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { canAccess, maxNFCDevices, maxTeamMembers, normalizePlan } from '@/lib/planPermissions';

/**
 * Returns the current user's active plan and a capability-based canAccess() helper.
 *
 * PLAN AUTHORITY:
 * The effective plan is resolved SERVER-SIDE by the `getUserFeatures` backend function,
 * from the `Subscription` entity only (whose `update` RLS is admin-only). Profile.plan is
 * owner-writable via the client SDK and is NEVER used to compute entitlement — a user
 * editing their own Profile.plan in the browser console cannot unlock paid features.
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

  const { data: featuresData, isLoading: loadingFeatures } = useQuery({
    queryKey: ['user-features', user?.id],
    queryFn: () => base44.functions.invoke('getUserFeatures', {}).then(res => res.data),
    enabled: !!user?.id,
  });

  const isLoading = loadingUser || loadingSub || loadingFeatures;

  const subscription = subscriptions?.[0] || null;
  const normalizedPlan = normalizePlan(featuresData?.plan || 'free');
  const isPaid = normalizedPlan !== 'free';

  // While loading, return open (true) so no gate screens flash prematurely
  const canAccessFn = (featureKey) => {
    if (isLoading) return true;
    return canAccess(normalizedPlan, featureKey);
  };

  // Derive plan source for debug/audit: stripe | admin_override | test_account | none
  const planSource = subscription?.plan_source
    || (subscription?.stripe_subscription_id ? 'stripe' : (featuresData?.is_test_account ? 'test_account' : 'none'));

  // Debug logging — verifies the app receives correct role/plan/subscription data
  console.log('[usePlan] Audit:', {
    userEmail: user?.email,
    userRole: user?.role,
    resolvedPlan: normalizedPlan,
    rawPlan: featuresData?.plan,
    isTestAccount: featuresData?.is_test_account || false,
    subscriptionStatus: subscription?.status || 'none',
    planSource,
  });

  return {
    user,
    subscription,
    plan: normalizedPlan,
    rawPlan: featuresData?.plan,
    isLoading,
    canAccess: canAccessFn,
    isTestAccount: featuresData?.is_test_account || false,
    planSource,
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