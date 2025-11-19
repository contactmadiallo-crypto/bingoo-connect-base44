import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-700 border-blue-300",
  preparing: "bg-purple-100 text-purple-700 border-purple-300",
  ready: "bg-green-100 text-green-700 border-green-300",
  out_for_delivery: "bg-orange-100 text-orange-700 border-orange-300",
  delivered: "bg-gray-100 text-gray-700 border-gray-300",
  cancelled: "bg-red-100 text-red-700 border-red-300"
};

export default function KitchenView() {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    
    // Only fetch restaurant if currentUser exists and has an email
    if (currentUser?.email) {
      const restaurants = await base44.entities.Restaurant.filter({ owner_email: currentUser.email });
      if (restaurants.length > 0) {
        setRestaurant(restaurants[0]);
      }
    }
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', restaurant?.id],
    queryFn: () => {
      if (restaurant) {
        return base44.entities.Order.filter({ restaurant_id: restaurant.id }, '-created_date');
      }
      // If no restaurant found for this user, return empty array instead of all orders
      return [];
    },
    initialData: [],
    refetchInterval: 5000,
    enabled: !!user && restaurant !== undefined, // Enable only when user and restaurant check is done
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status, order }) => {
      await base44.entities.Order.update(id, { status });
      
      // Create notification for customer
      const statusMessages = {
        'confirmed': 'Your order has been confirmed! 🎉',
        'preparing': 'Your order is now being prepared 👨‍🍳',
        'ready': 'Your order is ready! 📦',
        'out_for_delivery': 'Your order is out for delivery! 🚚',
        'delivered': 'Your order has been delivered! Enjoy! 😊'
      };

      if (statusMessages[status]) {
        await base44.entities.Notification.create({
          customer_email: order.created_by,
          title: statusMessages[status],
          message: `Order ${order.order_number} - ${statusMessages[status]}`,
          type: "order_update",
          order_id: order.id,
          restaurant_id: order.restaurant_id,
          action_url: `/OrderTracking?order=${order.order_number}` // Assuming this path for order tracking
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (order) => {
      await base44.entities.Order.update(order.id, { status: 'cancelled' });
      
      // Notify customer
      await base44.entities.Notification.create({
        customer_email: order.created_by,
        title: "Order Cancelled",
        message: `Your order ${order.order_number} has been cancelled by the restaurant.`,
        type: "order_update",
        order_id: order.id,
        restaurant_id: order.restaurant_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const activeOrders = orders.filter(o => 
    !['delivered', 'cancelled'].includes(o.status)
  );

  const updateStatus = (order, newStatus) => {
    updateOrderStatusMutation.mutate({ id: order.id, status: newStatus, order });
  };

  const moveToNextStatus = (order) => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: order.order_type === 'delivery' ? 'out_for_delivery' : 'delivered',
      out_for_delivery: 'delivered'
    };

    updateStatus(order, statusFlow[order.status]);
  };

  const cancelOrder = (order) => {
    if (confirm(`Cancel order ${order.order_number}?`)) {
      cancelOrderMutation.mutate(order);
    }
  };

  const pendingOrders = activeOrders.filter(o => o.status === 'pending');
  const preparingOrders = activeOrders.filter(o => ['confirmed', 'preparing'].includes(o.status));
  const readyOrders = activeOrders.filter(o => ['ready', 'out_for_delivery'].includes(o.status));

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🍳 Kitchen Dashboard</h1>
          <p className="text-slate-600">
            {restaurant ? `Managing orders for ${restaurant.name}` : 'Managing all orders'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                New Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">{pendingOrders.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Preparing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">{preparingOrders.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">{readyOrders.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">🆕 New Orders</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {pendingOrders.map((order) => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    onNext={() => moveToNextStatus(order)}
                    onCancel={() => cancelOrder(order)}
                  />
                ))}
              </AnimatePresence>
              {pendingOrders.length === 0 && (
                <p className="text-center text-slate-400 py-8">No new orders</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">👨‍🍳 Preparing</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {preparingOrders.map((order) => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    onNext={() => moveToNextStatus(order)}
                    onCancel={() => cancelOrder(order)}
                  />
                ))}
              </AnimatePresence>
              {preparingOrders.length === 0 && (
                <p className="text-center text-slate-400 py-8">No orders preparing</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">✅ Ready</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {readyOrders.map((order) => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    onNext={() => moveToNextStatus(order)}
                    onCancel={() => cancelOrder(order)}
                  />
                ))}
              </AnimatePresence>
              {readyOrders.length === 0 && (
                <p className="text-center text-slate-400 py-8">No ready orders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onNext, onCancel }) {
  const getNextButtonText = () => {
    switch(order.status) {
      case 'pending': return 'Confirm';
      case 'confirmed': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      case 'ready': return order.order_type === 'delivery' ? 'Out for Delivery' : 'Complete';
      case 'out_for_delivery': return 'Delivered';
      default: return 'Next';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <CardTitle className="text-lg">{order.order_number}</CardTitle>
              <p className="text-sm text-slate-600">{order.customer_name}</p>
              <p className="text-xs text-slate-500">{order.restaurant_name}</p>
            </div>
            <Badge className={`${statusColors[order.status]} border font-medium`}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              {order.order_type === 'dine_in' ? '🍽️' : order.order_type === 'takeout' ? '📦' : '🚚'} 
              {' '}{order.order_type.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">
              ⏱️ {format(new Date(order.created_date), 'HH:mm')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                {item.notes && <span className="text-slate-500 text-xs">({item.notes})</span>}
              </div>
            ))}
          </div>

          {order.special_instructions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
              <p className="text-xs font-semibold text-yellow-800">Special Instructions:</p>
              <p className="text-sm text-yellow-700">{order.special_instructions}</p>
            </div>
          )}

          <div className="border-t pt-3 mb-3">
            <p className="text-lg font-bold text-slate-900">Total: ${order.total_amount}</p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={onNext}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
            >
              {getNextButtonText()}
            </Button>
            {order.status === 'pending' && (
              <Button 
                onClick={onCancel}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}