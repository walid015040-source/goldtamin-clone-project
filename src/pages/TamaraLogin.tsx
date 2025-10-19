import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import tamaraLogo from "@/assets/tamara-logo.png";

const TamaraLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const price = searchParams.get("price") || "0";
  const company = searchParams.get("company") || "";

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    // Only allow input if it starts with 5 or is empty
    if (value.length === 0 || value.startsWith("5")) {
      if (value.length <= 9) {
        setPhoneNumber(value);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send OTP
    // For now, we'll navigate to a success or verification page
    console.log("Phone number:", phoneNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Tamara Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-12 flex items-center justify-center">
            <img src={tamaraLogo} alt="تمارا" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2">أدخل رقم الجوال</h1>
          <p className="text-center text-muted-foreground text-sm mb-8">
            سيتم إرسال رمز للمتابعة
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-right">
                رقم الجوال
              </label>
              <div className="flex items-center gap-2 border-2 border-primary/30 rounded-lg p-3 focus-within:border-primary transition-colors">
                <div className="flex items-center gap-2 border-l pl-3">
                  <span className="text-lg">🇸🇦</span>
                  <span className="font-medium text-muted-foreground">+966</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="5x xxx xxxx"
                  className="flex-1 outline-none text-lg font-medium"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-black/90 text-white h-12 text-base rounded-lg"
              disabled={phoneNumber.length < 9}
            >
              أرسل الرمز
            </Button>
          </form>
        </div>

        {/* Order Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>قيمة الطلب: {price} ر.س</p>
          <p className="mt-1">شركة التأمين: {company}</p>
        </div>
      </div>
    </div>
  );
};

export default TamaraLogin;
