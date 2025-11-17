import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Phone, Package, CheckCircle, User, DollarSign, Clock, TrendingUp, Bike, Bell, Key, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DriverOrderMap from "../components/driver/DriverOrderMap";

export default function DriverApp() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyDialog, setVerifyDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: driver, isLoading: driverLoading } = useQuery({
    queryKey: ['driver-profile', user?.email],
    queryFn: async () => {
      const drivers = await base44.entities.DeliveryPartner.filter({ email: user.email });
      return drivers[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (driver?.id && driver.location_sharing_enabled) {
      startLocationTracking();
    }
  }, [driver]);

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          updateDriverLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => console.error("Location error:", error),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
  };

  const updateDriverLocation = async (lat, lng) => {
    if (driver?.id && driver.location_sharing_enabled) {
      await base44.entities.DeliveryPartner.update(driver.id, {
        current_location: { lat, lng }
      });
    }
  };

  const { data: orders = [] } = useQuery({
    queryKey: ['driver-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    refetchInterval: 3000,
    enabled: !!driver,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['driver-notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ customer_email: user.email }, '-created_date'),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: (available) => base44.entities.DeliveryPartner.update(driver.id, { is_available: available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
      queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
    },
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (order) => {
      await base44.entities.Order.update(order.id, {
        delivery_partner_id: driver.id,
        driver_name: driver.full_name,
        driver_phone: driver.phone,
        vehicle_type: driver.vehicle_type,
        status: 'confirmed'
      });

      await base44.entities.Notification.create({
        customer_email: order.created_by,
        title: "Driver Assigned! 🚚",
        message: `${driver.full_name} will deliver your order ${order.order_number}`,
        type: "order_update",
        order_id: order.id,
        restaurant_id: order.restaurant_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, location }) => {
      const updateData = { status };
      
      if (location && driver.location_sharing_enabled) {
        updateData.driver_location = location;
      }

      await base44.entities.Order.update(orderId, updateData);

      const statusMessages = {
        'preparing': 'Driver picked up your order! 📦',
        'ready': 'Driver is on the way! 🚗',
        'out_for_delivery': 'Your order is out for delivery! 🚚',
        'delivered': 'Your order has been delivered! Enjoy! 😊'
      };

      if (statusMessages[status]) {
        const order = orders.find(o => o.id === orderId);
        await base44.entities.Notification.create({
          customer_email: order.created_by,
          title: statusMessages[status],
          message: `Order ${order.order_number} - ${statusMessages[status]}`,
          type: "order_update",
          order_id: orderId,
          restaurant_id: order.restaurant_id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
      setTrackingDialog(false);
      setVerifyDialog(false);
      setVerificationCode("");
    },
  });

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => resolve(null)
      );
    });
  };

  const handlePickup = async (order) => {
    const location = await getCurrentLocation();
    updateOrderStatusMutation.mutate({ orderId: order.id, status: 'preparing', location });
  };

  const handleEnRoute = async (order) => {
    const location = await getCurrentLocation();
    updateOrderStatusMutation.mutate({ orderId: order.id, status: 'out_for_delivery', location });
  };

  const handleVerifyDelivery = (order) => {
    setSelectedOrder(order);
    setVerifyDialog(true);
  };

  const verifyAndDeliver = async () => {
    if (verificationCode !== selectedOrder.delivery_code) {
      alert("Invalid delivery code. Please check with the customer.");
      return;
    }

    const location = await getCurrentLocation();
    updateOrderStatusMutation.mutate({ 
      orderId: selectedOrder.id, 
      status: 'delivered',
      location 
    });

    await base44.entities.DeliveryPartner.update(driver.id, {
      total_deliveries: (driver.total_deliveries || 0) + 1
    });
  };

  const openMap = (order) => {
    setSelectedOrder(order);
    setTrackingDialog(true);
  };

  if (driverLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Loading driver profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Driver Profile Found</h2>
            <p className="text-slate-600 mb-4">Please sign up as a delivery partner first</p>
            <Button onClick={() => window.location.href = '/DriverSignup'}>
              Sign Up as Driver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const myOrders = orders.filter(o => 
    o.delivery_partner_id === driver?.id || 
    (o.status === 'ready' && o.order_type === 'delivery' && !o.delivery_partner_id)
  );

  const activeOrders = myOrders.filter(o => 
    ['confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
  );

  const availableOrders = myOrders.filter(o => 
    o.status === 'ready' && !o.delivery_partner_id
  );

  const completedToday = orders.filter(o => {
    const today = new Date().toDateString();
    return o.delivery_partner_id === driver?.id && 
           o.status === 'delivered' && 
           new Date(o.created_date).toDateString() === today;
  });

  const todayEarnings = completedToday.reduce((sum, o) => 
    sum + (o.driver_earnings || 0) + (o.tip_amount || 0), 0
  );

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b shadow-sm">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-xl font-bold text-purple-600">🚚 Driver Mode</h1>
              <p className="text-xs text-slate-600">Hi, {driver.full_name}</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Button variant="outline" size="icon">
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-2">
                <span className="text-xs font-medium">
                  {driver.is_available ? 'Available' : 'Offline'}
                </span>
                <Switch
                  checked={driver.is_available}
                  onCheckedChange={(checked) => toggleAvailabilityMutation.mutate(checked)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <p className="text-xs text-slate-600">Today</p>
              </div>
              <p className="text-xl font-bold text-green-700">${todayEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-slate-600">Active</p>
              </div>
              <p className="text-xl font-bold text-blue-700">{activeOrders.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-slate-600">Done</p>
              </div>
              <p className="text-xl font-bold text-purple-700">{completedToday.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Available Orders */}
        {availableOrders.length > 0 && driver.is_available && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              New Deliveries Available
            </h2>
            <div className="space-y-3">
              <AnimatePresence>
                {availableOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="border-2 border-orange-200 bg-orange-50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-lg">{order.restaurant_name}</p>
                            <p className="text-sm text-slate-600">{order.order_number}</p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">New</Badge>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-slate-600">{order.customer_address}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-bold text-green-600">${order.delivery_fee?.toFixed(2)}</span>
                            </div>
                            {order.distance_km && (
                              <div className="flex items-center gap-1">
                                <Navigation className="w-4 h-4 text-blue-600" />
                                <span>{order.distance_km} km</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          onClick={() => acceptOrderMutation.mutate(order)}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          Accept Delivery
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Active Deliveries */}
        {activeOrders.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Active Deliveries</h2>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <Card key={order.id} className="border-2 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">{order.restaurant_name}</p>
                        <p className="text-sm text-slate-600">{order.order_number}</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-700">
                          {order.status === 'confirmed' && 'Go to Restaurant'}
                          {order.status === 'preparing' && 'Picking Up'}
                          {order.status === 'out_for_delivery' && 'Delivering'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">${order.delivery_fee?.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">+ tips</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{order.customer_name}</span>
                        <a href={`tel:${order.customer_phone}`} className="ml-auto">
                          <Button size="sm" variant="outline">
                            <Phone className="w-3 h-3" />
                          </Button>
                        </a>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <p className="text-slate-600 flex-1">{order.customer_address}</p>
                      </div>
                      {order.delivery_code && order.status === 'out_for_delivery' && (
                        <div className="bg-green-50 border border-green-200 p-2 rounded">
                          <p className="text-xs text-green-800 font-semibold">Delivery Code: {order.delivery_code}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => openMap(order)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate
                      </Button>
                      
                      {order.status === 'confirmed' && (
                        <Button 
                          onClick={() => handlePickup(order)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Picked Up
                        </Button>
                      )}
                      
                      {order.status === 'preparing' && (
                        <Button 
                          onClick={() => handleEnRoute(order)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          <Bike className="w-4 h-4 mr-2" />
                          En Route
                        </Button>
                      )}
                      
                      {order.status === 'out_for_delivery' && (
                        <Button 
                          onClick={() => handleVerifyDelivery(order)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Delivered
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeOrders.length === 0 && availableOrders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bike className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {driver.is_available ? 'No Orders Available' : 'You are Offline'}
              </h3>
              <p className="text-slate-600 text-sm">
                {driver.is_available 
                  ? 'New deliveries will appear here' 
                  : 'Turn on availability to receive orders'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Completed Today</h2>
            <div className="space-y-2">
              {completedToday.slice(0, 5).map((order) => (
                <Card key={order.id} className="bg-green-50">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm">{order.order_number}</p>
                        <p className="text-xs text-slate-600">{order.restaurant_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${((order.driver_earnings || 0) + (order.tip_amount || 0)).toFixed(2)}
                        </p>
                        {order.tip_amount > 0 && (
                          <p className="text-xs text-green-600">+${order.tip_amount.toFixed(2)} tip</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Dialog with Map */}
      <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center justify-between">
              <span>Navigation - {selectedOrder?.order_number}</span>
              <Badge className="bg-blue-100 text-blue-700">
                {selectedOrder?.status === 'confirmed' && 'To Restaurant'}
                {selectedOrder?.status === 'preparing' && 'Picking Up'}
                {selectedOrder?.status === 'out_for_delivery' && 'To Customer'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div>
              <DriverOrderMap order={selectedOrder} driver={driver} />
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Pickup Location</h4>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">{selectedOrder.restaurant_name}</p>
                      {selectedOrder.restaurant_address && (
                        <p>{selectedOrder.restaurant_address}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Delivery Location</h4>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                      <p>{selectedOrder.customer_address}</p>
                      <a href={`tel:${selectedOrder.customer_phone}`} className="text-blue-600">
                        {selectedOrder.customer_phone}
                      </a>
                    </div>
                  </div>
                </div>

                {selectedOrder.special_instructions && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-amber-900 mb-1">Special Instructions:</p>
                    <p className="text-sm text-amber-800">{selectedOrder.special_instructions}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedOrder.customer_address)}`}
                    target="_blank"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      <Navigation className="w-4 h-4 mr-2" />
                      Open in Maps
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verify Delivery Dialog */}
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Key className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-3">
                Ask the customer for their delivery code
              </p>
              <p className="text-xs text-slate-500">
                Order: {selectedOrder?.order_number}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Enter Delivery Code *</Label>
              <Input
                type="text"
                placeholder="Enter 4-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={4}
                className="text-center text-2xl font-bold tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setVerifyDialog(false);
              setVerificationCode("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={verifyAndDeliver}
              disabled={verificationCode.length !== 4}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}