import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Notifies available delivery drivers about a new order.
// Admin-only — invoked server-side from order management flows.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    const { order } = await req.json();
    if (!order) {
      return Response.json({ error: 'order is required' }, { status: 400 });
    }

    // Get all available drivers
    const allDrivers = await base44.entities.DeliveryPartner.filter({
      is_available: true,
      status: 'active'
    });

    if (!allDrivers || allDrivers.length === 0) {
      return Response.json({ success: true, notified: 0 });
    }

    // Filter drivers based on preferences and location if available
    const eligibleDrivers = allDrivers.filter(driver => {
      if (order.vehicle_type && driver.vehicle_type !== order.vehicle_type) {
        return false;
      }
      if (driver.preferred_zones && driver.preferred_zones.length > 0) {
        return true;
      }
      return true;
    });

    // Create notifications for all eligible drivers
    const notifications = [];
    for (const driver of eligibleDrivers) {
      try {
        await base44.asServiceRole.entities.Notification.create({
          customer_email: driver.email,
          title: "🚚 Nouvelle Livraison Disponible!",
          message: `${order.restaurant_name} - ${order.delivery_fee} CFA - ${order.distance_km || '?'} km`,
          type: "order_update",
          order_id: order.id,
          restaurant_id: order.restaurant_id
        });
        notifications.push(driver.id);
      } catch (error) {
        console.error(`Failed to notify driver ${driver.id}:`, error);
      }
    }

    return Response.json({
      success: true,
      notified: notifications.length,
      eligible_drivers: eligibleDrivers.length
    });
  } catch (error) {
    console.error('notifyNearbyDrivers error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});