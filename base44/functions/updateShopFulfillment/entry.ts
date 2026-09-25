import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const APP_URL = 'https://bingooconnect.com';
const MANUFACTURING = new Set(['pending','device_allocated','in_production','programmed','ready_to_ship','shipped']);
const FULFILLMENT = new Set(['processing','ready_to_ship','shipped','delivered','cancelled']);
const MANUFACTURING_TRANSITIONS = {
  pending: new Set(['device_allocated']),
  device_allocated: new Set(['in_production']),
  in_production: new Set(['programmed']),
  programmed: new Set(['ready_to_ship']),
  ready_to_ship: new Set(['shipped']),
  shipped: new Set([]),
};
const FULFILLMENT_TRANSITIONS = {
  processing: new Set(['ready_to_ship','cancelled']),
  ready_to_ship: new Set(['shipped','cancelled']),
  shipped: new Set(['delivered']),
  delivered: new Set([]),
  cancelled: new Set([]),
};

function canTransition(map, current, next) {
  if (!next || next === current) return true;
  return Boolean(map[current]?.has(next));
}

function carrierTrackingUrl(carrier, number) {
  const n = encodeURIComponent(String(number || '').trim());
  const c = String(carrier || '').toLowerCase();
  if (!n) return '';
  if (c === 'usps') return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
  if (c === 'ups') return `https://www.ups.com/track?tracknum=${n}`;
  if (c === 'fedex') return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
  if (c === 'dhl') return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`;
  return '';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required.' }, { status: 403 });

    const body = await req.json();
    const orderId = String(body.order_id || '').trim();
    if (!orderId) return Response.json({ error: 'order_id is required.' }, { status: 400 });
    const order = await base44.asServiceRole.entities.ShopOrder.get(orderId);
    if (!order) return Response.json({ error: 'Order not found.' }, { status: 404 });

    const update = {};
    if (body.manufacturing_status) {
      if (!MANUFACTURING.has(body.manufacturing_status)) return Response.json({ error: 'Invalid manufacturing status.' }, { status: 400 });
      const current = order.manufacturing_status || 'pending';
      if (!canTransition(MANUFACTURING_TRANSITIONS, current, body.manufacturing_status)) {
        return Response.json({ error: `Invalid manufacturing transition: ${current} → ${body.manufacturing_status}.` }, { status: 409 });
      }
      update.manufacturing_status = body.manufacturing_status;
      if (body.manufacturing_status === 'ready_to_ship') update.fulfillment_status = 'ready_to_ship';
    }
    if (body.fulfillment_status) {
      if (!FULFILLMENT.has(body.fulfillment_status)) return Response.json({ error: 'Invalid fulfillment status.' }, { status: 400 });
      const current = order.fulfillment_status || 'processing';
      if (!canTransition(FULFILLMENT_TRANSITIONS, current, body.fulfillment_status)) {
        return Response.json({ error: `Invalid fulfillment transition: ${current} → ${body.fulfillment_status}.` }, { status: 409 });
      }
      update.fulfillment_status = body.fulfillment_status;
      if (body.fulfillment_status === 'delivered') update.delivered_at = new Date().toISOString();
    }

    const carrier = body.carrier !== undefined ? String(body.carrier || '').trim() : order.carrier || '';
    const trackingNumber = body.tracking_number !== undefined ? String(body.tracking_number || '').trim() : order.tracking_number || '';
    if (body.carrier !== undefined) update.carrier = carrier;
    if (body.tracking_number !== undefined) update.tracking_number = trackingNumber;
    if (body.estimated_delivery !== undefined) update.estimated_delivery = body.estimated_delivery || null;

    if (trackingNumber) {
      const currentMfg = order.manufacturing_status || 'pending';
      const currentFulfillment = order.fulfillment_status || 'processing';
      if (currentMfg !== 'ready_to_ship' && currentMfg !== 'shipped') {
        return Response.json({ error: 'Order must complete production and be ready to ship before tracking can be assigned.' }, { status: 409 });
      }
      if (currentFulfillment !== 'ready_to_ship' && currentFulfillment !== 'shipped') {
        return Response.json({ error: 'Order must be ready to ship before tracking can be assigned.' }, { status: 409 });
      }
      update.tracking_url = String(body.tracking_url || '').trim() || carrierTrackingUrl(carrier, trackingNumber);
      update.fulfillment_status = 'shipped';
      update.manufacturing_status = 'shipped';
      update.shipped_at = order.shipped_at || new Date().toISOString();
    }

    if (Object.keys(update).length === 0) return Response.json({ error: 'No valid fulfillment changes supplied.' }, { status: 400 });

    const updated = await base44.asServiceRole.entities.ShopOrder.update(orderId, update);

    try {
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: 'shop_fulfillment_updated',
        performed_by: user.id,
        performed_by_name: user.full_name || user.name || '',
        performed_by_email: user.email || '',
        target_type: 'ShopOrder',
        target_id: orderId,
        target_name: order.order_number || orderId,
        old_value: JSON.stringify({ manufacturing_status: order.manufacturing_status, fulfillment_status: order.fulfillment_status, carrier: order.carrier, tracking_number: order.tracking_number }),
        new_value: JSON.stringify(update),
        notes: 'Server-validated manufacturing/fulfillment transition',
      });
    } catch (auditErr) {
      console.error('Fulfillment audit log failed (non-blocking):', auditErr.message);
    }

    if (trackingNumber && !order.shipped_email_sent_at) {
      const orderNumber = order.order_number || orderId;
      const trackPage = `${APP_URL}/my-orders?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(order.customer_email || '')}`;
      const carrierLabel = carrier || 'the carrier';
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: order.customer_email,
          subject: `Your Bingoo order ${orderNumber} has shipped`,
          from_name: 'Bingoo Connect',
          body: `Hi ${order.customer_name || 'there'},\n\nYour Bingoo order has shipped.\n\nOrder: ${orderNumber}\nCarrier: ${carrierLabel}\nTracking number: ${trackingNumber}\n${update.tracking_url ? `Carrier tracking: ${update.tracking_url}\n` : ''}\nTrack your Bingoo order: ${trackPage}\n\nThank you for choosing Bingoo Connect.`,
        });
        await base44.asServiceRole.entities.ShopOrder.update(orderId, { shipped_email_sent_at: new Date().toISOString() });
      } catch (e) {
        console.error('Shipped email failed (retryable):', e.message);
      }
    }

    return Response.json({ success: true, order: updated });
  } catch (error) {
    console.error('updateShopFulfillment error:', error.message);
    return Response.json({ error: error.message || 'Unable to update fulfillment.' }, { status: 500 });
  }
});