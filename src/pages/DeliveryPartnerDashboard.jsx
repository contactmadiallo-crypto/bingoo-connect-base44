
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Truck, MapPin, Phone, Clock, CheckCircle, AlertCircle, DollarSign, TrendingUp, Star, Bell, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeliveryPartnerDashboard() {
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [driverInfo, setDriverInfo] = useState({ name: "", phone: "" });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationOrder, setNotificationOrder] = useState(null);
  const [dialogMode, setDialogMode] = useState("verify"); // "pickup" or "verify"
  const [locationPreferences, setLocationPreferences] = useState({
    location_sharing_enabled: true,
    share_location_only_when_active: true,
    auto_disable_location_after_delivery: true
  });

  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ['partner-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
    refetchInterval: 3000
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

  const updatePartnerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DeliveryPartner.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setSettingsDialog(false);
    },
  });

  const currentPartner = partners[0];
  const myDeliveries = orders.filter(o => o.delivery_partner_id === currentPartner?.id);
  const completedDeliveries = myDeliveries.filter(o => o.status === 'delivered');
  
  const assignedOrders = orders.filter(o => 
    o.order_type === 'delivery' && 
    ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
  );

  // Real-time notification for new orders
  useEffect(() => {
    const newOrders = assignedOrders.filter(o => o.status === 'confirmed' && !o.delivery_partner_id);
    if (newOrders.length > 0 && !showNotification) {
      setNotificationOrder(newOrders[0]);
      setShowNotification(true);
    }
  }, [assignedOrders]);

  // Load current partner preferences
  useEffect(() => {
    if (currentPartner) {
      setLocationPreferences({
        location_sharing_enabled: currentPartner.location_sharing_enabled !== false,
        share_location_only_when_active: currentPartner.share_location_only_when_active !== false,
        auto_disable_location_after_delivery: currentPartner.auto_disable_location_after_delivery !== false
      });
    }
  }, [currentPartner]);

  const earnings = {
    today: completedDeliveries.filter(o => {
      const today = new Date().toDateString();
      return new Date(o.updated_date).toDateString() === today;
    }).reduce((sum, o) => sum + (o.driver_earnings || o.delivery_fee * 0.85) + (o.tip_amount || 0), 0),
    
    thisWeek: completedDeliveries.filter(o => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(o.updated_date) >= weekAgo;
    }).reduce((sum, o) => sum + (o.driver_earnings || o.delivery_fee * 0.85) + (o.tip_amount || 0), 0),
    
    total: completedDeliveries.reduce((sum, o) => sum + (o.driver_earnings || o.delivery_fee * 0.85) + (o.tip_amount || 0), 0),
    
    tips: completedDeliveries.reduce((sum, o) => sum + (o.tip_amount || 0), 0),
    
    avgRating: completedDeliveries.filter(o => o.customer_rating).length > 0
      ? (completedDeliveries.reduce((sum, o) => sum + (o.customer_rating || 0), 0) / 
         completedDeliveries.filter(o => o.customer_rating).length).toFixed(1)
      : 'N/A'
  };

  const canShareLocation = () => {
    if (!currentPartner) return false;
    if (!locationPreferences.location_sharing_enabled) return false;
    if (locationPreferences.share_location_only_when_active) {
      const hasActiveDelivery = myDeliveries.some(o => o.status === 'out_for_delivery');
      return hasActiveDelivery;
    }
    return true;
  };

  const handleAcceptOrder = (order) => {
    const partner = partners[0];
    const driverEarnings = order.delivery_fee * (partner?.commission_rate === 12 ? 0.88 : 0.85);
    
    updateOrderMutation.mutate({
      id: order.id,
      data: {
        ...order,
        delivery_partner_id: partner?.id,
        delivery_partner_name: partner?.company_name || partner?.full_name,
        driver_earnings: driverEarnings,
        status: 'confirmed'
      }
    });
    setShowNotification(false);
  };

  const handlePickup = (order) => {
    setSelectedOrder(order);
    setDialogMode("pickup");
    setVerifyDialog(true);
  };

  const handleOutForDelivery = () => {
    if (!driverInfo.name || !driverInfo.phone) {
      alert("Please enter driver information");
      return;
    }
    
    const startTime = new Date();
    
    if (navigator.geolocation && canShareLocation()) {
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
            status: 'out_for_delivery',
            pickup_time: startTime.toISOString()
          }
        });
        
        // Update location every 10 seconds only if sharing is allowed
        const locationInterval = setInterval(() => {
          if (canShareLocation()) {
            navigator.geolocation.getCurrentPosition((pos) => {
              updateLocationMutation.mutate({
                id: selectedOrder.id,
                location: {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude
                }
              });
            });
          } else {
            clearInterval(locationInterval);
          }
        }, 10000);
        
        window.deliveryLocationInterval = locationInterval;
      });
    } else {
      // Start delivery without location if sharing is disabled
      updateOrderMutation.mutate({
        id: selectedOrder.id,
        data: {
          ...selectedOrder,
          driver_name: driverInfo.name,
          driver_phone: driverInfo.phone,
          status: 'out_for_delivery',
          pickup_time: startTime.toISOString()
        }
      });
    }
    
    setVerifyDialog(false);
  };

  const handleDeliveryComplete = (order) => {
    setSelectedOrder(order);
    setDialogMode("verify");
    setVerifyDialog(true);
  };

  const verifyDelivery = () => {
    if (verificationCode === selectedOrder.delivery_code) {
      // Stop GPS tracking
      if (window.deliveryLocationInterval) {
        clearInterval(window.deliveryLocationInterval);
      }
      
      const deliveryTime = selectedOrder.pickup_time 
        ? Math.round((new Date() - new Date(selectedOrder.pickup_time)) / 60000)
        : selectedOrder.estimated_time;
      
      updateOrderMutation.mutate({
        id: selectedOrder.id,
        data: {
          ...selectedOrder,
          status: 'delivered',
          delivery_verified: true,
          actual_delivery_time: deliveryTime,
          driver_location: null // Clear location after delivery
        }
      });

      // Auto-disable location sharing after delivery if preference is enabled
      if (currentPartner && locationPreferences.auto_disable_location_after_delivery) {
        const hasOtherActiveDeliveries = myDeliveries.some(
          o => o.id !== selectedOrder.id && o.status === 'out_for_delivery'
        );
        if (!hasOtherActiveDeliveries) {
          // No other active deliveries, location sharing will be disabled automatically
        }
      }
    } else {
      alert("Invalid verification code!");
    }
  };

  const openSettings = () => {
    if (currentPartner) {
      setLocationPreferences({
        location_sharing_enabled: currentPartner.location_sharing_enabled !== false,
        share_location_only_when_active: currentPartner.share_location_only_when_active !== false,
        auto_disable_location_after_delivery: currentPartner.auto_disable_location_after_delivery !== false
      });
      setSettingsDialog(true);
    }
  };

  const saveSettings = () => {
    if (currentPartner) {
      updatePartnerMutation.mutate({
        id: currentPartner.id,
        data: locationPreferences
      });
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">🚚 Delivery Partner Dashboard</h1>
            <p className="text-slate-600">Track earnings, deliveries, and manage orders</p>
          </div>
          <Button variant="outline" onClick={openSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="history">Delivery History</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Available</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {assignedOrders.filter(o => !o.delivery_partner_id).length}
                      </p>
                    </div>
                    <Bell className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">In Transit</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {myDeliveries.filter(o => o.status === 'out_for_delivery').length}
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
                      <p className="text-sm text-slate-600">Today's Earnings</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${earnings.today.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {!locationPreferences.location_sharing_enabled && (
              <Card className="mb-6 border-amber-300 bg-amber-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-amber-800">
                    ⚠️ Location sharing is disabled. Customers won't see real-time tracking. Enable it in Preferences.
                  </p>
                </CardContent>
              </Card>
            )}

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
                      <div className="text-right">
                        <p className="text-2xl font-bold">${order.total_amount}</p>
                        <p className="text-sm text-green-600 font-semibold">
                          Earn: ${((order.delivery_fee || 0) * 0.85).toFixed(2)}
                        </p>
                      </div>
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
                      {!order.delivery_partner_id && order.status === 'confirmed' && (
                        <Button onClick={() => handleAcceptOrder(order)} className="w-full bg-green-600 hover:bg-green-700">
                          Accept Order
                        </Button>
                      )}
                      {order.delivery_partner_id === currentPartner?.id && order.status === 'ready' && (
                        <Button onClick={() => handlePickup(order)} className="w-full">
                          Pick Up & Start Delivery
                        </Button>
                      )}
                      {order.status === 'out_for_delivery' && order.delivery_partner_id === currentPartner?.id && (
                        <Button onClick={() => handleDeliveryComplete(order)} className="w-full bg-green-600 hover:bg-green-700">
                          Complete Delivery
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="pt-6">
                  <p className="text-sm opacity-90 mb-1">Total Earnings</p>
                  <p className="text-4xl font-bold">${earnings.total.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-6">
                  <p className="text-sm opacity-90 mb-1">This Week</p>
                  <p className="text-4xl font-bold">${earnings.thisWeek.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <p className="text-sm opacity-90 mb-1">Total Tips</p>
                  <p className="text-4xl font-bold">${earnings.tips.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="pt-6">
                  <p className="text-sm opacity-90 mb-1">Avg Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-4xl font-bold">{earnings.avgRating}</p>
                    <Star className="w-6 h-6 fill-white" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="font-semibold">Total Deliveries</span>
                    <span className="text-xl font-bold">{completedDeliveries.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="font-semibold">Avg Per Delivery</span>
                    <span className="text-xl font-bold text-green-600">
                      ${completedDeliveries.length > 0 ? (earnings.total / completedDeliveries.length).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="font-semibold">Commission Rate</span>
                    <span className="text-xl font-bold">{currentPartner?.commission_rate || 15}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Delivery History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedDeliveries.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-slate-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">{order.order_number}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(order.updated_date).toLocaleDateString()} at {new Date(order.updated_date).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+${((order.driver_earnings || order.delivery_fee * 0.85) + (order.tip_amount || 0)).toFixed(2)}</p>
                          {order.tip_amount > 0 && (
                            <p className="text-xs text-purple-600">Tip: ${order.tip_amount.toFixed(2)}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-slate-600">Customer: {order.customer_name}</p>
                          <p className="text-slate-600">{order.customer_address}</p>
                        </div>
                        <div>
                          {order.actual_delivery_time && (
                            <p className="text-slate-600">Delivery time: {order.actual_delivery_time} min</p>
                          )}
                          {order.distance_km && (
                            <p className="text-slate-600">Distance: {order.distance_km} km</p>
                          )}
                        </div>
                      </div>

                      {order.customer_rating && (
                        <div className="flex items-center gap-2 pt-3 border-t">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < order.customer_rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          {order.customer_feedback && (
                            <p className="text-sm text-slate-600 ml-2">"{order.customer_feedback}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {completedDeliveries.length === 0 && (
                    <div className="text-center py-12">
                      <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No deliveries completed yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AnimatePresence>
          {showNotification && notificationOrder && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-4 right-4 z-50 max-w-md"
            >
              <Card className="border-2 border-green-500 shadow-2xl bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Bell className="w-6 h-6 text-green-600 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-green-600">New Order Available!</h3>
                      <p className="text-sm text-slate-600">{notificationOrder.order_number}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><strong>Earn:</strong> ${((notificationOrder.delivery_fee || 0) * 0.85).toFixed(2)}</p>
                    <p className="text-sm"><strong>Destination:</strong> {notificationOrder.customer_address}</p>
                    <p className="text-sm"><strong>Estimated time:</strong> {notificationOrder.estimated_time} min</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowNotification(false)} className="flex-1">
                      Dismiss
                    </Button>
                    <Button onClick={() => handleAcceptOrder(notificationOrder)} className="flex-1 bg-green-600 hover:bg-green-700">
                      Accept Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "pickup" ? 'Assign Driver & Start Delivery' : 'Verify Delivery'}
              </DialogTitle>
            </DialogHeader>
            {dialogMode === "pickup" ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-slate-700">
                    {canShareLocation() ? (
                      <>📍 GPS tracking will start automatically. Customer will see your real-time location on the map.</>
                    ) : (
                      <>⚠️ Location sharing is disabled. Customer won't see real-time tracking. You can enable it in Preferences.</>
                    )}
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
                  autoFocus
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
              <Button variant="outline" onClick={() => {
                setVerifyDialog(false);
                setVerificationCode("");
              }}>Cancel</Button>
              <Button onClick={dialogMode === "pickup" ? handleOutForDelivery : verifyDelivery}>
                {dialogMode === "pickup" ? 'Start Delivery' : 'Verify & Complete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Location Sharing Preferences</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-semibold">Enable Location Sharing</Label>
                  <p className="text-xs text-slate-600">Allow customers to track your location in real-time</p>
                </div>
                <Switch
                  checked={locationPreferences.location_sharing_enabled}
                  onCheckedChange={(checked) => setLocationPreferences({...locationPreferences, location_sharing_enabled: checked})}
                />
              </div>

              {locationPreferences.location_sharing_enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-semibold">Share Only During Active Deliveries</Label>
                      <p className="text-xs text-slate-600">Location sharing starts when delivery begins</p>
                    </div>
                    <Switch
                      checked={locationPreferences.share_location_only_when_active}
                      onCheckedChange={(checked) => setLocationPreferences({...locationPreferences, share_location_only_when_active: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-semibold">Auto-Disable After Delivery</Label>
                      <p className="text-xs text-slate-600">Stop sharing location when delivery is complete</p>
                    </div>
                    <Switch
                      checked={locationPreferences.auto_disable_location_after_delivery}
                      onCheckedChange={(checked) => setLocationPreferences({...locationPreferences, auto_disable_location_after_delivery: checked})}
                    />
                  </div>
                </>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-slate-700">
                  💡 <strong>Privacy Tip:</strong> Enable "Share Only During Active Deliveries" to protect your privacy when you're not working.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsDialog(false)}>Cancel</Button>
              <Button onClick={saveSettings}>Save Preferences</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
