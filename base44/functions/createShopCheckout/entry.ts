import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

/**
 * NFC product catalog — product IDs from Stripe.
 * Line items use price_data (dynamic pricing) so we don't need to manage
 * separate Stripe Price objects for each product variant.
 *
 * Keys must match product.id values in lib/shopProducts.js exactly.
 */
const NFC_PRODUCTS = {
  'nfc-card':     { productId: 'prod_UdL2gP4j6Q9aP2', amount: 1999,  label: 'NFC Business Card' },
  'nfc-keychain': { productId: 'prod_UdL2pKDQZQrBJ1', amount: 1499,  label: 'NFC Keychain' },
  'nfc-sticker':  { productId: 'prod_UdL2IyT1qYzxw4', amount: 799,   label: 'NFC Sticker' },
  'nfc-stand':    { productId: 'prod_UdL2yIz4V7V9db', amount: 3499,  label: 'NFC Counter Stand' },
  'nfc-bracelet': { productId: 'prod_UdL2v8wEYP0JQp', amount: 2499,  label: 'NFC Bracelet' },
  'nfc-bundle':   { productId: null,                  amount: 2999,  label: 'NFC Starter Bundle' },
  'nfc-bulk-10':  { productId: 'prod_UdL2zv4avSmTJo', amount: 9999,  label: '10-Pack NFC Cards' },
};

const APP_URL = 'https://bingooconnect.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { items, order_id, customer_email } = body;

    console.log('createShopCheckout called — order_id:', order_id, '| items:', JSON.stringify(items));

    if (!items || items.length === 0) {
      console.error('createShopCheckout: no items provided');
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!order_id) {
      console.error('createShopCheckout: order_id missing');
      return Response.json({ error: 'order_id is required' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Build line items using price_data (dynamic) so we never depend on stale Price IDs
    const lineItems = items.map(item => {
      const productInfo = NFC_PRODUCTS[item.product_id];
      if (!productInfo) {
        throw new Error(`Unknown product_id: "${item.product_id}". Valid IDs: ${Object.keys(NFC_PRODUCTS).join(', ')}`);
      }

      const priceData = {
        currency: 'usd',
        unit_amount: Math.round((item.unit_price || (productInfo.amount / 100)) * 100),
        product_data: {
          name: item.product_name || productInfo.label,
        },
      };

      // Attach Stripe product ID when we have one (ensures product tracking in Stripe dashboard)
      if (productInfo.productId) {
        priceData.product = productInfo.productId;
        delete priceData.product_data; // can't use both product and product_data
      }

      return {
        price_data: priceData,
        quantity: item.quantity || 1,
      };
    });

    // Add shipping as a separate line item
    const shippingCost = body.shipping_cost || 5;
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(shippingCost * 100),
          product_data: { name: 'Shipping & Handling' },
        },
        quantity: 1,
      });
    }

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

    // Pre-fill customer email if provided (improves Stripe checkout UX)
    if (customer_email) {
      sessionParams.customer_email = customer_email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log('Shop checkout session created:', session.id, '| order:', order_id, '| url:', session.url);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createShopCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});