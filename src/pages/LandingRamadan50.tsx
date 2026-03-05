import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Star, Sparkles } from "lucide-react";

const LandingRamadan50 = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, #1a0a2e 0%, #2d1b69 30%, #0f3460 60%, #1a1a2e 100%)",
      }}
    >
      {/* Stars / decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[20%] w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse delay-300" />
        <div className="absolute top-[35%] left-[40%] w-1 h-1 bg-white rounded-full animate-pulse delay-500" />
        <div className="absolute top-[15%] right-[45%] w-2 h-2 bg-yellow-100 rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-[30%] left-[25%] w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse delay-200" />
        <div className="absolute bottom-[20%] right-[30%] w-1 h-1 bg-white rounded-full animate-pulse delay-400" />

        {/* Glowing orbs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl animate-pulse delay-500" />

        {/* Floating icons */}
        <Moon className="absolute top-16 left-[20%] w-10 h-10 text-yellow-300/30 animate-bounce" />
        <Star className="absolute top-28 right-[15%] w-8 h-8 text-yellow-400/25 animate-bounce delay-300" />
        <Sparkles className="absolute bottom-32 left-[30%] w-7 h-7 text-amber-300/20 animate-bounce delay-500" />
        <Moon className="absolute bottom-20 right-[25%] w-6 h-6 text-yellow-200/20 animate-bounce delay-700" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Crescent icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="bg-gradient-to-br from-amber-400 to-yellow-600 p-5 rounded-full shadow-2xl shadow-amber-500/30">
              <Moon className="w-16 h-16 text-white" />
            </div>
            <Star className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse" />
          </div>
        </div>

        {/* Ramadan Kareem */}
        <div className="mb-4 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-full">
          <span className="text-2xl">🌙</span>
          <span className="text-xl font-bold text-amber-300">رمضان كريم</span>
          <span className="text-2xl">✨</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          خصومات تصل إلى
        </h1>

        <div className="relative inline-block mb-4">
          <span
            className="text-8xl md:text-[140px] font-black leading-none"
            style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706, #fbbf24)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(251, 191, 36, 0.4))",
            }}
          >
            50%
          </span>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold text-white/90 mb-3">
          على تأمين سيارتك
        </h2>

        <p className="text-lg md:text-xl text-amber-200/80 mb-10 max-w-xl mx-auto">
          بمناسبة شهر رمضان المبارك ، احصل على أقوى العروض على التأمين الشامل وضد الغير
        </p>

        {/* CTA */}
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-500 text-gray-900 text-xl px-14 py-8 rounded-2xl shadow-2xl shadow-amber-500/30 transform hover:scale-105 transition-all duration-300 font-bold"
        >
          <span>احصل على عرضك الآن</span>
          <ArrowLeft className="w-6 h-6 mr-3" />
        </Button>

        {/* Trust */}
        <p className="mt-8 text-white/50 text-sm">
          ✨ عروض حصرية لفترة محدودة خلال شهر رمضان ✨
        </p>
      </div>
    </div>
  );
};

export default LandingRamadan50;
