import { useEffect, useMemo, useState } from "react";
import { Clock, Flame } from "lucide-react";

type CheapestOfferBadgeProps = {
  initialSeconds?: number;
};

export default function CheapestOfferBadge({
  initialSeconds = 10 * 60,
}: CheapestOfferBadgeProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 0 ? initialSeconds : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [initialSeconds]);

  const timeText = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, [secondsLeft]);

  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl animate-pulse">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-sm">
            <Flame className="w-5 h-5 animate-bounce" />
            <span>🔥 خصم 50% لمدة محدودة 🔥</span>
            <Flame className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg">{timeText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
