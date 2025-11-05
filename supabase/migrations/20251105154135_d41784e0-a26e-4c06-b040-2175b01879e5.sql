-- Create function to send telegram notification when a new user signs up
CREATE OR REPLACE FUNCTION public.notify_telegram_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  webhook_url text;
BEGIN
  -- Get the Supabase project URL from environment
  webhook_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-telegram-notification';
  
  -- Call the edge function asynchronously using pg_net (if available)
  -- For now, we'll return the new row and let the application handle the notification
  -- This is because pg_net might not be enabled by default
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the function after a new profile is inserted
DROP TRIGGER IF EXISTS on_new_user_profile_created ON public.profiles;
CREATE TRIGGER on_new_user_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_telegram_new_user();