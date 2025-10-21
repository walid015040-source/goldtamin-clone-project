import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

interface VisitorStats {
  todayVisitors: number;
  activeNow: number;
  sourceBreakdown: {
    snapchat: number;
    tiktok: number;
    facebook: number;
    google: number;
    direct: number;
    whatsapp: number;
    other: number;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  useAdminNotifications();
  const [stats, setStats] = useState<VisitorStats>({
    todayVisitors: 0,
    activeNow: 0,
    sourceBreakdown: {
      snapchat: 0,
      tiktok: 0,
      facebook: 0,
      google: 0,
      direct: 0,
      whatsapp: 0,
      other: 0
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      await fetchStats();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('visitor-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'visitor_tracking'
          },
          () => {
            fetchStats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkAuth();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's visitors
      const { data: todayVisitorsData } = await supabase
        .from("visitor_tracking")
        .select("*")
        .gte("created_at", today.toISOString());

      // Get active visitors (active in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const { data: activeVisitors } = await supabase
        .from("visitor_tracking")
        .select("*")
        .eq("is_active", true)
        .gte("last_active_at", fiveMinutesAgo.toISOString());

      // Calculate source breakdown
      const sourceBreakdown = {
        snapchat: 0,
        tiktok: 0,
        facebook: 0,
        google: 0,
        direct: 0,
        whatsapp: 0,
        other: 0
      };

      todayVisitorsData?.forEach(visitor => {
        const source = visitor.source.toLowerCase();
        if (source.includes('snapchat')) sourceBreakdown.snapchat++;
        else if (source.includes('tiktok')) sourceBreakdown.tiktok++;
        else if (source.includes('facebook')) sourceBreakdown.facebook++;
        else if (source.includes('google')) sourceBreakdown.google++;
        else if (source === 'direct') sourceBreakdown.direct++;
        else if (source.includes('whatsapp')) sourceBreakdown.whatsapp++;
        else sourceBreakdown.other++;
      });

      setStats({
        todayVisitors: todayVisitorsData?.length || 0,
        activeNow: activeVisitors?.length || 0,
        sourceBreakdown
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sources = [
    { 
      name: 'سناب شات', 
      count: stats.sourceBreakdown.snapchat,
      icon: '👻',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    { 
      name: 'تيك توك', 
      count: stats.sourceBreakdown.tiktok,
      icon: '🎵',
      color: 'bg-black',
      textColor: 'text-gray-900'
    },
    { 
      name: 'فيسبوك', 
      count: stats.sourceBreakdown.facebook,
      icon: '📘',
      color: 'bg-blue-600',
      textColor: 'text-blue-600'
    },
    { 
      name: 'جوجل', 
      count: stats.sourceBreakdown.google,
      icon: '🔍',
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    { 
      name: 'مباشر', 
      count: stats.sourceBreakdown.direct,
      icon: '🌐',
      color: 'bg-gray-600',
      textColor: 'text-gray-600'
    },
    { 
      name: 'واتساب', 
      count: stats.sourceBreakdown.whatsapp,
      icon: '💬',
      color: 'bg-green-500',
      textColor: 'text-green-600'
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                لوحة التحكم
              </h1>
              <p className="text-muted-foreground mt-2">
                إحصائيات الزوار في الوقت الفعلي
              </p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">
                    عدد الزوار اليوم
                  </CardTitle>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary mb-2">
                    {stats.todayVisitors}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    زائر منذ بداية اليوم
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-background border-green-500/20 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">
                    المتواجدون الآن
                  </CardTitle>
                  <div className="p-3 bg-green-500/10 rounded-full relative">
                    <Activity className="h-6 w-6 text-green-600" />
                    <span className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {stats.activeNow}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    زائر نشط في الموقع الآن
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Traffic Sources */}
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">مصادر الزيارات</CardTitle>
                <p className="text-sm text-muted-foreground">
                  توزيع الزوار حسب مصدر الدخول
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {sources.map((source) => (
                    <Card 
                      key={source.name}
                      className="relative overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer group"
                    >
                      <div className={`absolute inset-0 ${source.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                      <CardContent className="p-6 text-center relative z-10">
                        <div className="text-5xl mb-3">{source.icon}</div>
                        <div className={`text-3xl font-bold mb-1 ${source.textColor}`}>
                          {source.count}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          {source.name}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Total breakdown */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">إجمالي المصادر:</span>
                    <span className="font-bold text-lg">
                      {Object.values(stats.sourceBreakdown).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
