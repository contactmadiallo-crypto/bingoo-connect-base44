import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

// Match the Stripe catalog price IDs (listed in platform context)
// prod_UdL2W8XwDY3Bmq = Bingoo Pro Plan $4.99/mo
// prod_UdL2NqVtcHwKb2 = Bingoo Business Plan $14.99/mo
const PRICE_MAP = {
  pro:      { productId: 'prod_UdL2W8XwDY3Bmq', amount: 499,  name: 'Bingoo Pro — $4.99/mo' },
  business: { productId: 'prod_UdL2NqVtcHwKb2', amount: 1499, name: 'Bingoo Business — $14.99/mo' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !PRICE_MAP[plan]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const priceInfo = PRICE_MAP[plan];
    const appUrl = req.headers.get('origin') || 'https://bingooconnect.com';

    // Try to find existing Stripe customer
    let customerId;
    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email });
    if (subs?.[0]?.stripe_customer_id) {
      customerId = subs[0].stripe_customer_id;
    }

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: priceInfo.productId,
            unit_amount: priceInfo.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/plans?success=1&plan=${plan}`,
      cancel_url: `${appUrl}/plans?canceled=1`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_id: user.id,
        user_email: user.email,
        plan,
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createSubscriptionSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});