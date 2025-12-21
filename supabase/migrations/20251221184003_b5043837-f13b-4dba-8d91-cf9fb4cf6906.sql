-- Update orders RLS policy to allow both authenticated and guest orders
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

-- Allow authenticated users to create orders with their user_id
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Allow anyone to insert order items for their orders
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (true);

-- Allow authenticated users to insert coupon_usage
DROP POLICY IF EXISTS "Users can insert coupon usage" ON public.coupon_usage;
CREATE POLICY "Users can insert coupon usage"
ON public.coupon_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);