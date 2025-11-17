import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Phone, Loader2, Play, Pause } from "lucide-react";
import { format } from "date-fns";
import VoiceRecorder from "./VoiceRecorder";

export default function ChatWindow({ order, user, userType, open, onOpenChange }) {
  const [message, setMessage] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: conversation } = useQuery({
    queryKey: ['conversation', order?.id],
    queryFn: async () => {
      const convs = await base44.entities.Conversation.filter({ order_id: order.id });
      return convs[0] || null;
    },
    enabled: !!order?.id && open,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversation.id }, '-created_date'),
    enabled: !!conversation?.id && open,
    refetchInterval: 2000,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Conversation.create({
        order_id: order.id,
        driver_id: order.delivery_partner_id,
        driver_name: order.driver_name,
        customer_email: order.created_by,
        customer_name: order.customer_name,
        last_message: "",
        last_message_at: new Date().toISOString(),
        unread_count_driver: 0,
        unread_count_customer: 0,
        status: "active"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      let conv = conversation;
      if (!conv) {
        conv = await createConversationMutation.mutateAsync();
      }

      const msg = await base44.entities.Message.create({
        conversation_id: conv.id,
        sender_type: userType,
        sender_name: user.full_name,
        message_type: data.voice_url ? 'voice' : 'text',
        content: data.content || "",
        voice_url: data.voice_url,
        voice_duration: data.voice_duration,
        read_by_driver: userType === 'driver',
        read_by_customer: userType === 'customer'
      });

      await base44.entities.Conversation.update(conv.id, {
        last_message: data.voice_url ? "🎤 Message vocal" : data.content,
        last_message_at: new Date().toISOString(),
        [`unread_count_${userType === 'driver' ? 'customer' : 'driver'}`]: 
          conv[`unread_count_${userType === 'driver' ? 'customer' : 'driver'}`] + 1
      });

      const recipientEmail = userType === 'driver' ? order.created_by : order.created_by;
      await base44.entities.Notification.create({
        customer_email: recipientEmail,
        title: `Nouveau message de ${user.full_name}`,
        message: data.voice_url ? "🎤 Message vocal" : data.content,
        type: "order_update",
        order_id: order.id
      });

      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      setMessage("");
      setShowVoiceRecorder(false);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!conversation) return;
      
      const unreadField = `read_by_${userType}`;
      const unreadMessages = messages.filter(m => !m[unreadField] && m.sender_type !== userType);
      
      for (const msg of unreadMessages) {
        await base44.entities.Message.update(msg.id, { [unreadField]: true });
      }

      await base44.entities.Conversation.update(conversation.id, {
        [`unread_count_${userType}`]: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });

  useEffect(() => {
    if (open && conversation && messages.length > 0) {
      markAsReadMutation.mutate();
    }
  }, [open, conversation?.id, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ content: message });
  };

  const handleVoiceSend = (voiceData) => {
    sendMessageMutation.mutate(voiceData);
  };

  const toggleAudio = (audioUrl) => {
    if (playingAudio === audioUrl) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudio(audioUrl);
      }
    }
  };

  const otherPartyName = userType === 'driver' ? order?.customer_name : order?.driver_name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Chat - {order?.order_number}</DialogTitle>
              <p className="text-sm text-slate-600">{otherPartyName}</p>
            </div>
            {(userType === 'driver' ? order?.customer_phone : order?.driver_phone) && (
              <a href={`tel:${userType === 'driver' ? order.customer_phone : order.driver_phone}`}>
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler
                </Button>
              </a>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>Aucun message</p>
              <p className="text-sm">Commencez la conversation</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_type === userType;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMine ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-900'} rounded-2xl px-4 py-2`}>
                    {msg.message_type === 'voice' ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleAudio(msg.voice_url)}
                          className={isMine ? "text-white hover:bg-blue-600" : "hover:bg-slate-300"}
                        >
                          {playingAudio === msg.voice_url ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="h-1 bg-current opacity-30 rounded-full" />
                        </div>
                        <span className="text-xs">{msg.voice_duration}s</span>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-slate-500'}`}>
                      {format(new Date(msg.created_date), 'HH:mm')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          {showVoiceRecorder ? (
            <VoiceRecorder
              onSend={handleVoiceSend}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Tapez un message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={() => setShowVoiceRecorder(true)} size="icon" variant="ghost">
                <span className="text-xl">🎤</span>
              </Button>
              <Button onClick={handleSend} disabled={!message.trim() || sendMessageMutation.isPending}>
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}