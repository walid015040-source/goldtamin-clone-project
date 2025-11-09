-- Add manufacturing_year column to customer_orders
ALTER TABLE public.customer_orders 
ADD COLUMN manufacturing_year integer;

-- Add comment for documentation
COMMENT ON COLUMN public.customer_orders.manufacturing_year IS 'Year the vehicle was manufactured';