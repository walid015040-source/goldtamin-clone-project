import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Visitor {
  session_id: string;
  page_url: string | null;
  created_at: string | null;
  visitor_name: string | null;
  order_number: string | null;
}

interface Message {
  id: string;
  session_id: string;
  message: string;
  sent_by: string | null;
  created_at: string;
  is_read: boolean;
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);
  const [selectedVisitorInfo, setSelectedVisitorInfo] = useState<Visitor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    checkAuth();
    fetchActiveVisitors();
    
    // Initialize audio
    audioRef.current = new Audio("/customer-info-notification.mp3");
    
    // Subscribe to new messages
    const channel = supabase
      .channel('admin-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages'
        },
        (payload: any) => {
          const newMessage = payload.new as Message;
          
          // Only notify if message is from visitor (sent_by is null)
          if (!newMessage.sent_by) {
            audioRef.current?.play();
            toast({
              title: "رسالة جديدة",
              description: "استلمت رسالة جديدة من زائر",
            });
          }
          
          // Refresh messages if this is for the selected visitor
          if (selectedVisitor === newMessage.session_id) {
            fetchMessages(selectedVisitor);
          }
          
          // Refresh visitor list to show unread indicator
          fetchActiveVisitors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedVisitor]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  const fetchActiveVisitors = async () => {
    const { data: trackingData, error: trackingError } = await supabase
      .from("visitor_tracking")
      .select("session_id, page_url, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (trackingError) {
      console.error("Error fetching visitors:", trackingError);
      return;
    }

    // Fetch order details for each session
    const enrichedVisitors = await Promise.all(
      (trackingData || []).map(async (visitor) => {
        const { data: orderData } = await supabase
          .from("customer_orders")
          .select("owner_name, sequence_number")
          .eq("visitor_session_id", visitor.session_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...visitor,
          visitor_name: orderData?.owner_name || null,
          order_number: orderData?.sequence_number || null,
        };
      })
    );

    setVisitors(enrichedVisitors);
  };

  const fetchMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("admin_messages" as any)
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages((data as any) || []);
    
    // Mark messages as read
    await supabase
      .from("admin_messages" as any)
      .update({ is_read: true })
      .eq("session_id", sessionId)
      .is("sent_by", null);
  };

  const handleSelectVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor.session_id);
    setSelectedVisitorInfo(visitor);
    fetchMessages(visitor.session_id);
  };

  const sendMessage = async () => {
    if (!selectedVisitor || !message.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار زائر وكتابة رسالة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("admin_messages" as any)
      .insert({
        session_id: selectedVisitor,
        message: message.trim(),
        sent_by: user?.id || null,
      });

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل إرسال الرسالة",
        variant: "destructive",
      });
    } else {
      setMessage("");
      fetchMessages(selectedVisitor);
    }
    setLoading(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">إدارة الرسائل</h1>
          </header>

          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    الزوار النشطون
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {visitors.map((visitor) => (
                      <div
                        key={visitor.session_id}
                        onClick={() => handleSelectVisitor(visitor)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
                          selectedVisitor === visitor.session_id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        <div className="text-sm font-medium truncate">
                          {visitor.visitor_name || visitor.session_id.substring(0, 8) + "..."}
                        </div>
                        <div className="text-xs opacity-80 truncate">
                          {visitor.order_number ? `طلب: ${visitor.order_number}` : visitor.page_url || "غير محدد"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
                <CardHeader>
                  <CardTitle>
                    {selectedVisitorInfo ? (
                      <div>
                        <div className="text-lg font-bold">
                          {selectedVisitorInfo.visitor_name || "زائر"}
                        </div>
                        {selectedVisitorInfo.order_number && (
                          <div className="text-sm text-muted-foreground font-normal">
                            رقم الطلب: {selectedVisitorInfo.order_number}
                          </div>
                        )}
                      </div>
                    ) : (
                      "المحادثة"
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {selectedVisitor ? (
                    <>
                      <ScrollArea className="flex-1 mb-4 p-4 border rounded-lg">
                        <div className="space-y-3">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${
                                msg.sent_by ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] p-3 rounded-lg ${
                                  msg.sent_by
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary"
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
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="اكتب رسالتك هنا..."
                          onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
                          disabled={loading}
                        />
                        <Button onClick={sendMessage} disabled={loading || !message.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                      الرجاء اختيار زائر لبدء المحادثة
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
