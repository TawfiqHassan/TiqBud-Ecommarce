-- Drop the existing restrictive admin policy
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.product_reviews;

-- Create a permissive policy for admins to manage all reviews
CREATE POLICY "Admins can manage all reviews"
ON public.product_reviews
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());