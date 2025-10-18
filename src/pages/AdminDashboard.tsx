import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp, Clock } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      // Fetch statistics
      const { data: orders } = await supabase
        .from("customer_orders")
        .select("*");

      if (orders) {
        const today = new Date().toISOString().split('T')[0];
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          completedOrders: orders.filter(o => o.status === 'completed').length,
          todayOrders: orders.filter(o => 
            new Date(o.created_at).toISOString().split('T')[0] === today
          ).length,
        });
      }
    };

    checkAuth();
  }, [navigate]);

  const statCards = [
    {
      title: "إجمالي الطلبات",
      value: stats.totalOrders,
      icon: FileText,
      description: "جميع الطلبات المسجلة",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "الطلبات قيد الانتظار",
      value: stats.pendingOrders,
      icon: Clock,
      description: "طلبات تحتاج إلى مراجعة",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "الطلبات المكتملة",
      value: stats.completedOrders,
      icon: TrendingUp,
      description: "طلبات تم معالجتها",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "طلبات اليوم",
      value: stats.todayOrders,
      icon: Users,
      description: "طلبات جديدة اليوم",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">لوحة التحكم</h1>
              <p className="text-muted-foreground mt-2">
                مرحباً بك في لوحة التحكم الخاصة بإدارة طلبات التأمين
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat) => (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.bgColor} p-2 rounded-lg`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
