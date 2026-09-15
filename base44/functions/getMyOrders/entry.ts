import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function safeOrder(order) {
  return {
    id: order.id,
    order_number: order.order_number || '',
    customer_name: order.customer_name || '',
    customer_email: order.customer_email || '',
    items: order.items || [],
    subtotal: order.subtotal || 0,
    shipping_cost: order.shipping_cost || 0,
    total: order.total || 0,
    payment_status: order.payment_status || 'unpaid',
    fulfillment_status: order.fulfillment_status || 'processing',
    manufacturing_status: order.manufacturing_status || 'pending',
    carrier: order.carrier || '',
    tracking_number: order.tracking_number || '',
    tracking_url: order.tracking_url || '',
    estimated_delivery: order.estimated_delivery || '',
    shipped_at: order.shipped_at || '',
    delivered_at: order.delivered_at || '',
    created_date: order.created_date,
    updated_date: order.updated_date,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const requestedEmail = String(body.email || '').trim().toLowerCase();
    const requestedOrder = String(body.order_number || body.order || '').trim();
    const user = await base44.auth.me().catch(() => null);

    let email = requestedEmail;
    if (user?.email) {
      const ownEmail = String(user.email).toLowerCase();
      if (email && email !== ownEmail && user.role !== 'admin') {
        return Response.json({ error: 'You can only view your own orders.' }, { status: 403 });
      }
      email = email || ownEmail;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return Response.json({ error: 'A valid order email is required.' }, { status: 400 });
    }

    const orders = await base44.asServiceRole.entities.ShopOrder.filter({ customer_email: email }, '-created_date', 100);
    const filtered = requestedOrder
      ? orders.filter(o => String(o.order_number || '').toLowerCase() === requestedOrder.toLowerCase())
      : orders;

    return Response.json({ orders: filtered.map(safeOrder) });
  } catch (error) {
    console.error('getMyOrders error:', error.message);
    return Response.json({ error: 'Unable to load orders.' }, { status: 500 });
  }
});