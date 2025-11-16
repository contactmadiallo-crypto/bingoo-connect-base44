import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoyaltyRewards({ restaurant, loyalty, onRewardApplied }) {
  const queryClient = useQueryClient();

  const { data: rewards = [] } = useQuery({
    queryKey: ['loyalty-rewards', restaurant.id],
    queryFn: () => base44.entities.LoyaltyReward.filter({ 
      restaurant_id: restaurant.id, 
      active: true 
    }),
    enabled: !!restaurant?.loyalty_enabled,
  });

  const redeemMutation = useMutation({
    mutationFn: async (reward) => {
      // Update reward usage
      await base44.entities.LoyaltyReward.update(reward.id, {
        times_redeemed: (reward.times_redeemed || 0) + 1
      });
      
      // Update customer loyalty
      await base44.entities.CustomerLoyalty.update(loyalty.id, {
        points: loyalty.points - reward.points_required,
        rewards_redeemed: (loyalty.rewards_redeemed || 0) + 1
      });
      
      return reward;
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: ['customer-loyalty'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-rewards'] });
      onRewardApplied?.(reward);
    },
  });

  if (!restaurant?.loyalty_enabled || !loyalty || rewards.length === 0) return null;

  const canRedeem = (reward) => {
    const hasEnoughPoints = loyalty.points >= reward.points_required;
    const tierOrder = ["bronze", "silver", "gold", "platinum"];
    const hasTier = tierOrder.indexOf(loyalty.tier) >= tierOrder.indexOf(reward.tier_required);
    const notExhausted = !reward.usage_limit || reward.times_redeemed < reward.usage_limit;
    return hasEnoughPoints && hasTier && notExhausted;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-orange-600" />
        <h3 className="text-xl font-bold text-slate-900">Available Rewards</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {rewards.map((reward) => {
          const eligible = canRedeem(reward);
          const tierOrder = ["bronze", "silver", "gold", "platinum"];
          const needsHigherTier = tierOrder.indexOf(loyalty.tier) < tierOrder.indexOf(reward.tier_required);
          
          return (
            <motion.div
              key={reward.id}
              whileHover={eligible ? { scale: 1.02 } : {}}
              className={!eligible ? "opacity-60" : ""}
            >
              <Card className={`${eligible ? "border-orange-300" : "border-slate-200"}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{reward.title}</h4>
                      <p className="text-sm text-slate-600">{reward.description}</p>
                    </div>
                    {needsHigherTier && <Lock className="w-5 h-5 text-slate-400" />}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={eligible ? "default" : "outline"}>
                      {reward.points_required} points
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {reward.tier_required}+ tier
                    </Badge>
                    {reward.discount_type === "percentage" && (
                      <Badge variant="secondary">
                        {reward.discount_value}% off
                      </Badge>
                    )}
                    {reward.discount_type === "fixed_amount" && (
                      <Badge variant="secondary">
                        ${reward.discount_value} off
                      </Badge>
                    )}
                  </div>

                  {reward.usage_limit && (
                    <p className="text-xs text-slate-500 mb-3">
                      {reward.usage_limit - reward.times_redeemed} remaining
                    </p>
                  )}

                  <Button
                    onClick={() => redeemMutation.mutate(reward)}
                    disabled={!eligible || redeemMutation.isPending}
                    className="w-full"
                    variant={eligible ? "default" : "outline"}
                  >
                    {eligible ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Redeem Now
                      </>
                    ) : needsHigherTier ? (
                      "Requires Higher Tier"
                    ) : (
                      "Insufficient Points"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}