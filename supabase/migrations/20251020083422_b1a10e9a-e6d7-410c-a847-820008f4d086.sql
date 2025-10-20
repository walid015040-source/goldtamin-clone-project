-- تفعيل Realtime على جدول tamara_payments
ALTER TABLE public.tamara_payments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tamara_payments;