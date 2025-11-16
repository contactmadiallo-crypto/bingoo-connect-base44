import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Key } from "lucide-react";

export default function CustomerOrders({ user, onBack }) {
  const { data: orders } = useQuery({
    queryKey: ['user-orders', user.email],
    queryFn: async () => {
      const allOrders = await base44.entities.Order.list('-created_date');
      return allOrders.filter(o => o.created_by === user.email);
    },
    initialData: [],
    refetchInterval: 3000
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-orange-600">My Orders</h1>
              <p className="text-sm text-slate-600">Track your orders in real-time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600">No orders yet</p>
              </CardContent>
            </Card>
          ) : (
            orders.map(order => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{order.order_number}</h3>
                      <p className="text-sm text-orange-600 font-semibold">{order.restaurant_name}</p>
                      <p className="text-sm text-slate-600">{new Date(order.created_date).toLocaleString()}</p>
                    </div>
                    <Badge className={
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {order.status === 'out_for_delivery' && order.delivery_code && (
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-4 h-4 text-green-700" />
                        <p className="text-sm font-semibold text-green-700">Your Delivery Code:</p>
                      </div>
                      <p className="text-3xl font-bold text-green-700 text-center tracking-wider">
                        {order.delivery_code}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 text-center">Share with driver to confirm delivery</p>
                    </div>
                  )}

                  {order.driver_name && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-xs text-slate-600">Driver: {order.driver_name} ({order.driver_phone})</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                    <span>Total</span>
                    <span className="text-green-600">${order.total_amount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}