import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Package } from "lucide-react";
import { format } from "date-fns";

export default function ConversationsList({ user, userType, open, onOpenChange, onSelectConversation }) {
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.email, userType],
    queryFn: async () => {
      if (userType === 'customer') {
        return base44.entities.Conversation.filter({ customer_email: user.email, status: 'active' }, '-last_message_at');
      } else {
        const driver = await base44.entities.DeliveryPartner.filter({ email: user.email });
        if (driver[0]) {
          return base44.entities.Conversation.filter({ driver_id: driver[0].id, status: 'active' }, '-last_message_at');
        }
        return [];
      }
    },
    enabled: !!user && open,
    refetchInterval: 5000,
  });

  const unreadCount = userType === 'customer' 
    ? conversations.reduce((sum, c) => sum + (c.unread_count_customer || 0), 0)
    : conversations.reduce((sum, c) => sum + (c.unread_count_driver || 0), 0);

  const handleConversationClick = async (conv) => {
    const order = await base44.entities.Order.filter({ id: conv.order_id });
    if (order[0]) {
      onSelectConversation(order[0]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>💬 Messages</span>
            {unreadCount > 0 && (
              <Badge className="bg-blue-600">{unreadCount} Non lus</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Aucune conversation</p>
              <p className="text-sm text-slate-500">Les messages de vos commandes apparaîtront ici</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const unread = userType === 'customer' ? conv.unread_count_customer : conv.unread_count_driver;
              const otherParty = userType === 'customer' ? conv.driver_name : conv.customer_name;
              
              return (
                <Card 
                  key={conv.id} 
                  className={`cursor-pointer hover:bg-slate-50 transition-colors ${unread > 0 ? 'border-blue-300 bg-blue-50' : ''}`}
                  onClick={() => handleConversationClick(conv)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{otherParty}</p>
                          <p className="text-xs text-slate-600">Commande #{conv.order_id?.slice(-6)}</p>
                        </div>
                      </div>
                      {unread > 0 && (
                        <Badge className="bg-blue-600 text-white">{unread}</Badge>
                      )}
                    </div>
                    
                    <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                      {conv.last_message || 'Aucun message'}
                    </p>
                    
                    {conv.last_message_at && (
                      <p className="text-xs text-slate-500 mt-1">
                        {format(new Date(conv.last_message_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}