import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

/**
 * Plan definitions.
 * productId: existing Stripe product (reuse). null = will find/create dynamically.
 * amount: cents in USD
 */
const PLAN_MAP = {
  professional: { productId: 'prod_UdL2W8XwDY3Bmq', amount: 499,  productName: 'Bingoo Professional Plan' },
  pro:          { productId: 'prod_UdL2W8XwDY3Bmq', amount: 499,  productName: 'Bingoo Professional Plan' },
  salon:        { productId: 'prod_UfF46myS8RxwKE', amount: 1999, productName: 'Bingoo Salon Plan' },
  restaurant:   { productId: null, amount: 2999, productName: 'Bingoo Restaurant Plan' },
  lawfirm:      { productId: 'prod_UfFHNuhuWhyGVZ', amount: 4900, productName: 'Bingoo Law Firm Plan' },
  business:     { productId: 'prod_UdL2NqVtcHwKb2', amount: 1499, productName: 'Bingoo Business Plan' },
  corporate:    { productId: null, amount: 9900, productName: 'Bingoo Corporate Team Plan' },
};

const STRIPE_SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'cad'];
const APP_URL = 'https://bingooconnect.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan, currency, amount_cents, stripe_price_id, display_currency } = body;

    if (!plan || !PLAN_MAP[plan]) {
      return Response.json({ error: 'Invalid plan: ' + plan }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const priceInfo = PLAN_MAP[plan];

    // Resolve currency: default usd, fall back to usd if not Stripe-supported (e.g. XOF)
    const requestedCurrency = (currency || 'usd').toLowerCase();
    const stripeCurrency = STRIPE_SUPPORTED_CURRENCIES.includes(requestedCurrency) ? requestedCurrency : 'usd';
    const effectiveAmountCents = (stripeCurrency === requestedCurrency && amount_cents && amount_cents > 0)
      ? Math.round(amount_cents)
      : priceInfo.amount;

    // Find existing Stripe customer
    let customerId;
    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email });
    if (subs?.[0]?.stripe_customer_id) {
      customerId = subs[0].stripe_customer_id;
    }

    let lineItems;

    // If a specific Stripe Price ID is provided (from admin pricing config), use it directly
    if (stripe_price_id) {
      console.log(`Using Stripe Price ID: ${stripe_price_id} for plan=${plan}`);
      lineItems = [{ price: stripe_price_id, quantity: 1 }];
    } else {
      // Resolve product: use existing or find/create dynamically
      let productId = priceInfo.productId;

      if (!productId) {
        // Try to find existing product by name first (avoid duplicates)
        const searchResult = await stripe.products.search({
          query: `name:'${priceInfo.productName}' AND active:'true'`
        }).catch(() => ({ data: [] }));

        if (searchResult.data.length > 0) {
          productId = searchResult.data[0].id;
          console.log(`Found existing product: ${productId} (${priceInfo.productName})`);
        } else {
          const newProduct = await stripe.products.create({ name: priceInfo.productName });
          productId = newProduct.id;
          console.log(`Created new product: ${productId} (${priceInfo.productName})`);
        }
      }

      lineItems = [{
        price_data: {
          currency: stripeCurrency,
          product: productId,
          unit_amount: effectiveAmountCents,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }];
    }

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${APP_URL}/plans?success=1&plan=${plan}`,
      cancel_url: `${APP_URL}/plans?canceled=1`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_id: user.id,
        user_email: user.email,
        plan,
        currency: stripeCurrency,
        display_currency: display_currency || stripeCurrency.toUpperCase(),
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log(`Checkout session created: ${session.id} | plan=${plan} | currency=${stripeCurrency} | amount=${effectiveAmountCents}`);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createSubscriptionSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});