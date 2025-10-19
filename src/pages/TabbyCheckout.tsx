import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import tabbyLogo from "@/assets/tabby-logo.png";

const TabbyCheckout = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchParams] = useSearchParams();
  const price = searchParams.get("price") || "0";
  const company = searchParams.get("company") || "";

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value.substring(0, 9));
  };

  const handleContinue = () => {
    console.log("Continue with Tabby:", { phoneNumber, price, company });
    // Add navigation logic here
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="max-w-md mx-auto">
        {/* Header with Tabby Logo */}
        <div className="flex justify-center py-6 border-b">
          <img src={tabbyLogo} alt="تابي" className="h-8 object-contain" />
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-8 py-8 px-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-[16/9] bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mx-4 mb-8 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-yellow-300/20 to-orange-300/20">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-400 to-teal-500"></div>
              <div className="space-y-2">
                <div className="w-24 h-24 mx-auto rounded-xl bg-purple-300/30"></div>
                <div className="w-20 h-20 mx-auto rounded-lg bg-orange-300/30"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6">
          <h1 className="text-2xl font-bold text-center mb-3 text-gray-900">
            قم بربط رقمك مع تابي
          </h1>
          <p className="text-center text-gray-600 mb-8">
            أدخل رقم جوالك للتحقق من رصيد التقسيط
          </p>

          {/* Phone Number Input */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1">
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="رقم الجوال"
                className="w-full border-2 border-gray-300 rounded-lg p-4 text-right outline-none focus:border-primary transition-colors text-lg"
                dir="ltr"
              />
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-4 px-6 bg-gray-50">
              <span className="text-lg font-medium text-gray-700">+966</span>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={phoneNumber.length < 9}
            className="w-full bg-primary hover:bg-primary/90 h-14 text-lg rounded-lg mb-6"
          >
            استمرار
          </Button>

          {/* Order Info */}
          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>قيمة الطلب: {price} ر.س</p>
            <p>شركة التأمين: {company}</p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full mt-6 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>العودة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabbyCheckout;
