import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DriverNotificationDialog({ driver, open, onOpenChange }) {
  const [notificationType, setNotificationType] = useState("general");
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  const sendNotificationMutation = useMutation({
    mutationFn: async (data) => {
      // Create notification in database
      await base44.entities.Notification.create({
        customer_email: driver.email || driver.phone, // Using email or phone as identifier
        title: data.title,
        message: data.message,
        type: "general",
        read: false
      });

      // Optionally send email
      if (driver.email) {
        await base44.integrations.Core.SendEmail({
          to: driver.email,
          subject: data.title,
          body: data.message
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-notifications'] });
      toast.success("Notification envoyée avec succès");
      setMessage("");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi de la notification");
    }
  });

  const notificationTemplates = {
    general: {
      title: "Message de l'administration",
      placeholder: "Tapez votre message..."
    },
    urgent: {
      title: "🚨 Message Urgent",
      placeholder: "Message urgent pour le chauffeur..."
    },
    reminder: {
      title: "⏰ Rappel",
      placeholder: "Rappel pour le chauffeur..."
    },
    congratulations: {
      title: "🎉 Félicitations",
      placeholder: "Message de félicitations..."
    },
    warning: {
      title: "⚠️ Avertissement",
      placeholder: "Avertissement pour le chauffeur..."
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Veuillez entrer un message");
      return;
    }

    const template = notificationTemplates[notificationType];
    sendNotificationMutation.mutate({
      title: template.title,
      message: message
    });
  };

  if (!driver) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Envoyer une Notification
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-semibold text-blue-900">Destinataire:</p>
            <p className="text-sm text-blue-700">{driver.full_name}</p>
            <p className="text-xs text-blue-600">{driver.phone}</p>
          </div>

          <div className="space-y-2">
            <Label>Type de Notification</Label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">💬 Message Général</SelectItem>
                <SelectItem value="urgent">🚨 Urgent</SelectItem>
                <SelectItem value="reminder">⏰ Rappel</SelectItem>
                <SelectItem value="congratulations">🎉 Félicitations</SelectItem>
                <SelectItem value="warning">⚠️ Avertissement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={notificationTemplates[notificationType].placeholder}
              rows={5}
              required
            />
            <p className="text-xs text-slate-500">
              Le titre sera: "{notificationTemplates[notificationType].title}"
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={sendNotificationMutation.isPending}>
              {sendNotificationMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Envoyer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}