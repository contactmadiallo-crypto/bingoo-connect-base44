import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

/**
 * SERVER-SIDE product catalog — single source of truth for prices and labels.
 * The client may only send product_id, quantity, and custom-design fields.
 * All prices, shipping, currency, and totals are computed here.
 * Keys must exactly match product.id values in lib/shopProducts.js.
 */
const NFC_PRODUCTS = {
  'nfc-card':         { productId: 'prod_UdL2gP4j6Q9aP2',  amount: 1999, label: 'NFC Card' },
  'nfc-keychain':     { productId: 'prod_UdL2pKDQZQrBJ1',  amount: 1499, label: 'NFC Keychain' },
  'nfc-metal-card':   { productId: 'prod_UpruIOuKBCAvw4',  amount: 2999, label: 'NFC Metal Card' },
  'nfc-wood-card':    { productId: 'prod_Upru8nxVv85aYY',  amount: 2799, label: 'NFC Wood Card' },
  'nfc-sticker':      { productId: 'prod_UdL2IyT1qYzxw4',  amount: 799,  label: 'NFC Sticker' },
  'nfc-bracelet':     { productId: 'prod_UdL2v8wEYP0JQp',  amount: 2499, label: 'NFC Bracelet' },
  'nfc-silicone-tag': { productId: 'prod_Upru56GYFSd40q',  amount: 1299, label: 'NFC Silicone Tag' },
  'nfc-key-fob':      { productId: 'prod_Upru6EFzCOzX4U',  amount: 1199, label: 'NFC Key Fob' },
  'nfc-table-stand':  { productId: 'prod_UdL2yIz4V7V9db',  amount: 3499, label: 'NFC Table Stand' },
  'nfc-phone-stand':  { productId: 'prod_Upru71ZAVU5PZg',  amount: 2299, label: 'NFC Phone Stand' },
  'nfc-pet-collar':   { productId: 'prod_UrF7UD5DJJqIpk',  amount: 1699, label: 'NFC Pet Collar Tag' },
  'nfc-luggage-tag':  { productId: 'prod_UrF7bbKOm3lsXv',  amount: 1899, label: 'NFC Luggage Tag' },
};

const SHIPPING_COST_CENTS = 500; // $5.00 — fixed on server, never trusted from client
const MAX_QUANTITY_PER_ITEM = 50;
const MIN_TOTAL_UNITS = 10; // mirrors the client minimum-order rule

// APP_URL: hardcoded to the published domain. Base44 does not inject a runtime APP_URL env var,
// so we use the known production domain. Update here if the domain changes.
const APP_URL = 'https://bingooconnect.com';

// Only these custom-design fields are accepted from the client and persisted on order items.
// Matches the ShopOrder.items[].customDesign schema and the webhook's manufacturing generator.
const PERMITTED_CUSTOM_DESIGN_KEYS = new Set([
  'productType', 'cardColor', 'accentColor', 'nameText', 'holderName', 'roleText',
  'phone', 'email', 'website', 'assignProfileId', 'finish', 'quantity',
  'removeBranding', 'brandPattern', 'logoUrl',
]);

function sanitizeCustomDesign(input) {
  if (!input || typeof input !== 'object') return undefined;
  const out = {};
  for (const key of PERMITTED_CUSTOM_DESIGN_KEYS) {
    if (input[key] !== undefined) out[key] = input[key];
  }
  // Keep only keys that actually produced a value
  return Object.keys(out).length > 0 ? out : undefined;
}

function buildSessionParams({ lineItems, customerEmail, orderId }) {
  const params = {
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    success_url: `${APP_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${APP_URL}/cart`,
    metadata: {
      base44_app_id: Deno.env.get('BASE44_APP_ID'),
      order_id: orderId,
    },
  };
  if (customerEmail) params.customer_email = customerEmail;
  return params;
}

// ── Payload signature ───────────────────────────────────────────────────────
// Deterministic fingerprint of the checkout payload (normalized email + product
// IDs + quantities + permitted custom-design values). Used to reject reuse of an
// idempotency_key for a changed cart (HTTP 409) and to match request vs. stored order.
function normalizeValue(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    const keys = Object.keys(v).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + normalizeValue(v[k])).join(',') + '}';
  }
  return String(v);
}

function signatureFromItems(customerEmail, items) {
  const email = (customerEmail || '').trim().toLowerCase();
  const norm = (items || []).map(item => {
    const cd = sanitizeCustomDesign(item.customDesign) || {};
    const cdPairs = Object.keys(cd).sort().map(k => [k, normalizeValue(cd[k])]);
    return [item.product_id, item.quantity, cdPairs];
  });
  norm.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
    if (a[1] !== b[1]) return a[1] - b[1];
    const sa = JSON.stringify(a[2]), sb = JSON.stringify(b[2]);
    return sa < sb ? -1 : (sa > sb ? 1 : 0);
  });
  return JSON.stringify({ email, items: norm });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Guest checkout is allowed — no auth check. The client sends the cart + customer
    // details only; it does NOT send prices, totals, an order_id, or any privileged value.
    const {
      idempotency_key,
      customer = {},
      items,
    } = body;

    const customer_name = typeof customer.name === 'string' ? customer.name.trim() : '';
    const customer_email = typeof customer.email === 'string' ? customer.email.trim().toLowerCase() : '';
    const customer_phone = typeof customer.phone === 'string' ? customer.phone.trim() : '';
    const shipping_address = typeof customer.address === 'string' ? customer.address.trim() : '';
    const city = typeof customer.city === 'string' ? customer.city.trim() : '';
    const state = typeof customer.state === 'string' ? customer.state.trim() : '';
    const zip_code = typeof customer.zip === 'string' ? customer.zip.trim() : '';
    const country = typeof customer.country === 'string' ? customer.country.trim() : '';
    const order_notes = typeof customer.notes === 'string' ? customer.notes.trim() : '';

    // ── 1. Basic input validation ──────────────────────────────────────────
    if (!customer_name || !customer_email || !/\S+@\S+\.\S+/.test(customer_email)) {
      return Response.json({ error: 'Valid customer name and email are required' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!idempotency_key || typeof idempotency_key !== 'string' || idempotency_key.length > 200) {
      return Response.json({ error: 'idempotency_key is required' }, { status: 400 });
    }

    // ── 2. Validate items against the SERVER catalog ─────────────────────────
    let totalUnits = 0;
    for (const item of items) {
      const qty = item?.quantity;
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY_PER_ITEM) {
        return Response.json(
          { error: `Invalid quantity ${qty} for product "${item?.product_id}". Must be 1–${MAX_QUANTITY_PER_ITEM}.` },
          { status: 400 }
        );
      }
      if (!NFC_PRODUCTS[item.product_id]) {
        return Response.json({ error: `Unknown product: "${item.product_id}"` }, { status: 400 });
      }
      const cdQty = item.customDesign && typeof item.customDesign.quantity === 'number'
        ? item.customDesign.quantity
        : qty;
      totalUnits += cdQty;
    }
    if (totalUnits < MIN_TOTAL_UNITS) {
      return Response.json({ error: `Minimum order is ${MIN_TOTAL_UNITS} NFC products.` }, { status: 400 });
    }

    // ── 3. Build line items + order items from the SERVER catalog ────────────
    const lineItems = [];
    const orderItems = items.map(item => {
      const productInfo = NFC_PRODUCTS[item.product_id];
      const priceData = {
        currency: 'usd',
        unit_amount: productInfo.amount,
        product_data: { name: productInfo.label },
      };
      if (productInfo.productId) {
        priceData.product = productInfo.productId;
        delete priceData.product_data;
      }
      lineItems.push({ price_data: priceData, quantity: item.quantity });

      const orderItem = {
        product_id: item.product_id,
        product_name: productInfo.label,
        quantity: item.quantity,
        unit_price: productInfo.amount / 100,
      };
      const cd = sanitizeCustomDesign(item.customDesign);
      if (cd) orderItem.customDesign = cd;
      return orderItem;
    });

    // ── 4. Server-authoritative totals (never trusted from the client) ──────
    const productSubtotalCents = items.reduce(
      (sum, item) => sum + NFC_PRODUCTS[item.product_id].amount * item.quantity, 0
    );
    const totalCents = productSubtotalCents + SHIPPING_COST_CENTS;

    lineItems.push({
      price_data: {
        currency: 'usd',
        unit_amount: SHIPPING_COST_CENTS,
        product_data: { name: 'Shipping & Handling' },
      },
      quantity: 1,
    });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Deterministic Stripe idempotency key — identical for every call sharing this
    // checkout idempotency_key, so concurrent duplicate create() calls return the
    // SAME Stripe session instead of two. (Refreshing an expired session uses a
    // unique key so Stripe doesn't replay the stale expired session object.)
    const stripeIdemKey = 'bingoo-shopcheckout-' + idempotency_key;

    const requestSignature = signatureFromItems(customer_email, items);

    // ── 5. Idempotency: reuse an existing order for this key if present ──────
    let existing = [];
    try {
      existing = await base44.asServiceRole.entities.ShopOrder.filter({ idempotency_key }, 'created_date', 10);
    } catch (e) {
      console.error('Idempotency lookup failed:', e.message);
    }

    if (existing.length > 0) {
      const prior = existing[0];

      // Reject payload drift: the same idempotency_key must map to the same cart.
      const orderSignature = signatureFromItems(prior.customer_email, prior.items);
      if (requestSignature !== orderSignature) {
        console.warn(`Idempotency payload mismatch for key ${idempotency_key}`);
        return Response.json(
          { error: 'Checkout payload changed for this idempotency key. Please restart checkout.' },
          { status: 409 }
        );
      }

      // If a valid session already exists, return it — do NOT create another.
      if (prior.stripe_session_id) {
        try {
          const priorSession = await stripe.checkout.sessions.retrieve(prior.stripe_session_id);
          if (priorSession && priorSession.url) {
            console.log(`Idempotent reuse: order ${prior.id} | existing session ${prior.stripe_session_id}`);
            return Response.json({ url: priorSession.url, order_id: prior.id });
          }
        } catch (e) {
          console.warn('Retrieve prior session failed, will refresh:', e.message);
        }
        // Session expired/unavailable — create a fresh one for the SAME order,
        // using a unique Stripe idempotency key so Stripe doesn't return the stale
        // expired session.
        const refreshKey = 'bingoo-shopcheckout-' + idempotency_key + '-r' + Date.now();
        const refreshed = await stripe.checkout.sessions.create(
          buildSessionParams({ lineItems, customerEmail: customer_email, orderId: prior.id }),
          { idempotencyKey: refreshKey }
        );
        await base44.asServiceRole.entities.ShopOrder.update(prior.id, { stripe_session_id: refreshed.id });
        console.log(`Idempotent reuse: order ${prior.id} | refreshed session ${refreshed.id}`);
        return Response.json({ url: refreshed.url, order_id: prior.id });
      }

      // Order exists but has no session yet — create one for it. The deterministic
      // Stripe key dedupes any concurrent callers racing to do the same.
      const session = await stripe.checkout.sessions.create(
        buildSessionParams({ lineItems, customerEmail: customer_email, orderId: prior.id }),
        { idempotencyKey: stripeIdemKey }
      );
      await base44.asServiceRole.entities.ShopOrder.update(prior.id, { stripe_session_id: session.id });
      console.log(`Idempotent reuse: order ${prior.id} | new session ${session.id}`);
      return Response.json({ url: session.url, order_id: prior.id });
    }

    // ── 6. Create the ShopOrder server-side (asServiceRole bypasses RLS) ─────
    const order = await base44.asServiceRole.entities.ShopOrder.create({
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      state,
      zip_code,
      country,
      order_notes,
      items: orderItems,
      subtotal: productSubtotalCents / 100,
      shipping_cost: SHIPPING_COST_CENTS / 100,
      total: totalCents / 100,
      payment_status: 'unpaid',
      fulfillment_status: 'processing',
      idempotency_key,
    });

    // ── 6b. Reconcile concurrent creates ──────────────────────────────────────
    // Two simultaneous requests can both pass the "no existing order" check and
    // each create an order. Re-query for the earliest order with this key; if it
    // isn't ours, discard ours and adopt the earliest. Stripe's deterministic
    // idempotency key already guarantees a single shared session object either way.
    let canonicalOrder = order;
    try {
      const all = await base44.asServiceRole.entities.ShopOrder.filter({ idempotency_key }, 'created_date', 10);
      if (all.length > 1 && all[0].id !== order.id) {
        canonicalOrder = all[0];
        try {
          await base44.asServiceRole.entities.ShopOrder.delete(order.id);
          console.log(`Concurrent dedupe: discarded duplicate order ${order.id}, adopting ${canonicalOrder.id}`);
        } catch (e) {
          console.warn('Failed to discard duplicate order:', e.message);
        }
        // If the canonical (earliest) order already has a valid session, return it.
        if (canonicalOrder.stripe_session_id) {
          try {
            const s = await stripe.checkout.sessions.retrieve(canonicalOrder.stripe_session_id);
            if (s && s.url) return Response.json({ url: s.url, order_id: canonicalOrder.id });
          } catch (e) { console.warn('Retrieve canonical session failed:', e.message); }
        }
      }
    } catch (e) {
      console.warn('Reconcile query failed:', e.message);
    }

    // ── 7. Create the Stripe Checkout session bound to the canonical order ID ─
    const session = await stripe.checkout.sessions.create(
      buildSessionParams({ lineItems, customerEmail: customer_email, orderId: canonicalOrder.id }),
      { idempotencyKey: stripeIdemKey }
    );

    await base44.asServiceRole.entities.ShopOrder.update(canonicalOrder.id, {
      stripe_session_id: session.id,
    });

    console.log(`Checkout created: order ${canonicalOrder.id} | session ${session.id} | total_cents ${totalCents}`);
    return Response.json({ url: session.url, order_id: canonicalOrder.id });

  } catch (error) {
    console.error('createShopCheckout error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});