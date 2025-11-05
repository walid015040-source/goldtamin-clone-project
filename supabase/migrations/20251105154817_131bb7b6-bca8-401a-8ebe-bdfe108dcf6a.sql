-- Update the handle_new_user function to also send Telegram notification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  
  -- Try to send Telegram notification (won't block if it fails)
  BEGIN
    PERFORM
      net.http_post(
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
      );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log but don't fail
      RAISE WARNING 'Failed to send Telegram notification: %', SQLERRM;
  END;
  
  RETURN new;
END;
$function$;

-- Remove the extra trigger since handle_new_user already handles this
DROP TRIGGER IF EXISTS on_new_user_profile_created ON public.profiles;
DROP FUNCTION IF EXISTS public.notify_telegram_on_new_profile();