-- Update handle_new_user function to use pg_net correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_id bigint;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  
  -- Send Telegram notification using pg_net
  BEGIN
    SELECT net.http_post(
      url := 'https://khdslyxxxdwcbsvtxmwj.supabase.co/functions/v1/send-telegram-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZHNseXh4eGR3Y2JzdnR4bXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODI5NzYsImV4cCI6MjA3NjM1ODk3Nn0.XFGOWKYlQk-E-RQPPcuQJfM25lzE12Z9jVQG8WC_N_A'
      ),
      body := jsonb_build_object(
        'email', new.email,
        'full_name', COALESCE(new.raw_user_meta_data->>'full_name', ''),
        'user_id', new.id::text
      )
    ) INTO request_id;
    
    RAISE LOG 'Telegram notification request sent with ID: %', request_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to send Telegram notification: %', SQLERRM;
  END;
  
  RETURN new;
END;
$function$;