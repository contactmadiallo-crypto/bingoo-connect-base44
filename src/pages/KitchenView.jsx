import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, CheckCircle, AlertCircle, ChefHat, Flame, Package, Search, Filter } from "lucide-react";
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
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: allRestaurants = [] } = useQuery({
    queryKey: ['all-restaurants', user?.email],
    queryFn: () => base44.entities.Restaurant.filter({ owner_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const restaurant = allRestaurants.find(r => r.id === selectedRestaurantId) || allRestaurants[0];

  const handleRestaurantChange = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', selectedRestaurantId],
    queryFn: () => {
      if (selectedRestaurantId) {
        return base44.entities.Order.filter({ restaurant_id: selectedRestaurantId }, '-created_date');
      }
      return [];
    },
    initialData: [],
    refetchInterval: 5000,
    staleTime: 2000,
    enabled: !!selectedRestaurantId,
  });

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status, order }) => {
      const updateData = { status };

      // Calculate delivery fee based on distance when order becomes ready
      if (status === 'ready' && order.order_type === 'delivery' && order.customer_location) {
        try {
          const restaurantData = await base44.entities.Restaurant.filter({ id: order.restaurant_id });
          if (restaurantData[0]?.address) {
            // Get restaurant coordinates (you may need to geocode the address)
            // For now, use customer_location as reference
            const distance = order.distance_km || 5; // Default to 5km if not calculated

            // Calculate delivery fee: 500 CFA base + 200 CFA per km
            const baseDeliveryFee = 500;
            const perKmRate = 200;
            const calculatedDeliveryFee = baseDeliveryFee + (distance * perKmRate);

            // Driver gets 70% of delivery fee
            const driverEarnings = calculatedDeliveryFee * 0.7;

            updateData.delivery_fee = calculatedDeliveryFee;
            updateData.driver_earnings = driverEarnings;
            updateData.distance_km = distance;
          }
        } catch (error) {
          console.error('Failed to calculate delivery fee:', error);
          // Fallback to default
          updateData.delivery_fee = 1500;
          updateData.driver_earnings = 1050;
        }
      }

      await base44.entities.Order.update(id, updateData);

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
          action_url: `/OrderTracking?order=${order.order_number}`
        });
      }

      // When order becomes ready for delivery, system will automatically show it to drivers
      // No need to send individual notifications as RealtimeNotificationSystem handles it
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

  const filteredActiveOrders = activeOrders.filter(order => {
    const matchSearch = !searchQuery.trim() || 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    const matchType = orderTypeFilter === "all" || order.order_type === orderTypeFilter;
    
    return matchSearch && matchStatus && matchType;
  });

  const pendingOrders = filteredActiveOrders.filter(o => o.status === 'pending');
  const preparingOrders = filteredActiveOrders.filter(o => ['confirmed', 'preparing'].includes(o.status));
  const readyOrders = filteredActiveOrders.filter(o => ['ready', 'out_for_delivery'].includes(o.status));

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
                Kitchen Dashboard
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                {restaurant ? `${restaurant.name}` : 'Select a restaurant'}
              </p>
            </div>
            {allRestaurants.length > 0 && (
              <div className="w-full sm:w-72">
                <Select value={selectedRestaurantId} onValueChange={handleRestaurantChange}>
                  <SelectTrigger className="w-full bg-white shadow-sm border-2 border-orange-200 h-12">
                    <SelectValue placeholder="Select Restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {allRestaurants.map((rest) => (
                      <SelectItem key={rest.id} value={rest.id}>
                        <div className="flex items-center gap-2">
                          <span>{rest.name}</span>
                          <Badge variant="outline" className="text-xs">{rest.business_type}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {selectedRestaurantId && (
            <div className="mt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par numéro ou nom du client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les Statuts</SelectItem>
                    <SelectItem value="pending">En Attente</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="preparing">En Préparation</SelectItem>
                    <SelectItem value="ready">Prêt</SelectItem>
                    <SelectItem value="out_for_delivery">En Livraison</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les Types</SelectItem>
                    <SelectItem value="dine_in">Sur Place</SelectItem>
                    <SelectItem value="takeout">À Emporter</SelectItem>
                    <SelectItem value="delivery">Livraison</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {!selectedRestaurantId ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <ChefHat className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Select a Restaurant</h2>
              <p className="text-slate-600">Choose a restaurant to manage orders</p>
            </CardContent>
          </Card>
        ) : (
          <>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl border-0 hover:scale-105 transition-transform">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                New Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl sm:text-5xl font-bold">{pendingOrders.length}</p>
              <p className="text-sm text-white/80 mt-1">Needs confirmation</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl border-0 hover:scale-105 transition-transform">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                Preparing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl sm:text-5xl font-bold">{preparingOrders.length}</p>
              <p className="text-sm text-white/80 mt-1">Being cooked</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl border-0 hover:scale-105 transition-transform">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl sm:text-5xl font-bold">{readyOrders.length}</p>
              <p className="text-sm text-white/80 mt-1">For pickup/delivery</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">New Orders</h2>
              {pendingOrders.length > 0 && (
                <Badge className="bg-orange-500">{pendingOrders.length}</Badge>
              )}
            </div>
            <div className="space-y-3 sm:space-y-4">
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
                <Card className="bg-white/50 backdrop-blur border-dashed">
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No new orders</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Preparing</h2>
              {preparingOrders.length > 0 && (
                <Badge className="bg-purple-500">{preparingOrders.length}</Badge>
              )}
            </div>
            <div className="space-y-3 sm:space-y-4">
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
                <Card className="bg-white/50 backdrop-blur border-dashed">
                  <CardContent className="py-12 text-center">
                    <Flame className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No orders cooking</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Ready</h2>
              {readyOrders.length > 0 && (
                <Badge className="bg-green-500">{readyOrders.length}</Badge>
              )}
            </div>
            <div className="space-y-3 sm:space-y-4">
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
                <Card className="bg-white/50 backdrop-blur border-dashed">
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No ready orders</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onNext, onCancel }) {
  const getNextButtonText = () => {
    switch(order.status) {
      case 'pending': return '✓ Confirm Order';
      case 'confirmed': return '🔥 Start Cooking';
      case 'preparing': return '✓ Mark Ready';
      case 'ready': return order.order_type === 'delivery' ? '🚚 Out for Delivery' : '✓ Complete';
      case 'out_for_delivery': return '✓ Delivered';
      default: return 'Next';
    }
  };

  const getTimeSince = () => {
    const minutes = Math.floor((Date.now() - new Date(order.created_date)) / 60000);
    return minutes;
  };

  const minutes = getTimeSince();
  const isUrgent = minutes > 15;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-white shadow-lg hover:shadow-xl transition-all border-l-4 ${
        isUrgent ? 'border-l-red-500' : 'border-l-orange-400'
      }`}>
        <CardHeader className="pb-3 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                {order.order_number}
              </CardTitle>
              <p className="text-sm text-slate-600 font-medium">{order.customer_name}</p>
            </div>
            <Badge className={`${statusColors[order.status]} border-2 font-semibold text-xs whitespace-nowrap`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs font-medium">
              {order.order_type === 'dine_in' ? '🍽️ Dine In' : order.order_type === 'takeout' ? '📦 Takeout' : '🚚 Delivery'}
            </Badge>
            <Badge variant={isUrgent ? "destructive" : "outline"} className="text-xs font-medium">
              ⏱️ {minutes}m ago
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-sm">
                <div className="flex-1">
                  <span className="font-semibold text-slate-900">{item.quantity}x</span>
                  <span className="ml-2 text-slate-700">{item.name}</span>
                  {item.notes && (
                    <p className="text-xs text-amber-700 mt-1 ml-6 italic">Note: {item.notes}</p>
                  )}
                </div>
                <span className="text-slate-600 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {order.special_instructions && (
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-3">
              <p className="text-xs font-bold text-amber-900 mb-1">📝 Special Instructions:</p>
              <p className="text-sm text-amber-800">{order.special_instructions}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t-2 border-slate-200">
            <span className="text-sm font-semibold text-slate-600">Total:</span>
            <span className="text-xl font-bold text-orange-600">${order.total_amount.toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={onNext}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md font-semibold h-11"
            >
              {getNextButtonText()}
            </Button>
            {order.status === 'pending' && (
              <Button 
                onClick={onCancel}
                variant="outline"
                className="text-red-600 border-2 border-red-300 hover:bg-red-50 font-semibold h-11 px-4"
              >
                ✕
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}