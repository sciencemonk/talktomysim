-- Fix the orders RLS policy to properly check current user
DROP POLICY IF EXISTS "Store owners can view their orders via wallet auth" ON orders;

CREATE POLICY "Store owners can view their orders" 
ON orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM stores 
    WHERE stores.id = orders.store_id 
    AND stores.user_id = auth.uid()
  )
);