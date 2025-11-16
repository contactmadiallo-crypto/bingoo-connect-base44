import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Gift, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const tierConfig = {
  bronze: { color: "from-orange-400 to-orange-600", icon: Award, label: "Bronze" },
  silver: { color: "from-slate-400 to-slate-600", icon: Star, label: "Silver" },
  gold: { color: "from-yellow-400 to-yellow-600", icon: Star, label: "Gold" },
  platinum: { color: "from-purple-400 to-purple-600", icon: Award, label: "Platinum" }
};

export default function LoyaltyCard({ loyalty, restaurant }) {
  if (!loyalty || !restaurant?.loyalty_enabled) return null;

  const tierInfo = tierConfig[loyalty.tier];
  const TierIcon = tierInfo.icon;
  const currentTierConfig = restaurant.loyalty_tiers?.[loyalty.tier];
  const discount = currentTierConfig?.discount || 0;

  // Calculate next tier
  const tiers = ["bronze", "silver", "gold", "platinum"];
  const currentIndex = tiers.indexOf(loyalty.tier);
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  const nextTierPoints = nextTier ? restaurant.loyalty_tiers?.[nextTier]?.min_points : null;
  const pointsToNext = nextTierPoints ? nextTierPoints - loyalty.points : 0;
  const progress = nextTierPoints ? (loyalty.points / nextTierPoints) * 100 : 100;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="mb-6"
    >
      <Card className={`bg-gradient-to-br ${tierInfo.color} text-white border-none overflow-hidden`}>
        <CardContent className="pt-6 relative">
          <div className="absolute top-0 right-0 opacity-10">
            <TierIcon className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-none">
                  {tierInfo.label} Member
                </Badge>
                <h3 className="text-2xl font-bold">{restaurant.name}</h3>
                <p className="text-sm opacity-90">Loyalty Rewards</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{loyalty.points}</p>
                <p className="text-xs opacity-90">Points</p>
              </div>
            </div>

            {discount > 0 && (
              <div className="bg-white/20 rounded-lg p-3 mb-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  <span className="font-semibold">Your Benefit: {discount}% off all orders</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                <p className="text-xs opacity-75">Total Spent</p>
                <p className="font-bold">${loyalty.total_spent?.toFixed(0) || 0}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                <p className="text-xs opacity-75">Orders</p>
                <p className="font-bold">{loyalty.total_orders || 0}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                <p className="text-xs opacity-75">Rewards Used</p>
                <p className="font-bold">{loyalty.rewards_redeemed || 0}</p>
              </div>
            </div>

            {nextTier && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm opacity-90">Next: {tierConfig[nextTier].label}</span>
                  <span className="text-sm font-semibold">{pointsToNext} points needed</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    className="bg-white rounded-full h-2"
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {!nextTier && (
              <div className="text-center bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                <p className="text-sm font-semibold">Max Tier Achieved! 🎉</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}