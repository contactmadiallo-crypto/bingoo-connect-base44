import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

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
        const existing = await base44.asServiceRole.entities.Subscription.filter({
          customer_email: session.customer_email
        });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            plan, status: 'active',
            stripe_subscription_id: session.subscription || '',
            stripe_customer_id: session.customer || '',
          });
        } else {
          await base44.asServiceRole.entities.Subscription.create({
            customer_email: session.customer_email,
            customer_name: session.metadata?.customer_name || '',
            plan, status: 'active',
            stripe_subscription_id: session.subscription || '',
            stripe_customer_id: session.customer || '',
            stripe_session_id: session.id,
          });
        }
        console.log('Subscription created for plan:', plan);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: sub.id
      });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: 'canceled' });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});