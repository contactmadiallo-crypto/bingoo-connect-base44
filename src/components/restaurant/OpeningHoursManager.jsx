import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const daysOfWeek = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
];

export default function OpeningHoursManager({ restaurant }) {
  const [schedule, setSchedule] = useState({});
  const [specialDates, setSpecialDates] = useState([]);
  const [newSpecialDate, setNewSpecialDate] = useState({ date: '', reason: '', closed: true });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (restaurant?.operating_hours) {
      setSchedule(restaurant.operating_hours);
    } else {
      // Default schedule
      const defaultSchedule = {};
      daysOfWeek.forEach(day => {
        defaultSchedule[day.key] = {
          open: true,
          periods: [{ start: '09:00', end: '22:00' }]
        };
      });
      setSchedule(defaultSchedule);
    }

    if (restaurant?.special_dates) {
      setSpecialDates(restaurant.special_dates);
    }
  }, [restaurant]);

  const updateScheduleMutation = useMutation({
    mutationFn: (data) => base44.entities.Restaurant.update(restaurant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast.success("Horaires mis à jour!");
    },
  });

  const toggleDayOpen = (day) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        open: !schedule[day]?.open
      }
    });
  };

  const updatePeriod = (day, periodIndex, field, value) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day]) {
      newSchedule[day] = { open: true, periods: [{ start: '', end: '' }] };
    }
    newSchedule[day].periods[periodIndex][field] = value;
    setSchedule(newSchedule);
  };

  const addPeriod = (day) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day]) {
      newSchedule[day] = { open: true, periods: [] };
    }
    newSchedule[day].periods.push({ start: '', end: '' });
    setSchedule(newSchedule);
  };

  const removePeriod = (day, periodIndex) => {
    const newSchedule = { ...schedule };
    newSchedule[day].periods = newSchedule[day].periods.filter((_, i) => i !== periodIndex);
    setSchedule(newSchedule);
  };

  const addSpecialDate = () => {
    if (!newSpecialDate.date || !newSpecialDate.reason) {
      toast.error("Date et raison requis");
      return;
    }
    setSpecialDates([...specialDates, newSpecialDate]);
    setNewSpecialDate({ date: '', reason: '', closed: true });
  };

  const removeSpecialDate = (index) => {
    setSpecialDates(specialDates.filter((_, i) => i !== index));
  };

  const saveSchedule = () => {
    updateScheduleMutation.mutate({
      operating_hours: schedule,
      special_dates: specialDates
    });
  };

  const isCurrentlyOpen = () => {
    const now = new Date();
    const dayKey = daysOfWeek[now.getDay() === 0 ? 6 : now.getDay() - 1].key;
    const daySchedule = schedule[dayKey];

    if (!daySchedule?.open) return false;

    const currentTime = now.toTimeString().slice(0, 5);
    return daySchedule.periods.some(period => 
      currentTime >= period.start && currentTime <= period.end
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horaires d'Ouverture
            </CardTitle>
            <Badge className={isCurrentlyOpen() ? "bg-green-500" : "bg-red-500"}>
              {isCurrentlyOpen() ? "🟢 Ouvert Maintenant" : "🔴 Fermé"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map((day) => (
            <div key={day.key} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={schedule[day.key]?.open || false}
                    onCheckedChange={() => toggleDayOpen(day.key)}
                  />
                  <Label className="font-semibold">{day.label}</Label>
                </div>
                {schedule[day.key]?.open && (
                  <Button size="sm" variant="outline" onClick={() => addPeriod(day.key)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter Période
                  </Button>
                )}
              </div>

              {schedule[day.key]?.open && (
                <div className="space-y-2 ml-8">
                  {schedule[day.key]?.periods?.map((period, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={period.start}
                        onChange={(e) => updatePeriod(day.key, idx, 'start', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-slate-600">à</span>
                      <Input
                        type="time"
                        value={period.end}
                        onChange={(e) => updatePeriod(day.key, idx, 'end', e.target.value)}
                        className="w-32"
                      />
                      {schedule[day.key].periods.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePeriod(day.key, idx)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!schedule[day.key]?.open && (
                <p className="text-sm text-slate-500 ml-8">Fermé</p>
              )}
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button onClick={saveSchedule} className="w-full" disabled={updateScheduleMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les Horaires
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Dates Spéciales / Fermetures Exceptionnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-12 gap-2 items-end">
            <div className="md:col-span-4">
              <Label>Date</Label>
              <Input
                type="date"
                value={newSpecialDate.date}
                onChange={(e) => setNewSpecialDate({ ...newSpecialDate, date: e.target.value })}
              />
            </div>
            <div className="md:col-span-5">
              <Label>Raison</Label>
              <Input
                placeholder="ex: Jour férié, Congés"
                value={newSpecialDate.reason}
                onChange={(e) => setNewSpecialDate({ ...newSpecialDate, reason: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2 p-2">
              <Switch
                checked={newSpecialDate.closed}
                onCheckedChange={(checked) => setNewSpecialDate({ ...newSpecialDate, closed: checked })}
              />
              <Label className="text-xs">Fermé</Label>
            </div>
            <div className="md:col-span-1">
              <Button onClick={addSpecialDate} className="w-full">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {specialDates.length > 0 && (
            <div className="space-y-2">
              {specialDates.map((special, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{new Date(special.date).toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm text-slate-600">{special.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={special.closed ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                      {special.closed ? "Fermé" : "Horaires spéciaux"}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => removeSpecialDate(idx)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {specialDates.length > 0 && (
            <Button onClick={saveSchedule} variant="outline" className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les Dates Spéciales
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">💡 Conseils Horaires</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Définissez des horaires réalistes que vous pouvez respecter</li>
                <li>• Ajoutez plusieurs périodes pour les restaurants avec pause</li>
                <li>• Planifiez les fermetures exceptionnelles à l'avance</li>
                <li>• Les clients verront si vous êtes ouvert en temps réel</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}