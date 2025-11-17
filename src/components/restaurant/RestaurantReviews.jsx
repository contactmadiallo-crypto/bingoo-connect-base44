import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function RestaurantReviews({ restaurant, user }) {
  const [showResponseForm, setShowResponseForm] = useState(null);
  const [responseText, setResponseText] = useState("");
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['restaurant-reviews', restaurant.id],
    queryFn: () => base44.entities.RestaurantReview.filter({ restaurant_id: restaurant.id }, '-created_date'),
  });

  const respondToReviewMutation = useMutation({
    mutationFn: ({ reviewId, response }) => base44.entities.RestaurantReview.update(reviewId, {
      restaurant_response: response,
      response_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-reviews'] });
      setShowResponseForm(null);
      setResponseText("");
    },
  });

  const markHelpfulMutation = useMutation({
    mutationFn: (review) => base44.entities.RestaurantReview.update(review.id, {
      helpful_count: (review.helpful_count || 0) + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-reviews'] });
    },
  });

  const handleRespond = (reviewId) => {
    if (!responseText.trim()) return;
    respondToReviewMutation.mutate({ reviewId, response: responseText });
  };

  const isOwner = user?.email === restaurant.owner_email;

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === stars).length / reviews.length * 100) : 0
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold">{avgRating}</span>
              <span className="text-sm text-slate-600">({reviews.length} reviews)</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium">{stars}</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-yellow-500 h-full rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 bg-slate-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{review.customer_name}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(review.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpfulMutation.mutate(review)}
                      className="text-slate-600"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {review.helpful_count || 0}
                    </Button>
                  </div>

                  {(review.food_rating || review.service_rating || review.delivery_rating) && (
                    <div className="flex gap-4 mb-3 text-sm">
                      {review.food_rating && (
                        <Badge variant="outline">Food: {review.food_rating}⭐</Badge>
                      )}
                      {review.service_rating && (
                        <Badge variant="outline">Service: {review.service_rating}⭐</Badge>
                      )}
                      {review.delivery_rating && (
                        <Badge variant="outline">Delivery: {review.delivery_rating}⭐</Badge>
                      )}
                    </div>
                  )}

                  <p className="text-slate-700 mb-3">{review.comment}</p>

                  {review.restaurant_response && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        Response from {restaurant.name}
                      </p>
                      <p className="text-sm text-slate-700">{review.restaurant_response}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(review.response_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {isOwner && !review.restaurant_response && (
                    <div className="mt-3">
                      {showResponseForm === review.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Write your response..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleRespond(review.id)}>
                              Post Response
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setShowResponseForm(null);
                              setResponseText("");
                            }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowResponseForm(review.id)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Respond
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}