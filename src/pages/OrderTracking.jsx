import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Clock, Package, Truck, MapPin } from "lucide-react";

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'ready', label: 'Ready', icon: CheckCircle },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin }
];

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrder, setSearchedOrder] = useState(null);

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
  });

  const handleSearch = () => {
    const found = orders.find(o => o.order_number === orderNumber.trim());
    setSearchedOrder(found || null);
  };

  const getStatusIndex = (status) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">📦 Track Your Order</h1>
          <p className="text-slate-600">Enter your order number to see real-time status</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Enter order number (e.g., ORD-123456789)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-500 to-purple-500">
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchedOrder ? (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{searchedOrder.order_number}</CardTitle>
                    <p className="text-slate-600 mt-1">{searchedOrder.customer_name}</p>
                  </div>
                  <Badge className="text-lg px-4 py-2">
                    {searchedOrder.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    {statusSteps.map((step, idx) => {
                      const currentIndex = getStatusIndex(searchedOrder.status);
                      const isCompleted = idx <= currentIndex;
                      const isCurrent = idx === currentIndex;
                      const Icon = step.icon;

                      return (
                        <div key={step.key} className="flex-1 relative">
                          <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                              isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
                            } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <p className={`text-xs text-center ${isCompleted ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                              {step.label}
                            </p>
                          </div>
                          {idx < statusSteps.length - 1 && (
                            <div className={`absolute top-6 left-1/2 w-full h-1 ${
                              idx < currentIndex ? 'bg-green-500' : 'bg-slate-200'
                            }`} style={{ zIndex: -1 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Order Details</h3>
                    <div className="space-y-2">
                      {searchedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-green-600">${searchedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Delivery Info</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-600">Order Type: </span>
                        <span className="font-semibold">{searchedOrder.order_type.replace('_', ' ')}</span>
                      </div>
                      {searchedOrder.customer_phone && (
                        <div>
                          <span className="text-slate-600">Phone: </span>
                          <span className="font-semibold">{searchedOrder.customer_phone}</span>
                        </div>
                      )}
                      {searchedOrder.customer_address && (
                        <div>
                          <span className="text-slate-600">Address: </span>
                          <span className="font-semibold">{searchedOrder.customer_address}</span>
                        </div>
                      )}
                      {searchedOrder.estimated_time && (
                        <div>
                          <span className="text-slate-600">Estimated Time: </span>
                          <span className="font-semibold">{searchedOrder.estimated_time} minutes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : orderNumber && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">No order found with number: {orderNumber}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}