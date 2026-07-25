import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import {
  PLAN_FEATURES, normalizePlan, downgradedPlan, getTestOverride, featuresForPlan, loadPlanEntitlement,
} from '../../shared/entitlementResolver.ts';

/**
 * Resolves the CALLING user's effective plan + feature set.
 *
 * createGatedRecord / updateProfileGated resolve the RESOURCE owner's entitlement
 * (via entitlementResolver.resolveEffectivePlan + loadPlanEntitlement) so an admin
 * acting on a free user's profile cannot unlock paid features via the admin's plan.
 * This function remains the entry point for the dashboard's own plan display.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 1. Check test account overrides first ──────────────────────────────
    const override = getTestOverride(user.email);

    // Protected accounts with a hardcoded plan always get that plan,
    // regardless of Subscription entity or Stripe status.
    if (override && override.protected && override.plan) {
      const planName = normalizePlan(override.plan);
      const { entitlement } = await loadPlanEntitlement(base44, planName);
      return Response.json({
        user_id: user.id,
        plan: planName,
        features: featuresForPlan(planName),
        subscription_plan: planName,
        maximum_active_profiles: entitlement?.maximum_active_profiles ?? 1,
        is_test_account: true,
      });
    }

    // ── 2. Fetch subscription ──────────────────────────────────────────────
    const subscriptions = await base44.entities.Subscription.filter({
      customer_email: user.email,
    });

    const subscription = subscriptions?.[0] || null;
    let subPlan = 'free';

    if (subscription) {
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        subPlan = normalizePlan(subscription.plan);
      } else if (subscription.status === 'past_due') {
        // Grace period — keep current plan access
        subPlan = normalizePlan(subscription.plan);
      } else {
        // 'canceled' or terminal status: apply tiered downgrade policy
        // BUT protected test accounts never downgrade
        if (override?.protected) {
          subPlan = normalizePlan(subscription.plan);
        } else {
          subPlan = downgradedPlan(normalizePlan(subscription.plan));
        }
      }
    } else {
      // No subscription record and no test override → Free.
      // Paid entitlement comes ONLY from a real Subscription record.
    }

    const planName = subPlan;
    const features = PLAN_FEATURES[planName] || featuresForPlan('free');
    const { entitlement } = await loadPlanEntitlement(base44, planName);

    // Debug logging — verifies server-side plan resolution per user
    console.log('[getUserFeatures] Audit:', {
      userEmail: user.email,
      userRole: user.role,
      resolvedPlan: planName,
      subscriptionStatus: subscription?.status || 'none',
      subscriptionPlan: subscription?.plan || 'none',
      planSource: subscription?.plan_source || 'none',
      isTestAccount: !!override,
      featuresCount: features.length,
    });

    return Response.json({
      user_id: user.id,
      plan: planName,
      features,
      subscription_plan: subPlan,
      maximum_active_profiles: entitlement?.maximum_active_profiles ?? 1,
      is_test_account: !!override,
    });
  } catch (error) {
    console.error('getUserFeatures error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});