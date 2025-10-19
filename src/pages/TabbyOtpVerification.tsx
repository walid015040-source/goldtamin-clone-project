import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import tabbyLogo from "@/assets/tabby-logo.png";

const TabbyOtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const price = searchParams.get("price") || "0";
  const company = searchParams.get("company") || "";
  const phone = searchParams.get("phone") || "";
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleVerify = () => {
    const otpCode = otp.join("");
    console.log("Verify OTP:", { otpCode, phone, price, company });
    // Add verification logic here
  };

  const handleResendOtp = () => {
    console.log("Resend OTP to:", phone);
    setOtp(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const isOtpComplete = otp.every(digit => digit !== "");

  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir="rtl">
      <div className="max-w-[480px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#3CDBC0] hover:text-[#2fc4aa] transition-colors text-sm font-medium"
          >
            <ChevronRight className="w-4 h-4" />
            العودة إلى المتجر
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
            English
          </button>
        </div>

        {/* Store Name and Tabby Logo */}
        <div className="text-center py-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{company || "المتجر"}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>الدفع بواسطة</span>
            <img src={tabbyLogo} alt="تابي" className="h-5 object-contain" />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-6 py-8 px-8">
          <div className="w-10 h-10 rounded-lg border-2 border-[#22C55E] flex items-center justify-center bg-[#22C55E]">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 h-[2px] bg-[#22C55E]"></div>
          <div className="w-10 h-10 rounded-lg border-2 border-[#22C55E] flex items-center justify-center bg-white">
            <svg className="w-5 h-5 text-[#22C55E]" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 10h18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <div className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center bg-white">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Hero Image */}
        <div className="px-8 mb-8">
          <div className="w-full rounded-2xl overflow-hidden shadow-md">
            <img 
              src="https://tabby.sallapayment.store/assets/auth-image.png" 
              alt="Tabby" 
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.classList.add('aspect-[16/9]', 'bg-gradient-to-br', 'from-orange-100', 'to-orange-200');
              }}
            />
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
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 border-2 border-gray-300 rounded-lg text-center text-xl font-semibold outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
              />
            ))}
          </div>

          {/* Resend OTP */}
          <div className="text-center mb-6">
            <button
              onClick={handleResendOtp}
              className="text-[#22C55E] hover:text-[#16A34A] text-sm font-medium transition-colors"
            >
              إعادة إرسال الرمز
            </button>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!isOtpComplete}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-lg transition-all text-base"
          >
            تحقق
          </button>

          {/* Order Info */}
          <div className="text-center text-xs text-gray-500 mt-8 space-y-1">
            <p>قيمة الطلب: {price} ر.س</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabbyOtpVerification;
