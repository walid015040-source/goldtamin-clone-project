import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const ProcessingPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messageIndex, setMessageIndex] = useState(0);
  
  const companyName = searchParams.get("company") || "شركة الاتحاد للتأمين التعاوني";
  const price = searchParams.get("price") || "411.15";
  const success = searchParams.get("success") === "true";

  const messages = [
    "جاري التحقق من عملية الدفع...",
    "جاري التواصل مع البنك...",
    "جاري معالجة المعاملة...",
    "جاري تأكيد الدفع...",
  ];

  useEffect(() => {
    // Cycle through messages
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1000);

    // Navigate after processing
    const navigationTimer = setTimeout(() => {
      if (success) {
        navigate(`/payment-success?company=${encodeURIComponent(companyName)}&price=${price}`);
      }
    }, 4000);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate, success, companyName, price]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="text-center animate-fade-in">
        <div className="mb-6">
          <Loader2 className="w-16 h-16 animate-spin text-[#2900fc] mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          معالجة عملية الدفع
        </h2>
        <p className="text-gray-600 text-lg animate-fade-in" key={messageIndex}>
          {messages[messageIndex]}
        </p>
        <p className="text-sm text-gray-500 mt-6">
          الرجاء عدم إغلاق هذه الصفحة
        </p>
      </div>
    </div>
  );
};

export default ProcessingPayment;
