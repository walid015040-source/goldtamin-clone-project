import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  // For user signups
  email?: string;
  full_name?: string;
  user_id?: string;
  
  // For customer orders
  order_id?: string;
  owner_name?: string;
  phone_number?: string;
  insurance_company?: string;
  insurance_price?: number;
  id_number?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();

    let message: string;

    // Check if it's a user signup or customer order
    if (data.order_id) {
      // Customer order notification
      console.log('Sending Telegram notification for new order:', data);
      
      message = `🔔 *طلب تأمين جديد*\n\n` +
                `📋 *رقم الطلب:* ${data.order_id}\n` +
                `👤 *اسم العميل:* ${data.owner_name || 'غير محدد'}\n` +
                `📱 *رقم الجوال:* ${data.phone_number || 'غير محدد'}\n` +
                `🏢 *شركة التأمين:* ${data.insurance_company || 'غير محدد'}\n` +
                `💰 *قيمة التأمين:* ${data.insurance_price ? `${data.insurance_price} ريال` : 'غير محدد'}\n` +
                `🆔 *رقم الهوية:* ${data.id_number || 'غير محدد'}\n` +
                `🕐 *التاريخ:* ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`;
    } else {
      // User signup notification
      console.log('Sending Telegram notification for new user:', data);
      
      message = `🔔 *مستخدم جديد سجل في الموقع*\n\n` +
                `👤 *الاسم:* ${data.full_name || 'غير محدد'}\n` +
                `📧 *البريد الإلكتروني:* ${data.email}\n` +
                `🆔 *معرف المستخدم:* ${data.user_id}\n` +
                `🕐 *التاريخ:* ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`;
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    const result = await telegramResponse.json();
    
    if (!telegramResponse.ok) {
      console.error('Telegram API error:', result);
      throw new Error(`Telegram API error: ${JSON.stringify(result)}`);
    }

    console.log('Telegram notification sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-telegram-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
