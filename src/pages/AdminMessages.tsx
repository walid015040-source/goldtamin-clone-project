import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, User } from "lucide-react";

interface Visitor {
  session_id: string;
  page_url: string | null;
  created_at: string | null;
  visitor_name: string | null;
  order_number: string | null;
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchActiveVisitors();
  }, []);

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
    const { error } = await supabase
      .from("admin_messages" as any)
      .insert({
        session_id: selectedVisitor,
        message: message.trim(),
        sent_by: null,
      });

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل إرسال الرسالة",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم الإرسال",
        description: "تم إرسال الرسالة بنجاح",
      });
      setMessage("");
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
                        onClick={() => setSelectedVisitor(visitor.session_id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
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

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>إرسال رسالة</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedVisitor ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm font-medium">الزائر المحدد:</p>
                        <p className="text-xs opacity-80">{selectedVisitor}</p>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="اكتب رسالتك هنا..."
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          disabled={loading}
                        />
                        <Button onClick={sendMessage} disabled={loading}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      الرجاء اختيار زائر لإرسال رسالة
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
