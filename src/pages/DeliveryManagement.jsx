import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, DollarSign, Navigation, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-700 border-blue-300",
  preparing: "bg-purple-100 text-purple-700 border-purple-300",
  ready: "bg-green-100 text-green-700 border-green-300",
  out_for_delivery: "bg-orange-100 text-orange-700 border-orange-300",
  delivered: "bg-gray-100 text-gray-700 border-gray-300"
};

export default function DeliveryManagement() {
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: orders } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
    refetchInterval: autoRefresh ? 5000 : false
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    },
  });

  const deliveryOrders = orders.filter(o => o.order_type === 'delivery');
  const activeDeliveries = deliveryOrders.filter(o => 
    ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
  );
  const completedDeliveries = deliveryOrders.filter(o => o.status === 'delivered');

  const handleStatusChange = (order, newStatus) => {
    updateOrderMutation.mutate({
      id: order.id,
      data: { ...order, status: newStatus }
    });
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'out_for_delivery',
      out_for_delivery: 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">🚚 Delivery Management</h1>
            <p className="text-slate-600">Real-time delivery tracking and management</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm text-slate-600">
              {autoRefresh ? 'Live Updates' : 'Paused'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Deliveries</p>
                  <p className="text-3xl font-bold text-blue-600">{activeDeliveries.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Navigation className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Out for Delivery</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {deliveryOrders.filter(o => o.status === 'out_for_delivery').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed Today</p>
                  <p className="text-3xl font-bold text-green-600">
                    {completedDeliveries.filter(o => {
                      const today = new Date().toDateString();
                      return new Date(o.created_date).toDateString() === today;
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Active Deliveries</h2>
          {activeDeliveries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active deliveries at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {activeDeliveries.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <Card className={`border-2 ${statusColors[order.status]}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{order.order_number}</CardTitle>
                          <Badge className={`${statusColors[order.status]} mt-2`}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">${order.total_amount}</p>
                          {order.estimated_time && (
                            <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {order.estimated_time} min
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                          <div>
                            <p className="font-semibold text-sm">{order.customer_name}</p>
                            <p className="text-sm text-slate-600">{order.customer_address}</p>
                          </div>
                        </div>

                        {order.customer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <a href={`tel:${order.customer_phone}`} className="text-sm text-blue-600 hover:underline">
                              {order.customer_phone}
                            </a>
                          </div>
                        )}

                        <div className="pt-3 border-t">
                          <p className="text-xs text-slate-500 mb-2">Items:</p>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <p key={idx} className="text-sm">
                                {item.quantity}x {item.name}
                              </p>
                            ))}
                          </div>
                        </div>

                        {order.special_instructions && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-slate-500 mb-1">Special Instructions:</p>
                            <p className="text-sm text-slate-700">{order.special_instructions}</p>
                          </div>
                        )}

                        {order.status !== 'delivered' && (
                          <Button
                            onClick={() => handleStatusChange(order, getNextStatus(order.status))}
                            className="w-full mt-3"
                            disabled={updateOrderMutation.isPending}
                          >
                            Mark as {getStatusLabel(getNextStatus(order.status))}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Recent Completed</h2>
          <div className="space-y-3">
            {completedDeliveries.slice(0, 5).map((order) => (
              <Card key={order.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{order.order_number}</p>
                      <p className="text-sm text-slate-600">{order.customer_name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(order.updated_date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${order.total_amount}</p>
                      <Badge className={statusColors.delivered}>Delivered</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}