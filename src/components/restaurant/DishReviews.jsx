import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Star, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DishReviews({ menuItem, restaurant, user, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const queryClient = useQueryClient();

  const { data: reviews } = useQuery({
    queryKey: ['reviews', menuItem.id],
    queryFn: () => base44.entities.Review.filter({ menu_item_id: menuItem.id }),
    initialData: [],
  });

  const createReviewMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', menuItem.id] });
      setComment("");
      setRating(5);
      alert("Review submitted successfully!");
    },
  });

  const handleSubmit = () => {
    if (!comment.trim()) {
      alert("Please add a comment");
      return;
    }

    createReviewMutation.mutate({
      menu_item_id: menuItem.id,
      menu_item_name: menuItem.name,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      customer_name: user.full_name,
      rating,
      comment,
      created_by: user.email
    });
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5" />
            Reviews for {menuItem.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-3xl font-bold text-orange-600">{averageRating}</p>
                <p className="text-sm text-slate-600">{reviews.length} reviews</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(averageRating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Write a Review</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 mb-2">Your Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredStar || rating)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Share your experience with this dish..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-24"
              />

              <Button 
                onClick={handleSubmit} 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={createReviewMutation.isPending}
              >
                Submit Review
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Customer Reviews ({reviews.length})</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reviews.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{review.customer_name}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(review.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}