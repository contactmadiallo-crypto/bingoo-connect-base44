
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Star, DollarSign, MessageSquare, Truck, Phone, Package, Clock, User, Key, CheckCircle, MessageCircle } from "lucide-react";
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
  
  const { t } = useTranslation(language);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: orders } = useQuery({
    queryKey: ['my-orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ created_by: user.email }, '-created_date'),
    initialData: [],
    enabled: !!user,
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

        <div className="space-y-4">
          {orders.map((order) => (
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
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                  <span className="text-xl font-bold text-green-600">${order.total_amount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {orders.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">{t('no_orders')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Live Order Tracking - {liveOrder?.order_number}</DialogTitle>
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
                      <p className="text-sm text-green-700 font-semibold mb-1">Temps d'Arrivée Estimé</p>
                      <p className="text-3xl sm:text-4xl font-bold text-green-700">
                        {estimatedArrival.minutes} min
                      </p>
                      <p className="text-xs sm:text-sm text-green-600 mt-1">
                        Arrivée vers {estimatedArrival.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
                      <p className="text-lg sm:text-xl font-bold text-blue-700">Chauffeur a récupéré votre commande!</p>
                      <p className="text-sm text-blue-600 mt-1">Il sera bientôt en route vers vous</p>
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
                          {status.label}
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
                      <p className="text-sm">Est. {liveOrder.estimated_time} minutes</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {liveOrder.driver_name && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-700" />
                        <p className="text-sm font-semibold text-blue-700">Your Driver:</p>
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
                            Appeler
                          </Button>
                        </a>
                        <Button size="sm" variant="outline" onClick={() => openChat(liveOrder)} className="flex-1">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  )}

                  {liveOrder.delivery_code && liveOrder.status === 'out_for_delivery' && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-4 h-4 text-green-700" />
                        <p className="text-sm font-semibold text-green-700">Your Delivery Code:</p>
                      </div>
                      <p className="text-3xl font-bold text-green-700 text-center tracking-wider">
                        {liveOrder.delivery_code}
                      </p>
                      <p className="text-xs text-slate-600 mt-2">
                        Share this code with the driver to confirm delivery
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-3">Order Items:</p>
                <div className="space-y-2">
                  {liveOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                  <span>Total</span>
                  <span className="text-green-600">${liveOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {!liveOrder.driver_location && liveOrder.status === 'out_for_delivery' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="text-sm text-amber-800">
                    📍 En attente de la position GPS du chauffeur...
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setTrackingDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={orderDetailsDialog} onOpenChange={setOrderDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
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
                  <p className="text-2xl font-bold text-green-600 mt-2">${selectedOrder.total_amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-600" />
                    Customer Info
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
                    Order Info
                  </h4>
                  <div className="text-sm space-y-1 pl-6">
                    <p className="capitalize">{selectedOrder.order_type?.replace('_', ' ')}</p>
                    {selectedOrder.estimated_time && (
                      <p className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3" />
                        {selectedOrder.estimated_time} min estimated
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedOrder.special_instructions && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-semibold text-sm mb-1">Special Instructions:</p>
                  <p className="text-sm text-slate-700">{selectedOrder.special_instructions}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">{t('items')}:</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-2 pb-2 border-b">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                  <span>{t('total')}</span>
                  <span className="text-green-600">${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.driver_name && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Driver Information
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
                          Message
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
                          <span className="text-xs text-green-600">• Tip: ${selectedOrder.tip_amount.toFixed(2)}</span>
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
                    Track Order Live
                  </Button>
                )}
                {selectedOrder.status === 'delivered' && !selectedOrder.customer_rating && (
                  <Button onClick={() => {
                    setOrderDetailsDialog(false);
                    handleRateDriver(selectedOrder);
                  }} className="flex-1">
                    <Star className="w-4 h-4 mr-2" />
                    Rate & Tip Driver
                  </Button>
                )}
                {selectedOrder.status === 'delivered' && !hasReviewedRestaurant(selectedOrder.id) && (
                  <Button onClick={() => {
                    setOrderDetailsDialog(false);
                    handleReviewRestaurant(selectedOrder);
                  }} variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Review Restaurant
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
            <DialogTitle>Rate Your Delivery Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>How was your delivery? *</Label>
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
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent!"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Add a Tip for Your Driver (Optional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={tipAmount === "2" ? "default" : "outline"}
                  onClick={() => setTipAmount("2")}
                  className="flex-1"
                >
                  $2
                </Button>
                <Button
                  type="button"
                  variant={tipAmount === "5" ? "default" : "outline"}
                  onClick={() => setTipAmount("5")}
                  className="flex-1"
                >
                  $5
                </Button>
                <Button
                  type="button"
                  variant={tipAmount === "10" ? "default" : "outline"}
                  onClick={() => setTipAmount("10")}
                  className="flex-1"
                >
                  $10
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">Custom:</Label>
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
                  💚 Thank you for supporting our drivers!
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Share Your Feedback (Optional)</Label>
              <Textarea
                placeholder="Tell us about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingDialog(false)}>Cancel</Button>
            <Button onClick={submitRating} disabled={rating === 0}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restaurantReviewDialog} onOpenChange={setRestaurantReviewDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review {selectedOrder?.restaurant_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Overall Rating *</Label>
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
              <p className="text-sm font-semibold text-slate-700">Detailed Ratings (Optional)</p>
              
              <div className="space-y-2">
                <Label className="text-sm">Food Quality</Label>
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
                <Label className="text-sm">Service</Label>
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
                  <Label className="text-sm">Delivery Experience</Label>
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
              <Label>Your Review</Label>
              <Textarea
                placeholder="Share your experience with this restaurant..."
                value={restaurantComment}
                onChange={(e) => setRestaurantComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestaurantReviewDialog(false)}>Cancel</Button>
            <Button onClick={submitRestaurantReview} disabled={restaurantRating === 0}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
