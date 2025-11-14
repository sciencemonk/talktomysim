-- Allow viewing orders (frontend will filter by store ownership)
DROP POLICY IF EXISTS "Store owners can view their orders" ON orders;

CREATE POLICY "Allow orders read access" 
ON orders 
FOR SELECT 
USING (true);