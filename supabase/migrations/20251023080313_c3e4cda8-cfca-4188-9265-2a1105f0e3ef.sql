-- إضافة أعمدة جديدة لجدول customer_orders لحفظ جميع بيانات العميل
ALTER TABLE public.customer_orders
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS estimated_value TEXT,
ADD COLUMN IF NOT EXISTS policy_start_date DATE,
ADD COLUMN IF NOT EXISTS add_driver TEXT;