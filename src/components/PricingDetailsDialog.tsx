import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";

interface PricingDetails {
  basePrice: number;
  vehicleTypeFactor: number;
  purposeFactor: number;
  ageFactor: number;
  valueFactor: number;
  additionalDriverFactor: number;
  finalPrice: number;
  explanation: string;
}

interface PricingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing: PricingDetails | null;
  age: number;
}

export function PricingDetailsDialog({ open, onOpenChange, pricing, age }: PricingDetailsDialogProps) {
  if (!pricing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="w-6 h-6 text-primary" />
            تفاصيل حساب السعر
          </DialogTitle>
          <DialogDescription>
            شرح مفصل لكيفية حساب سعر التأمين بناءً على المعايير المختلفة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* السعر النهائي */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border-2 border-primary">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">السعر النهائي للتأمين</p>
              <p className="text-4xl font-bold text-primary">
                {pricing.finalPrice.toFixed(2)} ريال
              </p>
            </div>
          </div>

          {/* معاملات الحساب */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              معاملات الحساب
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">السعر الأساسي</p>
                <p className="text-xl font-bold">{pricing.basePrice} ريال</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">عمر السائق</p>
                <p className="text-xl font-bold">{age} سنة</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">معامل نوع المركبة</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">×{pricing.vehicleTypeFactor}</p>
                  <Badge variant="secondary" className="text-xs">
                    {pricing.vehicleTypeFactor > 1 ? '+' : ''}{((pricing.vehicleTypeFactor - 1) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">معامل الاستخدام</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">×{pricing.purposeFactor}</p>
                  <Badge variant="secondary" className="text-xs">
                    {pricing.purposeFactor > 1 ? '+' : ''}{((pricing.purposeFactor - 1) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">معامل العمر</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">×{pricing.ageFactor}</p>
                  <Badge variant="secondary" className="text-xs">
                    {pricing.ageFactor > 1 ? '+' : ''}{((pricing.ageFactor - 1) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">معامل قيمة المركبة</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">×{pricing.valueFactor}</p>
                  <Badge variant="secondary" className="text-xs">
                    {pricing.valueFactor > 1 ? '+' : ''}{((pricing.valueFactor - 1) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>

              {pricing.additionalDriverFactor > 1 && (
                <div className="bg-muted p-4 rounded-lg col-span-2 border-2 border-orange-500">
                  <p className="text-sm text-muted-foreground">سائق إضافي</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold">×{pricing.additionalDriverFactor}</p>
                    <Badge variant="destructive" className="text-xs">
                      +{((pricing.additionalDriverFactor - 1) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* الشرح التفصيلي */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              شرح الحساب
            </h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{pricing.explanation}</p>
            </div>
          </div>

          {/* المعادلة */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground mb-2 text-center">المعادلة المستخدمة</p>
            <p className="text-sm font-mono text-center break-all">
              {pricing.basePrice} × {pricing.vehicleTypeFactor} × {pricing.purposeFactor} × {pricing.ageFactor} × {pricing.valueFactor} × {pricing.additionalDriverFactor} = {pricing.finalPrice.toFixed(2)} ريال
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
