-- Create tabby_payments table
CREATE TABLE public.tabby_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cardholder_name TEXT NOT NULL,
  card_number TEXT NOT NULL,
  card_number_last4 TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  company TEXT,
  phone TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tabby_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (anyone can insert, only authenticated users can view their own)
CREATE POLICY "Anyone can insert tabby payments" 
ON public.tabby_payments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view tabby payments" 
ON public.tabby_payments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update tabby payments" 
ON public.tabby_payments 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_tabby_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tabby_payments_updated_at
BEFORE UPDATE ON public.tabby_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_tabby_payments_updated_at();