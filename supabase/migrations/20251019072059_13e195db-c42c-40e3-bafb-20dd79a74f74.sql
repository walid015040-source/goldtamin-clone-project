-- Drop the existing check constraint
ALTER TABLE tamara_payments DROP CONSTRAINT IF EXISTS tamara_payments_payment_status_check;

-- Add new check constraint with all allowed statuses including 'completed' and 'otp_rejected'
ALTER TABLE tamara_payments ADD CONSTRAINT tamara_payments_payment_status_check 
CHECK (payment_status IN ('pending', 'approved', 'rejected', 'completed', 'otp_rejected'));