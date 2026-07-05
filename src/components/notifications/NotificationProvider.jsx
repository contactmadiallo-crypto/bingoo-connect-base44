import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, Package, Truck, Star, Gift, AlertCircle } from "lucide-react";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export default function NotificationProvider({ children, user, userType = "customer" }) {
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { data: notifications = [] } = useQuery({
    queryKey: ['push-notifications', user?.email, userType],
    queryFn: async () => {
      if (userType === "customer") {
        return base44.entities.Notification.filter({ customer_email: user.email }, '-created_date', 50);
      } else if (userType === "driver") {
        return base44.entities.Notification.filter({ customer_email: user.email || user.phone }, '-created_date', 50);
      }
      return [];
    },
    enabled: !!user,
    refetchInterval: 15000, // Check every 15 seconds
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (notifications.length === 0) return;

    const latestNotification = notifications[0];
    
    // Check if this is a new notification
    if (lastNotificationId && latestNotification.id !== lastNotificationId) {
      showNotification(latestNotification);
    }
    
    setLastNotificationId(latestNotification.id);
  }, [notifications]);

  const showNotification = (notification) => {
    const icons = {
      order_update: Package,
      special_offer: Gift,
      loyalty_reward: Star,
      general: Bell,
      alert: AlertCircle
    };

    const Icon = icons[notification.type] || Bell;

    // Play sound if enabled
    if (soundEnabled && typeof Audio !== 'undefined') {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGWm98OWhUgwMUKXh8LRkHQU2j9XyyH0vBSh+zPHajz4JFV612+ynWBUIRp7f8r1uIAUqgM3y2Ik2Bhlov/Ppo1MNDVCl4fG0ZRwENo/V88d9LQUof83y2JA+CBVfttvsp1gVB0ae3/K9byAEKoHN8tiJNgYZaL7z6aNSDQ1QpeLxtGUcBDaP1fPHfS0FKH/N8tiQPQgVX7bb7KdYFQdGnt/yvm8gBCqBzfLYiTYGGWi+8+mjUg0NUKXi8bRlHAQ2j9Xzx30tBSh/zfLYkD0IFV+22+ynWBUHRp7f8r5vIAQqgc3y2Ik2Bhlovu');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {}
    }

    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      icon: <Icon className="w-5 h-5" />,
      duration: 5000,
      action: notification.action_url ? {
        label: "Voir",
        onClick: () => {
          if (notification.action_url.startsWith('http')) {
            window.open(notification.action_url, '_blank');
          } else {
            window.location.href = notification.action_url;
          }
        }
      } : undefined,
    });
  };

  const value = {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}