import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

// Same product→plan map used in stripeWebhook
const PRODUCT_TO_PLAN = {
  'prod_UdL2W8XwDY3Bmq': 'professional',
  'prod_UdL2NqVtcHwKb2': 'business',
  'prod_UfF46myS8RxwKE': 'salon',
  'prod_UfFHNuhuWhyGVZ': 'lawfirm',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const allSubs = await base44.asServiceRole.entities.Subscription.list();

    const report = [];
    for (const dbSub of allSubs) {
      const entry = {
        email: dbSub.customer_email,
        db_plan: dbSub.plan,
        db_status: dbSub.status,
        db_plan_source: dbSub.plan_source,
        stripe_subscription_id: dbSub.stripe_subscription_id,
        stripe_customer_id: dbSub.stripe_customer_id,
        stripe_resolved_plan: null,
        stripe_product_id: null,
        stripe_price_id: null,
        stripe_price_metadata_plan: null,
        stripe_status: null,
        mismatch: false,
        error: null,
      };

      // For subs with a real Stripe ID, fetch the actual subscription
      if (dbSub.stripe_subscription_id) {
        try {
          const sub = await stripe.subscriptions.retrieve(dbSub.stripe_subscription_id);
          entry.stripe_status = sub.status;

          const item = sub.items?.data?.[0];
          const price = item?.price;
          entry.stripe_price_id = price?.id || null;
          entry.stripe_price_metadata_plan = price?.metadata?.plan || null;

          const productId = typeof price?.product === 'string' ? price.product : price?.product?.id;
          entry.stripe_product_id = productId || null;

          // Resolve plan: price metadata first, then product map
          if (price?.metadata?.plan) {
            entry.stripe_resolved_plan = price.metadata.plan;
          } else if (productId && PRODUCT_TO_PLAN[productId]) {
            entry.stripe_resolved_plan = PRODUCT_TO_PLAN[productId];
          }

          if (entry.stripe_resolved_plan && entry.stripe_resolved_plan !== dbSub.plan) {
            entry.mismatch = true;
          }
        } catch (e) {
          entry.error = e.message;
        }
      }

      report.push(entry);
    }

    return Response.json({
      total: report.length,
      mismatches: report.filter(r => r.mismatch),
      all: report,
    });
  } catch (error) {
    console.error('auditSubscriptionPlans error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});