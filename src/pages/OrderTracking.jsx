import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle, MapPin, Phone, Clock, Key } from "lucide-react";
import { motion } from "framer-motion";
import DeliveryMap from "../components/DeliveryMap";

const statuses = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'ready', label: 'Ready', icon: CheckCircle },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
    refetchInterval: 5000
  });

  const searchOrder = () => {
    return orders.find(o => o.order_number === orderNumber.trim());
  };

  const order = searchOrder();
  const currentStatusIndex = statuses.findIndex(s => s.key === order?.status);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">📦 Track Your Order</h1>
          <p className="text-slate-600">Enter your order number to see real-time status</p>
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
            {/* Show map if delivery order and driver assigned */}
            {order.order_type === 'delivery' && order.status === 'out_for_delivery' && (
              <DeliveryMap order={order} />
            )}

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{order.order_number}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Ordered on {new Date(order.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="text-lg px-4 py-2">
                    {statuses.find(s => s.key === order.status)?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="flex justify-between mb-8">
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
                      <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                      <div>
                        <p className="text-sm font-semibold">{order.customer_name}</p>
                        {order.customer_address && (
                          <p className="text-sm text-slate-600">{order.customer_address}</p>
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
                        <p className="text-sm">Est. {order.estimated_time} minutes</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {order.driver_name && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Driver Assigned:</p>
                        <p className="font-semibold">{order.driver_name}</p>
                        <p className="text-sm text-slate-600">{order.driver_phone}</p>
                        {order.vehicle_type && (
                          <Badge variant="outline" className="mt-2">
                            {order.vehicle_type}
                          </Badge>
                        )}
                      </div>
                    )}

                    {order.delivery_code && order.status === 'out_for_delivery' && (
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
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                    <span>Total</span>
                    <span className="text-green-600">${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
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