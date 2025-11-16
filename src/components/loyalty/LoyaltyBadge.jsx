import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Award } from "lucide-react";

export default function LoyaltyBadge({ points, tier, compact = false }) {
  if (!tier) return null;

  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
    green: "bg-green-100 text-green-700 border-green-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    red: "bg-red-100 text-red-700 border-red-300",
    pink: "bg-pink-100 text-pink-700 border-pink-300"
  };

  if (compact) {
    return (
      <Badge className={`${colorClasses[tier.color || 'blue']} border`}>
        <Award className="w-3 h-3 mr-1" />
        {tier.name}
      </Badge>
    );
  }

  return (
    <div className={`${colorClasses[tier.color || 'blue']} border-2 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          <span className="font-bold">{tier.name} Member</span>
        </div>
        <Badge variant="secondary">{tier.discount_percentage}% OFF</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Star className="w-4 h-4" />
        <span>{points} points</span>
      </div>
      {tier.special_offer && (
        <p className="text-xs mt-2 opacity-90">{tier.special_offer}</p>
      )}
    </div>
  );
}