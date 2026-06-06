import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

const PRICE_MAP = {
  pro:       { amount: 1499, name: "Bingoo Pro — $14.99/mo" },
  business:  { amount: 4999, name: "Bingoo Business — $49.99/mo" },
  lawfirm:   { amount: 9900, name: "Bingoo Law Firm — $99/mo" },
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: priceInfo.name },
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
        plan: plan,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createSubscriptionSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});