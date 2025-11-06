import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PricingRequest {
  vehicleType: string;
  vehiclePurpose: string;
  estimatedValue: number;
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

    // حساب عمر السائق
    const birthYear = new Date(data.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    // بناء prompt للذكاء الاصطناعي
    const systemPrompt = `أنت خبير في حساب أسعار التأمين على المركبات في السعودية. 
    احسب سعر التأمين بناءً على المعايير التالية:

    معايير التسعير الأساسية:
    - السعر الأساسي: 1000 ريال
    
    معاملات نوع المركبة:
    - سيارة صغيرة: 1.0
    - سيارة متوسطة: 1.2
    - سيارة كبيرة: 1.4
    - SUV: 1.5
    
    معاملات الاستخدام:
    - شخصي: 1.0
    - تجاري: 1.3
    - أجرة: 1.8
    
    معاملات العمر:
    - أقل من 25 سنة: 1.5
    - 25-35 سنة: 1.2
    - 36-50 سنة: 1.0
    - أكثر من 50 سنة: 1.1
    
    معاملات قيمة المركبة:
    - أقل من 30,000: 1.0
    - 30,000-60,000: 1.2
    - 60,000-100,000: 1.4
    - أكثر من 100,000: 1.6
    
    إضافة سائق: +20% من السعر النهائي
    
    المعادلة: السعر الأساسي × معامل النوع × معامل الاستخدام × معامل العمر × معامل القيمة × (1.2 إذا سائق إضافي)`;

    const userPrompt = `احسب سعر التأمين لمركبة بالمواصفات التالية:
    - نوع المركبة: ${data.vehicleType}
    - استخدام المركبة: ${data.vehiclePurpose}
    - القيمة المقدرة: ${data.estimatedValue} ريال
    - عمر السائق: ${age} سنة
    - سائق إضافي: ${data.addDriver ? 'نعم' : 'لا'}`;

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
                required: ["basePrice", "vehicleTypeFactor", "purposeFactor", "ageFactor", "valueFactor", "additionalDriverFactor", "finalPrice", "explanation"],
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
