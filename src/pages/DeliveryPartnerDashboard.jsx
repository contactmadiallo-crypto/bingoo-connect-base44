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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, MapPin, Phone, Clock, CheckCircle, AlertCircle, DollarSign, TrendingUp, Star, Bell, Settings, User, Upload, Loader2, BarChart3, Target, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeliveryPartnerDashboard() {
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [driverInfo, setDriverInfo] = useState({ name: "", phone: "" });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationOrder, setNotificationOrder] = useState(null);
  const [dialogMode, setDialogMode] = useState("verify"); // "pickup" or "verify"
  const [uploadingDoc, setUploadingDoc] = useState("");
  const [locationPreferences, setLocationPreferences] = useState({
    location_sharing_enabled: true,
    share_location_only_when_active: true,
    auto_disable_location_after_delivery: true
  });
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    vehicle_type: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    vehicle_color: "",
    license_plate: "",
    profile_photo_url: "",
    license_document_url: "",
    vehicle_photo_url: ""
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
      setProfileDialog(false);
    },
  });

  const currentPartner = partners[0];
  const myDeliveries = orders.filter(o => o.delivery_partner_id === currentPartner?.id);
  const completedDeliveries = myDeliveries.filter(o => o.status === 'delivered');
  
  const assignedOrders = orders.filter(o => 
    o.order_type === 'delivery' && 
    ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
  );

  // Removed notification popup - partners see orders in the main list

  // Load current partner preferences and profile
  useEffect(() => {
    if (currentPartner) {
      setLocationPreferences({
        location_sharing_enabled: currentPartner.location_sharing_enabled !== false,
        share_location_only_when_active: currentPartner.share_location_only_when_active !== false,
        auto_disable_location_after_delivery: currentPartner.auto_disable_location_after_delivery !== false
      });
      setProfileForm({
        full_name: currentPartner.full_name || "",
        phone: currentPartner.phone || "",
        email: currentPartner.email || "",
        vehicle_type: currentPartner.vehicle_type || "",
        vehicle_make: currentPartner.vehicle_make || "",
        vehicle_model: currentPartner.vehicle_model || "",
        vehicle_year: currentPartner.vehicle_year?.toString() || "",
        vehicle_color: currentPartner.vehicle_color || "",
        license_plate: currentPartner.license_plate || "",
        profile_photo_url: currentPartner.profile_photo_url || "",
        license_document_url: currentPartner.license_document_url || "",
        vehicle_photo_url: currentPartner.vehicle_photo_url || ""
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

  // Performance metrics
  const performance = {
    avgDeliveryTime: completedDeliveries.filter(o => o.actual_delivery_time).length > 0
      ? (completedDeliveries.reduce((sum, o) => sum + (o.actual_delivery_time || 0), 0) / 
         completedDeliveries.filter(o => o.actual_delivery_time).length).toFixed(1)
      : 'N/A',
    completionRate: myDeliveries.length > 0
      ? ((completedDeliveries.length / myDeliveries.length) * 100).toFixed(1)
      : 'N/A',
    earningsPerHour: (() => {
      const totalMinutes = completedDeliveries.reduce((sum, o) => sum + (o.actual_delivery_time || 0), 0);
      const totalHours = totalMinutes / 60;
      return totalHours > 0 ? (earnings.total / totalHours).toFixed(2) : '0.00';
    })(),
    onTimeRate: completedDeliveries.filter(o => o.actual_delivery_time && o.estimated_time).length > 0
      ? ((completedDeliveries.filter(o => 
          o.actual_delivery_time && o.estimated_time && o.actual_delivery_time <= o.estimated_time
        ).length / completedDeliveries.filter(o => o.actual_delivery_time && o.estimated_time).length) * 100).toFixed(1)
      : 'N/A'
  };

  const canShareLocation = () => {
    if (!currentPartner) return false;
    if (!locationPreferences.location_sharing_enabled) return false;
    if (locationPreferences.share_location_only_when_active) {
      const hasActiveDelivery = myDeliveries.some(o => ['ready', 'out_for_delivery'].includes(o.status));
      return hasActiveDelivery;
    }
    return true;
  };

  const toggleOnlineStatus = () => {
    if (currentPartner) {
      updatePartnerMutation.mutate({
        id: currentPartner.id,
        data: { is_available: !currentPartner.is_available }
      });
    }
  };

  const handleDocumentUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(field);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfileForm(prev => ({ ...prev, [field]: file_url }));
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploadingDoc("");
    }
  };

  const saveProfile = () => {
    if (currentPartner) {
      updatePartnerMutation.mutate({
        id: currentPartner.id,
        data: {
          ...profileForm,
          vehicle_year: profileForm.vehicle_year ? parseInt(profileForm.vehicle_year) : undefined
        }
      });
    }
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
        status: 'ready' // Order becomes 'ready' for pickup once accepted by a driver
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
      // Start delivery without location if sharing is disabled or not available
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
        : selectedOrder.estimated_time; // Fallback if pickup_time somehow isn't set
      
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
      // This will be handled by the canShareLocation() check in the interval.
      // If no other active deliveries, canShareLocation() will return false and clear the interval.
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
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">🚚 Delivery Partner Dashboard</h1>
            <p className="text-slate-600">Track earnings, deliveries, and manage orders</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border shadow-sm">
              <span className="text-sm font-medium">{currentPartner?.is_available ? 'Online' : 'Offline'}</span>
              <Switch
                checked={currentPartner?.is_available || false}
                onCheckedChange={toggleOnlineStatus}
              />
              <div className={`w-2 h-2 rounded-full ${currentPartner?.is_available ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
            </div>
            <Button variant="outline" onClick={() => setProfileDialog(true)}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" onClick={openSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </Button>
          </div>
        </div>

        {!currentPartner?.is_available && (
          <Card className="mb-6 border-slate-300 bg-slate-50">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-700">
                ℹ️ You're currently offline. Toggle online to start receiving delivery requests.
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
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
                        {assignedOrders.filter(o => !o.delivery_partner_id && o.status === 'confirmed').length}
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
                      {!order.delivery_partner_id && order.status === 'confirmed' && currentPartner?.is_available && (
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
              {assignedOrders.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No active orders right now. Check back soon!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">Avg Delivery Time</p>
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-4xl font-bold">{performance.avgDeliveryTime}</p>
                  <p className="text-xs opacity-75 mt-1">minutes</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">Completion Rate</p>
                    <Target className="w-5 h-5" />
                  </div>
                  <p className="text-4xl font-bold">{performance.completionRate}%</p>
                  <p className="text-xs opacity-75 mt-1">of accepted orders</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">Earnings Per Hour</p>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-4xl font-bold">${performance.earningsPerHour}</p>
                  <p className="text-xs opacity-75 mt-1">per hour worked</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">On-Time Rate</p>
                    <Award className="w-5 h-5" />
                  </div>
                  <p className="text-4xl font-bold">{performance.onTimeRate}%</p>
                  <p className="text-xs opacity-75 mt-1">within estimated time</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Total Deliveries</span>
                      <span className="text-2xl font-bold">{completedDeliveries.length}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Customer Rating</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{earnings.avgRating}</span>
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-yellow-500 h-3 rounded-full" style={{ width: earnings.avgRating !== 'N/A' ? `${(parseFloat(earnings.avgRating) / 5) * 100}%` : '0%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-2xl font-bold">{performance.completionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: performance.completionRate !== 'N/A' ? `${performance.completionRate}%` : '0%' }}></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mt-6">
                    <h4 className="font-semibold mb-2">💡 Tips to Improve Performance</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• Maintain communication with customers for better ratings</li>
                      <li>• Plan routes efficiently to reduce delivery time</li>
                      <li>• Accept orders during peak hours for higher earnings per hour</li>
                      <li>• Keep your vehicle well-maintained for on-time deliveries</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      <p className="text-xs text-slate-600">Location sharing starts when delivery begins and stops when it's done</p>
                    </div>
                    <Switch
                      checked={locationPreferences.share_location_only_when_active}
                      onCheckedChange={(checked) => setLocationPreferences({...locationPreferences, share_location_only_when_active: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-semibold">Auto-Disable After Delivery</Label>
                      <p className="text-xs text-slate-600">Stop sharing location when delivery is complete (unless other active deliveries)</p>
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

        <Dialog open={profileDialog} onOpenChange={setProfileDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>My Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={profileForm.full_name} onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Vehicle Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Type *</Label>
                    <Select value={profileForm.vehicle_type} onValueChange={(value) => setProfileForm({...profileForm, vehicle_type: value})}>
                      <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bicycle">Bicycle</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>License Plate</Label>
                    <Input value={profileForm.license_plate} onChange={(e) => setProfileForm({...profileForm, license_plate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Make</Label>
                    <Input value={profileForm.vehicle_make} onChange={(e) => setProfileForm({...profileForm, vehicle_make: e.target.value})} placeholder="e.g., Toyota" />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input value={profileForm.vehicle_model} onChange={(e) => setProfileForm({...profileForm, vehicle_model: e.target.value})} placeholder="e.g., Camry" />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input type="number" value={profileForm.vehicle_year} onChange={(e) => setProfileForm({...profileForm, vehicle_year: e.target.value})} placeholder="2020" />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input value={profileForm.vehicle_color} onChange={(e) => setProfileForm({...profileForm, vehicle_color: e.target.value})} placeholder="e.g., Black" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Documents</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    {profileForm.profile_photo_url && (
                      <div className="w-20 h-20 rounded-full overflow-hidden border mb-2">
                        <img src={profileForm.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <Input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(e, 'profile_photo_url')} disabled={uploadingDoc === 'profile_photo_url'} />
                    {uploadingDoc === 'profile_photo_url' && <Loader2 className="w-4 h-4 animate-spin mt-2" />}
                  </div>

                  <div className="space-y-2">
                    <Label>Driver's License</Label>
                    {profileForm.license_document_url && (
                      <a href={profileForm.license_document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block">View current document</a>
                    )}
                    <Input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, 'license_document_url')} disabled={uploadingDoc === 'license_document_url'} />
                    {uploadingDoc === 'license_document_url' && <Loader2 className="w-4 h-4 animate-spin mt-2" />}
                  </div>

                  <div className="space-y-2">
                    <Label>Vehicle Photo</Label>
                    {profileForm.vehicle_photo_url && (
                      <div className="w-32 h-20 rounded overflow-hidden border mb-2">
                        <img src={profileForm.vehicle_photo_url} alt="Vehicle" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <Input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(e, 'vehicle_photo_url')} disabled={uploadingDoc === 'vehicle_photo_url'} />
                    {uploadingDoc === 'vehicle_photo_url' && <Loader2 className="w-4 h-4 animate-spin mt-2" />}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProfileDialog(false)}>Cancel</Button>
              <Button onClick={saveProfile}>Save Profile</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}