import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Leaf, GlassWater, Wheat, Moon, Milk, Nut, Flame } from "lucide-react";
import { toast } from "sonner";

const dietaryOptions = [
  { value: "vegetarian", label: "Végétarien", icon: Leaf, color: "bg-green-100 text-green-700" },
  { value: "vegan", label: "Végan", icon: Leaf, color: "bg-green-200 text-green-800" },
  { value: "gluten_free", label: "Sans Gluten", icon: Wheat, color: "bg-amber-100 text-amber-700" },
  { value: "halal", label: "Halal", icon: Moon, color: "bg-emerald-100 text-emerald-700" },
  { value: "kosher", label: "Casher", icon: CheckCircle, color: "bg-blue-100 text-blue-700" },
  { value: "dairy_free", label: "Sans Lactose", icon: Milk, color: "bg-purple-100 text-purple-700" },
  { value: "nut_free", label: "Sans Noix", icon: Nut, color: "bg-orange-100 text-orange-700" },
  { value: "low_carb", label: "Faible en Glucides", icon: Flame, color: "bg-red-100 text-red-700" }
];

const deliveryInstructions = [
  "Laisser à la porte",
  "Appeler à l'arrivée",
  "Sonner à la porte",
  "Remettre en main propre",
  "Laisser à la réception"
];

export default function UserPreferences({ user, onUpdate }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({
    dietary_preferences: user.dietary_preferences || [],
    default_delivery_instructions: user.default_delivery_instructions || "",
    notification_preferences: user.notification_preferences || {
      order_updates: true,
      promotions: true,
      loyalty_rewards: true,
      new_restaurants: false
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success("Préférences enregistrées!");
      if (onUpdate) onUpdate();
    },
  });

  const toggleDietary = (value) => {
    const current = preferences.dietary_preferences || [];
    const updated = current.includes(value)
      ? current.filter(p => p !== value)
      : [...current, value];
    setPreferences({ ...preferences, dietary_preferences: updated });
  };

  const toggleNotification = (key) => {
    setPreferences({
      ...preferences,
      notification_preferences: {
        ...preferences.notification_preferences,
        [key]: !preferences.notification_preferences[key]
      }
    });
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            🥗 Préférences Alimentaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Sélectionnez vos restrictions alimentaires pour filtrer les restaurants et plats
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {dietaryOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = preferences.dietary_preferences?.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleDietary(option.value)}
                  className={`p-3 sm:p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                    isSelected 
                      ? `${option.color} border-current` 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-2 ${isSelected ? '' : 'text-slate-400'}`} />
                  <p className="text-xs sm:text-sm font-semibold">{option.label}</p>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 mt-1 opacity-70" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            📦 Instructions de Livraison par Défaut
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Ces instructions seront automatiquement ajoutées à toutes vos commandes
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {deliveryInstructions.map((instruction) => (
              <Button
                key={instruction}
                variant={preferences.default_delivery_instructions === instruction ? "default" : "outline"}
                onClick={() => setPreferences({ ...preferences, default_delivery_instructions: instruction })}
                size="sm"
                className="h-auto py-2 text-xs sm:text-sm whitespace-normal"
              >
                {instruction}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Instructions Personnalisées</Label>
            <Textarea
              placeholder="Ex: Sonnez deux fois, appartement au 3ème étage..."
              value={preferences.default_delivery_instructions}
              onChange={(e) => setPreferences({ ...preferences, default_delivery_instructions: e.target.value })}
              rows={3}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            🔔 Préférences de Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-sm sm:text-base">Mises à Jour de Commande</p>
              <p className="text-xs sm:text-sm text-slate-600">Recevoir des notifications sur vos commandes</p>
            </div>
            <Switch
              checked={preferences.notification_preferences?.order_updates ?? true}
              onCheckedChange={() => toggleNotification('order_updates')}
            />
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-sm sm:text-base">Promotions & Offres</p>
              <p className="text-xs sm:text-sm text-slate-600">Recevoir les offres spéciales</p>
            </div>
            <Switch
              checked={preferences.notification_preferences?.promotions ?? true}
              onCheckedChange={() => toggleNotification('promotions')}
            />
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-sm sm:text-base">Récompenses Fidélité</p>
              <p className="text-xs sm:text-sm text-slate-600">Alertes sur vos points et récompenses</p>
            </div>
            <Switch
              checked={preferences.notification_preferences?.loyalty_rewards ?? true}
              onCheckedChange={() => toggleNotification('loyalty_rewards')}
            />
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-sm sm:text-base">Nouveaux Restaurants</p>
              <p className="text-xs sm:text-sm text-slate-600">Découvrir les nouvelles ouvertures</p>
            </div>
            <Switch
              checked={preferences.notification_preferences?.new_restaurants ?? false}
              onCheckedChange={() => toggleNotification('new_restaurants')}
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
        disabled={updatePreferencesMutation.isPending}
      >
        💾 Enregistrer les Préférences
      </Button>
    </div>
  );
}