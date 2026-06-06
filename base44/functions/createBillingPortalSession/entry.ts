import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const appUrl = req.headers.get('origin') || 'https://bingooconnect.com';

    // Find customer ID from subscription
    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email });
    const customerId = subs?.[0]?.stripe_customer_id;

    if (!customerId) {
      return Response.json({ error: 'No active subscription found.' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/billing`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createBillingPortalSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});