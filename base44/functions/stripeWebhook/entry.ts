import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

async function upsertSubscription(base44, { customer_email, customer_name, plan, status, stripe_subscription_id, stripe_customer_id, stripe_session_id, current_period_end, cancel_at_period_end }) {
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
      customer_name: customer_name || '',
      plan, status,
      stripe_subscription_id: stripe_subscription_id || '',
      stripe_customer_id: stripe_customer_id || '',
      stripe_session_id: stripe_session_id || '',
      ...(current_period_end && { current_period_end }),
    });
    console.log('Subscription created:', plan, status);
  }
}

/**
 * Update all profiles belonging to the user to the new plan.
 * Tries to find profiles by user_id first (from session metadata), then falls back to email match.
 */
async function updateProfilePlan(base44, { customerEmail, userId, plan }) {
  try {
    let profilesToUpdate = [];

    // Primary: find by created_by_id using user_id from metadata
    if (userId) {
      const byUser = await base44.asServiceRole.entities.Profile.filter({ created_by_id: userId });
      if (byUser.length > 0) profilesToUpdate = byUser;
    }

    // Fallback: find by email field on profile
    if (profilesToUpdate.length === 0 && customerEmail) {
      const allProfiles = await base44.asServiceRole.entities.Profile.filter({});
      profilesToUpdate = allProfiles.filter(p => p.email === customerEmail);
    }

    for (const profile of profilesToUpdate) {
      await base44.asServiceRole.entities.Profile.update(profile.id, { plan });
    }

    console.log(`Updated ${profilesToUpdate.length} profile(s) to plan=${plan} for user=${userId || customerEmail}`);
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

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 400 });
    }
    if (!sig) {
      console.error('Missing stripe-signature header');
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event;
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);

    console.log('Stripe webhook event:', event.type);

    // ── checkout.session.completed ─────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { order_id, plan, user_id, user_email } = session.metadata || {};

      if (session.mode === 'payment' && order_id) {
        // Idempotency: fetch before update — skip if already paid to avoid double-processing
        let shopOrder;
        try {
          shopOrder = await base44.asServiceRole.entities.ShopOrder.get(order_id);
        } catch (e) {
          console.error('Could not fetch ShopOrder for webhook:', order_id, e.message);
        }
        if (!shopOrder) {
          console.error('Webhook: ShopOrder not found for order_id:', order_id);
        } else if (shopOrder.payment_status === 'paid') {
          console.log('Webhook: order already paid, skipping update:', order_id);
        } else {
          await base44.asServiceRole.entities.ShopOrder.update(order_id, {
            payment_status: 'paid',
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent || '',
          });
          console.log('Order marked as paid:', order_id, '| session:', session.id);
        }

      } else if (session.mode === 'subscription' && plan) {
        const customerEmail = session.customer_email || user_email;

        // Get subscription details for period end
        let periodEnd = null;
        let stripeSubId = session.subscription || '';
        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            periodEnd = new Date(sub.current_period_end * 1000).toISOString();
            stripeSubId = sub.id;
          } catch (e) { console.error('retrieve sub error:', e.message); }
        }

        // Get customer name from Stripe if available
        let customerName = '';
        if (session.customer) {
          try {
            const customer = await stripe.customers.retrieve(session.customer);
            customerName = customer.name || customer.email || '';
          } catch (_) {}
        }

        await upsertSubscription(base44, {
          customer_email: customerEmail,
          customer_name: customerName,
          plan,
          status: 'active',
          stripe_subscription_id: stripeSubId,
          stripe_customer_id: session.customer || '',
          stripe_session_id: session.id,
          current_period_end: periodEnd,
        });

        await updateProfilePlan(base44, {
          customerEmail,
          userId: user_id,
          plan,
        });
      }
    }

    // ── customer.subscription.updated ─────────────────────────
    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: sub.id
      });
      if (existing.length > 0) {
        const newStatus = ['active', 'past_due', 'canceled'].includes(sub.status) ? sub.status : sub.status;
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
          await updateProfilePlan(base44, { customerEmail: existing[0].customer_email, plan: 'free' });
        }
      }
    }

    // ── customer.subscription.deleted ─────────────────────────
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
        await updateProfilePlan(base44, { customerEmail: existing[0].customer_email, plan: 'free' });
        console.log('Subscription canceled:', sub.id);
      }
    }

    // ── invoice.payment_failed ─────────────────────────────────
    // Mark as past_due but do NOT immediately downgrade the profile plan.
    // Stripe will retry automatically; only downgrade on subscription.deleted/updated(canceled).
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: invoice.subscription
      });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          status: 'past_due',
        });
        // No plan downgrade yet — allow Stripe's retry window (3-7 days) before losing access
        console.log('Subscription past_due (grace period active):', invoice.subscription);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});