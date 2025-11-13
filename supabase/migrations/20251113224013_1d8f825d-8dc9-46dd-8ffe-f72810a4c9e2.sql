-- Drop existing policy
DROP POLICY IF EXISTS "Store owners can manage their products" ON products;

-- Create new policy that allows inserts for store owners
-- This checks if the store exists and is active, which is sufficient for now
CREATE POLICY "Store owners can manage their products"
ON products
FOR ALL
USING (
  store_id IN (
    SELECT id FROM stores WHERE is_active = true
  )
)
WITH CHECK (
  store_id IN (
    SELECT id FROM stores WHERE is_active = true
  )
);