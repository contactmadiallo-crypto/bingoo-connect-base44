import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

// Plan definitions — amounts in cents
// Existing Stripe products from platform catalog:
//   prod_UdL2W8XwDY3Bmq = Bingoo Pro Plan → repurposed as Professional $4.99
//   prod_UdL2NqVtcHwKb2 = Bingoo Business Plan → repurposed as Law Firm $49
// New plans (salon $19.99, restaurant $29.99, corporate $99) will be created inline

const PLAN_MAP = {
  professional: { productId: 'prod_UdL2W8XwDY3Bmq', amount: 499,  label: 'Bingoo Professional — $4.99/mo' },
  pro:          { productId: 'prod_UdL2W8XwDY3Bmq', amount: 499,  label: 'Bingoo Professional — $4.99/mo' },
  salon:        { productId: null, amount: 1999, label: 'Bingoo Salon Plan — $19.99/mo',  productName: 'Bingoo Salon Plan' },
  restaurant:   { productId: null, amount: 2999, label: 'Bingoo Restaurant Plan — $29.99/mo', productName: 'Bingoo Restaurant Plan' },
  lawfirm:      { productId: null, amount: 4900, label: 'Bingoo Law Firm Plan — $49/mo',  productName: 'Bingoo Law Firm Plan' },
  business:     { productId: 'prod_UdL2NqVtcHwKb2', amount: 1499, label: 'Bingoo Business — $14.99/mo' },
  corporate:    { productId: null, amount: 9900, label: 'Bingoo Corporate Team — $99/mo', productName: 'Bingoo Corporate Team Plan' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !PLAN_MAP[plan]) {
      return Response.json({ error: 'Invalid plan: ' + plan }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const priceInfo = PLAN_MAP[plan];
    const appUrl = req.headers.get('origin') || 'https://bingooconnect.com';

    // Find or use existing Stripe customer
    let customerId;
    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email });
    if (subs?.[0]?.stripe_customer_id) {
      customerId = subs[0].stripe_customer_id;
    }

    // Resolve product ID — create on-the-fly if not in catalog
    let productId = priceInfo.productId;
    if (!productId && priceInfo.productName) {
      const product = await stripe.products.create({ name: priceInfo.productName });
      productId = product.id;
      console.log('Created Stripe product:', productId, priceInfo.productName);
    }

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          product: productId,
          unit_amount: priceInfo.amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
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
    console.log('Checkout session created:', session.id, 'for plan:', plan);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createSubscriptionSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});