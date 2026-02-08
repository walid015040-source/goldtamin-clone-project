import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tag, ArrowLeft, Percent, Sparkles } from "lucide-react";

const LandingPrices399 = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        {/* Floating elements */}
        <Sparkles className="absolute top-20 left-20 w-12 h-12 text-yellow-300/50 animate-bounce" />
        <Sparkles className="absolute bottom-32 right-32 w-8 h-8 text-white/30 animate-bounce delay-300" />
        <Percent className="absolute top-40 right-40 w-16 h-16 text-white/20 animate-pulse" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-bold text-lg">
          <Tag className="w-5 h-5" />
          <span>عرض خاص</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          أسعار تبدأ من
        </h1>
        
        <div className="relative inline-block mb-6">
          <span className="text-8xl md:text-[150px] font-black text-white leading-none">
            399
          </span>
          <span className="text-3xl md:text-5xl font-bold text-yellow-300 mr-2">ريال</span>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 inline-block mb-10">
          <p className="text-2xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Percent className="w-8 h-8 text-yellow-300" />
            خصومات حصرية
          </p>
        </div>

        {/* CTA Button */}
        <div>
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="bg-yellow-400 text-yellow-900 hover:bg-yellow-300 text-xl px-12 py-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold"
          >
            <span>احصل على السعر الآن</span>
            <ArrowLeft className="w-6 h-6 mr-3" />
          </Button>
        </div>

        {/* Trust badge */}
        <p className="mt-8 text-white/80 text-sm">
          أقل الأسعار مع أفضل التغطيات التأمينية
        </p>
      </div>
    </div>
  );
};

export default LandingPrices399;
