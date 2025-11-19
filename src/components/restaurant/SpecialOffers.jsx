import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Percent, Clock, Tag } from "lucide-react";
import { motion } from "framer-motion";

export default function SpecialOffers({ restaurant, onApplyOffer, appliedOffer, language = "en" }) {
  if (!restaurant.special_offers || restaurant.special_offers.length === 0) {
    return null;
  }

  const translations = {
    en: {
      special_offers: "Special Offers",
      apply: "Apply",
      applied: "Applied",
      remove: "Remove",
      min_order: "Min order",
      valid_until: "Valid until",
      discount: "discount",
      off: "off"
    },
    fr: {
      special_offers: "Offres Spéciales",
      apply: "Appliquer",
      applied: "Appliqué",
      remove: "Retirer",
      min_order: "Commande min",
      valid_until: "Valable jusqu'au",
      discount: "réduction",
      off: "de réduction"
    },
    ar: {
      special_offers: "العروض الخاصة",
      apply: "تطبيق",
      applied: "مطبق",
      remove: "إزالة",
      min_order: "الحد الأدنى للطلب",
      valid_until: "صالح حتى",
      discount: "خصم",
      off: "خصم"
    }
  };

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  const getOfferIcon = (type) => {
    switch (type) {
      case "percentage": return <Percent className="w-5 h-5" />;
      case "fixed_amount": return <Tag className="w-5 h-5" />;
      case "free_delivery": return <Gift className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const getOfferColor = (type) => {
    switch (type) {
      case "percentage": return "from-purple-500 to-pink-500";
      case "fixed_amount": return "from-green-500 to-emerald-500";
      case "free_delivery": return "from-blue-500 to-cyan-500";
      default: return "from-orange-500 to-red-500";
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Gift className="w-5 h-5 text-orange-600" />
        {t("special_offers")} 🎉
      </h3>
      <div className="grid gap-3">
        {restaurant.special_offers.map((offer, idx) => {
          const isApplied = appliedOffer?.code === offer.code;
          const isExpired = offer.valid_until && new Date(offer.valid_until) < new Date();
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`overflow-hidden ${isApplied ? 'border-2 border-green-500' : ''} ${isExpired ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getOfferColor(offer.type)} flex items-center justify-center text-white flex-shrink-0`}>
                      {getOfferIcon(offer.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{offer.title}</h4>
                          <p className="text-xs text-slate-600 mb-2">{offer.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {offer.type === "percentage" && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                {offer.discount_value}% {t("off")}
                              </Badge>
                            )}
                            {offer.type === "fixed_amount" && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                ${offer.discount_value} {t("discount")}
                              </Badge>
                            )}
                            {offer.type === "free_delivery" && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                Livraison Gratuite
                              </Badge>
                            )}
                            {offer.min_order && (
                              <Badge variant="outline" className="text-xs">
                                {t("min_order")}: ${offer.min_order}
                              </Badge>
                            )}
                            {offer.valid_until && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(offer.valid_until).toLocaleDateString(language)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isApplied ? "outline" : "default"}
                          onClick={() => onApplyOffer(isApplied ? null : offer)}
                          disabled={isExpired}
                          className={isApplied ? "bg-green-50 text-green-700 border-green-300" : ""}
                        >
                          {isApplied ? `✓ ${t("applied")}` : t("apply")}
                        </Button>
                      </div>
                      {offer.code && (
                        <div className="mt-2 text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                          Code: {offer.code}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}