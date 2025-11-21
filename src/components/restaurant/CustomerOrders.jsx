import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Star, DollarSign, MessageSquare, Truck, Phone, Package, Clock, User, Key, CheckCircle, MessageCircle, ShoppingCart, Calendar, Filter, Search } from "lucide-react";
import { useTranslation } from "../translations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DeliveryMap from "../DeliveryMap";
import ChatWindow from "../chat/ChatWindow";
import { motion } from "framer-motion";

const statuses = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'ready', label: 'Ready', icon: CheckCircle },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function CustomerOrders({ user, onBack, language = "en" }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsDialog, setOrderDetailsDialog] = useState(false);
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [ratingDialog, setRatingDialog] = useState(false);
  const [restaurantReviewDialog, setRestaurantReviewDialog] = useState(false);
  const [chatDialog, setChatDialog] = useState(false);
  const [chatOrder, setChatOrder] = useState(null);
  const [tipAmount, setTipAmount] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [restaurantComment, setRestaurantComment] = useState("");
  const [liveOrder, setLiveOrder] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null); // New state for ETA
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { t } = useTranslation(language);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: orders } = useQuery({
    queryKey: ['my-orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ created_by: user.email }, '-created_date'),
    initialData: [],
    enabled: !!user,
    refetchInterval: 3000, // Auto-refresh every 3 seconds
  });

  const { data: myRestaurantReviews = [] } = useQuery({
    queryKey: ['my-restaurant-reviews', user?.email],
    queryFn: () => base44.entities.RestaurantReview.filter({ customer_email: user.email }),
    enabled: !!user,
  });

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    let interval;
    if (trackingDialog && liveOrder) {
      interval = setInterval(async () => {
        const updated = await base44.entities.Order.filter({ id: liveOrder.id });
        if (updated[0]) {
          setLiveOrder(updated[0]);
          
          // Calculate ETA if order is out for delivery and locations are available
          if (updated[0].status === 'out_for_delivery' && updated[0].driver_location && updated[0].customer_location) {
            const driverLat = updated[0].driver_location.lat;
            const driverLng = updated[0].driver_location.lng;
            const customerLat = updated[0].customer_location.lat;
            const customerLng = updated[0].customer_location.lng;
            
            const distance = calculateDistance(driverLat, driverLng, customerLat, customerLng);
            const avgSpeed = 25; // km/h average speed for delivery
            const etaMinutes = Math.ceil((distance / avgSpeed) * 60);
            
            const arrivalTime = new Date(Date.now() + etaMinutes * 60000);
            setEstimatedArrival({ minutes: etaMinutes, time: arrivalTime });
          } else {
            setEstimatedArrival(null); // Clear ETA if not out for delivery or locations are missing
          }
        }
      }, 3000);
    } else {
      setEstimatedArrival(null); // Clear ETA when dialog is closed or no live order
    }
    return () => {
        clearInterval(interval);
        setEstimatedArrival(null); // Ensure ETA is cleared on unmount/dependency change
    };
  }, [trackingDialog, liveOrder]); // calculateDistance is a pure function, no need to include in deps

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setRatingDialog(false);
      setRating(0);
      setFeedback("");
      setTipAmount("");
    },
  });

  const createRestaurantReviewMutation = useMutation({
    mutationFn: (data) => base44.entities.RestaurantReview.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-restaurant-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-reviews'] });
      setRestaurantReviewDialog(false);
      setRestaurantRating(0);
      setFoodRating(0);
      setServiceRating(0);
      setDeliveryRating(0);
      setRestaurantComment("");
    },
  });

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    
    if (dateFilter !== "all") {
      const now = new Date();
      const orderDate = (o) => new Date(o.created_date);
      
      filtered = filtered.filter(o => {
        const date = orderDate(o);
        if (dateFilter === "today") {
          return date.toDateString() === now.toDateString();
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return date >= monthAgo;
        }
        return true;
      });
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.order_number?.toLowerCase().includes(query) ||
        o.customer_name?.toLowerCase().includes(query) ||
        o.restaurant_name?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [orders, statusFilter, dateFilter, searchQuery]);

  const activeOrders = filteredOrders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status));
  const completedOrders = filteredOrders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setOrderDetailsDialog(true);
  };

  const handleTrackOrder = (order) => {
    setLiveOrder(order);
    setTrackingDialog(true);
    setOrderDetailsDialog(false);
  };

  const handleRateDriver = (order) => {
    setSelectedOrder(order);
    setRating(order.customer_rating || 0);
    setFeedback(order.customer_feedback || "");
    setTipAmount(order.tip_amount?.toString() || "");
    setRatingDialog(true);
  };

  const handleReviewRestaurant = (order) => {
    setSelectedOrder(order);
    setRestaurantReviewDialog(true);
  };

  const submitRating = () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    updateOrderMutation.mutate({
      id: selectedOrder.id,
      data: {
        customer_rating: rating,
        customer_feedback: feedback,
        tip_amount: tipAmount ? parseFloat(tipAmount) : 0
      }
    });
  };

  const submitRestaurantReview = () => {
    if (restaurantRating === 0) {
      alert("Please select an overall rating");
      return;
    }

    createRestaurantReviewMutation.mutate({
      restaurant_id: selectedOrder.restaurant_id,
      restaurant_name: selectedOrder.restaurant_name,
      customer_email: user.email,
      customer_name: user.full_name,
      order_id: selectedOrder.id,
      rating: restaurantRating,
      comment: restaurantComment,
      food_rating: foodRating || undefined,
      service_rating: serviceRating || undefined,
      delivery_rating: selectedOrder.order_type === 'delivery' ? deliveryRating : undefined
    });
  };

  const hasReviewedRestaurant = (orderId) => {
    return myRestaurantReviews.some(r => r.order_id === orderId);
  };

  const openChat = (order) => {
    setChatOrder(order);
    setChatDialog(true);
  };

  const handleReorder = async (order) => {
    // Navigate back and trigger restaurant selection with reorder data
    sessionStorage.setItem('reorder', JSON.stringify({
      restaurantId: order.restaurant_id,
      items: order.items.map(item => ({
        menu_item_id: item.menu_item_id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    }));
    onBack(); // Go back to customer app which will handle the reorder
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    ready: "bg-indigo-100 text-indigo-700",
    out_for_delivery: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700"
  };

  const currentStatusIndex = liveOrder ? statuses.findIndex(s => s.key === liveOrder.status) : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">📦 {t('orders')}</h1>
          <p className="text-slate-600">{t('view_track_orders')}</p>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher par numéro, client ou restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="active" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">{t('active_orders')} ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="history">{t('order_history')} ({completedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">{t('no_active_orders')}</p>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order) => (
                <Card 
                  key={order.id} 
                  className="hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleOrderClick(order)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{order.order_number}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                          {new Date(order.created_date).toLocaleString()}
                        </p>
                        <p className="text-sm font-semibold text-slate-700 mt-1">
                          {order.restaurant_name}
                        </p>
                      </div>
                      <Badge className={statusColors[order.status]}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-600">
                        {order.items.length} {order.items.length === 1 ? t('item') : t('items')}
                      </p>
                      <span className="text-xl font-bold text-green-600">{order.total_amount.toFixed(0)} CFA</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex gap-2 mb-4 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('filter_by_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="delivered">{t('delivered')}</SelectItem>
                  <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('filter_by_date')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_dates')}</SelectItem>
                  <SelectItem value="today">{t('today')}</SelectItem>
                  <SelectItem value="week">{t('this_week')}</SelectItem>
                  <SelectItem value="month">{t('this_month')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">{t('no_orders_in_history')}</p>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{order.order_number}</CardTitle>
                          <Badge className={statusColors[order.status]}>
                            {order.status === 'delivered' ? `✓ ${t('delivered')}` : t('cancelled')}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {new Date(order.created_date).toLocaleDateString(language, { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm font-semibold text-slate-700 mt-1">
                          {order.restaurant_name}
                        </p>
                      </div>
                      <span className="text-xl font-bold text-green-600">{order.total_amount.toFixed(0)} CFA</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-slate-600">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between py-1">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-semibold">{(item.price * item.quantity).toFixed(0)} CFA</span>
                          </div>
                        ))}
                      </div>
                      
                      {order.driver_name && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-600">{t('driver')}</p>
                          <p className="text-sm font-semibold">{order.driver_name}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => handleOrderClick(order)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          {t('view_details')}
                        </Button>
                        <Button 
                          onClick={() => handleReorder(order)}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {t('reorder')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('live_order_tracking')} - {liveOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {liveOrder && (
            <div className="space-y-6">
              {/* ETA Display */}
              {liveOrder.status === 'out_for_delivery' && estimatedArrival && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-4 sm:p-6 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-semibold mb-1">{t('estimated_arrival_time')}</p>
                      <p className="text-3xl sm:text-4xl font-bold text-green-700">
                        {estimatedArrival.minutes} {t('min')}
                      </p>
                      <p className="text-xs sm:text-sm text-green-600 mt-1">
                        {t('arriving_around')} {estimatedArrival.time.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="animate-pulse">
                      <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Driver picked up message */}
              {liveOrder.status === 'preparing' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 p-4 sm:p-6 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="animate-bounce">
                      <Package className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-bold text-blue-700">{t('driver_picked_up_order_message')}</p>
                      <p className="text-sm text-blue-600 mt-1">{t('will_be_on_your_way_soon')}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {liveOrder.order_type === 'delivery' && liveOrder.status === 'out_for_delivery' && liveOrder.driver_location && (
                <DeliveryMap order={liveOrder} />
              )}

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
                          {t(status.key)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-sm font-semibold">{liveOrder.customer_name}</p>
                      {liveOrder.customer_address && (
                        <p className="text-sm text-slate-600">{liveOrder.customer_address}</p>
                      )}
                    </div>
                  </div>

                  {liveOrder.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <p className="text-sm">{liveOrder.customer_phone}</p>
                    </div>
                  )}

                  {liveOrder.estimated_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <p className="text-sm">{t('estimated')} {liveOrder.estimated_time} {t('minutes')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {liveOrder.driver_name && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-700" />
                        <p className="text-sm font-semibold text-blue-700">{t('your_driver')}:</p>
                      </div>
                      <p className="font-semibold">{liveOrder.driver_name}</p>
                      <p className="text-sm text-slate-600">{liveOrder.driver_phone}</p>
                      {liveOrder.vehicle_type && (
                        <Badge variant="outline" className="mt-2">
                          {liveOrder.vehicle_type}
                        </Badge>
                      )}
                      <div className="flex gap-2 mt-3">
                        <a href={`tel:${liveOrder.driver_phone}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Phone className="w-3 h-3 mr-1" />
                            {t('call')}
                          </Button>
                        </a>
                        <Button size="sm" variant="outline" onClick={() => openChat(liveOrder)} className="flex-1">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {t('chat')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {liveOrder.delivery_code && liveOrder.order_type === 'delivery' && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Key className="w-5 h-5 text-green-700" />
                        <p className="text-sm font-bold text-green-700">{t('your_delivery_code')}:</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 mb-3">
                        <p className="text-4xl font-bold text-green-700 text-center tracking-widest">
                          {liveOrder.delivery_code}
                        </p>
                      </div>
                      <p className="text-xs text-slate-700 text-center font-semibold">
                        📱 {t('share_code_with_driver')}
                      </p>
                      <p className="text-xs text-slate-600 text-center mt-1">
                        Le chauffeur vous demandera ce code à la livraison
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-3">{t('order_items')}:</p>
                <div className="space-y-2">
                  {liveOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-semibold">{(item.price * item.quantity).toFixed(0)} CFA</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                  <span>{t('total')}</span>
                  <span className="text-green-600">{liveOrder.total_amount.toFixed(0)} CFA</span>
                </div>
              </div>

              {!liveOrder.driver_location && liveOrder.status === 'out_for_delivery' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="text-sm text-amber-800">
                    📍 {t('awaiting_driver_gps')}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setTrackingDialog(false)}>{t('close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={orderDetailsDialog} onOpenChange={setOrderDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('order_details')}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between items-start p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-bold text-lg">{selectedOrder.order_number}</p>
                  <p className="text-sm text-slate-600">{new Date(selectedOrder.created_date).toLocaleString()}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{selectedOrder.restaurant_name}</p>
                </div>
                <div className="text-right">
                  <Badge className={statusColors[selectedOrder.status]}>
                    {selectedOrder.status.replace('_', ' ')}
                  </Badge>
                  <p className="text-2xl font-bold text-green-600 mt-2">{selectedOrder.total_amount.toFixed(0)} CFA</p>
                </div>
              </div>

              {selectedOrder.delivery_code && selectedOrder.order_type === 'delivery' && (
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Key className="w-6 h-6 text-green-700" />
                    <p className="text-lg font-bold text-green-700">CODE DE LIVRAISON</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 mb-3 shadow-inner">
                    <p className="text-6xl font-bold text-green-700 text-center tracking-widest">
                      {selectedOrder.delivery_code}
                    </p>
                  </div>
                  <p className="text-sm text-slate-700 text-center font-semibold">
                    📱 Donnez ce code au chauffeur à la livraison
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-600" />
                    {t('customer_info')}
                  </h4>
                  <div className="text-sm space-y-1 pl-6">
                    <p>{selectedOrder.customer_name}</p>
                    <p className="text-slate-600">{selectedOrder.customer_phone}</p>
                    {selectedOrder.customer_address && (
                      <p className="text-slate-600">{selectedOrder.customer_address}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-600" />
                    {t('order_info')}
                  </h4>
                  <div className="text-sm space-y-1 pl-6">
                    <p className="capitalize">{selectedOrder.order_type?.replace('_', ' ')}</p>
                    {selectedOrder.estimated_time && (
                      <p className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3" />
                        {selectedOrder.estimated_time} {t('min_estimated')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedOrder.special_instructions && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-semibold text-sm mb-1">{t('special_instructions')}:</p>
                  <p className="text-sm text-slate-700">{selectedOrder.special_instructions}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">{t('items')}:</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-2 pb-2 border-b">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold">{(item.price * item.quantity).toFixed(0)} CFA</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                  <span>{t('total')}</span>
                  <span className="text-green-600">{selectedOrder.total_amount.toFixed(0)} CFA</span>
                </div>
              </div>

              {selectedOrder.driver_name && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {t('driver_information')}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{selectedOrder.driver_name}</p>
                    <div className="flex gap-2 mt-2">
                      <a href={`tel:${selectedOrder.driver_phone}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <Phone className="w-3 h-3 mr-1" />
                          {selectedOrder.driver_phone}
                        </Button>
                      </a>
                      {['confirmed', 'preparing', 'out_for_delivery'].includes(selectedOrder.status) && (
                        <Button size="sm" variant="outline" onClick={() => openChat(selectedOrder)} className="flex-1">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {t('message')}
                        </Button>
                      )}
                    </div>
                    {selectedOrder.customer_rating && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < selectedOrder.customer_rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                          ))}
                        </div>
                        {selectedOrder.tip_amount > 0 && (
                          <span className="text-xs text-green-600">• {t('tip')}: {selectedOrder.tip_amount.toFixed(0)} CFA</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t flex-wrap">
                {['out_for_delivery', 'preparing', 'ready'].includes(selectedOrder.status) && (
                  <Button onClick={() => handleTrackOrder(selectedOrder)} className="flex-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    {t('track_order_live')}
                  </Button>
                )}
                {selectedOrder.status === 'delivered' && !selectedOrder.customer_rating && (
                  <Button onClick={() => {
                    setOrderDetailsDialog(false);
                    handleRateDriver(selectedOrder);
                  }} className="flex-1">
                    <Star className="w-4 h-4 mr-2" />
                    {t('rate_tip_driver')}
                  </Button>
                )}
                {selectedOrder.status === 'delivered' && !hasReviewedRestaurant(selectedOrder.id) && (
                  <Button onClick={() => {
                    setOrderDetailsDialog(false);
                    handleReviewRestaurant(selectedOrder);
                  }} variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('review_restaurant')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {chatOrder && (
        <ChatWindow 
          order={chatOrder}
          user={user}
          userType="customer"
          open={chatDialog}
          onOpenChange={setChatDialog}
        />
      )}

      <Dialog open={ratingDialog} onOpenChange={setRatingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('rate_delivery_experience')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{t('how_was_delivery')} *</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-slate-600">
                  {rating === 1 && t('poor')}
                  {rating === 2 && t('fair')}
                  {rating === 3 && t('good')}
                  {rating === 4 && t('very_good')}
                  {rating === 5 && t('excellent')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('add_tip_for_driver')} ({t('optional')})</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={tipAmount === "500" ? "default" : "outline"}
                  onClick={() => setTipAmount("500")}
                  className="flex-1"
                >
                  500 CFA
                </Button>
                <Button
                  type="button"
                  variant={tipAmount === "1000" ? "default" : "outline"}
                  onClick={() => setTipAmount("1000")}
                  className="flex-1"
                >
                  1000 CFA
                </Button>
                <Button
                  type="button"
                  variant={tipAmount === "2000" ? "default" : "outline"}
                  onClick={() => setTipAmount("2000")}
                  className="flex-1"
                >
                  2000 CFA
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">{t('custom')}:</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="0.00"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="flex-1"
                />
              </div>
              {tipAmount && parseFloat(tipAmount) > 0 && (
                <p className="text-sm text-green-600 text-center">
                  💚 {t('thank_you_for_supporting_drivers')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('share_your_feedback')} ({t('optional')})</Label>
              <Textarea
                placeholder={t('tell_us_about_experience')}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingDialog(false)}>{t('cancel')}</Button>
            <Button onClick={submitRating} disabled={rating === 0}>
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('submit_review')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restaurantReviewDialog} onOpenChange={setRestaurantReviewDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('review')} {selectedOrder?.restaurant_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{t('overall_rating')} *</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRestaurantRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= restaurantRating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-slate-700">{t('detailed_ratings')} ({t('optional')})</p>
              
              <div className="space-y-2">
                <Label className="text-sm">{t('food_quality')}</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFoodRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= foodRating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t('service')}</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setServiceRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= serviceRating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {selectedOrder?.order_type === 'delivery' && (
                <div className="space-y-2">
                  <Label className="text-sm">{t('delivery_experience')}</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setDeliveryRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= deliveryRating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('your_review')}</Label>
              <Textarea
                placeholder={t('share_experience_restaurant')}
                value={restaurantComment}
                onChange={(e) => setRestaurantComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestaurantReviewDialog(false)}>{t('cancel')}</Button>
            <Button onClick={submitRestaurantReview} disabled={restaurantRating === 0}>
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('submit_review')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}