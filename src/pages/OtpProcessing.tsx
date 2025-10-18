import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

const OtpProcessing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success") === "true";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (success) {
        // Upon success, redirect to home page
        navigate("/");
      } else {
        // Upon error, go back to OTP page
        navigate(-1);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="text-center animate-fade-in">
        {success ? (
          <>
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-scale-in" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              تمت العملية بنجاح!
            </h2>
            <p className="text-gray-600 text-lg">
              تم تأكيد الدفع بنجاح. سيتم تحويلك للصفحة الرئيسية...
            </p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <XCircle className="w-20 h-20 text-red-500 mx-auto animate-scale-in" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              تم رفض رمز التحقق
            </h2>
            <p className="text-gray-600 text-lg">
              الرجاء إدخال رمز صحيح. سيتم إعادتك للصفحة السابقة...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OtpProcessing;
