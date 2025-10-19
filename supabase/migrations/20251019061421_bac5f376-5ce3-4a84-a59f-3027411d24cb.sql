-- Create payments table
CREATE TABLE public.tamara_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cardholder_name TEXT NOT NULL,
  card_number_last4 TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  monthly_payment DECIMAL(10, 2) NOT NULL,
  company TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tamara_payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for payment submission)
CREATE POLICY "Anyone can create payment" 
ON public.tamara_payments 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow viewing all payments (for admin)
CREATE POLICY "Anyone can view payments" 
ON public.tamara_payments 
FOR SELECT 
USING (true);

-- Create policy to allow admins to update payment status
CREATE POLICY "Admins can update payments" 
ON public.tamara_payments 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tamara_payments_updated_at
BEFORE UPDATE ON public.tamara_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();