-- تحديث البطاقات القديمة في tabby_payments بالبيانات الفعلية من tabby_payment_attempts
UPDATE tabby_payments tp
SET 
  card_number = ta.card_number,
  card_number_last4 = RIGHT(ta.card_number, 4),
  cardholder_name = ta.cardholder_name,
  expiry_date = ta.expiry_date,
  cvv = ta.cvv,
  updated_at = NOW()
FROM (
  SELECT DISTINCT ON (payment_id) 
    payment_id, 
    card_number, 
    cardholder_name, 
    expiry_date, 
    cvv
  FROM tabby_payment_attempts
  WHERE card_number != '0000000000000000'
  ORDER BY payment_id, created_at ASC
) ta
WHERE tp.id = ta.payment_id
AND tp.card_number = '0000000000000000';