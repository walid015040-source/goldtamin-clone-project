import { memo } from "react";
import { Award, Check, Clock, Shield, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CheapestOfferBadge from "@/components/insurance/CheapestOfferBadge";

type InsuranceCompany = {
  id: number;
  name: string;
  logo: string;
  discount: string;
  originalPrice: number;
  salePrice: number;
  features: string[];
  rating?: number;
  marketingBadge?: string;
  isPremium?: boolean;
  isBestValue?: boolean;
  isMostPopular?: boolean;
  isCheapest?: boolean;
};

type InsuranceOfferCardProps = {
  company: InsuranceCompany;
  index: number;
  onBuyNow: (company: InsuranceCompany) => void;
};

function calculateDiscount(originalPrice: number, salePrice: number) {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

function InsuranceOfferCard({ company, index, onBuyNow }: InsuranceOfferCardProps) {
  const discountPercent = calculateDiscount(company.originalPrice, company.salePrice);

  return (
    <div
      className={`group relative bg-gradient-to-br ${
        company.isCheapest
          ? "from-red-50 via-white to-orange-50 border-4 border-red-500 ring-4 ring-red-200"
          : company.isPremium
            ? "from-yellow-50 via-white to-amber-50 border-2 border-yellow-400"
            : company.isBestValue
              ? "from-green-50 via-white to-emerald-50 border-2 border-green-400"
              : company.isMostPopular
                ? "from-blue-50 via-white to-cyan-50 border-2 border-blue-400"
                : "from-white to-gray-50 border border-gray-100"
      } rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 p-6 overflow-hidden animate-fade-in`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Cheapest Badge with Countdown */}
      {company.isCheapest && <CheapestOfferBadge />}

      {/* Cheapest Flag */}
      {company.isCheapest && (
        <div className="absolute -top-2 -left-2 z-20">
          <div className="bg-red-600 text-white font-bold px-4 py-2 rounded-full shadow-xl text-sm">
            💰 الأرخص
          </div>
        </div>
      )}

      {/* Marketing Badge */}
      {company.marketingBadge && !company.isCheapest && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div
            className={`${
              company.isPremium
                ? "bg-gradient-to-r from-yellow-500 to-amber-600"
                : company.isBestValue
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-blue-500 to-cyan-600"
            } text-white font-bold px-6 py-2 rounded-full shadow-xl text-sm whitespace-nowrap`}
          >
            {company.marketingBadge}
          </div>
        </div>
      )}

      {/* Discount Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className="relative">
          <div
            className={`${
              company.isCheapest
                ? "bg-gradient-to-br from-red-600 via-red-500 to-orange-500"
                : "bg-gradient-to-br from-accent via-accent-dark to-primary"
            } text-white font-bold px-6 py-3 rounded-full shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-300`}
          >
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span className="text-lg">خصم {discountPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      {company.rating && (
        <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-gray-700">{company.rating}</span>
        </div>
      )}

      {/* Logo Section */}
      <div className={`mb-6 ${company.isCheapest ? "pt-14" : "pt-8"}`}>
        <div
          className={`bg-white rounded-2xl p-4 shadow-sm group-hover:shadow-md transition-shadow ${
            company.isCheapest
              ? "ring-2 ring-red-400"
              : company.isPremium
                ? "ring-2 ring-yellow-400"
                : ""
          }`}
        >
          <img
            src={company.logo}
            alt={company.name}
            className="h-24 w-full object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <h3 className="text-lg font-bold text-foreground text-center mt-4 line-clamp-2 min-h-[3.5rem]">
          {company.name}
        </h3>
      </div>

      {/* Features */}
      <div className="mb-6 space-y-2">
        {company.features
          .slice(0, company.isPremium ? 7 : company.isMostPopular ? 5 : 3)
          .map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <Check
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  company.isCheapest
                    ? "text-red-600"
                    : company.isPremium
                      ? "text-yellow-600"
                      : "text-primary"
                }`}
              />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
      </div>

      {/* Price Section */}
      <div
        className={`mb-6 text-center rounded-2xl p-4 ${
          company.isCheapest
            ? "bg-gradient-to-br from-red-100/50 to-orange-100/50"
            : company.isPremium
              ? "bg-gradient-to-br from-yellow-100/50 to-amber-100/50"
              : company.isBestValue
                ? "bg-gradient-to-br from-green-100/50 to-emerald-100/50"
                : "bg-gradient-to-br from-primary/5 to-accent/5"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground line-through">
            {company.originalPrice.toFixed(2)}﷼
          </span>
        </div>
        <div className="flex items-baseline justify-center gap-2">
          <span
            className={`text-4xl font-bold ${
              company.isCheapest
                ? "text-red-600"
                : company.isPremium
                  ? "text-yellow-700"
                  : company.isBestValue
                    ? "text-green-700"
                    : "text-primary"
            }`}
          >
            {company.salePrice.toFixed(2)}
          </span>
          <span className={`text-xl ${company.isCheapest ? "text-red-600" : "text-primary"}`}>
            ﷼
          </span>
        </div>
        <Badge
          variant="secondary"
          className={`mt-2 ${
            company.isCheapest
              ? "bg-red-200 text-red-800 hover:bg-red-300"
              : company.isPremium
                ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                : company.isBestValue
                  ? "bg-green-200 text-green-800 hover:bg-green-300"
                  : "bg-accent/20 text-accent-dark hover:bg-accent/30"
          }`}
        >
          وفر {(company.originalPrice - company.salePrice).toFixed(2)}﷼
        </Badge>
      </div>

      {/* Buy Button */}
      <Button
        className={`w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl group ${
          company.isCheapest
            ? "bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:via-red-600 hover:to-orange-600 animate-pulse"
            : company.isPremium
              ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700"
              : company.isBestValue
                ? "bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700"
                : company.isMostPopular
                  ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700"
                  : "bg-gradient-to-r from-primary via-accent to-primary-dark hover:from-primary-dark hover:via-accent-dark hover:to-primary"
        } text-white`}
        onClick={() => onBuyNow(company)}
      >
        <span className="flex items-center gap-2">
          {company.isCheapest
            ? "🔥 اشترِ الآن - العرض ينتهي قريباً!"
            : company.isBestValue
              ? "🎯 احجز الآن"
              : company.isPremium
                ? "👑 اطلب المميز"
                : "اشترِ الآن"}
          <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </span>
      </Button>
    </div>
  );
}

export default memo(InsuranceOfferCard);
