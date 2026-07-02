import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email });
    const subscription = subs?.[0];

    if (!subscription?.stripe_subscription_id) {
      return Response.json({ error: 'No active subscription found.' }, { status: 404 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const updated = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await base44.asServiceRole.entities.Subscription.update(subscription.id, {
      cancel_at_period_end: true,
      current_period_end: new Date(updated.current_period_end * 1000).toISOString(),
    });

    return Response.json({ success: true, current_period_end: updated.current_period_end });
  } catch (error) {
    console.error('cancelSubscription error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});