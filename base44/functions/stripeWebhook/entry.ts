import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

async function upsertSubscription(base44, { customer_email, plan, status, stripe_subscription_id, stripe_customer_id, stripe_session_id, current_period_end, cancel_at_period_end }) {
  const existing = await base44.asServiceRole.entities.Subscription.filter({ customer_email });
  if (existing.length > 0) {
    await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
      plan, status,
      ...(stripe_subscription_id && { stripe_subscription_id }),
      ...(stripe_customer_id && { stripe_customer_id }),
      ...(current_period_end && { current_period_end }),
      ...(cancel_at_period_end !== undefined && { cancel_at_period_end }),
    });
    console.log('Subscription updated:', plan, status);
  } else {
    await base44.asServiceRole.entities.Subscription.create({
      customer_email,
      plan, status,
      stripe_subscription_id: stripe_subscription_id || '',
      stripe_customer_id: stripe_customer_id || '',
      stripe_session_id: stripe_session_id || '',
      ...(current_period_end && { current_period_end }),
    });
    console.log('Subscription created:', plan, status);
  }
}

async function updateProfilePlan(base44, customerEmail, plan) {
  try {
    const allProfiles = await base44.asServiceRole.entities.Profile.filter({});
    const profiles = allProfiles.filter(p => p.email === customerEmail);
    for (const profile of profiles) {
      await base44.asServiceRole.entities.Profile.update(profile.id, { plan });
    }
    // Also update subscription record plan field
    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: customerEmail });
    if (subs.length > 0 && plan !== 'free') {
      await base44.asServiceRole.entities.Subscription.update(subs[0].id, { plan });
    }
    console.log('Profile/subscription plans updated for', customerEmail, '->', plan);
  } catch (err) {
    console.error('updateProfilePlan error:', err.message);
  }
}

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event;
    if (webhookSecret && sig) {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log('Stripe webhook event:', event.type);

    // ── checkout.session.completed ──────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { order_id, plan } = session.metadata || {};

      if (session.mode === 'payment' && order_id) {
        await base44.asServiceRole.entities.ShopOrder.update(order_id, {
          payment_status: 'paid',
          stripe_payment_intent: session.payment_intent || '',
        });
        console.log('Order marked as paid:', order_id);

      } else if (session.mode === 'subscription' && plan) {
        // Get subscription details for period end
        let periodEnd = null;
        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            periodEnd = new Date(sub.current_period_end * 1000).toISOString();
          } catch (e) { console.error('retrieve sub error:', e.message); }
        }

        await upsertSubscription(base44, {
          customer_email: session.customer_email,
          plan,
          status: 'active',
          stripe_subscription_id: session.subscription || '',
          stripe_customer_id: session.customer || '',
          stripe_session_id: session.id,
          current_period_end: periodEnd,
        });
        await updateProfilePlan(base44, session.customer_email, plan);
      }
    }

    // ── customer.subscription.updated ──────────────────────────
    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: sub.id
      });
      if (existing.length > 0) {
        const newStatus = sub.status === 'active' ? 'active' : sub.status;
        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          status: newStatus,
          cancel_at_period_end: sub.cancel_at_period_end || false,
          ...(periodEnd && { current_period_end: periodEnd }),
        });
        console.log('Subscription updated:', sub.id, newStatus);

        if (newStatus !== 'active') {
          await updateProfilePlan(base44, existing[0].customer_email, 'free');
        }
      }
    }

    // ── customer.subscription.deleted ──────────────────────────
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: sub.id
      });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          status: 'canceled',
          cancel_at_period_end: false,
        });
        await updateProfilePlan(base44, existing[0].customer_email, 'free');
        console.log('Subscription canceled:', sub.id);
      }
    }

    // ── invoice.payment_failed ──────────────────────────────────
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: invoice.subscription
      });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          status: 'past_due',
        });
        await updateProfilePlan(base44, existing[0].customer_email, 'free');
        console.log('Subscription past_due:', invoice.subscription);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});