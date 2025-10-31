-- إضافة حقل المبلغ الشهري إلى جدول tabby_payments
ALTER TABLE public.tabby_payments 
ADD COLUMN monthly_payment numeric DEFAULT 0 NOT NULL;