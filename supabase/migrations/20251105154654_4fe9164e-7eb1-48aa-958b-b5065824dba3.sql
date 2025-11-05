-- Create a function to notify via HTTP when a new profile is created
CREATE OR REPLACE FUNCTION public.notify_telegram_on_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  supabase_url text := 'https://khdslyxxxdwcbsvtxmwj.supabase.co';
  function_url text;
BEGIN
  -- Construct the full function URL
  function_url := supabase_url || '/functions/v1/send-telegram-notification';
  
  -- Make HTTP request using pg_net if available
  -- Note: This requires pg_net extension to be enabled
  BEGIN
    SELECT
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZHNseXh4eGR3Y2JzdnR4bXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODI5NzYsImV4cCI6MjA3NjM1ODk3Nn0.XFGOWKYlQk-E-RQPPcuQJfM25lzE12Z9jVQG8WC_N_A'
        ),
        body := jsonb_build_object(
          'email', NEW.email,
          'full_name', NEW.full_name,
          'user_id', NEW.id::text
        )
      ) INTO request_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't block the insert
      RAISE WARNING 'Failed to send Telegram notification: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_new_user_profile_created ON public.profiles;

-- Create new trigger
CREATE TRIGGER on_new_user_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_telegram_on_new_profile();