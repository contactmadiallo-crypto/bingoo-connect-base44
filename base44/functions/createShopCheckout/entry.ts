import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

/**
 * SERVER-SIDE product catalog — single source of truth for prices and labels.
 * Frontend may only send product_id and quantity. All prices come from here.
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
};

const SHIPPING_COST_CENTS = 500; // $5.00 — fixed on server, never trusted from client
const MAX_QUANTITY_PER_ITEM = 50;

// APP_URL: hardcoded to the published domain. Base44 does not inject a runtime APP_URL env var,
// so we use the known production domain. Update here if the domain changes.
const APP_URL = 'https://bingooconnect.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { order_id, items } = body;
    // customer_email is accepted for UX pre-fill only — never used for auth decisions
    const customer_email = typeof body.customer_email === 'string' ? body.customer_email.trim() : null;

    console.log('createShopCheckout called — order_id:', order_id, '| items:', JSON.stringify(items));

    // ── 1. Basic input validation ──────────────────────────────────────────
    if (!order_id || typeof order_id !== 'string') {
      return Response.json({ error: 'order_id is required' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // ── 2. Validate quantities — reject zero, negative, fractional, excessive ──
    for (const item of items) {
      const qty = item.quantity;
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY_PER_ITEM) {
        console.error('Invalid quantity for', item.product_id, ':', qty);
        return Response.json(
          { error: `Invalid quantity ${qty} for product "${item.product_id}". Must be 1–${MAX_QUANTITY_PER_ITEM}.` },
          { status: 400 }
        );
      }
      if (!NFC_PRODUCTS[item.product_id]) {
        console.error('Unknown product_id:', item.product_id);
        return Response.json(
          { error: `Unknown product: "${item.product_id}"` },
          { status: 400 }
        );
      }
    }

    // ── 3. Verify ShopOrder integrity ──────────────────────────────────────
    let existingOrder;
    try {
      existingOrder = await base44.asServiceRole.entities.ShopOrder.get(order_id);
    } catch (e) {
      console.error('Failed to fetch ShopOrder:', order_id, e.message);
    }

    if (!existingOrder) {
      console.error('Order not found:', order_id);
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    if (existingOrder.payment_status === 'paid') {
      console.warn('Attempted checkout on already-paid order:', order_id);
      return Response.json({ error: 'This order has already been paid' }, { status: 409 });
    }

    // ── 4. Build line items from SERVER catalog — ignore all frontend prices ──
    const lineItems = items.map(item => {
      const productInfo = NFC_PRODUCTS[item.product_id];
      // productInfo is guaranteed to exist (validated above)

      const priceData = {
        currency: 'usd',
        unit_amount: productInfo.amount, // always from server catalog
        product_data: { name: productInfo.label },
      };

      // Link to Stripe product when we have a product ID (for dashboard tracking)
      if (productInfo.productId) {
        priceData.product = productInfo.productId;
        delete priceData.product_data;
      }

      return {
        price_data: priceData,
        quantity: item.quantity,
      };
    });

    // Add server-calculated shipping — never from frontend
    lineItems.push({
      price_data: {
        currency: 'usd',
        unit_amount: SHIPPING_COST_CENTS,
        product_data: { name: 'Shipping & Handling' },
      },
      quantity: 1,
    });

    // ── 5. Calculate backend total and update the order record ─────────────
    const productSubtotalCents = items.reduce((sum, item) => {
      return sum + NFC_PRODUCTS[item.product_id].amount * item.quantity;
    }, 0);
    const totalCents = productSubtotalCents + SHIPPING_COST_CENTS;

    // Overwrite order totals with server-authoritative values
    await base44.asServiceRole.entities.ShopOrder.update(order_id, {
      subtotal: productSubtotalCents / 100,
      shipping_cost: SHIPPING_COST_CENTS / 100,
      total: totalCents / 100,
    });
    console.log(`Order ${order_id} totals set by server: subtotal=$${productSubtotalCents/100} shipping=$${SHIPPING_COST_CENTS/100} total=$${totalCents/100}`);

    // ── 6. Create Stripe Checkout session ──────────────────────────────────
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${APP_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${order_id}`,
      cancel_url: `${APP_URL}/cart`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        order_id,
      },
    };

    if (customer_email) {
      sessionParams.customer_email = customer_email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Store session ID on the order so webhook can locate it by either method
    await base44.asServiceRole.entities.ShopOrder.update(order_id, {
      stripe_session_id: session.id,
    });

    console.log('Stripe session created:', session.id, '| order:', order_id, '| total_cents:', totalCents);

    return Response.json({ url: session.url });

  } catch (error) {
    console.error('createShopCheckout error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});