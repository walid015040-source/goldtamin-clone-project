import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Car, ArrowLeft, Shield, CheckCircle } from "lucide-react";

const LandingChooseInsurance = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-green-600 to-green-700 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Icons */}
        <div className="mb-8 flex justify-center gap-6">
          <div className="bg-white/20 backdrop-blur-sm p-5 rounded-full">
            <Shield className="w-14 h-14 text-white" />
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-5 rounded-full">
            <Car className="w-14 h-14 text-white" />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          تأمين شامل وضد الغير
        </h1>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl px-8 py-6 inline-block mb-8">
          <p className="text-3xl md:text-5xl font-bold text-yellow-300">
            يناسب اختيارك
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {["تغطية شاملة", "أسعار تنافسية", "خدمة سريعة"].map((feature) => (
            <div key={feature} className="flex items-center gap-2 bg-white/10 rounded-full px-5 py-2">
              <CheckCircle className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="bg-white text-accent hover:bg-white/90 text-xl px-12 py-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold"
        >
          <span>قارن الأسعار الآن</span>
          <ArrowLeft className="w-6 h-6 mr-3" />
        </Button>

        {/* Trust badge */}
        <p className="mt-8 text-white/70 text-sm">
          اختر التأمين المناسب لك بكل سهولة
        </p>
      </div>
    </div>
  );
};

export default LandingChooseInsurance;
