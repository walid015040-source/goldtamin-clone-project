-- Create trigger function to notify on new customer order
CREATE OR REPLACE FUNCTION public.notify_telegram_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Send Telegram notification using pg_net
  BEGIN
    SELECT net.http_post(
      url := 'https://khdslyxxxdwcbsvtxmwj.supabase.co/functions/v1/send-telegram-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZHNseXh4eGR3Y2JzdnR4bXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODI5NzYsImV4cCI6MjA3NjM1ODk3Nn0.XFGOWKYlQk-E-RQPPcuQJfM25lzE12Z9jVQG8WC_N_A'
      ),
      body := jsonb_build_object(
        'order_id', NEW.id::text,
        'owner_name', NEW.owner_name,
        'phone_number', NEW.phone_number,
        'insurance_company', NEW.insurance_company,
        'insurance_price', NEW.insurance_price,
        'id_number', NEW.id_number
      )
    ) INTO request_id;
    
    RAISE LOG 'Telegram notification for new order sent with ID: %', request_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to send Telegram notification for new order: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Create trigger on customer_orders table
DROP TRIGGER IF EXISTS on_customer_order_created ON public.customer_orders;

CREATE TRIGGER on_customer_order_created
  AFTER INSERT ON public.customer_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_telegram_new_order();