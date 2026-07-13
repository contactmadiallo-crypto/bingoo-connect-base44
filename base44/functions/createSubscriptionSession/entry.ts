import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

/**
 * Plan definitions with Monthly + Annual pricing.
 * Annual = monthly × 12 × 0.9 (10% discount).
 * productId: existing Stripe product (reuse). amount: fixed cents in USD (server-side, trusted).
 * The client can never override the amount.
 */
const PLAN_MAP = {
  professional: { productId: 'prod_UdL2W8XwDY3Bmq', monthly: 499,   annual: 5389,  productName: 'Bingoo Professional Plan' },
  pro:          { productId: 'prod_UdL2W8XwDY3Bmq', monthly: 499,   annual: 5389,  productName: 'Bingoo Professional Plan' },
  salon:        { productId: 'prod_UfF46myS8RxwKE', monthly: 1999,  annual: 21589, productName: 'Bingoo Salon Plan' },
  lawfirm:      { productId: 'prod_UfFHNuhuWhyGVZ', monthly: 4900,  annual: 52920, productName: 'Bingoo Law Firm Plan' },
  business:     { productId: 'prod_UdL2NqVtcHwKb2', monthly: 1499,  annual: 16189, productName: 'Bingoo Business Plan' },
  corporate:    { productId: 'prod_UsKCo8sDBXEsuY', monthly: 9900,  annual: 106920, productName: 'Bingoo Corporate Plan' },
};

const STRIPE_SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'cad'];
const APP_URL = 'https://bingooconnect.com';

/**
 * Resolves a fixed, reusable Stripe Price ID for a plan + currency + interval.
 * Never trusts a client-supplied amount or price ID.
 * 1. Looks up an admin-configured PricingConfig record (server-side only).
 * 2. Otherwise reuses/creates a Price on the plan's product using the fixed PLAN_MAP amount.
 */
async function resolvePriceId(stripe, base44, plan, currency, interval) {
  const normalizedPlan = plan === 'pro' ? 'professional' : plan;
  const info = PLAN_MAP[plan];
  const amount = interval === 'year' ? info.annual : info.monthly;

  // Check PricingConfig for a pre-configured price ID
  const configs = await base44.asServiceRole.entities.PricingConfig.filter({
    plan_name: normalizedPlan,
    currency: currency.toUpperCase(),
    active: true,
  }).catch(() => []);
  if (configs?.[0]?.stripe_price_id) {
    return configs[0].stripe_price_id;
  }

  // Look for an existing price matching currency + amount + interval
  const existingPrices = await stripe.prices.list({ product: info.productId, active: true, limit: 50 });
  const match = existingPrices.data.find(
    p => p.currency === currency && p.unit_amount === amount && p.recurring?.interval === interval
  );
  if (match) return match.id;

  // Create a new price
  const newPrice = await stripe.prices.create({
    product: info.productId,
    currency,
    unit_amount: amount,
    recurring: { interval },
    metadata: { plan: normalizedPlan, billing_cycle: interval === 'year' ? 'annual' : 'monthly' },
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
    const { plan, currency, display_currency, billing_cycle, success_url: bodySuccessUrl, cancel_url: bodyCancelUrl } = body;
    const FIXED_TRIAL_DAYS = 14;

    if (!plan || !PLAN_MAP[plan]) {
      return Response.json({ error: 'Invalid plan: ' + plan }, { status: 400 });
    }

    const interval = billing_cycle === 'annual' ? 'year' : 'month';
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const requestedCurrency = (currency || 'usd').toLowerCase();
    const stripeCurrency = STRIPE_SUPPORTED_CURRENCIES.includes(requestedCurrency) ? requestedCurrency : 'usd';

    const priceId = await resolvePriceId(stripe, base44, plan, stripeCurrency, interval);

    // Find existing Stripe customer for this user
    let customerId;
    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email });
    if (subs?.[0]?.stripe_customer_id) {
      customerId = subs[0].stripe_customer_id;
    }

    // Trial eligibility: only Professional plan, monthly interval, and only for new customers
    const everHadRealSubscription = subs.some(s => !!s.stripe_subscription_id);
    const isTrialEligible = (plan === 'professional' || plan === 'pro') && !everHadRealSubscription && interval === 'month';

    // ── Prevent duplicate subscriptions ──────────────────────────────────
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
            billing_cycle: interval === 'year' ? 'annual' : 'monthly',
          },
        });
        console.log(`Updated existing subscription ${existingSub.id} to plan=${plan} interval=${interval} for ${user.email}`);
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
        billing_cycle: interval === 'year' ? 'annual' : 'monthly',
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    if (isTrialEligible) {
      sessionParams.subscription_data = { trial_period_days: FIXED_TRIAL_DAYS };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log(`Checkout session created: ${session.id} | plan=${plan} | interval=${interval} | currency=${stripeCurrency} | price=${priceId} | trial=${isTrialEligible}`);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createSubscriptionSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});