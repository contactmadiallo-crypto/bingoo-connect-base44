import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

/**
 * Plan definitions.
 * productId: existing Stripe product (reuse). amount: fixed cents in USD (server-side, trusted).
 * The client can never override the amount — only the display currency is client-selected.
 */
const PLAN_MAP = {
   professional: { productId: 'prod_UdL2W8XwDY3Bmq', amount: 499,  productName: 'Bingoo Professional Plan' },
   pro:          { productId: 'prod_UdL2W8XwDY3Bmq', amount: 499,  productName: 'Bingoo Professional Plan' },
   salon:        { productId: 'prod_UfF46myS8RxwKE', amount: 1999, productName: 'Bingoo Salon Plan' },
   lawfirm:      { productId: 'prod_UfFHNuhuWhyGVZ', amount: 4900, productName: 'Bingoo Law Firm Plan' },
   business:     { productId: 'prod_UdL2NqVtcHwKb2', amount: 1499, productName: 'Bingoo Business Plan' },
};

const STRIPE_SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'cad'];
const APP_URL = 'https://bingooconnect.com';

/**
 * Resolves a fixed, reusable Stripe Price ID for a plan + currency.
 * Never trusts a client-supplied amount or price ID.
 * 1. Looks up an admin-configured PricingConfig record (server-side only).
 * 2. Otherwise reuses/creates a Price on the plan's product using the fixed PLAN_MAP amount.
 */
async function resolvePriceId(stripe, base44, plan, currency) {
  const normalizedPlan = plan === 'pro' ? 'professional' : plan;
  const info = PLAN_MAP[plan];

  const configs = await base44.asServiceRole.entities.PricingConfig.filter({
    plan_name: normalizedPlan,
    currency: currency.toUpperCase(),
    active: true,
  }).catch(() => []);
  if (configs?.[0]?.stripe_price_id) {
    return configs[0].stripe_price_id;
  }

  const existingPrices = await stripe.prices.list({ product: info.productId, active: true, limit: 20 });
  const match = existingPrices.data.find(
    p => p.currency === currency && p.unit_amount === info.amount && p.recurring?.interval === 'month'
  );
  if (match) return match.id;

  const newPrice = await stripe.prices.create({
    product: info.productId,
    currency,
    unit_amount: info.amount,
    recurring: { interval: 'month' },
    metadata: { plan: normalizedPlan },
  });
  return newPrice.id;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    // trial_days is intentionally NOT read from the request body — accepting a client-supplied
    // trial length would let anyone request an arbitrarily long free trial (e.g. trial_days: 3650).
    // Trials are instead a fixed, server-owned 14 days, offered only for the Professional plan,
    // and only to customers who have never had a real Stripe subscription before (see below).
    const { plan, currency, display_currency, success_url: bodySuccessUrl, cancel_url: bodyCancelUrl } = body;
    const FIXED_TRIAL_DAYS = 14;

    if (!plan || !PLAN_MAP[plan]) {
      return Response.json({ error: 'Invalid plan: ' + plan }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Currency is only ever a real Stripe-supported currency — never derived from a client amount.
    const requestedCurrency = (currency || 'usd').toLowerCase();
    const stripeCurrency = STRIPE_SUPPORTED_CURRENCIES.includes(requestedCurrency) ? requestedCurrency : 'usd';

    const priceId = await resolvePriceId(stripe, base44, plan, stripeCurrency);

    // Find existing Stripe customer for this user
    let customerId;
    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email });
    if (subs?.[0]?.stripe_customer_id) {
      customerId = subs[0].stripe_customer_id;
    }

    // Eligible for the free trial only if: plan is Professional AND this customer
    // has never had a real Stripe subscription before (prevents repeat-trial abuse).
    const everHadRealSubscription = subs.some(s => !!s.stripe_subscription_id);
    const isTrialEligible = (plan === 'professional' || plan === 'pro') && !everHadRealSubscription;

    // ── Prevent duplicate subscriptions ──────────────────────────────────
    // If the customer already has an active/trialing subscription, update it in place
    // instead of creating a second concurrent Stripe subscription.
    if (customerId) {
      const [activeSubs, trialingSubs] = await Promise.all([
        stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 5 }),
        stripe.subscriptions.list({ customer: customerId, status: 'trialing', limit: 5 }),
      ]);
      const existingSub = [...activeSubs.data, ...trialingSubs.data][0];

      if (existingSub) {
        const itemId = existingSub.items.data[0].id;
        await stripe.subscriptions.update(existingSub.id, {
          items: [{ id: itemId, price: priceId }],
          proration_behavior: 'create_prorations',
          metadata: {
            ...existingSub.metadata,
            base44_app_id: Deno.env.get('BASE44_APP_ID'),
            user_id: user.id,
            user_email: user.email,
            plan,
          },
        });
        console.log(`Updated existing subscription ${existingSub.id} to plan=${plan} for ${user.email} (no duplicate created)`);
        return Response.json({
          updated: true,
          plan,
          message: 'Your plan has been updated. It may take a moment to reflect on your account.',
        });
      }
    }

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: bodySuccessUrl || `${APP_URL}/plans?success=1`,
      cancel_url: bodyCancelUrl || `${APP_URL}/plans?canceled=1`,
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

    // Trial length is fixed server-side (never from client input) and only granted when eligible.
    if (isTrialEligible) {
      sessionParams.subscription_data = { trial_period_days: FIXED_TRIAL_DAYS };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log(`Checkout session created: ${session.id} | plan=${plan} | currency=${stripeCurrency} | price=${priceId} | trial=${isTrialEligible}`);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createSubscriptionSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});