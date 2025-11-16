import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Star, DollarSign, MessageSquare } from "lucide-react";
import { useTranslation } from "../translations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CustomerOrders({ user, onBack, language = "en" }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ratingDialog, setRatingDialog] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  const { t } = useTranslation(language);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: orders } = useQuery({
    queryKey: ['my-orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ created_by: user.email }, '-created_date'),
    initialData: [],
    enabled: !!user,
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setRatingDialog(false);
      setSelectedOrder(null);
      setRating(0);
      setFeedback("");
      setTipAmount("");
    },
  });

  const handleRateDriver = (order) => {
    setSelectedOrder(order);
    setRating(order.customer_rating || 0);
    setFeedback(order.customer_feedback || "");
    setTipAmount(order.tip_amount?.toString() || "");
    setRatingDialog(true);
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

  const trackOrder = (order) => {
    navigate(createPageUrl(`OrderTracking?order=${order.order_number}`));
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
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
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
                <div className="space-y-3">
                  <div className="border-t pt-3">
                    <p className="text-sm font-semibold mb-2">{t('items')}:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-semibold">{t('total')}</span>
                    <span className="text-xl font-bold text-green-600">${order.total_amount.toFixed(2)}</span>
                  </div>

                  {order.driver_name && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-semibold mb-1">🚗 Driver:</p>
                      <p className="text-sm">{order.driver_name} - {order.driver_phone}</p>
                      {order.customer_rating ? (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < order.customer_rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          {order.tip_amount > 0 && (
                            <span className="text-xs text-green-600">• Tip: ${order.tip_amount.toFixed(2)}</span>
                          )}
                        </div>
                      ) : order.status === 'delivered' && (
                        <Button size="sm" variant="outline" onClick={() => handleRateDriver(order)} className="mt-2">
                          <Star className="w-4 h-4 mr-2" />
                          Rate Driver
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="border-t pt-3 flex gap-2">
                    {['out_for_delivery', 'preparing', 'ready'].includes(order.status) && (
                      <Button onClick={() => trackOrder(order)} className="flex-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        Track Order
                      </Button>
                    )}
                    {order.status === 'delivered' && !order.customer_rating && (
                      <Button onClick={() => handleRateDriver(order)} className="flex-1">
                        <Star className="w-4 h-4 mr-2" />
                        Rate & Tip
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {orders.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600">{t('no_orders')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
    </div>
  );
}