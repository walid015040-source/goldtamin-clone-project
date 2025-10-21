-- Add approval_status column to tabby_payment_attempts
ALTER TABLE public.tabby_payment_attempts 
ADD COLUMN approval_status TEXT;

-- Add approval_status column to tabby_otp_attempts
ALTER TABLE public.tabby_otp_attempts 
ADD COLUMN approval_status TEXT;