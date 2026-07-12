import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

// Fallback mapping when a subscription item's price has no plan metadata
// (e.g. prices created before plan metadata was added).
const PRODUCT_TO_PLAN = {
  'prod_UdL2W8XwDY3Bmq': 'professional',
  'prod_UfF46myS8RxwKE': 'salon',
  'prod_UfFHNuhuWhyGVZ': 'lawfirm',
  'prod_UdL2NqVtcHwKb2': 'business',
};

// ── Test Account Overrides ──────────────────────────────────────────────────
// MUST stay in sync with src/lib/testAccounts.js and getUserFeatures/entry.ts
// Protected test accounts never get downgraded by Stripe events.
const TEST_ACCOUNT_OVERRIDES = {
  'contact.madiallo@gmail.com':              { protected: true },
  'mdiallo9225@gmail.com':                   { protected: true },
  'msfall0510@gmail.com':                    { protected: true },
  'skilibeng110@gmail.com':                  { protected: true },
  '9ztjvf42zs@privaterelay.appleid.com':     { protected: true },
  'kvartz.alexander@googlemail.com':         { protected: true },
};

function isProtectedTestAccount(email) {
  if (!email) return false;
  return !!TEST_ACCOUNT_OVERRIDES[email.toLowerCase()]?.protected;
}

// Industry/business-tier plans fall back to Professional (not Free) when payment fails
// or a trial ends unpaid — they're built on top of Professional. Professional itself
// falls back to Free. Mirrors the same policy in getUserFeatures.
const INDUSTRY_PLANS = ['salon', 'restaurant', 'lawfirm', 'business', 'corporate'];
function downgradedPlan(plan) {
  return INDUSTRY_PLANS.includes(plan) ? 'professional' : 'free';
}

// Local plan rank for upgrade/downgrade detection (mirrors planPermissions.PLAN_HIERARCHY)
const PLAN_RANK = {
  free: 0, professional: 1, pro: 1, business: 2, salon: 3, restaurant: 3, lawfirm: 4, corporate: 5,
};

function resolvePlanFromSubscriptionItem(item, fallbackPlan) {
  const price = item?.price;
  if (price?.metadata?.plan) return price.metadata.plan;
  const productId = typeof price?.product === 'string' ? price.product : price?.product?.id;
  if (productId && PRODUCT_TO_PLAN[productId]) return PRODUCT_TO_PLAN[productId];
  return fallbackPlan;
}

// Look up the Bingoo user account for a customer email (best-effort; non-blocking).
async function findUserIdByEmail(base44, email) {
  if (!email) return null;
  try {
    const users = await base44.asServiceRole.entities.User.filter({ email }, '-created_date', 1);
    return users?.[0]?.id || null;
  } catch (e) {
    console.error('findUserIdByEmail failed (non-blocking):', e.message);
    return null;
  }
}

// Append a SubscriptionActivity audit row (non-blocking).
async function logSubscriptionActivity(base44, { customer_email, customer_name, plan, action, old_plan, old_status, status, amount, stripe_subscription_id, details }) {
  try {
    await base44.asServiceRole.entities.SubscriptionActivity.create({
      customer_email,
      customer_name: customer_name || '',
      plan: plan || '',
      action,
      old_plan: old_plan || '',
      old_status: old_status || '',
      status: status || '',
      amount: amount || 0,
      stripe_subscription_id: stripe_subscription_id || '',
      details: details || '',
      activity_date: new Date().toISOString(),
    });
  } catch (e) {
    console.error('SubscriptionActivity log failed (non-blocking):', e.message);
  }
}

// Create an in-app notification for the subscriber (non-blocking).
async function notifyUser(base44, { userId, eventType, title, message, actionUrl, relatedId }) {
  if (!userId) return;
  try {
    await base44.asServiceRole.entities.BingooNotification.create({
      user_id: userId,
      event_type: eventType,
      title,
      message: message || '',
      is_read: false,
      action_url: actionUrl,
      related_id: relatedId || '',
    });
  } catch (e) {
    console.error('notifyUser failed (non-blocking):', e.message);
  }
}

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

// ── Generate manufacturing devices and activation codes after payment ────────
// For each custom NFC item in the order, creates NFCDevice records with unique
// activation codes (BG-XXXXXX). Devices are created with status "available" —
// the customer activates them after receiving the physical product.
async function generateManufacturingDevices(base44, shopOrder, orderId) {
  try {
    const items = shopOrder.items || [];
    const customItems = items.filter(item => item.customDesign);
    if (customItems.length === 0) return;

    // Find the highest existing BG-XXXXXX number to continue sequentially
    const existing = await base44.asServiceRole.entities.NFCDevice.filter({}, '-device_code', 1);
    let nextNum = 1;
    if (existing.length > 0 && existing[0].device_code) {
      const match = String(existing[0].device_code).match(/BG-(\d+)/i);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }

    const manufacturingItems = [];
    const allDevices = [];

    for (const item of customItems) {
      const cd = item.customDesign;
      const qty = Math.min(item.quantity || 1, 500);
      const codes = [];

      for (let i = 0; i < qty; i++) {
        const code = `BG-${String(nextNum + i).padStart(6, '0')}`;
        const qrUrl = `https://bingooconnect.com/n/${code}`;
        codes.push({ code, qr_url: qrUrl });

        allDevices.push({
          device_code: code,
          device_type: cd.productType || 'card',
          product_sku: item.product_id || '',
          product_name: item.product_name || `NFC ${cd.productType || 'Card'}`,
          status: 'available',
          description: `${cd.nameText || ''} — ${cd.holderName || ''} (${cd.finish || 'Matte'})`.trim(),
        });
      }

      manufacturingItems.push({
        product_type: cd.productType || 'card',
        product_sku: item.product_id || '',
        product_name: item.product_name || `NFC ${cd.productType || 'Card'}`,
        finish: cd.finish || 'Matte',
        quantity: qty,
        company_name: cd.nameText || '',
        holder_name: cd.holderName || '',
        role_position: cd.roleText || '',
        logo_url: cd.logoUrl || '',
        card_color: cd.cardColor || '',
        accent_color: cd.accentColor || '',
        remove_branding: cd.removeBranding || false,
        brand_pattern: cd.brandPattern || null,
        design_data: cd,
        activation_codes: codes,
        manufacturing_status: 'pending',
      });

      nextNum += qty;
    }

    // Bulk create NFCDevice records in batches of 100
    if (allDevices.length > 0) {
      for (let i = 0; i < allDevices.length; i += 100) {
        const batch = allDevices.slice(i, i + 100);
        await base44.asServiceRole.entities.NFCDevice.bulkCreate(batch);
      }
      console.log(`Created ${allDevices.length} NFCDevice records for order ${orderId}`);
    }

    // Update ShopOrder with manufacturing items + all device codes
    if (manufacturingItems.length > 0) {
      const allCodes = manufacturingItems.flatMap(m => m.activation_codes.map(c => c.code));
      await base44.asServiceRole.entities.ShopOrder.update(orderId, {
        manufacturing_items: manufacturingItems,
        assigned_device_codes: allCodes,
      });
      console.log(`Generated ${allCodes.length} activation codes for order ${orderId}`);
    }
  } catch (e) {
    console.error('generateManufacturingDevices error (non-blocking):', e.message);
  }
}

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const appOrigin = Deno.env.get('APP_ORIGIN') || 'https://bingooconnect.com';

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

          // Generate activation codes for custom NFC items (non-blocking)
          await generateManufacturingDevices(base44, shopOrder, order_id);
        }

      } else if (session.mode === 'subscription') {
        const customerEmail = session.customer_email || user_email;
        const metadataPlan = plan; // from session metadata — a hint, NOT the source of truth

        // Get subscription details for period end AND resolve the real plan from the
        // actual Stripe product/price. The metadata plan can be wrong if someone
        // checked out via a stale or mismatched session; the Stripe product is truth.
        let periodEnd = null;
        let stripeSubId = session.subscription || '';
        let resolvedPlan = metadataPlan;
        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            periodEnd = new Date(sub.current_period_end * 1000).toISOString();
            stripeSubId = sub.id;
            resolvedPlan = resolvePlanFromSubscriptionItem(sub.items?.data?.[0], metadataPlan);
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
          plan: resolvedPlan,
          status: 'active',
          stripe_subscription_id: stripeSubId,
          stripe_customer_id: session.customer || '',
          stripe_session_id: session.id,
          current_period_end: periodEnd,
        });

        await updateProfilePlan(base44, {
          customerEmail,
          userId: user_id,
          plan: resolvedPlan,
        });

        // Activity log + in-app notification + confirmation email (all non-blocking)
        const billingUrl = stripeSubId ? `${appOrigin}/billing?subscriptionId=${stripeSubId}` : `${appOrigin}/billing`;
        const planLabel = resolvedPlan.charAt(0).toUpperCase() + resolvedPlan.slice(1);
        const subscriberUserId = user_id || await findUserIdByEmail(base44, customerEmail);

        await logSubscriptionActivity(base44, {
          customer_email: customerEmail, customer_name: customerName,
          plan: resolvedPlan, action: 'created', status: 'active',
          stripe_subscription_id: stripeSubId,
          details: `Subscribed to ${planLabel} via checkout`,
        });

        await notifyUser(base44, {
          userId: subscriberUserId,
          eventType: 'subscription_created',
          title: `You're on the ${planLabel} plan 🎉`,
          message: 'Your premium features are unlocked.',
          actionUrl: billingUrl,
          relatedId: stripeSubId,
        });

        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: customerEmail,
            subject: `You're subscribed to the ${planLabel} plan! 🎉`,
            from_name: 'Bingoo Connect',
            body: `Hi ${customerName || 'there'},\n\nThanks for subscribing to the Bingoo Connect ${planLabel} plan! Your new features are unlocked and ready to use.\n\nManage your subscription anytime from your Billing page: ${billingUrl}\n\nCheers,\nThe Bingoo Connect Team`,
          });
        } catch (emailErr) {
          console.error('Subscription confirmation email failed:', emailErr.message);
        }
      }
    }

    // ── customer.subscription.updated ─────────────────────────
    // Covers plan upgrades/downgrades made via Stripe Billing Portal, and status transitions.
    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: sub.id
      });
      if (existing.length > 0) {
        const prev = existing[0];
        const resolvedPlan = resolvePlanFromSubscriptionItem(sub.items?.data?.[0], prev.plan);
        const newStatus = sub.status; // active, trialing, past_due, canceled, unpaid, incomplete, incomplete_expired
        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        await base44.asServiceRole.entities.Subscription.update(prev.id, {
          plan: resolvedPlan,
          status: newStatus,
          cancel_at_period_end: sub.cancel_at_period_end || false,
          ...(periodEnd && { current_period_end: periodEnd }),
        });
        console.log('Subscription updated:', sub.id, resolvedPlan, newStatus);

        const billingUrl = `${appOrigin}/billing?subscriptionId=${sub.id}`;

        if (newStatus === 'active' || newStatus === 'trialing') {
          const action = (resolvedPlan !== prev.plan) ? (PLAN_RANK[resolvedPlan] > PLAN_RANK[prev.plan] ? 'upgraded' : 'downgraded') : 'renewed';
          // Covers upgrades AND downgrades made through the Billing Portal
          await updateProfilePlan(base44, { customerEmail: prev.customer_email, plan: resolvedPlan });

          await logSubscriptionActivity(base44, {
            customer_email: prev.customer_email, customer_name: prev.customer_name,
            plan: resolvedPlan, action, old_plan: prev.plan, old_status: prev.status, status: newStatus,
            stripe_subscription_id: sub.id,
            details: `${resolvedPlan !== prev.plan ? `${prev.plan} → ${resolvedPlan}` : `Renewed (${newStatus})`}`,
          });

          if (resolvedPlan !== prev.plan) {
            await notifyUser(base44, {
              userId: await findUserIdByEmail(base44, prev.customer_email),
              eventType: 'subscription_updated',
              title: `Plan ${action} to ${resolvedPlan.charAt(0).toUpperCase() + resolvedPlan.slice(1)}`,
              message: 'Your subscription was updated.',
              actionUrl: billingUrl, relatedId: sub.id,
            });
          }
        } else if (newStatus === 'canceled' || newStatus === 'unpaid' || newStatus === 'incomplete_expired') {
          // Payment failed permanently or trial ended unpaid — apply tiered downgrade policy.
          // BUT protected test accounts never get downgraded.
          if (isProtectedTestAccount(prev.customer_email)) {
            console.log('Skipping downgrade for protected test account:', prev.customer_email);
          } else {
            await updateProfilePlan(base44, { customerEmail: prev.customer_email, plan: downgradedPlan(resolvedPlan) });

            await logSubscriptionActivity(base44, {
              customer_email: prev.customer_email, customer_name: prev.customer_name,
              plan: resolvedPlan, action: 'canceled', old_plan: prev.plan, old_status: prev.status, status: newStatus,
              stripe_subscription_id: sub.id,
              details: `Subscription ended (${newStatus})`,
            });

            await notifyUser(base44, {
              userId: await findUserIdByEmail(base44, prev.customer_email),
              eventType: 'subscription_canceled',
              title: 'Subscription ended',
              message: 'Your premium features have been adjusted.',
              actionUrl: billingUrl, relatedId: sub.id,
            });
          }
        }
        // past_due / incomplete: keep current plan (grace period) — no profile change
      }
    }

    // ── customer.subscription.deleted ─────────────────────────
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: sub.id
      });
      if (existing.length > 0) {
        const prev = existing[0];
        await base44.asServiceRole.entities.Subscription.update(prev.id, {
          status: 'canceled',
          cancel_at_period_end: false,
        });
        const billingUrl = `${appOrigin}/billing?subscriptionId=${sub.id}`;
        // Subscription fully deleted — apply tiered downgrade policy based on what plan they had.
        // BUT protected test accounts never get downgraded.
        if (isProtectedTestAccount(prev.customer_email)) {
          console.log('Skipping deletion downgrade for protected test account:', prev.customer_email);
        } else {
          await updateProfilePlan(base44, { customerEmail: prev.customer_email, plan: downgradedPlan(prev.plan) });
          console.log('Subscription canceled:', sub.id, '| downgraded to:', downgradedPlan(prev.plan));

          await logSubscriptionActivity(base44, {
            customer_email: prev.customer_email, customer_name: prev.customer_name,
            plan: prev.plan, action: 'canceled', old_status: prev.status, status: 'canceled',
            stripe_subscription_id: sub.id,
            details: 'Subscription deleted',
          });

          await notifyUser(base44, {
            userId: await findUserIdByEmail(base44, prev.customer_email),
            eventType: 'subscription_canceled',
            title: 'Subscription canceled',
            message: 'Your plan has been canceled.',
            actionUrl: billingUrl, relatedId: sub.id,
          });
        }
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
        const prev = existing[0];
        await base44.asServiceRole.entities.Subscription.update(prev.id, {
          status: 'past_due',
        });
        const billingUrl = invoice.subscription ? `${appOrigin}/billing?subscriptionId=${invoice.subscription}` : `${appOrigin}/billing`;
        // No plan downgrade yet — allow Stripe's retry window (3-7 days) before losing access
        console.log('Subscription past_due (grace period active):', invoice.subscription);

        await logSubscriptionActivity(base44, {
          customer_email: prev.customer_email, customer_name: prev.customer_name,
          plan: prev.plan, action: 'past_due', old_status: prev.status, status: 'past_due',
          stripe_subscription_id: invoice.subscription,
          details: 'Invoice payment failed — grace period active',
        });

        await notifyUser(base44, {
          userId: await findUserIdByEmail(base44, prev.customer_email),
          eventType: 'payment_failed',
          title: 'Payment failed ⚠️',
          message: 'Update your payment method to keep your plan.',
          actionUrl: billingUrl, relatedId: invoice.subscription,
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});