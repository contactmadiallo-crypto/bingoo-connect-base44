import { base44 } from "@/api/base44Client";

export const OrderNotificationService = {
  // Send notification when order status changes
  async notifyOrderStatusChange(order, newStatus) {
    const statusMessages = {
      confirmed: {
        title: "✅ Commande Confirmée",
        message: `Votre commande ${order.order_number} a été confirmée par ${order.restaurant_name}`,
      },
      preparing: {
        title: "👨‍🍳 En Préparation",
        message: `${order.restaurant_name} prépare votre commande ${order.order_number}`,
      },
      ready: {
        title: "🎉 Commande Prête",
        message: `Votre commande ${order.order_number} est prête pour la livraison`,
      },
      out_for_delivery: {
        title: "🚗 En Livraison",
        message: `${order.driver_name || 'Votre chauffeur'} est en route avec votre commande ${order.order_number}`,
      },
      delivered: {
        title: "✨ Livré",
        message: `Votre commande ${order.order_number} a été livrée. Bon appétit!`,
      },
      cancelled: {
        title: "❌ Commande Annulée",
        message: `Votre commande ${order.order_number} a été annulée`,
      }
    };

    const notification = statusMessages[newStatus];
    if (!notification) return;

    // Notify customer
    await base44.entities.Notification.create({
      customer_email: order.created_by,
      title: notification.title,
      message: notification.message,
      type: "order_update",
      order_id: order.id,
      restaurant_id: order.restaurant_id,
      read: false
    });

    // Notify driver if order is assigned
    if (order.delivery_partner_id && ['ready', 'out_for_delivery'].includes(newStatus)) {
      const driverMessages = {
        ready: {
          title: "📦 Nouvelle Commande Prête",
          message: `La commande ${order.order_number} est prête pour le ramassage chez ${order.restaurant_name}`,
        },
        out_for_delivery: {
          title: "🚗 Livraison en Cours",
          message: `Vous êtes en route avec la commande ${order.order_number}`,
        }
      };

      const driverNotification = driverMessages[newStatus];
      if (driverNotification) {
        const driver = await base44.entities.DeliveryPartner.filter({ id: order.delivery_partner_id });
        if (driver[0]) {
          await base44.entities.Notification.create({
            customer_email: driver[0].email || driver[0].phone,
            title: driverNotification.title,
            message: driverNotification.message,
            type: "order_update",
            order_id: order.id,
            read: false
          });
        }
      }
    }
  },

  // Send notification for new order to restaurant
  async notifyNewOrder(order) {
    const restaurant = await base44.entities.Restaurant.filter({ id: order.restaurant_id });
    if (restaurant[0]?.owner_email) {
      await base44.entities.Notification.create({
        customer_email: restaurant[0].owner_email,
        title: "🔔 Nouvelle Commande",
        message: `Nouvelle commande ${order.order_number} de ${order.customer_name} - ${order.total_amount} CFA`,
        type: "order_update",
        order_id: order.id,
        read: false
      });
    }
  },

  // Send special offer notification
  async notifySpecialOffer(customerEmail, restaurant, offer) {
    await base44.entities.Notification.create({
      customer_email: customerEmail,
      title: `🎁 ${offer.title}`,
      message: offer.message,
      type: "special_offer",
      restaurant_id: restaurant.id,
      read: false
    });
  },

  // Send loyalty reward notification
  async notifyLoyaltyReward(customerEmail, restaurant, reward) {
    await base44.entities.Notification.create({
      customer_email: customerEmail,
      title: "⭐ Nouvelle Récompense de Fidélité",
      message: `Vous avez débloqué "${reward}" chez ${restaurant.name}!`,
      type: "loyalty_reward",
      restaurant_id: restaurant.id,
      read: false
    });
  },

  // Broadcast notification to all customers
  async broadcastToCustomers(title, message) {
    const users = await base44.entities.User.list();
    const notifications = users.map(user => ({
      customer_email: user.email,
      title,
      message,
      type: "general",
      read: false
    }));

    await base44.entities.Notification.bulkCreate(notifications);
  },

  // Send notification to drivers in area
  async notifyDriversInArea(location, title, message) {
    const drivers = await base44.entities.DeliveryPartner.filter({ 
      is_available: true,
      status: 'active'
    });

    const notifications = drivers
      .filter(d => d.current_location?.lat && d.current_location?.lng)
      .map(driver => ({
        customer_email: driver.email || driver.phone,
        title,
        message,
        type: "general",
        read: false
      }));

    if (notifications.length > 0) {
      await base44.entities.Notification.bulkCreate(notifications);
    }
  }
};