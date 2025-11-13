-- Drop all existing policies on products table
DROP POLICY IF EXISTS "Store owners can manage their products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Store owners can insert products" ON products;
DROP POLICY IF EXISTS "Store owners can update their products" ON products;
DROP POLICY IF EXISTS "Store owners can delete their products" ON products;

-- Create a security definer function to check store ownership
CREATE OR REPLACE FUNCTION public.user_owns_store(p_user_id uuid, p_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM stores
    WHERE id = p_store_id
      AND user_id = p_user_id
      AND is_active = true
  );
$$;

-- Create secure RLS policies for products
-- Anyone can view active products from active stores
CREATE POLICY "Anyone can view active products"
ON products
FOR SELECT
USING (
  is_active = true 
  AND store_id IN (
    SELECT id FROM stores WHERE is_active = true
  )
);

-- Users can insert products only for stores they own
CREATE POLICY "Store owners can insert products"
ON products
FOR INSERT
WITH CHECK (
  public.user_owns_store(
    (SELECT user_id FROM stores WHERE id = store_id),
    store_id
  )
);

-- Users can update products only for stores they own
CREATE POLICY "Store owners can update their products"
ON products
FOR UPDATE
USING (
  public.user_owns_store(
    (SELECT user_id FROM stores WHERE id = store_id),
    store_id
  )
);

-- Users can delete products only for stores they own
CREATE POLICY "Store owners can delete their products"
ON products
FOR DELETE
USING (
  public.user_owns_store(
    (SELECT user_id FROM stores WHERE id = store_id),
    store_id
  )
);