-- إضافة عمود visitor_ip لجدول customer_orders
ALTER TABLE public.customer_orders
ADD COLUMN IF NOT EXISTS visitor_ip TEXT;