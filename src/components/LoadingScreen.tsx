import { Car } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-primary to-primary-dark z-50 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        {/* Animated Car */}
        <div className="relative mb-8">
          <div className="animate-bounce-slow">
            <Car className="w-24 h-24 text-white mx-auto" strokeWidth={1.5} />
          </div>
          {/* Road lines animation */}
          <div className="relative mt-8 h-2 w-64 mx-auto overflow-hidden rounded-full bg-white/20">
            <div className="absolute inset-0 animate-road-line">
              <div className="h-full w-16 bg-white/60 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white animate-pulse">
            جاري البحث عن أفضل عروض شركات التأمين
          </h2>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-white/80 text-lg">
            يرجى الانتظار قليلاً...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
