import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

// Product IDs for NFC devices from Stripe catalog
const NFC_PRODUCTS = {
  'nfc-card': { productId: 'prod_UdL2gP4j6Q9aP2', amount: 1999, label: 'NFC Business Card' },
  'nfc-keychain': { productId: 'prod_UdL2pKDQZQrBJ1', amount: 1499, label: 'NFC Keychain' },
  'nfc-bracelet': { productId: 'prod_UdL2v8wEYP0JQp', amount: 2499, label: 'NFC Bracelet' },
  'nfc-stand': { productId: 'prod_UdL2yIz4V7V9db', amount: 3499, label: 'NFC Counter Stand' },
  'nfc-sticker': { productId: 'prod_UdL2IyT1qYzxw4', amount: 799, label: 'NFC Sticker' },
  'nfc-bundle': { productId: 'prod_UdL2w8KxYHac58', amount: 3999, label: 'NFC Bundle Package' },
  'bulk-order': { productId: 'prod_UdL2zv4avSmTJo', amount: 14999, label: 'Bulk Corporate Order' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { items, order_id } = await req.json();

    if (!items || items.length === 0 || !order_id) {
      return Response.json({ error: 'items and order_id are required' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const appUrl = 'https://bingooconnect.com';

    // Build line items
    const lineItems = items.map(item => {
      const productInfo = NFC_PRODUCTS[item.product_id];
      if (!productInfo) {
        throw new Error(`Unknown product: ${item.product_id}`);
      }
      return {
        price: productInfo.productId,
        quantity: item.quantity || 1,
      };
    });

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${appUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        order_id,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log('Shop checkout session created:', session.id, 'for order:', order_id);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createShopCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});