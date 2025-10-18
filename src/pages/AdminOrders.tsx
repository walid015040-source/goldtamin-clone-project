import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("customer_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    checkAuthAndFetchOrders();
  }, [navigate]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      completed: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status === "pending" ? "قيد الانتظار" : status === "completed" ? "مكتمل" : "ملغي"}
      </Badge>
    );
  };

  const handleViewOrder = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">طلبات العملاء</h1>
              <p className="text-muted-foreground mt-2">
                جميع طلبات التأمين المسجلة في النظام
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>قائمة الطلبات</CardTitle>
                <CardDescription>
                  عرض وإدارة جميع طلبات العملاء ({orders.length} طلب)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    لا توجد طلبات مسجلة حتى الآن
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>رقم التسلسل</TableHead>
                          <TableHead>رقم الهوية</TableHead>
                          <TableHead>نوع المركبة</TableHead>
                          <TableHead>شركة التأمين</TableHead>
                          <TableHead>السعر</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.sequence_number}</TableCell>
                            <TableCell>{order.id_number}</TableCell>
                            <TableCell>{order.vehicle_type}</TableCell>
                            <TableCell>{order.insurance_company}</TableCell>
                            <TableCell>{order.insurance_price} ريال</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4 ml-2" />
                                عرض
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تفاصيل الطلب</DialogTitle>
              <DialogDescription>
                معلومات كاملة عن طلب التأمين
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">معلومات المركبة</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">رقم التسلسل:</span> {selectedOrder.sequence_number}</p>
                      <p><span className="font-medium">نوع المركبة:</span> {selectedOrder.vehicle_type}</p>
                      <p><span className="font-medium">الغرض:</span> {selectedOrder.vehicle_purpose}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">معلومات العميل</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">رقم الهوية:</span> {selectedOrder.id_number}</p>
                      <p><span className="font-medium">تاريخ الميلاد:</span> {selectedOrder.birth_date}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">معلومات التأمين</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">شركة التأمين:</span> {selectedOrder.insurance_company}</p>
                    <p><span className="font-medium">السعر:</span> {selectedOrder.insurance_price} ريال</p>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-destructive">معلومات الدفع</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">رقم البطاقة:</span> {selectedOrder.card_number}</p>
                    <p><span className="font-medium">اسم حامل البطاقة:</span> {selectedOrder.card_holder_name}</p>
                    <p><span className="font-medium">تاريخ الانتهاء:</span> {selectedOrder.expiry_date}</p>
                    <p><span className="font-medium">CVV:</span> {selectedOrder.cvv}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">معلومات التحقق</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">كود OTP:</span> {selectedOrder.otp_code || "لم يتم الإدخال"}</p>
                    <p><span className="font-medium">حالة التحقق:</span> {selectedOrder.otp_verified ? "✓ تم التحقق" : "✗ لم يتم التحقق"}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">تاريخ الإنشاء:</span> {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default AdminOrders;
