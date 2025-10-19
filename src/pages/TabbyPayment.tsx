import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronRight, CreditCard } from "lucide-react";
import tabbyLogo from "@/assets/tabby-logo.png";

const TabbyPayment = () => {
  const [selectedMethod, setSelectedMethod] = useState<"card" | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cardType, setCardType] = useState<"visa" | "mastercard" | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const price = searchParams.get("price") || "0";
  const company = searchParams.get("company") || "";
  const phone = searchParams.get("phone") || "";

  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) {
      return "visa";
    } else if (/^5[1-5]/.test(cleaned) || /^(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/.test(cleaned)) {
      return "mastercard";
    }
    return null;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    if (!/^\d*$/.test(value)) return;
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted.substring(0, 19)); // 16 digits + 3 spaces
    setCardType(detectCardType(value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCvv(value.substring(0, 3));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    setExpiryDate(value.substring(0, 5));
  };

  const handleContinue = () => {
    if (selectedMethod === "card") {
      // Validate card details
      if (cardNumber.replace(/\s/g, "").length !== 16 || cvv.length !== 3 || expiryDate.length !== 5) {
        return;
      }
    }
    console.log("Continue with payment:", { selectedMethod, price, company, phone });
    // Navigate to payment processing or success page
    navigate(`/payment-success?price=${price}&company=${company}`);
  };

  const isFormValid = selectedMethod === "card" 
    ? cardNumber.replace(/\s/g, "").length === 16 && cvv.length === 3 && expiryDate.length === 5
    : false;

  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir="rtl">
      <div className="max-w-[480px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#3CDBC0] hover:text-[#2fc4aa] transition-colors text-sm font-medium"
          >
            <ChevronRight className="w-4 h-4" />
            العودة إلى المتجر
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
            English
          </button>
        </div>

        {/* Store Name and Tabby Logo */}
        <div className="text-center py-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{company || "المتجر"}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>الدفع بواسطة</span>
            <img src={tabbyLogo} alt="تابي" className="h-5 object-contain" />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-6 py-8 px-8">
          <div className="w-10 h-10 rounded-lg border-2 border-[#22C55E] flex items-center justify-center bg-[#22C55E]">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 h-[2px] bg-[#22C55E]"></div>
          <div className="w-10 h-10 rounded-lg border-2 border-[#22C55E] flex items-center justify-center bg-[#22C55E]">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 h-[2px] bg-[#22C55E]"></div>
          <div className="w-10 h-10 rounded-lg border-2 border-[#22C55E] flex items-center justify-center bg-white">
            <svg className="w-5 h-5 text-[#22C55E]" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 10h18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Hero Image */}
        <div className="px-8 mb-8">
          <div className="w-full rounded-2xl overflow-hidden shadow-md">
            <img 
              src="https://tabby.sallapayment.store/assets/auth-image.png" 
              alt="Tabby" 
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.classList.add('aspect-[16/9]', 'bg-gradient-to-br', 'from-orange-100', 'to-orange-200');
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-8">
          <h1 className="text-2xl font-bold text-center mb-3 text-gray-900">
            اختر طريقة الدفع
          </h1>
          <p className="text-center text-gray-600 mb-8 text-sm">
            قم بإكمال الدفع لإتمام عملية الشراء
          </p>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            {/* Card Payment */}
            <button
              onClick={() => setSelectedMethod("card")}
              className={`w-full p-4 rounded-lg border-2 transition-all text-right flex items-center gap-3 ${
                selectedMethod === "card"
                  ? "border-[#22C55E] bg-[#22C55E]/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "card" ? "border-[#22C55E]" : "border-gray-300"
              }`}>
                {selectedMethod === "card" && (
                  <div className="w-3 h-3 rounded-full bg-[#22C55E]"></div>
                )}
              </div>
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">بطاقة ائتمان</span>
            </button>

            {/* Card Details Form - Shows when card is selected */}
            {selectedMethod === "card" && (
              <div className="bg-white border-2 border-[#22C55E]/20 rounded-lg p-5 space-y-4 animate-in fade-in-50 slide-in-from-top-2">
                <h3 className="font-semibold text-gray-900 mb-4">إضافة بطاقة جديدة</h3>
                
                {/* Card Number */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">رقم البطاقة</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4212 1234 1234 1234"
                      className="w-full border border-gray-300 rounded-lg py-3 text-left outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition-all pl-4 pr-14"
                      dir="ltr"
                    />
                    {cardType && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {cardType === "visa" ? (
                          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 object-contain" />
                        ) : (
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 object-contain" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">تاريخ انتهاء الصلاحية</label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="mm/yy"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition-all"
                      dir="ltr"
                    />
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">CVV</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cvv}
                        onChange={handleCvvChange}
                        placeholder="أرقام 3"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition-all"
                        dir="ltr"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M3 10h18" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Logos */}
                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 object-contain" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 object-contain" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" className="h-6 object-contain" />
                  <div className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">mada</div>
                </div>

                <p className="text-xs text-center text-gray-500 pt-2">
                  سيتم تشفير البطاقة لأجل إستلام المدفوعات النشطة والمستقبلية بموجب البنك
                </p>
              </div>
            )}

            {/* Installment Information */}
            <div className="bg-gradient-to-br from-[#3CDBC0]/10 to-[#22C55E]/10 p-5 rounded-lg border border-[#3CDBC0]/30">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-white p-2 rounded-lg">
                  <img src={tabbyLogo} alt="تابي" className="h-5 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">الدفع بالتقسيط</h3>
                  <p className="text-sm text-gray-600">قسّم مشترياتك على 4 دفعات بدون فوائد</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">الدفعة {num}</div>
                    <div className="font-bold text-[#22C55E]" dir="ltr">
                      {(parseFloat(price) / 4).toFixed(2)} ر.س
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!isFormValid}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-lg transition-all text-base mb-4"
          >
            إكمال الدفع
          </button>

          {/* Order Info */}
          <div className="text-center space-y-2 mb-8">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">المجموع الكلي:</span>
              <span className="font-bold text-lg text-gray-900">{price} ر.س</span>
            </div>
            <p className="text-xs text-gray-500">رقم الجوال: +966{phone}</p>
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pb-8">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>عملية دفع آمنة ومشفرة</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabbyPayment;
