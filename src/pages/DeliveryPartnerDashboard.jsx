
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Truck, MapPin, Phone, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function DeliveryPartnerDashboard() {
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [driverInfo, setDriverInfo] = useState({ name: "", phone: "" });

  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ['partner-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
    refetchInterval: 5000
  });

  const { data: partners } = useQuery({
    queryKey: ['partners'],
    queryFn: () => base44.entities.DeliveryPartner.list(),
    initialData: [],
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-orders'] });
      setVerifyDialog(false);
      setSelectedOrder(null);
      setVerificationCode("");
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({ id, location }) => base44.entities.Order.update(id, {
      driver_location: location
    }),
  });

  const assignedOrders = orders.filter(o => 
    o.order_type === 'delivery' && 
    ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
  );

  const handleAcceptOrder = (order) => {
    const partner = partners[0];
    updateOrderMutation.mutate({
      id: order.id,
      data: {
        ...order,
        delivery_partner_id: partner?.id,
        delivery_partner_name: partner?.company_name,
        status: 'confirmed'
      }
    });
  };

  const handlePickup = (order) => {
    setSelectedOrder(order);
    setVerifyDialog(true);
  };

  const handleOutForDelivery = () => {
    if (!driverInfo.name || !driverInfo.phone) {
      alert("Please enter driver information");
      return;
    }
    
    // Start GPS tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        updateOrderMutation.mutate({
          id: selectedOrder.id,
          data: {
            ...selectedOrder,
            driver_name: driverInfo.name,
            driver_phone: driverInfo.phone,
            driver_location: location,
            status: 'out_for_delivery'
          }
        });
        
        // Update location every 10 seconds
        const locationInterval = setInterval(() => {
          navigator.geolocation.getCurrentPosition((pos) => {
            updateLocationMutation.mutate({
              id: selectedOrder.id,
              location: {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              }
            });
          });
        }, 10000);
        
        // Store interval ID to clear later
        window.deliveryLocationInterval = locationInterval;
      });
    }
    
    setVerifyDialog(false);
  };

  const handleDeliveryComplete = (order) => {
    setSelectedOrder(order);
    setVerifyDialog(true);
  };

  const verifyDelivery = () => {
    if (selectedOrder && verificationCode === selectedOrder.delivery_code) {
      // Stop GPS tracking
      if (window.deliveryLocationInterval) {
        clearInterval(window.deliveryLocationInterval);
        delete window.deliveryLocationInterval; // Clean up the global variable
      }
      
      updateOrderMutation.mutate({
        id: selectedOrder.id,
        data: {
          ...selectedOrder,
          status: 'delivered',
          delivery_verified: true
        }
      });
    } else {
      alert("Invalid verification code!");
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🚚 Delivery Partner Dashboard</h1>
          <p className="text-slate-600">Manage pickup and delivery orders</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">New Orders</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {assignedOrders.filter(o => o.status === 'confirmed').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Transit</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {assignedOrders.filter(o => o.status === 'out_for_delivery').length}
                  </p>
                </div>
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed Today</p>
                  <p className="text-3xl font-bold text-green-600">
                    {orders.filter(o => {
                      const today = new Date().toDateString();
                      return o.status === 'delivered' && new Date(o.updated_date).toDateString() === today;
                    }).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {assignedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.order_number}</CardTitle>
                    <Badge className="mt-2">
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">${order.total_amount}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="font-semibold text-sm">{order.customer_name}</p>
                    <p className="text-sm text-slate-600">{order.customer_address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <p className="text-sm">{order.customer_phone}</p>
                </div>

                {order.estimated_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-sm">{order.estimated_time} min</p>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-xs text-slate-500 mb-2">Items:</p>
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm">{item.quantity}x {item.name}</p>
                  ))}
                </div>

                {order.driver_name && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-500">Driver: {order.driver_name} ({order.driver_phone})</p>
                  </div>
                )}

                <div className="pt-3">
                  {order.status === 'confirmed' && (
                    <Button onClick={() => handleAcceptOrder(order)} className="w-full">
                      Accept Order
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button onClick={() => handlePickup(order)} className="w-full">
                      Pick Up & Start Delivery
                    </Button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <Button onClick={() => handleDeliveryComplete(order)} className="w-full bg-green-600 hover:bg-green-700">
                      Complete Delivery
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOrder?.status === 'ready' ? 'Assign Driver & Enable GPS' : 'Verify Delivery'}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder?.status === 'ready' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-slate-700">
                  📍 GPS tracking will start automatically. Customer will see your real-time location on the map.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Driver Name *</Label>
                <Input value={driverInfo.name} onChange={(e) => setDriverInfo({...driverInfo, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Driver Phone *</Label>
                <Input value={driverInfo.phone} onChange={(e) => setDriverInfo({...driverInfo, phone: e.target.value})} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Enter the 4-digit verification code from the customer:</p>
              <Input 
                placeholder="4-digit code" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={4}
                className="text-center text-2xl tracking-widest"
              />
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 mb-2">🔒 Security Note:</p>
                <p className="text-xs text-amber-800">
                  • Customer must provide this code to complete delivery<br/>
                  • Without correct code, order cannot be marked as delivered<br/>
                  • This prevents fraudulent delivery completions<br/>
                  • Your delivery history and rating are tracked
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog(false)}>Cancel</Button>
            <Button onClick={selectedOrder?.status === 'ready' ? handleOutForDelivery : verifyDelivery}>
              {selectedOrder?.status === 'ready' ? 'Start Delivery & GPS' : 'Verify & Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
