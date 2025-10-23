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

    const formattedPolicyStartDate = policyStartDate ? policyStartDate.toISOString().split('T')[0] : null;

    // Update context
    updateOrderData({
      vehiclePurpose: usagePurpose,
      vehicleType: vehicleType,
      estimatedValue: estimatedValue,
      policyStartDate: formattedPolicyStartDate || undefined,
      addDriver: addDriver || undefined,
    });

    // Update database
    try {
      if (orderData.sequenceNumber) {
        const { error } = await supabase
          .from("customer_orders")
          .update({
            vehicle_purpose: usagePurpose,
            vehicle_type: vehicleType,
            estimated_value: estimatedValue,
            policy_start_date: formattedPolicyStartDate,
            add_driver: addDriver,
            updated_at: new Date().toISOString(),
          })
          .eq("sequence_number", orderData.sequenceNumber);
        
        if (error) {
          console.error("Error updating order:", error);
          toast.error("حدث خطأ أثناء حفظ البيانات");
          setIsLoading(false);
          return;
        }
        
        console.log("Vehicle info updated successfully");
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
