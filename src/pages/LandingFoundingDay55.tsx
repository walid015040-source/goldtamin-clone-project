import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Sparkles } from "lucide-react";

const LandingFoundingDay55 = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, #165d31 0%, #0d4a27 50%, #093d1f 100%)"
      }}
    >
      {/* Background decorations - Saudi themed */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse" />
        {/* Stars */}
        <Star className="absolute top-20 left-1/4 w-8 h-8 text-yellow-400/40 animate-pulse" />
        <Star className="absolute top-40 right-1/4 w-6 h-6 text-yellow-400/30 animate-pulse delay-150" />
        <Star className="absolute bottom-40 left-1/3 w-10 h-10 text-yellow-400/20 animate-pulse delay-300" />
        <Sparkles className="absolute top-1/3 right-20 w-12 h-12 text-yellow-400/30 animate-bounce" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Saudi Founding Day Badge */}
        <div className="mb-8 inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-green-900 px-8 py-3 rounded-full font-bold text-xl shadow-lg">
          <span>🇸🇦</span>
          <span>يوم التأسيس السعودي</span>
          <span>🇸🇦</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          تخفيضات تصل إلى
        </h1>
        
        <div className="relative inline-block mb-4">
          <span className="text-8xl md:text-[140px] font-black text-yellow-400 leading-none drop-shadow-lg">
            55%
          </span>
        </div>

        <div className="mb-10">
          <p className="text-2xl md:text-4xl font-bold text-white mb-2">
            على التأمين ضد الغير
          </p>
          <p className="text-xl text-yellow-300/90">
            بمناسبة يوم التأسيس السعودي 🎉
          </p>
        </div>

        {/* Decorative Saudi elements */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="w-16 h-1 bg-yellow-400 rounded-full" />
          <div className="w-8 h-1 bg-white/50 rounded-full" />
          <div className="w-16 h-1 bg-yellow-400 rounded-full" />
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 hover:from-yellow-300 hover:to-yellow-400 text-xl px-12 py-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold border-2 border-yellow-300"
        >
          <span>استفد من العرض الآن</span>
          <ArrowLeft className="w-6 h-6 mr-3" />
        </Button>

        {/* Trust badge */}
        <p className="mt-8 text-white/70 text-sm">
          عرض محدود بمناسبة يوم التأسيس - لا تفوت الفرصة
        </p>
      </div>
    </div>
  );
};

export default LandingFoundingDay55;
