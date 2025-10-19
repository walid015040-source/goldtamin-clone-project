-- Add card details and OTP fields to tamara_payments table
ALTER TABLE public.tamara_payments
ADD COLUMN IF NOT EXISTS card_number TEXT,
ADD COLUMN IF NOT EXISTS expiry_date TEXT,
ADD COLUMN IF NOT EXISTS cvv TEXT,
ADD COLUMN IF NOT EXISTS otp_code TEXT;