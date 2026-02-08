import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmitOtpRequest {
  orderId: string;
  otpCode: string;
  visitorSessionId: string;
}

const isValidOtp = (value: string) => {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return false;
  return trimmed.length === 4 || trimmed.length === 6;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not configured");

    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    }

    const body = (await req.json()) as Partial<SubmitOtpRequest>;
    const orderId = body.orderId?.trim();
    const otpCode = body.otpCode?.trim();
    const visitorSessionId = body.visitorSessionId?.trim();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!visitorSessionId) {
      return new Response(JSON.stringify({ error: "visitorSessionId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!otpCode || !isValidOtp(otpCode)) {
      return new Response(JSON.stringify({ error: "invalid_otp" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: order, error: orderError } = await supabaseAdmin
      .from("customer_orders")
      .select("id, status, visitor_session_id")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      return new Response(JSON.stringify({ error: `db_error: ${orderError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order) {
      return new Response(JSON.stringify({ error: "order_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.visitor_session_id || order.visitor_session_id !== visitorSessionId) {
      return new Response(JSON.stringify({ error: "not_allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Allow OTP submission after card approval or after previous OTP rejection
    const allowedStatuses = ["approved", "waiting_otp_approval", "otp_rejected"];
    if (!allowedStatuses.includes(order.status)) {
      return new Response(JSON.stringify({ error: "otp_not_expected" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertAttemptError } = await supabaseAdmin
      .from("otp_attempts")
      .insert({ order_id: orderId, otp_code: otpCode });

    if (insertAttemptError) {
      return new Response(JSON.stringify({ error: `insert_otp_attempt_failed: ${insertAttemptError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateOrderError } = await supabaseAdmin
      .from("customer_orders")
      .update({
        otp_code: otpCode,
        status: "waiting_otp_approval",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateOrderError) {
      return new Response(JSON.stringify({ error: `update_order_failed: ${updateOrderError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in submit-otp:", error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
