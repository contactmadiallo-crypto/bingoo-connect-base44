import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const daysOfWeek = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" }
];

const timeSlots = [
  "06:00-10:00",
  "10:00-14:00",
  "14:00-18:00",
  "18:00-22:00",
  "22:00-02:00"
];

export default function DriverPreferences({ driver, onClose }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({
    preferred_zones: driver.preferred_zones || [],
    preferred_hours: driver.preferred_hours || {}
  });
  const [newZone, setNewZone] = useState({ name: "", lat: "", lng: "", radius_km: 2 });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data) => base44.entities.DeliveryPartner.update(driver.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
      toast.success("Préférences enregistrées!");
      if (onClose) onClose();
    },
  });

  const addZone = () => {
    if (!newZone.name || !newZone.lat || !newZone.lng) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setPreferences({
      ...preferences,
      preferred_zones: [...preferences.preferred_zones, {
        name: newZone.name,
        lat: parseFloat(newZone.lat),
        lng: parseFloat(newZone.lng),
        radius_km: parseFloat(newZone.radius_km) || 2
      }]
    });
    setNewZone({ name: "", lat: "", lng: "", radius_km: 2 });
  };

  const removeZone = (index) => {
    setPreferences({
      ...preferences,
      preferred_zones: preferences.preferred_zones.filter((_, i) => i !== index)
    });
  };

  const toggleTimeSlot = (day, slot) => {
    const daySlots = preferences.preferred_hours[day] || [];
    const updated = daySlots.includes(slot)
      ? daySlots.filter(s => s !== slot)
      : [...daySlots, slot];
    
    setPreferences({
      ...preferences,
      preferred_hours: {
        ...preferences.preferred_hours,
        [day]: updated
      }
    });
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewZone({
            ...newZone,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          });
          toast.success("Position actuelle récupérée!");
        },
        () => toast.error("Impossible de récupérer votre position")
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-h-[80vh] overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
            Zones de Livraison Préférées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Définissez vos zones préférées pour recevoir des commandes prioritaires
          </p>

          {preferences.preferred_zones.map((zone, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{zone.name}</p>
                <p className="text-xs text-slate-600">
                  Rayon: {zone.radius_km} km • {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeZone(idx)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}

          <div className="border-t pt-4 space-y-3">
            <Label className="text-sm font-semibold">Ajouter une Zone</Label>
            <Input
              placeholder="Nom de la zone (ex: Plateau, Médina)"
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="0.000001"
                placeholder="Latitude"
                value={newZone.lat}
                onChange={(e) => setNewZone({ ...newZone, lat: e.target.value })}
              />
              <Input
                type="number"
                step="0.000001"
                placeholder="Longitude"
                value={newZone.lng}
                onChange={(e) => setNewZone({ ...newZone, lng: e.target.value })}
              />
            </div>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                step="0.5"
                placeholder="Rayon (km)"
                value={newZone.radius_km}
                onChange={(e) => setNewZone({ ...newZone, radius_km: e.target.value })}
                className="flex-1"
              />
              <Button variant="outline" onClick={useCurrentLocation} size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                Position Actuelle
              </Button>
            </div>
            <Button onClick={addZone} className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter la Zone
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-green-600" />
            Horaires de Travail Préférés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Sélectionnez vos créneaux horaires préférés pour chaque jour
          </p>

          {daysOfWeek.map((day) => (
            <div key={day.key} className="space-y-2">
              <Label className="text-sm font-semibold">{day.label}</Label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = preferences.preferred_hours[day.key]?.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleTimeSlot(day.key, slot)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:border-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2 sticky bottom-0 bg-white pt-4 pb-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={updatePreferencesMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
}