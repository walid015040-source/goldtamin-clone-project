import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  id: string;
  message: string;
  sent_by: string | null;
  created_at: string;
}

export function VisitorChatWidget({ sessionId }: { sessionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Initialize audio
    audioRef.current = new Audio("/customer-info-notification.mp3");

    // Fetch existing messages
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`visitor-chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload: any) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          
          // Play sound and show unread indicator if message is from admin
          if (newMsg.sent_by && !isOpen) {
            audioRef.current?.play();
            setHasUnread(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      markMessagesAsRead();
    }
  }, [isOpen]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("admin_messages" as any)
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as any);
      
      // Check for unread messages
      const unread = (data as any[]).some((msg: Message) => msg.sent_by && !isOpen);
      setHasUnread(unread);
    }
  };

  const markMessagesAsRead = async () => {
    await supabase
      .from("admin_messages" as any)
      .update({ is_read: true })
      .eq("session_id", sessionId)
      .not("sent_by", "is", null);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    const { error } = await supabase
      .from("admin_messages" as any)
      .insert({
        session_id: sessionId,
        message: newMessage.trim(),
        sent_by: null,
      });

    if (!error) {
      setNewMessage("");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {hasUnread && (
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              الدعم الفني
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm">مرحباً! كيف يمكننا مساعدتك؟</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sent_by ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sent_by
                            ? "bg-secondary"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
                  disabled={loading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
