import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Phone, Loader2, Play, Pause, MapPin, Zap, Languages } from "lucide-react";
import { format } from "date-fns";
import VoiceRecorder from "./VoiceRecorder";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const quickMessages = {
  driver: [
    { text: "Je suis en route! 🚗", emoji: "🚗" },
    { text: "Arrivée dans 5 minutes ⏱️", emoji: "⏱️" },
    { text: "Je suis arrivé 📍", emoji: "📍" },
    { text: "Problème de circulation, petit retard 🚦", emoji: "🚦" },
    { text: "Je ne trouve pas l'adresse 🔍", emoji: "🔍" },
    { text: "Merci pour votre commande! 🙏", emoji: "🙏" }
  ],
  customer: [
    { text: "Merci! 😊", emoji: "😊" },
    { text: "Prenez votre temps 👍", emoji: "👍" },
    { text: "Je vous attends devant 🏠", emoji: "🏠" },
    { text: "Sonnez à l'interphone SVP 🔔", emoji: "🔔" },
    { text: "Pouvez-vous appeler en arrivant? 📞", emoji: "📞" }
  ]
};

export default function ChatWindow({ order, user, userType, open, onOpenChange }) {
  const [message, setMessage] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [translatingMessages, setTranslatingMessages] = useState({});
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
        message_type: data.voice_url ? 'voice' : data.location ? 'location' : 'text',
        content: data.content || "",
        voice_url: data.voice_url,
        voice_duration: data.voice_duration,
        location: data.location,
        read_by_driver: userType === 'driver',
        read_by_customer: userType === 'customer'
      });

      await base44.entities.Conversation.update(conv.id, {
        last_message: data.voice_url ? "🎤 Message vocal" : data.location ? "📍 Position partagée" : data.content,
        last_message_at: new Date().toISOString(),
        [`unread_count_${userType === 'driver' ? 'customer' : 'driver'}`]: 
          conv[`unread_count_${userType === 'driver' ? 'customer' : 'driver'}`] + 1
      });

      const recipientEmail = userType === 'driver' ? order.created_by : order.created_by;
      await base44.entities.Notification.create({
        customer_email: recipientEmail,
        title: `Nouveau message de ${user.full_name}`,
        message: data.voice_url ? "🎤 Message vocal" : data.location ? "📍 Position partagée" : data.content,
        type: "order_update",
        order_id: order.id
      });

      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      queryClient.invalidateQueries({ queryKey: ['driver-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['customer-conversations'] });
      setMessage("");
      setShowVoiceRecorder(false);
      setShowQuickMessages(false);
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

  const handleQuickMessage = (quickMsg) => {
    sendMessageMutation.mutate({ content: quickMsg.text });
  };

  const shareLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non disponible");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        sendMessageMutation.mutate({ 
          content: "📍 Position partagée",
          location 
        });
        toast.success("Position partagée!");
      },
      (error) => {
        toast.error("Impossible d'obtenir la position");
      }
    );
  };

  const translateMessage = async (msg) => {
    if (translatingMessages[msg.id]) return;

    setTranslatingMessages({ ...translatingMessages, [msg.id]: true });

    const targetLang = localStorage.getItem("language") || "fr";
    
    const prompt = `Translate the following message to ${targetLang === 'fr' ? 'French' : targetLang === 'en' ? 'English' : targetLang === 'ar' ? 'Arabic' : 'French'}:
    
"${msg.content}"

Return ONLY the translation, nothing else.`;

    const translation = await base44.integrations.Core.InvokeLLM({ prompt });
    
    setTranslatingMessages({ 
      ...translatingMessages, 
      [msg.id]: translation 
    });
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
            <div className="flex gap-2">
              {userType === 'driver' && (
                <Button size="sm" variant="outline" onClick={shareLocation}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Partager Position
                </Button>
              )}
              {(userType === 'driver' ? order?.customer_phone : order?.driver_phone) && (
                <a href={`tel:${userType === 'driver' ? order.customer_phone : order.driver_phone}`}>
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler
                  </Button>
                </a>
              )}
            </div>
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
              const isTranslated = translatingMessages[msg.id] && typeof translatingMessages[msg.id] === 'string';
              
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%]`}>
                    <div className={`${isMine ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-900'} rounded-2xl px-4 py-2`}>
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
                      ) : msg.message_type === 'location' ? (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-semibold">Position partagée</span>
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs underline ${isMine ? 'text-blue-100' : 'text-blue-600'}`}
                          >
                            Ouvrir dans Google Maps
                          </a>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm">{isTranslated ? translatingMessages[msg.id] : msg.content}</p>
                          {isTranslated && (
                            <p className="text-xs mt-1 opacity-70 italic border-t pt-1 mt-2">
                              Original: {msg.content}
                            </p>
                          )}
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-slate-500'}`}>
                        {format(new Date(msg.created_date), 'HH:mm')}
                      </p>
                    </div>
                    {!isMine && msg.message_type === 'text' && !isTranslated && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => translateMessage(msg)}
                        className="mt-1 h-6 text-xs"
                        disabled={translatingMessages[msg.id] === true}
                      >
                        <Languages className="w-3 h-3 mr-1" />
                        {translatingMessages[msg.id] === true ? "Traduction..." : "Traduire"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t space-y-2">
          {showQuickMessages && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {quickMessages[userType]?.map((qm, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickMessage(qm)}
                  className="text-xs h-auto py-2 justify-start"
                  disabled={sendMessageMutation.isPending}
                >
                  <span className="mr-2">{qm.emoji}</span>
                  <span className="line-clamp-1">{qm.text}</span>
                </Button>
              ))}
            </div>
          )}

          {showVoiceRecorder ? (
            <VoiceRecorder
              onSend={handleVoiceSend}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowQuickMessages(!showQuickMessages)}
                  size="icon"
                  variant={showQuickMessages ? "default" : "ghost"}
                  title="Messages rapides"
                >
                  <Zap className="w-4 h-4" />
                </Button>
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
            </div>
          )}
        </div>

        <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}