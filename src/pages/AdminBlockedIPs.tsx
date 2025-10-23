import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Trash2, Plus } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  created_at: string;
}

const AdminBlockedIPs = () => {
  const navigate = useNavigate();
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIP, setNewIP] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    checkAuth();
    fetchBlockedIPs();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  const fetchBlockedIPs = async () => {
    try {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlockedIPs(data || []);
    } catch (error) {
      console.error("Error fetching blocked IPs:", error);
      toast.error("فشل في تحميل قائمة IPs المحظورة");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIP = async () => {
    if (!newIP.trim()) {
      toast.error("الرجاء إدخال عنوان IP");
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIP)) {
      toast.error("عنوان IP غير صالح");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("blocked_ips")
        .insert({
          ip_address: newIP,
          reason: reason || null,
          blocked_by: user?.id
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("هذا العنوان IP محظور بالفعل");
        } else {
          throw error;
        }
        return;
      }

      toast.success("تم حظر العنوان IP بنجاح");
      setNewIP("");
      setReason("");
      setIsDialogOpen(false);
      fetchBlockedIPs();
    } catch (error) {
      console.error("Error blocking IP:", error);
      toast.error("فشل في حظر العنوان IP");
    }
  };

  const handleDeleteIP = async (id: string, ipAddress: string) => {
    if (!confirm(`هل أنت متأكد من إلغاء حظر ${ipAddress}؟`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("blocked_ips")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("تم إلغاء حظر العنوان IP");
      fetchBlockedIPs();
    } catch (error) {
      console.error("Error unblocking IP:", error);
      toast.error("فشل في إلغاء الحظر");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full" dir="rtl">
        <AdminSidebar />
        <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-destructive" />
              <h1 className="text-3xl font-bold">عناوين IP المحظورة</h1>
            </div>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة IP محظور
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>حظر عنوان IP جديد</DialogTitle>
                    <DialogDescription>
                      أدخل عنوان IP الذي تريد حظره من الوصول للموقع
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">عنوان IP</label>
                      <Input
                        placeholder="مثال: 192.168.1.1"
                        value={newIP}
                        onChange={(e) => setNewIP(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">السبب (اختياري)</label>
                      <Textarea
                        placeholder="سبب الحظر..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleAddIP} className="w-full">
                      حظر العنوان
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleLogout}>
                تسجيل الخروج
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">جاري التحميل...</div>
          ) : blockedIPs.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">لا توجد عناوين IP محظورة</p>
            </div>
          ) : (
            <div className="bg-card rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">عنوان IP</TableHead>
                    <TableHead className="text-right">السبب</TableHead>
                    <TableHead className="text-right">تاريخ الحظر</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedIPs.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-mono">{ip.ip_address}</TableCell>
                      <TableCell>{ip.reason || "لا يوجد سبب محدد"}</TableCell>
                      <TableCell>
                        {new Date(ip.created_at).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteIP(ip.id, ip.ip_address)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminBlockedIPs;