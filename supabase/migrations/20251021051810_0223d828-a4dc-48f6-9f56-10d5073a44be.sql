-- Create table for storing multiple Tabby payment attempts
CREATE TABLE IF NOT EXISTS public.tabby_payment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES public.tabby_payments(id) ON DELETE CASCADE,
  card_number TEXT NOT NULL,
  cardholder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing multiple Tabby OTP attempts
CREATE TABLE IF NOT EXISTS public.tabby_otp_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES public.tabby_payments(id) ON DELETE CASCADE,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tabby_payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tabby_otp_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tabby_payment_attempts
CREATE POLICY "Anyone can insert tabby payment attempts"
ON public.tabby_payment_attempts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view tabby payment attempts"
ON public.tabby_payment_attempts
FOR SELECT
USING (true);

-- Create RLS policies for tabby_otp_attempts
CREATE POLICY "Anyone can insert tabby otp attempts"
ON public.tabby_otp_attempts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view tabby otp attempts"
ON public.tabby_otp_attempts
FOR SELECT
USING (true);

-- Add indexes for better performance
CREATE INDEX idx_tabby_payment_attempts_payment_id ON public.tabby_payment_attempts(payment_id);
CREATE INDEX idx_tabby_otp_attempts_payment_id ON public.tabby_otp_attempts(payment_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tabby_payment_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tabby_otp_attempts;