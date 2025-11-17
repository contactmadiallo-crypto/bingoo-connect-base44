import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Package, Gift, TrendingUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function NotificationPreferences({ user, onUserUpdate }) {
  const [preferences, setPreferences] = useState({
    order_updates: true,
    promotional_offers: true,
    loyalty_updates: true,
    restaurant_news: true,
    driver_messages: true,
    email_notifications: false,
    sms_notifications: false
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.notification_preferences) {
      setPreferences({ ...preferences, ...user.notification_preferences });
    }
  }, [user]);

  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences) => base44.auth.updateMe({ notification_preferences: newPreferences }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success("Préférences enregistrées!");
      if (onUserUpdate) onUserUpdate();
    },
  });

  const handleToggle = (key) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const notificationSettings = [
    {
      key: 'order_updates',
      icon: Package,
      title: 'Mises à jour de commande',
      description: 'Recevoir des notifications sur le statut de vos commandes',
      color: 'text-blue-600'
    },
    {
      key: 'promotional_offers',
      icon: Gift,
      title: 'Offres promotionnelles',
      description: 'Recevoir des offres spéciales et promotions',
      color: 'text-orange-600'
    },
    {
      key: 'loyalty_updates',
      icon: TrendingUp,
      title: 'Programme de fidélité',
      description: 'Recevoir des mises à jour sur vos points et récompenses',
      color: 'text-purple-600'
    },
    {
      key: 'restaurant_news',
      icon: Bell,
      title: 'Actualités des restaurants',
      description: 'Recevoir des nouvelles des restaurants que vous suivez',
      color: 'text-green-600'
    },
    {
      key: 'driver_messages',
      icon: MessageSquare,
      title: 'Messages du chauffeur',
      description: 'Recevoir des notifications quand le chauffeur vous envoie un message',
      color: 'text-indigo-600'
    }
  ];

  const channelSettings = [
    {
      key: 'email_notifications',
      title: 'Notifications par email',
      description: 'Recevoir des notifications par email'
    },
    {
      key: 'sms_notifications',
      title: 'Notifications par SMS',
      description: 'Recevoir des notifications par SMS (si disponible)'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Préférences de Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">Types de notifications</h3>
            {notificationSettings.map((setting) => {
              const Icon = setting.icon;
              return (
                <div key={setting.key} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white ${setting.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <Label className="font-semibold cursor-pointer">{setting.title}</Label>
                      <p className="text-sm text-slate-600 mt-1">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[setting.key]}
                    onCheckedChange={() => handleToggle(setting.key)}
                  />
                </div>
              );
            })}
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-sm text-slate-700 mb-4">Canaux de notification</h3>
            <div className="space-y-3">
              {channelSettings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <Label className="font-medium cursor-pointer">{setting.title}</Label>
                    <p className="text-xs text-slate-600 mt-1">{setting.description}</p>
                  </div>
                  <Switch
                    checked={preferences[setting.key]}
                    onCheckedChange={() => handleToggle(setting.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Astuce:</strong> Activez les notifications de commande pour suivre en temps réel l'état de vos livraisons.
            </p>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={updatePreferencesMutation.isPending}>
            Enregistrer les préférences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}