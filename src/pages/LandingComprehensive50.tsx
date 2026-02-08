import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

const LandingComprehensive50 = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-primary relative overflow-hidden"
      dir="rtl"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full">
            <Shield className="w-20 h-20 text-white" />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          تخفيض يصل إلى
          <span className="block text-yellow-300 text-7xl md:text-9xl my-4">50%</span>
          على التأمين الشامل
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
          احمِ سيارتك بأفضل تغطية تأمينية شاملة بأسعار لا تُقاوم
        </p>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 text-xl px-12 py-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold"
        >
          <span>احصل على عرضك الآن</span>
          <ArrowLeft className="w-6 h-6 mr-3" />
        </Button>

        {/* Trust badge */}
        <p className="mt-8 text-white/70 text-sm">
          أكثر من 100,000 عميل يثقون بنا
        </p>
      </div>
    </div>
  );
};

export default LandingComprehensive50;
