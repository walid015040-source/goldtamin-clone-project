import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyName = searchParams.get("company") || "شركة الاتحاد للتأمين التعاوني";
  const price = searchParams.get("price") || "411.15";

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, price]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center animate-scale-in">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          تم الدفع بنجاح!
        </h1>
        
        <p className="text-gray-600 mb-6">
          تمت عملية الدفع بنجاح
        </p>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-right">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">المتجر:</span>
            <span className="font-medium text-gray-900">{companyName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">المبلغ:</span>
            <span className="font-medium text-gray-900" dir="ltr">{price} SAR</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-[#2900fc] hover:bg-[#2200cc] text-white font-medium transition-colors rounded"
          >
            العودة للرئيسية
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          سيتم تحويلك تلقائياً خلال 5 ثوان
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
