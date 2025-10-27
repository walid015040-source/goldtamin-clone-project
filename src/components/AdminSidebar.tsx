import { Home, FileText, LogOut, Users, CreditCard, Shield, Activity, MessageSquare } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "الصفحة الرئيسية", url: "/admin/dashboard", icon: Home },
  { title: "طلبات العملاء", url: "/admin/orders", icon: FileText },
  { title: "الرسائل", url: "/admin/messages", icon: MessageSquare },
  { title: "أحداث الزوار", url: "/admin/visitor-events", icon: Activity },
  { title: "دفعات تمارا", url: "/admin/tamara-payments", icon: CreditCard },
  { title: "دفعات تابي", url: "/admin/tabby-payments", icon: CreditCard },
  { title: "إدارة المستخدمين", url: "/admin/users", icon: Users },
  { title: "IPs المحظورة", url: "/admin/blocked-ips", icon: Shield },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
      navigate("/admin/login");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent";

  return (
    <Sidebar collapsible="icon">
      <div className="p-4 border-b">
        <h2 className={`font-bold text-lg ${collapsed ? "hidden" : "block"}`}>
          لوحة التحكم
        </h2>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : "block"}>
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={collapsed ? "mx-auto" : "ml-2 h-4 w-4"} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className={collapsed ? "mx-auto" : "ml-2 h-4 w-4"} />
                  {!collapsed && <span>تسجيل الخروج</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-2 border-t">
        <SidebarTrigger />
      </div>
    </Sidebar>
  );
}
