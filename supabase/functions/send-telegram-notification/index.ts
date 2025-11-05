import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  email: string;
  full_name?: string;
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name, user_id }: NotificationRequest = await req.json();

    console.log('Sending Telegram notification for new user:', { email, full_name, user_id });

    const message = `🔔 *مستخدم جديد سجل في الموقع*\n\n` +
                   `👤 *الاسم:* ${full_name || 'غير محدد'}\n` +
                   `📧 *البريد الإلكتروني:* ${email}\n` +
                   `🆔 *معرف المستخدم:* ${user_id}\n` +
                   `🕐 *التاريخ:* ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`;

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
