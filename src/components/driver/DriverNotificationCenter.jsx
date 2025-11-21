import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, CheckCheck, Trash2, Package, MessageSquare, DollarSign, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const notificationIcons = {
  order_update: Package,
  message: MessageSquare,
  payment: DollarSign,
  general: Bell,
  alert: AlertCircle,
};

export default function DriverNotificationCenter({ user, open, onOpenChange }) {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['driver-notifications-all', user?.email],
    queryFn: () => base44.entities.Notification.filter({ customer_email: user.email }, '-created_date'),
    enabled: !!user?.email && open,
    refetchInterval: 3000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.update(notificationId, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-notifications-all'] });
      queryClient.invalidateQueries({ queryKey: ['driver-notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifs = notifications.filter(n => !n.read);
      for (const notif of unreadNotifs) {
        await base44.entities.Notification.update(notif.id, { read: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-notifications-all'] });
      queryClient.invalidateQueries({ queryKey: ['driver-notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-notifications-all'] });
      queryClient.invalidateQueries({ queryKey: ['driver-notifications'] });
    },
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Centre de Notifications
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Tout marquer lu
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={filter} onValueChange={setFilter} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Tous ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lus ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Lus ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notif) => {
                    const Icon = notificationIcons[notif.type] || Bell;
                    const isNew = !notif.read;
                    
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        layout
                      >
                        <div
                          className={`group relative border rounded-lg p-4 transition-all cursor-pointer ${
                            isNew 
                              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                              : 'bg-white hover:bg-slate-50'
                          }`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 p-2 rounded-full ${
                              isNew ? 'bg-blue-100' : 'bg-slate-100'
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                isNew ? 'text-blue-600' : 'text-slate-600'
                              }`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`font-semibold text-sm ${
                                  isNew ? 'text-blue-900' : 'text-slate-900'
                                }`}>
                                  {notif.title}
                                </h4>
                                {isNew && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                )}
                              </div>
                              
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-slate-500">
                                  {format(new Date(notif.created_date), 'PPp', { locale: fr })}
                                </p>
                                
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {isNew && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsReadMutation.mutate(notif.id);
                                      }}
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotificationMutation.mutate(notif.id);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}