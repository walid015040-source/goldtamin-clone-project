import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    console.log('Telegram webhook received:', JSON.stringify(update));

    // التعامل مع callback queries (أزرار الموافقة والرفض)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const callbackQueryId = update.callback_query.id;
      const messageId = update.callback_query.message?.message_id;
      const chatId = update.callback_query.message?.chat?.id;

      let action = '';
      let orderId = '';

      if (callbackData.startsWith('approve_')) {
        action = 'approved';
        orderId = callbackData.replace('approve_', '');
      } else if (callbackData.startsWith('reject_')) {
        action = 'rejected';
        orderId = callbackData.replace('reject_', '');
      }

      if (action && orderId) {
        // تحديث حالة الطلب في قاعدة البيانات
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        
        const { error } = await supabase
          .from('customer_orders')
          .update({ 
            status: action,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (error) {
          console.error('Error updating order status:', error);
        }

        // الرد على الزر
        const statusText = action === 'approved' ? '✅ تمت الموافقة' : '❌ تم الرفض';
        
        // تحديث الرسالة الأصلية لإزالة الأزرار وإضافة الحالة
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text: statusText,
            show_alert: true
          })
        });

        // تعديل الرسالة لإظهار الحالة النهائية
        if (messageId && chatId) {
          const originalText = update.callback_query.message?.text || '';
          const updatedText = `${originalText}\n\n${statusText}\n🕐 ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`;
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: updatedText,
              reply_markup: { inline_keyboard: [] }
            })
          });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error in telegram-webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200, // Return 200 to prevent Telegram from retrying
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
