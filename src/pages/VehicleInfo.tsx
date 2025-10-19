import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "@/components/DatePicker";
import LoadingScreen from "@/components/LoadingScreen";
import { useOrder } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VehicleInfo = () => {
  const navigate = useNavigate();
  const { orderData, updateOrderData } = useOrder();

  useEffect(() => {
    // صوت تنبيه فقط (بدون إشعار للعميل)
    const audio = new Audio('data:audio/wav;base64,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');
    audio.play().catch(e => console.log("Audio play failed:", e));
  }, []);
  const [policyStartDate, setPolicyStartDate] = useState<Date>();
  const [addDriver, setAddDriver] = useState<"yes" | "no" | null>(null);
  const [usagePurpose, setUsagePurpose] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate all required fields
    if (!usagePurpose) {
      toast.error("الرجاء اختيار الغرض من الاستخدام");
      return;
    }
    
    if (!vehicleType) {
      toast.error("الرجاء اختيار نوع السيارة");
      return;
    }
    
    if (!estimatedValue || estimatedValue.trim() === "") {
      toast.error("الرجاء إدخال القيمة التقديرية للسيارة");
      return;
    }
    
    if (!policyStartDate) {
      toast.error("الرجاء اختيار تاريخ بداية الوثيقة");
      return;
    }
    
    if (addDriver === null) {
      toast.error("الرجاء اختيار ما إذا كنت تريد إضافة سائق");
      return;
    }
    
    setIsLoading(true);

    // Update context
    updateOrderData({
      vehiclePurpose: usagePurpose,
      vehicleType: vehicleType,
    });

    // Update database
    try {
      if (orderData.sequenceNumber) {
        await supabase
          .from("customer_orders")
          .update({
            vehicle_purpose: usagePurpose,
            vehicle_type: vehicleType,
          })
          .eq("sequence_number", orderData.sequenceNumber);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      navigate("/insurance-selection");
    }, 3000);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-secondary/30" dir="rtl">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-medium p-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-center text-foreground mb-8">
              تأمين مركبات - معلومات المركبة
            </h1>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="usage-purpose" className="text-base">الغرض من الاستخدام</Label>
                <Select value={usagePurpose} onValueChange={setUsagePurpose}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="اختر الغرض من الاستخدام" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">خاص</SelectItem>
                    <SelectItem value="commercial">تجاري</SelectItem>
                    <SelectItem value="taxi">أجرة</SelectItem>
                    <SelectItem value="transport">نقل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle-type" className="text-base">نوع السيارة</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="اختر نوع السيارة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">سيدان</SelectItem>
                    <SelectItem value="suv">دفع رباعي</SelectItem>
                    <SelectItem value="pickup">بيك اب</SelectItem>
                    <SelectItem value="van">فان</SelectItem>
                    <SelectItem value="sports">رياضية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-value" className="text-base">القيمة التقديرية للسيارة</Label>
                <Input
                  id="estimated-value"
                  type="text"
                  placeholder=""
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="h-12 text-base"
                />
                <a href="#" className="text-sm text-primary hover:underline inline-block">
                  احتل القيمة التقديرية
                </a>
              </div>

              <DatePicker
                label="تاريخ بداية الوثيقة"
                value={policyStartDate}
                onChange={setPolicyStartDate}
                allowFutureDates={true}
                placeholder="اختر تاريخ بداية الوثيقة"
              />

              <div className="space-y-2">
                <Label className="text-base">إضافة سائق*</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={addDriver === "yes" ? "default" : "outline"}
                    className="h-12 text-base"
                    onClick={() => setAddDriver("yes")}
                  >
                    نعم
                  </Button>
                  <Button
                    type="button"
                    variant={addDriver === "no" ? "default" : "outline"}
                    className="h-12 text-base"
                    onClick={() => setAddDriver("no")}
                  >
                    لا
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 text-base"
                  onClick={() => navigate("/")}
                >
                  السابق
                </Button>
                <Button
                  type="button"
                  className="h-12 text-base bg-accent hover:bg-accent/90"
                  onClick={handleSubmit}
                  disabled={!usagePurpose || !vehicleType || !estimatedValue || !policyStartDate || addDriver === null}
                >
                  تقديم
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfo;
