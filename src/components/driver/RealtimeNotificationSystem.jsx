import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Navigation, DollarSign, MapPin, Clock, Package } from "lucide-react";
import { toast } from "sonner";

// Notification sound (simple beep encoded in base64)
const NOTIFICATION_SOUND = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSmJ0/DWhC4HGmy28eB7MgYdhM/y04IvBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eFzNgYdhM/y0YIuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4XQ1Bh6Ey/LRgS4HHmq28eF0NQYehMvy0YEuBx5qtvHhdDUGHoTL8tGBLgcearbx4Q==";

export default function RealtimeNotificationSystem({ 
  orders = [], 
  driver,
  onAcceptOrder,
  onViewOrder 
}) {
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [notifiedOrderIds, setNotifiedOrderIds] = useState(new Set());
  const audioRef = useRef(null);
  const previousOrdersRef = useRef([]);

  useEffect(() => {
    // Initialize audio
    if (!audioRef.current) {
      audioRef.current = new Audio(NOTIFICATION_SOUND);
      audioRef.current.volume = 0.5;
    }
  }, []);

  useEffect(() => {
    if (!driver?.is_available) return;

    // Filter ready orders not yet assigned
    const readyOrders = orders.filter(o => 
      o.status === 'ready' && 
      o.order_type === 'delivery' && 
      !o.delivery_partner_id
    );

    // Detect new orders
    const previousOrderIds = previousOrdersRef.current.map(o => o.id);
    const newOrders = readyOrders.filter(o => 
      !previousOrderIds.includes(o.id) && 
      !notifiedOrderIds.has(o.id)
    );

    if (newOrders.length > 0) {
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }

      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      // Add to displayed orders
      setDisplayedOrders(prev => [...newOrders, ...prev]);
      
      // Mark as notified
      setNotifiedOrderIds(prev => {
        const newSet = new Set(prev);
        newOrders.forEach(o => newSet.add(o.id));
        return newSet;
      });

      // Show toast notification
      newOrders.forEach(order => {
        toast.success(`🚚 Nouvelle Livraison Disponible!`, {
          description: `${order.restaurant_name} - ${(order.delivery_fee || 0).toFixed(0)} CFA`,
          duration: 8000,
          action: {
            label: "Accepter",
            onClick: () => onAcceptOrder(order)
          }
        });
      });
    }

    previousOrdersRef.current = readyOrders;
  }, [orders, driver?.is_available, notifiedOrderIds, onAcceptOrder]);

  const handleDismiss = (orderId) => {
    setDisplayedOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleAccept = (order) => {
    handleDismiss(order.id);
    onAcceptOrder(order);
  };

  if (!driver?.is_available || displayedOrders.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <AnimatePresence>
        {displayedOrders.slice(0, 3).map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: index * 10, 
              scale: 1,
              transition: { type: "spring", stiffness: 500, damping: 30 }
            }}
            exit={{ opacity: 0, x: 300, transition: { duration: 0.2 } }}
            className="mb-3"
          >
            <Card className="border-4 border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 shadow-2xl animate-pulse-slow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-orange-900 text-lg">Nouvelle Livraison!</p>
                      <Badge className="bg-orange-600 text-white">Vient d'arriver</Badge>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDismiss(order.id)}
                    className="h-8 w-8 hover:bg-orange-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      <p className="font-bold text-slate-900">{order.restaurant_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{order.distance_km ? `${order.distance_km.toFixed(1)} km` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{order.estimated_time || 30} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm">Vous gagnerez</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {(order.driver_earnings || order.delivery_fee * 0.7 || 0).toFixed(0)} CFA
                      </p>
                    </div>
                    {order.tip_amount > 0 && (
                      <p className="text-xs text-green-100 mt-1">+ Pourboire possible</p>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 bg-white rounded p-2">
                    <p><strong>Commande:</strong> {order.order_number}</p>
                    <p><strong>Client:</strong> {order.customer_name}</p>
                    <p className="truncate"><strong>Adresse:</strong> {order.customer_address}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onViewOrder(order)}
                    variant="outline"
                    className="flex-1 border-2 border-orange-300 hover:bg-orange-50"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Voir Carte
                  </Button>
                  <Button
                    onClick={() => handleAccept(order)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Accepter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}