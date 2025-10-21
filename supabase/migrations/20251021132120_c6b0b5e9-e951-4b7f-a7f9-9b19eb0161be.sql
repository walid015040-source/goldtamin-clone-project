-- Add session_id to customer_orders
ALTER TABLE customer_orders 
ADD COLUMN IF NOT EXISTS visitor_session_id TEXT;

-- Add session_id to tamara_payments
ALTER TABLE tamara_payments 
ADD COLUMN IF NOT EXISTS visitor_session_id TEXT;

-- Add session_id to tabby_payments
ALTER TABLE tabby_payments 
ADD COLUMN IF NOT EXISTS visitor_session_id TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_orders_visitor_session 
ON customer_orders(visitor_session_id);

CREATE INDEX IF NOT EXISTS idx_tamara_payments_visitor_session 
ON tamara_payments(visitor_session_id);

CREATE INDEX IF NOT EXISTS idx_tabby_payments_visitor_session 
ON tabby_payments(visitor_session_id);