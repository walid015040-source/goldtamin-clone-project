-- إضافة سياسة التحديث لجدول tabby_payment_attempts
CREATE POLICY "Admins can update payment attempts"
ON tabby_payment_attempts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- إضافة سياسة التحديث لجدول tabby_otp_attempts  
CREATE POLICY "Admins can update otp attempts"
ON tabby_otp_attempts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));