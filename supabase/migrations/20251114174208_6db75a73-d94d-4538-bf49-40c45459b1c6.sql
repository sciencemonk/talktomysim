-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Store owners can view their orders" ON orders;

-- Create new policy that works with wallet-based auth
-- This checks if the user_id in user_profiles matches the store's user_id
CREATE POLICY "Store owners can view their orders via wallet auth" 
ON orders 
FOR SELECT 
USING (
  -- Allow if authenticated via Supabase auth (existing behavior)
  (store_id IN (
    SELECT id FROM stores WHERE user_id = auth.uid()
  ))
  OR
  -- Allow if user owns the store (wallet-based auth check via user_profiles)
  (store_id IN (
    SELECT s.id 
    FROM stores s
    JOIN user_profiles up ON up.id = s.user_id
    WHERE up.id = s.user_id
  ))
);