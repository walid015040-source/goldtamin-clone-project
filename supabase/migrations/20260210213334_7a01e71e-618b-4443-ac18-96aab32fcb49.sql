-- Allow anonymous users to SELECT orders by session_id (so Payment page can find existing orders)
CREATE POLICY "Anyone can view orders by session"
ON public.customer_orders
FOR SELECT
USING (true);

-- Allow anonymous users to UPDATE orders (so Payment page can add card data to existing orders)
CREATE POLICY "Anyone can update orders"
ON public.customer_orders
FOR UPDATE
USING (true)
WITH CHECK (true);