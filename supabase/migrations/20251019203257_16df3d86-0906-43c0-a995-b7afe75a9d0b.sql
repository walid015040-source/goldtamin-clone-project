-- Add foreign key constraints to tamara_payment_attempts
ALTER TABLE public.tamara_payment_attempts
ADD CONSTRAINT tamara_payment_attempts_payment_id_fkey
FOREIGN KEY (payment_id)
REFERENCES public.tamara_payments(id)
ON DELETE CASCADE;

-- Add foreign key constraints to tamara_otp_attempts
ALTER TABLE public.tamara_otp_attempts
ADD CONSTRAINT tamara_otp_attempts_payment_id_fkey
FOREIGN KEY (payment_id)
REFERENCES public.tamara_payments(id)
ON DELETE CASCADE;