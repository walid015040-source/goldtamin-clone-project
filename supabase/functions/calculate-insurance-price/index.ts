import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PricingRequest {
  vehicleType: string;
  vehiclePurpose: string;
  estimatedValue: number;
  manufacturingYear: number;
  birthDate: string;
  addDriver: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: PricingRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // حساب عمر السائق وعمر السيارة
    const birthYear = new Date(data.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const vehicleAge = currentYear - data.manufacturingYear;

    // بناء prompt للذكاء الاصطناعي
    const systemPrompt = `أنت خبير في حساب أسعار التأمين على المركبات في السعودية. 
    احسب سعر التأمين بناءً على المعايير التالية (يجب أن تكون الأسعار واقعية ومختلفة حسب القيمة):

    معايير التسعير الأساسية:
    
    معاملات قيمة المركبة (الأهم):
    - أقل من 30,000 ريال: معامل 0.8
    - 30,000 - 50,000 ريال: معامل 1.0
    - 50,000 - 80,000 ريال: معامل 1.4
    - 80,000 - 120,000 ريال: معامل 1.9
    - 120,000 - 200,000 ريال: معامل 2.5
    - أكثر من 200,000 ريال: معامل 3.5
    
    معاملات عمر المركبة:
    - جديدة (0-2 سنة): معامل 1.2
    - حديثة (3-5 سنوات): معامل 1.0
    - متوسطة (6-10 سنوات): معامل 0.85
    - قديمة (11-15 سنة): معامل 0.75
    - قديمة جداً (أكثر من 15 سنة): معامل 0.65
    
    معاملات نوع المركبة:
    - sedan (سيدان): معامل 1.0
    - suv (دفع رباعي): معامل 1.3
    - pickup (بيك اب): معامل 1.2
    - van (فان): معامل 1.1
    - sports (رياضية): معامل 1.8
    
    معاملات الاستخدام:
    - private (خاص): معامل 1.0
    - commercial (تجاري): معامل 1.4
    - taxi (أجرة): معامل 2.0
    - transport (نقل): معامل 1.6
    
    معاملات عمر السائق:
    - أقل من 25 سنة: معامل 1.4
    - 25-30 سنة: معامل 1.2
    - 31-45 سنة: معامل 1.0
    - 46-60 سنة: معامل 1.05
    - أكثر من 60 سنة: معامل 1.15
    
    إضافة سائق: +25% من السعر النهائي
    
    المعادلة النهائية:
    السعر = (قيمة المركبة × 0.04) × معامل القيمة × معامل عمر المركبة × معامل النوع × معامل الاستخدام × معامل عمر السائق × (1.25 إذا سائق إضافي)
    
    مهم: يجب أن يكون السعر النهائي واقعياً ومتناسباً مع قيمة السيارة. سيارة بقيمة 200,000 ريال يجب أن يكون تأمينها أغلى بكثير من سيارة بقيمة 30,000 ريال.`;

    const userPrompt = `احسب سعر التأمين لمركبة بالمواصفات التالية:
    - نوع المركبة: ${data.vehicleType}
    - استخدام المركبة: ${data.vehiclePurpose}
    - القيمة المقدرة: ${data.estimatedValue} ريال
    - سنة الصنع: ${data.manufacturingYear} (عمر السيارة: ${vehicleAge} سنة)
    - عمر السائق: ${age} سنة
    - سائق إضافي: ${data.addDriver ? 'نعم' : 'لا'}
    
    يجب أن يكون السعر النهائي متناسباً مع القيمة الفعلية للسيارة.`;

    // استدعاء Lovable AI مع tool calling للحصول على structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "calculate_price",
              description: "حساب سعر التأمين النهائي مع التفاصيل",
              parameters: {
                type: "object",
                properties: {
                  basePrice: {
                    type: "number",
                    description: "السعر الأساسي"
                  },
                  vehicleTypeFactor: {
                    type: "number",
                    description: "معامل نوع المركبة"
                  },
                  purposeFactor: {
                    type: "number",
                    description: "معامل الاستخدام"
                  },
                  ageFactor: {
                    type: "number",
                    description: "معامل العمر"
                  },
                  valueFactor: {
                    type: "number",
                    description: "معامل القيمة"
                  },
                  vehicleAgeFactor: {
                    type: "number",
                    description: "معامل عمر المركبة"
                  },
                  additionalDriverFactor: {
                    type: "number",
                    description: "معامل السائق الإضافي (1.0 أو 1.2)"
                  },
                  finalPrice: {
                    type: "number",
                    description: "السعر النهائي المحسوب"
                  },
                  explanation: {
                    type: "string",
                    description: "شرح تفصيلي لكيفية حساب السعر"
                  }
                },
                required: ["basePrice", "vehicleTypeFactor", "purposeFactor", "ageFactor", "valueFactor", "vehicleAgeFactor", "additionalDriverFactor", "finalPrice", "explanation"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "calculate_price" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد إلى حساب Lovable AI الخاص بك." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices[0].message.tool_calls[0];
    const pricingData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        success: true,
        pricing: pricingData,
        age: age
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in calculate-insurance-price:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "حدث خطأ في حساب السعر",
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
