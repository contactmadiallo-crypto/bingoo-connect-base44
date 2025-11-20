import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle, MapPin, Phone, Clock, Key, User, Star, Store, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import DeliveryMap from "../components/DeliveryMap";

const deliveryStatuses = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'ready', label: 'Ready', icon: CheckCircle },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const pickupStatuses = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'ready', label: 'Ready for Pickup', icon: Store },
];

const dineInStatuses = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'ready', label: 'Ready to Serve', icon: UtensilsCrossed },
];

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [preparationTime, setPreparationTime] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get('order');
    if (orderParam) {
      setOrderNumber(orderParam);
    }
  }, []);

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
    refetchInterval: 3000
  });

  const searchOrder = () => {
    return orders.find(o => o.order_number === orderNumber.trim());
  };

  const order = searchOrder();
  
  // Select appropriate status flow based on order type
  const statuses = order?.order_type === 'delivery' ? deliveryStatuses 
    : order?.order_type === 'takeout' ? pickupStatuses 
    : dineInStatuses;
  
  const currentStatusIndex = statuses.findIndex(s => s.key === order?.status);

  // Calculate real-time preparation time
  useEffect(() => {
    if (!order || !['preparing'].includes(order.status)) {
      setPreparationTime(0);
      return;
    }

    const calculateTime = () => {
      const startTime = new Date(order.updated_date || order.created_date);
      const now = new Date();
      const elapsed = Math.floor((now - startTime) / 1000 / 60); // minutes
      setPreparationTime(elapsed);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [order?.status, order?.updated_date]);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">📦 Track Your Order</h1>
          <p className="text-slate-600">Enter your order number to see real-time status and location</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter order number (e.g., ORD-123456)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={searchOrder}>
                <Search className="w-4 h-4 mr-2" />
                Track
              </Button>
            </div>
          </CardContent>
        </Card>

        {order ? (
          <div className="space-y-6">
            {/* Order Type Badge */}
            <div className="flex justify-center">
              <Badge variant="outline" className="text-lg px-6 py-3">
                {order.order_type === 'delivery' && '🚚 Delivery Order'}
                {order.order_type === 'takeout' && '🛍️ Pickup Order'}
                {order.order_type === 'dine_in' && '🍽️ Dine-In Order'}
              </Badge>
            </div>

            {/* Real-time Preparation Timer */}
            {order.status === 'preparing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-6 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Package className="w-8 h-8 text-orange-600 animate-pulse" />
                  <h3 className="text-2xl font-bold text-orange-700">Your Order is Being Prepared</h3>
                </div>
                <div className="text-5xl font-bold text-orange-600 mb-2">
                  {preparationTime} min
                </div>
                <p className="text-sm text-slate-600">
                  {order.order_type === 'takeout' && `Estimated ready in ${Math.max(0, (order.estimated_time || 20) - preparationTime)} minutes`}
                  {order.order_type === 'dine_in' && 'Your food will be served shortly'}
                  {order.order_type === 'delivery' && 'Preparing for delivery'}
                </p>
              </motion.div>
            )}

            {/* Ready for Pickup Alert */}
            {order.status === 'ready' && order.order_type === 'takeout' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6 text-center"
              >
                <Store className="w-16 h-16 text-green-600 mx-auto mb-3" />
                <h3 className="text-3xl font-bold text-green-700 mb-2">Ready for Pickup! 🎉</h3>
                <p className="text-lg text-slate-700 mb-4">Your order is ready. Please come pick it up!</p>
                <div className="bg-white rounded-lg p-4 inline-block">
                  <p className="text-sm text-slate-600 mb-1">Pickup Location:</p>
                  <p className="font-bold text-slate-900">{order.restaurant_name}</p>
                </div>
              </motion.div>
            )}

            {/* Show map if delivery order and driver location available */}
            {order.order_type === 'delivery' && order.status === 'out_for_delivery' && order.driver_location && (
              <DeliveryMap order={order} />
            )}

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{order.order_number}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Ordered on {new Date(order.created_date).toLocaleDateString()} at {new Date(order.created_date).toLocaleTimeString()}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {order.restaurant_name}
                    </p>
                  </div>
                  <Badge className="text-lg px-4 py-2">
                    {statuses.find(s => s.key === order.status)?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-8">
                  <div className="flex justify-between">
                    {statuses.map((status, idx) => {
                      const Icon = status.icon;
                      const isActive = idx <= currentStatusIndex;
                      return (
                        <div key={status.key} className="flex flex-col items-center flex-1 relative">
                          {idx < statuses.length - 1 && (
                            <div 
                              className={`absolute top-5 left-[50%] w-full h-1 -z-10 ${
                                idx < currentStatusIndex ? 'bg-green-500' : 'bg-slate-200'
                              }`}
                            />
                          )}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                              isActive ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </motion.div>
                          <p className={`text-xs text-center ${isActive ? 'font-semibold' : 'text-slate-500'}`}>
                            {status.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-6 border-t">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      {order.order_type === 'delivery' ? <MapPin className="w-4 h-4 text-slate-400 mt-1" /> : <Store className="w-4 h-4 text-slate-400 mt-1" />}
                      <div>
                        <p className="text-sm font-semibold">{order.customer_name}</p>
                        {order.order_type === 'delivery' && order.customer_address && (
                          <p className="text-sm text-slate-600">{order.customer_address}</p>
                        )}
                        {order.order_type !== 'delivery' && (
                          <p className="text-sm text-slate-600">Pickup at {order.restaurant_name}</p>
                        )}
                      </div>
                    </div>

                    {order.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <p className="text-sm">{order.customer_phone}</p>
                      </div>
                    )}

                    {order.estimated_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <p className="text-sm">
                          {order.order_type === 'delivery' ? `Est. delivery in ${order.estimated_time} min` : `Est. ready in ${order.estimated_time} min`}
                        </p>
                      </div>
                    )}

                    {order.table_number && order.order_type === 'dine_in' && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm text-purple-700 font-semibold">Table Number</p>
                        <p className="text-2xl font-bold text-purple-600">{order.table_number}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {order.order_type === 'delivery' && order.driver_name && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-700" />
                          <p className="text-sm font-semibold text-blue-700">Your Driver:</p>
                        </div>
                        <p className="font-semibold">{order.driver_name}</p>
                        <p className="text-sm text-slate-600">{order.driver_phone}</p>
                        {order.vehicle_type && (
                          <Badge variant="outline" className="mt-2">
                            {order.vehicle_type}
                          </Badge>
                        )}
                        {order.customer_rating && (
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < order.customer_rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {order.delivery_code && order.order_type === 'delivery' && order.status === 'out_for_delivery' && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-4 h-4 text-green-700" />
                          <p className="text-sm font-semibold text-green-700">Your Delivery Code:</p>
                        </div>
                        <p className="text-3xl font-bold text-green-700 text-center tracking-wider">
                          {order.delivery_code}
                        </p>
                        <p className="text-xs text-slate-600 mt-2">
                          Share this code with the driver to confirm delivery
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t mt-4">
                  <p className="text-sm font-semibold mb-3">Order Items:</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-semibold">{(item.price * item.quantity).toFixed(0)} CFA</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                    <span>Total</span>
                    <span className="text-green-600">{order.total_amount.toFixed(0)} CFA</span>
                  </div>
                </div>

                {order.order_type === 'delivery' && !order.driver_location && order.status === 'out_for_delivery' && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-sm text-amber-800">
                      📍 Waiting for driver to activate GPS tracking...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : orderNumber ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Order not found. Please check your order number.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}