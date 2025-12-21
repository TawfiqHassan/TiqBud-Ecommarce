-- Allow admins to update profiles (needed for approving users)
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (public.is_admin());