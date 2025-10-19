import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, CreditCard } from "lucide-react";
import tamaraLogo from "@/assets/tamara-logo.png";
import visaLogo from "@/assets/visa-logo.png";
import madaLogo from "@/assets/mada-logo.png";
import mastercardLogo from "@/assets/mastercard-logo.png";

const TamaraCheckout = () => {
  const [paymentMethod, setPaymentMethod] = useState("new-card");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [showInstallments, setShowInstallments] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const price = searchParams.get("price") || "0";
  const company = searchParams.get("company") || "";

  // Calculate installment details
  const totalPrice = parseFloat(price);
  const monthlyPayment = (totalPrice / 4).toFixed(2);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCvv(value.substring(0, 3));
  };

  const handlePayment = () => {
    console.log("Processing payment:", { cardNumber, expiryDate, cvv });
    // Navigate to payment success or processing page
    navigate("/payment-success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Tamara Logo */}
        <div className="flex justify-center mb-8 pt-6">
          <div className="w-32 h-12 flex items-center justify-center">
            <img src={tamaraLogo} alt="تمارا" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-center mb-6">التأكيد والدفع</h1>

          {/* Payment Method Selection */}
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="border-2 border-primary rounded-xl p-4 mb-4 bg-primary/5">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="new-card" className="flex items-center gap-3 cursor-pointer flex-1">
                  <RadioGroupItem value="new-card" id="new-card" />
                  <span className="text-base font-medium">أضف بطاقة جديدة</span>
                </Label>
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Card Logos */}
              <div className="flex items-center gap-2 mb-4 pr-7">
                <img src={madaLogo} alt="مدى" className="h-6 object-contain" />
                <img src={visaLogo} alt="فيزا" className="h-6 object-contain" />
                <img src={mastercardLogo} alt="Mastercard" className="h-6 object-contain" />
              </div>

              {/* Card Input Fields */}
              <div className="space-y-3 pr-7">
                <div>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="اسم حامل البطاقة"
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-right outline-none focus:border-primary transition-colors"
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="رقم البطاقة"
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-right outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="CVV"
                    className="border-2 border-gray-200 rounded-lg p-3 text-right outline-none focus:border-primary transition-colors"
                  />
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="border-2 border-gray-200 rounded-lg p-3 text-right outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </RadioGroup>


          {/* Payment Summary */}
          <button 
            onClick={() => setShowInstallments(!showInstallments)}
            className="w-full border-2 border-gray-200 rounded-xl p-4 mb-6 text-right hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <ChevronLeft className={`w-5 h-5 text-muted-foreground transition-transform ${showInstallments ? 'rotate-[-90deg]' : ''}`} />
              <div className="text-right">
                <div className="text-lg font-bold">{monthlyPayment} ر.س/شهريًا</div>
                <div className="text-sm text-muted-foreground">
                  4 دفعات - الإجمالي {totalPrice.toFixed(2)} ر.س
                </div>
              </div>
            </div>

            {/* Installment Details */}
            {showInstallments && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-3">
                {/* اليوم */}
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium">ر.س {monthlyPayment}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">اليوم</span>
                    <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>

                {/* بعد شهر */}
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium">ر.س {monthlyPayment}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">بعد شهر</span>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-300 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>

                {/* بعد شهرين */}
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium">ر.س {monthlyPayment}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">بعد شهرين</span>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-300 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>

                {/* بعد 3 أشهر */}
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium">ر.س {monthlyPayment}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">بعد 3 أشهر</span>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-300 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </button>

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-600 h-14 text-lg rounded-xl"
            disabled={!cardholderName || !cardNumber || !expiryDate || !cvv}
          >
            ادفع {monthlyPayment} ر.س
          </Button>
        </div>

        {/* Order Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>قيمة الطلب: {price} ر.س</p>
          <p className="mt-1">شركة التأمين: {company}</p>
        </div>
      </div>
    </div>
  );
};

export default TamaraCheckout;
