-- إضافة حقل رقم الهاتف في جدول tamara_payments إذا لم يكن موجوداً
ALTER TABLE tamara_payments 
ADD COLUMN IF NOT EXISTS phone TEXT;