export default async function notifyNearbyDrivers({ order, base44 }) {
  // Get all available drivers
  const allDrivers = await base44.entities.DeliveryPartner.filter({ 
    is_available: true,
    status: 'active'
  });
  
  if (!allDrivers || allDrivers.length === 0) {
    return { success: true, notified: 0 };
  }
  
  // Filter drivers based on preferences and location if available
  const eligibleDrivers = allDrivers.filter(driver => {
    // Check if driver accepts this vehicle type requirement
    if (order.vehicle_type && driver.vehicle_type !== order.vehicle_type) {
      return false;
    }
    
    // Check if delivery is in driver's preferred zones (if they have preferences)
    if (driver.preferred_zones && driver.preferred_zones.length > 0) {
      // For now, include all drivers - zone matching can be enhanced later
      return true;
    }
    
    return true;
  });
  
  // Create notifications for all eligible drivers
  const notifications = [];
  for (const driver of eligibleDrivers) {
    try {
      await base44.entities.Notification.create({
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
  
  return { 
    success: true, 
    notified: notifications.length,
    eligible_drivers: eligibleDrivers.length
  };
}