-- Create blocked_ips table
CREATE TABLE public.blocked_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  blocked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view blocked IPs"
ON public.blocked_ips
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert blocked IPs"
ON public.blocked_ips
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blocked IPs"
ON public.blocked_ips
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blocked IPs"
ON public.blocked_ips
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to check if IP is blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocked_ips
    WHERE ip_address = check_ip
  )
$$;

-- Add trigger for updating updated_at
CREATE TRIGGER update_blocked_ips_updated_at
BEFORE UPDATE ON public.blocked_ips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();