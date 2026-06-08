import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

// Base USD plan definitions (fallback when no currency override provided)
const PLAN_MAP = {
  professional: { productId: 'prod_UdL2W8XwDY3Bmq', amount: 499,  label: 'Bingoo Professional — $4.99/mo' },
  pro:          { productId: 'prod_UdL2W8XwDY3Bmq', amount: 499,  label: 'Bingoo Professional — $4.99/mo' },
  salon:        { productId: null, amount: 1999, label: 'Bingoo Salon Plan — $19.99/mo',  productName: 'Bingoo Salon Plan' },
  restaurant:   { productId: null, amount: 2999, label: 'Bingoo Restaurant Plan — $29.99/mo', productName: 'Bingoo Restaurant Plan' },
  lawfirm:      { productId: null, amount: 4900, label: 'Bingoo Law Firm Plan — $49/mo',  productName: 'Bingoo Law Firm Plan' },
  business:     { productId: 'prod_UdL2NqVtcHwKb2', amount: 1499, label: 'Bingoo Business — $14.99/mo' },
  corporate:    { productId: null, amount: 9900, label: 'Bingoo Corporate Team — $99/mo', productName: 'Bingoo Corporate Team Plan' },
};

// Supported Stripe currencies
const STRIPE_SUPPORTED = ['usd', 'eur', 'gbp', 'cad'];

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
    const appUrl = 'https://bingooconnect.com';

    // Determine effective Stripe currency (fallback to USD if unsupported e.g. XOF)
    const requestedCurrency = (currency || 'usd').toLowerCase();
    const stripeCurrency = STRIPE_SUPPORTED.includes(requestedCurrency) ? requestedCurrency : 'usd';
    const effectiveAmountCents = (stripeCurrency === requestedCurrency && amount_cents)
      ? Math.round(amount_cents)
      : priceInfo.amount; // fallback to base USD cents

    console.log(`Checkout: plan=${plan}, currency=${stripeCurrency}, display=${display_currency || 'USD'}, amount_cents=${effectiveAmountCents}`);

    // Find or use existing Stripe customer
    let customerId;
    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email });
    if (subs?.[0]?.stripe_customer_id) {
      customerId = subs[0].stripe_customer_id;
    }

    let sessionParams;

    // If admin provided a specific Stripe Price ID for this currency, use it directly
    if (stripe_price_id) {
      console.log(`Using provided Stripe Price ID: ${stripe_price_id}`);
      sessionParams = {
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: stripe_price_id, quantity: 1 }],
        success_url: `${appUrl}/plans?success=1&plan=${plan}`,
        cancel_url: `${appUrl}/plans?canceled=1`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          user_id: user.id,
          user_email: user.email,
          plan,
          currency: stripeCurrency,
          display_currency: display_currency || stripeCurrency,
        },
      };
    } else {
      // Dynamic price_data — resolve or create product
      let productId = priceInfo.productId;
      if (!productId && priceInfo.productName) {
        // Try to find existing product by name to avoid duplicates
        const existingProducts = await stripe.products.search({ query: `name:'${priceInfo.productName}'` }).catch(() => ({ data: [] }));
        if (existingProducts.data.length > 0) {
          productId = existingProducts.data[0].id;
          console.log('Found existing Stripe product:', productId);
        } else {
          const product = await stripe.products.create({ name: priceInfo.productName });
          productId = product.id;
          console.log('Created Stripe product:', productId, priceInfo.productName);
        }
      }

      sessionParams = {
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{
          price_data: {
            currency: stripeCurrency,
            product: productId,
            unit_amount: effectiveAmountCents,
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
          currency: stripeCurrency,
          display_currency: display_currency || stripeCurrency,
        },
      };
    }

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log('Checkout session created:', session.id, 'plan:', plan, 'currency:', stripeCurrency);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createSubscriptionSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});