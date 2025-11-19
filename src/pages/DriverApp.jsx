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
import { MapPin, Navigation, Phone, Package, CheckCircle, User, DollarSign, Clock, TrendingUp, Bike, Bell, Key, Loader2, Wallet, MessageCircle, BarChart3, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DriverOrderMap from "../components/driver/DriverOrderMap";
import DriverWallet from "../components/driver/DriverWallet";
import RouteOptimizer from "../components/driver/RouteOptimizer";
import ChatWindow from "../components/chat/ChatWindow";
import ConversationsList from "../components/chat/ConversationsList";
import AnalyticsDashboard from "../components/driver/AnalyticsDashboard";
import DriverPreferences from "../components/driver/DriverPreferences";
import { toast } from "sonner";

export default function DriverApp() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [optimizedRouteData, setOptimizedRouteData] = useState(null);
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [walletDialog, setWalletDialog] = useState(false);
  const [chatDialog, setChatDialog] = useState(false);
  const [chatOrder, setChatOrder] = useState(null);
  const [showConversations, setShowConversations] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: driver, isLoading: driverLoading } = useQuery({
    queryKey: ['driver-profile', user?.email],
    queryFn: async () => {
      const drivers = await base44.entities.DeliveryPartner.list();
      const myDriver = drivers.find(d => d.email === user.email || d.created_by === user.email);
      return myDriver || null;
    },
    enabled: !!user?.email,
  });





  const updateDriverLocation = async (lat, lng, activeOrdersList = []) => {
    if (!driver?.id || !driver.location_sharing_enabled) return;
    
    const location = { lat, lng };
    
    // Update driver location
    await base44.entities.DeliveryPartner.update(driver.id, {
      current_location: location
    });
    
    // Update active order locations in real-time
    if (activeOrdersList.length > 0) {
      for (const order of activeOrdersList) {
        await base44.entities.Order.update(order.id, {
          driver_location: location
        });
      }
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
    refetchInterval: 3000,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['driver-conversations', driver?.id],
    queryFn: () => base44.entities.Conversation.filter({ driver_id: driver.id, status: 'active' }),
    enabled: !!driver?.id,
    refetchInterval: 2000,
  });

  const myOrders = orders.filter(o => 
    o.delivery_partner_id === driver?.id || 
    (o.status === 'ready' && o.order_type === 'delivery' && !o.delivery_partner_id)
  );

  const activeOrders = myOrders.filter(o => 
    ['confirmed', 'arriving_at_pickup', 'picked_up', 'en_route', 'arriving_at_delivery'].includes(o.status)
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

  // Start location tracking with active orders check
  useEffect(() => {
    if (driver?.id && driver.location_sharing_enabled) {
      const hasActiveDeliveries = activeOrders.length > 0;
      
      if (navigator.geolocation) {
        const updateInterval = hasActiveDeliveries ? 3000 : 10000;
        
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            updateDriverLocation(position.coords.latitude, position.coords.longitude, activeOrders);
          },
          (error) => console.error("Location error:", error),
          { 
            enableHighAccuracy: true, 
            maximumAge: updateInterval,
            timeout: 10000
          }
        );

        return () => {
          if (watchId) navigator.geolocation.clearWatch(watchId);
        };
      }
    }
  }, [driver?.id, driver?.location_sharing_enabled, activeOrders.length]);

  // Show toast notification for new unread notifications
  useEffect(() => {
    const unreadNotifs = notifications.filter(n => !n.read);
    if (unreadNotifs.length > 0) {
      // Find the latest unread notification
      const latest = unreadNotifs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
      // Only show toast if it's recent (within the last 10 seconds, considering refetch interval)
      if (latest && Date.now() - new Date(latest.created_date).getTime() < 4000) { // Slightly more than refetch
        toast.info(latest.title, {
          description: latest.message,
          duration: 5000,
        });
      }
    }
  }, [notifications.length, notifications]); // Depend on notifications array directly

  // Show toast notification for new messages
  useEffect(() => {
    const unreadConversations = conversations.filter(c => (c.unread_count_driver || 0) > 0);
    if (unreadConversations.length > 0) {
      // Find the conversation with the latest unread message
      const latestConv = unreadConversations.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))[0];
      // Only show toast if the last message is recent
      if (latestConv && Date.now() - new Date(latestConv.last_message_at).getTime() < 3000) { // Slightly more than refetch
        toast.info("Nouveau message", {
          description: `${latestConv.customer_name}: ${latestConv.last_message?.slice(0, 50)}${latestConv.last_message.length > 50 ? '...' : ''}`,
          duration: 5000,
        });
      }
    }
  }, [conversations.map(c => `${c.id}-${c.unread_count_driver}`).join(','), conversations]);

  const totalUnreadMessages = conversations.reduce((sum, c) => sum + (c.unread_count_driver || 0), 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const toggleAvailabilityMutation = useMutation({
    mutationFn: (available) => base44.entities.DeliveryPartner.update(driver.id, { is_available: available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
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
        title: "Chauffeur Assigné! 🚚",
        message: `${driver.full_name} livrera votre commande ${order.order_number}`,
        type: "order_update",
        order_id: order.id,
        restaurant_id: order.restaurant_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
    },
  });

  const acceptBatchMutation = useMutation({
    mutationFn: async ({ orders: batchOrders, routeData }) => {
      for (const order of batchOrders) {
        await base44.entities.Order.update(order.id, {
          delivery_partner_id: driver.id,
          driver_name: driver.full_name,
          driver_phone: driver.phone,
          vehicle_type: driver.vehicle_type,
          status: 'confirmed'
        });

        await base44.entities.Notification.create({
          customer_email: order.created_by,
          title: "Chauffeur Assigné! 🚚",
          message: `${driver.full_name} livrera votre commande ${order.order_number}`,
          type: "order_update",
          order_id: order.id,
          restaurant_id: order.restaurant_id
        });
      }
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
        'arriving_at_pickup': 'Le chauffeur arrive au restaurant! 🚗',
        'picked_up': 'Commande récupérée! En route vers vous! 📦',
        'en_route': 'Le chauffeur est en route! 🚚',
        'arriving_at_delivery': 'Le chauffeur arrive bientôt! 📍',
        'delivered': 'Votre commande a été livrée! Bon appétit! 😊'
      };

      if (statusMessages[status]) {
        const order = orders.find(o => o.id === orderId);
        await base44.entities.Notification.create({
          customer_email: order.created_by,
          title: statusMessages[status],
          message: `Commande ${order.order_number} - ${statusMessages[status]}`,
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

  const handleArrivingAtPickup = async (order) => {
    const location = await getCurrentLocation();
    updateOrderStatusMutation.mutate({ orderId: order.id, status: 'arriving_at_pickup', location });
  };

  const handlePickup = async (order) => {
    const location = await getCurrentLocation();
    updateOrderStatusMutation.mutate({ orderId: order.id, status: 'picked_up', location });
  };

  const handleEnRoute = async (order) => {
    const location = await getCurrentLocation();
    updateOrderStatusMutation.mutate({ orderId: order.id, status: 'en_route', location });
  };

  const handleArrivingAtDelivery = async (order) => {
    const location = await getCurrentLocation();
    updateOrderStatusMutation.mutate({ orderId: order.id, status: 'arriving_at_delivery', location });
  };

  const openNativeNavigation = (order) => {
    const destination = order.customer_location 
      ? `${order.customer_location.lat},${order.customer_location.lng}`
      : encodeURIComponent(order.customer_address);
    
    // Try to detect user's preferred navigation app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      // iOS - try Apple Maps first, fallback to Google Maps
      window.location.href = `maps://maps.apple.com/?daddr=${destination}`;
    } else if (isAndroid) {
      // Android - try Google Maps app
      window.location.href = `google.navigation:q=${destination}`;
    } else {
      // Desktop or fallback - open Google Maps in browser
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    }
  };

  const handleVerifyDelivery = (order) => {
    setSelectedOrder(order);
    setVerifyDialog(true);
  };

  const verifyAndDeliver = async () => {
    if (verificationCode !== selectedOrder.delivery_code) {
      alert("Code de livraison invalide. Veuillez vérifier avec le client.");
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

  const openMap = (order, batchOrders = null) => {
    if (batchOrders) {
      setSelectedOrders(batchOrders);
    } else {
      setSelectedOrder(order);
      setSelectedOrders([]);
    }
    setTrackingDialog(true);
  };

  const openChat = (order) => {
    setChatOrder(order);
    setChatDialog(true);
  };

  const handleSelectConversation = (order) => {
    setChatOrder(order);
    setChatDialog(true);
    setShowConversations(false); // Close conversation list when a chat is opened
  };

  const handleAcceptBatch = (batchOrders, routeData) => {
    setOptimizedRouteData(routeData);
    acceptBatchMutation.mutate({ orders: batchOrders, routeData });
  };

  if (driverLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Chargement du profil chauffeur...</p>
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
            <h2 className="text-2xl font-bold mb-2">Aucun Profil Chauffeur</h2>
            <p className="text-slate-600 mb-4">Veuillez vous inscrire en tant que partenaire de livraison</p>
            <Button onClick={() => window.location.href = '/DriverSignup'}>
              S'inscrire comme Chauffeur
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b shadow-sm">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-purple-600">🚚 Mode Chauffeur</h1>
              <p className="text-xs text-slate-600 truncate max-w-[120px] sm:max-w-none">Salut, {driver.full_name}</p>
            </div>
            <div className="flex gap-1 sm:gap-2 items-center flex-wrap">
              <Button variant="outline" size="icon" onClick={() => setShowPreferences(true)} className="h-8 w-8 sm:h-10 sm:w-10">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setShowAnalytics(true)} className="h-8 w-8 sm:h-10 sm:w-10">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setWalletDialog(true)} className="h-8 w-8 sm:h-10 sm:w-10">
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <div className="relative">
                <Button variant="outline" size="icon" onClick={() => setShowNotifications(true)} className="h-8 w-8 sm:h-10 sm:w-10">
                  <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] sm:text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
              <div className="relative">
                <Button variant="outline" size="icon" onClick={() => setShowConversations(true)} className="h-8 w-8 sm:h-10 sm:w-10">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  {totalUnreadMessages > 0 && (
                    <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center bg-blue-500 text-white text-[10px] sm:text-xs">
                      {totalUnreadMessages}
                    </Badge>
                  )}
                </Button>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-full px-3 py-2">
                <span className="text-xs font-medium whitespace-nowrap">
                  {driver.is_available ? 'Disponible' : 'Hors Ligne'}
                </span>
                <Switch
                  checked={driver.is_available}
                  onCheckedChange={(checked) => toggleAvailabilityMutation.mutate(checked)}
                />
              </div>
              <div className="sm:hidden">
                <Switch
                  checked={driver.is_available}
                  onCheckedChange={(checked) => toggleAvailabilityMutation.mutate(checked)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 sm:p-3 border border-green-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <p className="text-[10px] sm:text-xs text-slate-600">Aujourd'hui</p>
              </div>
              <p className="text-sm sm:text-xl font-bold text-green-700">{todayEarnings.toFixed(0)} CFA</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 sm:p-3 border border-blue-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                <p className="text-[10px] sm:text-xs text-slate-600">Actif</p>
              </div>
              <p className="text-sm sm:text-xl font-bold text-blue-700">{activeOrders.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 sm:p-3 border border-purple-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                <p className="text-[10px] sm:text-xs text-slate-600">Terminé</p>
              </div>
              <p className="text-sm sm:text-xl font-bold text-purple-700">{completedToday.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Route Optimizer */}
        {driver.is_available && driver.current_location && (
          <RouteOptimizer
            availableOrders={availableOrders}
            driverLocation={driver.current_location}
            driver={driver}
            onAcceptBatch={handleAcceptBatch}
          />
        )}

        {/* Available Orders */}
        {availableOrders.length > 0 && driver.is_available && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Nouvelles Livraisons Disponibles
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
                          <Badge className="bg-orange-100 text-orange-700">Nouveau</Badge>
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
                              <span className="font-bold text-green-600">{(order.delivery_fee || 0).toFixed(0)} CFA</span>
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
                          Accepter la Livraison
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
            <h2 className="text-lg font-bold text-slate-900 mb-3">Livraisons Actives</h2>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <Card key={order.id} className="border-2 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">{order.restaurant_name}</p>
                        <p className="text-sm text-slate-600">{order.order_number}</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-700">
                          {order.status === 'confirmed' && '📍 Vers Restaurant'}
                          {order.status === 'arriving_at_pickup' && '🏪 Arrivée Restaurant'}
                          {order.status === 'picked_up' && '📦 Commande Récupérée'}
                          {order.status === 'en_route' && '🚗 En Route'}
                          {order.status === 'arriving_at_delivery' && '📍 Proche du Client'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold text-green-600">{(order.delivery_fee || 0).toFixed(0)} CFA</p>
                        <p className="text-xs text-slate-500">+ tips</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{order.customer_name}</span>
                        <div className="ml-auto flex gap-1">
                          <a href={`tel:${order.customer_phone}`}>
                            <Button size="sm" variant="outline">
                              <Phone className="w-3 h-3" />
                            </Button>
                          </a>
                          <Button size="sm" variant="outline" onClick={() => openChat(order)}>
                            <MessageCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <p className="text-slate-600 flex-1">{order.customer_address}</p>
                        </div>
                        </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => openMap(order)}
                          variant="outline"
                          className="flex-1"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Carte
                        </Button>
                        <Button 
                          onClick={() => openNativeNavigation(order)}
                          variant="outline"
                          className="flex-1 bg-blue-50"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          GPS
                        </Button>
                      </div>
                      
                      {order.status === 'confirmed' && (
                        <Button 
                          onClick={() => handleArrivingAtPickup(order)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          🏪 J'arrive au Restaurant
                        </Button>
                      )}
                      
                      {order.status === 'arriving_at_pickup' && (
                        <Button 
                          onClick={() => handlePickup(order)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Commande Récupérée
                        </Button>
                      )}
                      
                      {order.status === 'picked_up' && (
                        <Button 
                          onClick={() => handleEnRoute(order)}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          <Bike className="w-4 h-4 mr-2" />
                          En Route vers Client
                        </Button>
                      )}
                      
                      {order.status === 'en_route' && (
                        <Button 
                          onClick={() => handleArrivingAtDelivery(order)}
                          className="w-full bg-amber-600 hover:bg-amber-700"
                        >
                          📍 J'arrive chez le Client
                        </Button>
                      )}
                      
                      {order.status === 'arriving_at_delivery' && (
                        <Button 
                          onClick={() => handleVerifyDelivery(order)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Livré - Vérifier
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
                {driver.is_available ? 'Aucune Commande Disponible' : 'Vous êtes Hors Ligne'}
              </h3>
              <p className="text-slate-600 text-sm">
                {driver.is_available 
                  ? 'Les nouvelles livraisons apparaîtront ici' 
                  : 'Activez votre disponibilité pour recevoir des commandes'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Terminé Aujourd'hui</h2>
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
                          {((order.driver_earnings || 0) + (order.tip_amount || 0)).toFixed(0)} CFA
                        </p>
                        {order.tip_amount > 0 && (
                          <p className="text-xs text-green-600">+{order.tip_amount.toFixed(0)} CFA tip</p>
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

      <DriverWallet driver={driver} open={walletDialog} onOpenChange={setWalletDialog} />
      
      <ConversationsList 
        user={user}
        userType="driver"
        open={showConversations}
        onOpenChange={setShowConversations}
        onSelectConversation={handleSelectConversation}
      />

      {chatOrder && (
        <ChatWindow 
          order={chatOrder}
          user={user}
          userType="driver"
          open={chatDialog}
          onOpenChange={setChatDialog}
        />
      )}

      {/* Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Mes Préférences</DialogTitle>
          </DialogHeader>
          <DriverPreferences driver={driver} onClose={() => setShowPreferences(false)} />
        </DialogContent>
      </Dialog>

      {/* Analytics Dashboard */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <AnalyticsDashboard driver={driver} />
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-3 rounded-lg border ${notif.read ? 'bg-slate-50' : 'bg-blue-50 border-blue-200'}`}>
                  <h4 className="font-semibold text-sm mb-1">{notif.title}</h4>
                  <p className="text-xs text-slate-600">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(notif.created_date).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center justify-between">
              <span>Navigation {selectedOrders.length > 0 ? `- ${selectedOrders.length} Arrêts` : `- ${selectedOrder?.order_number}`}</span>
              <Badge className="bg-blue-100 text-blue-700">
                {selectedOrder?.status === 'confirmed' && '📍 Vers Restaurant'}
                {selectedOrder?.status === 'arriving_at_pickup' && '🏪 Arrivée Restaurant'}
                {selectedOrder?.status === 'picked_up' && '📦 Récupéré'}
                {selectedOrder?.status === 'en_route' && '🚗 En Route'}
                {selectedOrder?.status === 'arriving_at_delivery' && '📍 Proche Client'}
                {selectedOrders.length > 0 && 'Itinéraire Optimisé'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <DriverOrderMap 
            order={selectedOrder} 
            orders={selectedOrders.length > 0 ? selectedOrders : null}
            driver={driver}
            optimizedRoute={optimizedRouteData}
          />
          
          <div className="p-6">
            {selectedOrders.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold">Ordre de Livraison:</h4>
                {selectedOrders.map((o, idx) => (
                  <div key={o.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{o.restaurant_name}</p>
                      <p className="text-xs text-slate-600">→ {o.customer_name} - {o.customer_address}</p>
                    </div>
                    <p className="font-bold text-green-600 text-sm sm:text-base">{(o.delivery_fee || 0).toFixed(0)} CFA</p>
                  </div>
                ))}
              </div>
            ) : selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Lieu de Récupération</h4>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">{selectedOrder.restaurant_name}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Lieu de Livraison</h4>
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
                    <p className="text-xs font-semibold text-amber-900 mb-1">Instructions Spéciales:</p>
                    <p className="text-sm text-amber-800">{selectedOrder.special_instructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vérifier la Livraison</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Key className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-3">
                Demandez au client son code de livraison
              </p>
              <p className="text-xs text-slate-500">
                Commande: {selectedOrder?.order_number}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Entrer le Code de Livraison *</Label>
              <Input
                type="text"
                placeholder="Code à 4 chiffres"
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
              Annuler
            </Button>
            <Button 
              onClick={verifyAndDeliver}
              disabled={verificationCode.length !== 4}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmer la Livraison
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}