import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

// Fallback mapping when a subscription item's price has no plan metadata
// (e.g. prices created before plan metadata was added).
const PRODUCT_TO_PLAN = {
  'prod_UdL2W8XwDY3Bmq': 'professional',
  'prod_UfF46myS8RxwKE': 'salon',
  'prod_UfFHNuhuWhyGVZ': 'lawfirm',
  'prod_UdL2NqVtcHwKb2': 'business',
  'prod_UsKCo8sDBXEsuY': 'corporate',
};

// Physical Shop catalog metadata used when converting a paid ShopOrder into
// canonical NFCDevice inventory. Keep these IDs aligned with createShopCheckout
// and src/lib/shopProducts.js. This is manufacturing identity, not pricing.
const SHOP_NFC_PRODUCTS = {
  // Standalone Design Studio manufacturing identities. No retail Shop image is
  // attached: the purchased product is the customer's submitted design.
  'studio-business-card':     { device_type: 'card',     name: 'Custom NFC Card',      image: '' },
  'studio-business-keychain': { device_type: 'keychain', name: 'Custom NFC Keychain',  image: '' },
  'studio-business-sticker':  { device_type: 'sticker',  name: 'Custom NFC Sticker',   image: '' },
  'studio-business-bracelet': { device_type: 'bracelet', name: 'Custom NFC Bracelet',  image: '' },
  'studio-business-tag':      { device_type: 'tag',      name: 'Custom NFC Tag',       image: '' },
  'studio-business-stand':    { device_type: 'stand',    name: 'Custom NFC Stand',     image: '' },
  'studio-pro-card':          { device_type: 'card',     name: 'Custom NFC Card',      image: '' },
  'studio-pro-keychain':      { device_type: 'keychain', name: 'Custom NFC Keychain',  image: '' },
  'studio-pro-sticker':       { device_type: 'sticker',  name: 'Custom NFC Sticker',   image: '' },
  'studio-pro-bracelet':      { device_type: 'bracelet', name: 'Custom NFC Bracelet',  image: '' },
  'studio-pro-tag':           { device_type: 'tag',      name: 'Custom NFC Tag',       image: '' },
  'studio-pro-stand':         { device_type: 'stand',    name: 'Custom NFC Stand',     image: '' },

  'nfc-card':         { device_type: 'card',     name: 'NFC Card',           image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/e20177e15_nfc-card.webp' },
  'nfc-keychain':     { device_type: 'keychain', name: 'NFC Keychain',       image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/ec99291e4_nfc-keychain.webp' },
  'nfc-metal-card':   { device_type: 'metal_card', name: 'NFC Metal Card',  image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/1a49f3891_nfc-metal-card.webp' },
  'nfc-wood-card':    { device_type: 'card',     name: 'NFC Wood Card',      image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/ef8e36d9a_nfc-wood-card.webp' },
  'nfc-sticker':      { device_type: 'sticker',  name: 'NFC Sticker',        image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/73a89b588_nfc-sticker.webp' },
  'nfc-bracelet':     { device_type: 'bracelet', name: 'NFC Bracelet',       image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/c61eb39e9_nfc-bracelet.webp' },
  'nfc-silicone-tag': { device_type: 'tag',      name: 'NFC Silicone Tag',   image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/60a904175_nfc-silicone-tag.webp' },
  'nfc-key-fob':      { device_type: 'keychain', name: 'NFC Key Fob',        image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/034a5179c_nfc-key-fob.webp' },
  'nfc-table-stand':  { device_type: 'stand',    name: 'NFC Table Stand',    image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/ef2d6166e_nfc-table-stand.webp' },
  'nfc-phone-stand':  { device_type: 'stand',    name: 'NFC Phone Stand',    image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/5a7033e82_nfc-phone-stand.webp' },
  'nfc-pet-collar':   { device_type: 'tag',      name: 'NFC Pet Collar Tag', image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/0f7c80692_nfc-pet-collar.webp' },
  'nfc-luggage-tag':  { device_type: 'tag',      name: 'NFC Luggage Tag',    image: 'https://base44.app/api/apps/692bd9007b93ba81de543346/files/mp/public/692bd9007b93ba81de543346/6bf4206d2_nfc-luggage-tag.webp' },
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

// Local plan rank for upgrade/downgrade detection.
// MUST mirror planPermissions.PLAN_HIERARCHY exactly — see consolidation note in getUserFeatures.
const PLAN_RANK = {
  free: 0, professional: 1, pro: 1, business: 2, salon: 3, restaurant: 2, lawfirm: 3, corporate: 4,
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

// updateProfilePlan removed — Subscription is the single source of truth for plan entitlement.
// Profile.plan is owner-writable and must never be written by webhooks or admin actions.
// Entitlement is resolved at read-time by getUserFeatures / getEffectivePlan from the Subscription entity.

// ── Generate manufacturing devices and activation codes after payment ────────
// Every paid physical NFC unit — standard Shop purchase OR Design Studio item —
// receives one canonical NFCDevice record and one permanent /d/BG-###### URL.
// The order stores the same device codes for manufacturing/fulfillment.
async function generateManufacturingDevices(base44, shopOrder, orderId) {
  try {
    const items = Array.isArray(shopOrder.items) ? shopOrder.items : [];
    if (items.length === 0) return;

    // Order-level idempotency: once manufacturing codes exist for this paid order,
    // a Stripe webhook retry must never allocate another set of physical devices.
    if ((shopOrder.assigned_device_codes || []).length > 0 || (shopOrder.manufacturing_items || []).length > 0) {
      console.log(`Manufacturing already generated for order ${orderId}; skipping duplicate allocation.`);
      return;
    }

    // Find the highest canonical BG code. Codes are zero-padded, so descending
    // lexical order is also descending numeric order.
    const existing = await base44.asServiceRole.entities.NFCDevice.filter({}, '-device_code', 1);
    let nextNum = 1;
    if (existing.length > 0 && existing[0].device_code) {
      const match = String(existing[0].device_code).match(/^BG-(\d{6})$/i);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }

    const manufacturingItems = [];
    const allocatedCodes = new Set();
    let totalCreated = 0;

    for (const item of items) {
      const product = SHOP_NFC_PRODUCTS[item.product_id];
      if (!product) {
        console.warn(`Skipping unknown Shop product during manufacturing: ${item.product_id}`);
        continue;
      }

      const cd = item.customDesign && typeof item.customDesign === 'object' ? item.customDesign : {};
      const qty = Math.max(1, Math.min(Number(item.quantity) || 1, 500));
      const productType = product.device_type;
      const codes = [];

      for (let i = 0; i < qty; i++) {
        // Re-check each candidate against the live database. This also protects the
        // Shop allocator from codes generated manually in Admin moments earlier.
        let code;
        let attempts = 0;
        while (attempts < 1000) {
          code = `BG-${String(nextNum).padStart(6, '0')}`;
          nextNum += 1;
          attempts += 1;
          if (allocatedCodes.has(code)) continue;
          const collision = await base44.asServiceRole.entities.NFCDevice.filter({ device_code: code }, '-created_date', 5);
          if (!collision || collision.length === 0) break;
          code = null;
        }
        if (!code) throw new Error('Unable to allocate a unique NFC device code.');

        const descriptionParts = [cd.nameText, cd.holderName, cd.finish].filter(Boolean);
        const device = await base44.asServiceRole.entities.NFCDevice.create({
          device_code: code,
          device_type: productType,
          product_sku: item.product_id,
          product_name: product.name,
          product_image: cd.logoUrl || product.image || '',
          status: 'available',
          description: descriptionParts.length ? descriptionParts.join(' · ') : `${product.name} · Shop order ${orderId}`,
        });

        allocatedCodes.add(code);
        totalCreated += 1;
        codes.push({
          code,
          qr_url: `https://bingooconnect.com/d/${code}`,
          device_id: device.id,
        });

        // Keep Shop-generated hardware visible in the same audit history as Admin-generated devices.
        try {
          await base44.asServiceRole.entities.DeviceAuditLog.create({
            device_id: device.id,
            device_code: code,
            action: 'generated',
            new_status: 'available',
            notes: `Stripe Shop order ${orderId} · ${product.name} · ${item.product_id}`,
          });
        } catch (auditErr) {
          console.error('Shop NFC audit log failed (non-blocking):', auditErr.message);
        }
      }

      manufacturingItems.push({
        product_type: productType,
        product_sku: item.product_id,
        product_name: product.name,
        finish: cd.finish || 'Standard',
        quantity: qty,
        company_name: cd.nameText || '',
        holder_name: cd.holderName || '',
        role_position: cd.roleText || '',
        phone: cd.phone || '',
        email: cd.email || '',
        website: cd.website || '',
        assign_profile_id: cd.assignProfileId || '',
        logo_url: cd.logoUrl || '',
        card_color: cd.cardColor || '',
        accent_color: cd.accentColor || '',
        remove_branding: cd.removeBranding || false,
        brand_pattern: cd.brandPattern || null,
        design_data: Object.keys(cd).length ? cd : {},
        activation_codes: codes,
        manufacturing_status: 'pending',
      });
    }

    if (manufacturingItems.length > 0) {
      const allCodes = manufacturingItems.flatMap(m => m.activation_codes.map(c => c.code));
      await base44.asServiceRole.entities.ShopOrder.update(orderId, {
        manufacturing_items: manufacturingItems,
        assigned_device_codes: allCodes,
        manufacturing_status: 'device_allocated',
      });
      console.log(`Shop manufacturing ready: order ${orderId} | ${totalCreated} NFC devices | ${allCodes.join(', ')}`);
    }
  } catch (e) {
    console.error('generateManufacturingDevices error (non-blocking):', e.message);
  }
}

// Build the international manufacturing backbone from the canonical paid ShopOrder.
// Idempotent: one specification + one job per manufacturing line, recorded back on ShopOrder.
async function ensureProductionBackbone(base44, shopOrder, orderId) {
  try {
    if (!shopOrder || shopOrder.payment_status !== 'paid') return;
    if ((shopOrder.production_spec_ids || []).length > 0 || (shopOrder.production_job_ids || []).length > 0) {
      console.log(`Production backbone already exists for order ${orderId}; skipping.`);
      return;
    }

    const manufacturingItems = Array.isArray(shopOrder.manufacturing_items) ? shopOrder.manufacturing_items : [];
    if (manufacturingItems.length === 0) {
      console.warn(`Production backbone deferred for order ${orderId}: manufacturing allocation is not ready.`);
      return;
    }

    const orderNumber = shopOrder.order_number || `BC-${String(orderId).slice(-8).toUpperCase()}`;
    const specIds = [];
    const jobIds = [];

    for (let index = 0; index < manufacturingItems.length; index += 1) {
      const item = manufacturingItems[index];
      const line = String(index + 1).padStart(2, '0');
      const specNumber = `SPEC-${orderNumber}-${line}`;
      const jobNumber = `JOB-${orderNumber}-${line}`;

      // Database-level lookup protects against webhook retries or a partial previous run.
      let specs = await base44.asServiceRole.entities.ProductionSpecification.filter({ spec_number: specNumber }, '-created_date', 1);
      let spec = specs?.[0];
      if (!spec) {
        spec = await base44.asServiceRole.entities.ProductionSpecification.create({
          spec_number: specNumber,
          shop_order_id: orderId,
          shop_order_number: orderNumber,
          version: 1,
          status: 'locked_for_production',
          product_sku: item.product_sku || '',
          product_type: item.product_type || 'card',
          quantity: Math.max(1, Number(item.quantity) || 1),
          finish: item.finish || 'Standard',
          logo_url: item.logo_url || '',
          design_snapshot: item.design_data || {},
          nfc_destination_policy: 'bingoo_device_redirect',
          qr_url_pattern: 'https://bingooconnect.com/d/{device_code}',
          encoding_instructions: 'Encode each NFC device to its allocated permanent Bingoo /d/BG-###### URL. Never encode a customer profile URL directly.',
          packaging_instructions: 'Match the paid ShopOrder and locked production specification. Preserve device-code traceability through packing.',
          customs_description: `Bingoo Connect NFC ${item.product_name || item.product_type || 'device'}`,
          locked_at: new Date().toISOString(),
          locked_by: 'stripe_webhook',
        });
      }
      specIds.push(spec.id);

      let jobs = await base44.asServiceRole.entities.ProductionJob.filter({ job_number: jobNumber }, '-created_date', 1);
      let job = jobs?.[0];
      if (!job) {
        job = await base44.asServiceRole.entities.ProductionJob.create({
          job_number: jobNumber,
          shop_order_id: orderId,
          shop_order_number: orderNumber,
          production_spec_id: spec.id,
          status: 'draft',
          quantity: Math.max(1, Number(item.quantity) || 1),
          currency: 'USD',
          priority: 'standard',
          notes: 'Automatically created after verified Stripe payment and canonical NFC device allocation. Awaiting manufacturing partner assignment.',
        });
      }
      jobIds.push(job.id);
    }

    await base44.asServiceRole.entities.ShopOrder.update(orderId, {
      production_spec_ids: specIds,
      production_job_ids: jobIds,
      production_backbone_status: 'generated',
      production_backbone_generated_at: new Date().toISOString(),
    });
    console.log(`Production backbone generated for order ${orderId}: ${specIds.length} specs / ${jobIds.length} jobs.`);
  } catch (e) {
    console.error('ensureProductionBackbone error (non-blocking):', e.message);
    try {
      await base44.asServiceRole.entities.ShopOrder.update(orderId, { production_backbone_status: 'error' });
    } catch (_) {
      // Keep Stripe acknowledgement independent from non-payment manufacturing orchestration.
    }
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
        } else {
          if (shopOrder.payment_status !== 'paid') {
            await base44.asServiceRole.entities.ShopOrder.update(order_id, {
              payment_status: 'paid',
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent || '',
            });
            console.log('Order marked as paid:', order_id, '| session:', session.id);
          } else {
            console.log('Webhook: order already paid; verifying manufacturing allocation:', order_id);
          }

          // Always verify manufacturing allocation on a completed-payment retry.
          // generateManufacturingDevices is itself idempotent and immediately exits
          // when this order already owns canonical device codes.
          let freshOrder = await base44.asServiceRole.entities.ShopOrder.get(order_id);
          await generateManufacturingDevices(base44, freshOrder || shopOrder, order_id);

          // Connect the paid order to the hardened international manufacturing backbone.
          // Refresh first because device allocation writes manufacturing_items to ShopOrder.
          freshOrder = await base44.asServiceRole.entities.ShopOrder.get(order_id);
          await ensureProductionBackbone(base44, freshOrder || shopOrder, order_id);

          // Send Bingoo's own purchase confirmation after payment. Stripe/Link's
          // receipt is payment-provider confirmation, not the Bingoo fulfillment receipt.
          freshOrder = await base44.asServiceRole.entities.ShopOrder.get(order_id);
          if (freshOrder && !freshOrder.confirmation_email_sent_at) {
            const orderNumber = freshOrder.order_number || `BC-${String(order_id).slice(-8).toUpperCase()}`;
            const itemLines = (freshOrder.items || []).map(i => `• ${i.product_name} × ${i.quantity}`).join('\n');
            const trackUrl = `${appOrigin}/my-orders?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(freshOrder.customer_email || '')}`;
            try {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: freshOrder.customer_email,
                subject: `Bingoo order ${orderNumber} confirmed`,
                from_name: 'Bingoo Connect',
                body: `Hi ${freshOrder.customer_name || 'there'},\n\nYour Bingoo order is confirmed and payment has been received.\n\nOrder: ${orderNumber}\n${itemLines}\nTotal: $${Number(freshOrder.total || 0).toFixed(2)}\n\nYour Bingoo device is now entering preparation. Shipping tracking will appear as soon as your package is handed to the carrier.\n\nTrack your order: ${trackUrl}\n\nConnect what matters.\nBingoo Connect`,
              });
              await base44.asServiceRole.entities.ShopOrder.update(order_id, {
                confirmation_email_sent_at: new Date().toISOString(),
              });
            } catch (emailErr) {
              console.error('Shop confirmation email failed (retryable):', emailErr.message);
            }
          }
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

        // Activity log + in-app notification + confirmation email (all non-blocking)
        const billingUrl = stripeSubId ? `${appOrigin}/billing?subscriptionId=${stripeSubId}` : `${appOrigin}/billing`;
        const billingPath = stripeSubId ? `/billing?subscriptionId=${stripeSubId}` : '/billing';
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
          actionUrl: billingPath,
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

        const billingUrl = `/billing?subscriptionId=${sub.id}`;

        if (newStatus === 'active' || newStatus === 'trialing') {
          const action = (resolvedPlan !== prev.plan) ? (PLAN_RANK[resolvedPlan] > PLAN_RANK[prev.plan] ? 'upgraded' : 'downgraded') : 'renewed';
          // Covers upgrades AND downgrades made through the Billing Portal
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
        const billingUrl = `/billing?subscriptionId=${sub.id}`;
        // Subscription fully deleted — apply tiered downgrade policy based on what plan they had.
        // BUT protected test accounts never get downgraded.
        if (isProtectedTestAccount(prev.customer_email)) {
          console.log('Skipping deletion downgrade for protected test account:', prev.customer_email);
        } else {
          console.log('Subscription canceled:', sub.id, '| Subscription record marked canceled (profile plan untouched)');

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
        const billingUrl = invoice.subscription ? `/billing?subscriptionId=${invoice.subscription}` : '/billing';
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