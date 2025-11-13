-- Add checkout fields configuration to products table
ALTER TABLE products 
ADD COLUMN checkout_fields jsonb DEFAULT '{"email": true, "name": true, "phone": false, "address": false, "custom_fields": []}'::jsonb;

-- Create orders table to store purchase information
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_email text,
  buyer_name text,
  buyer_phone text,
  buyer_address jsonb,
  custom_field_data jsonb DEFAULT '{}'::jsonb,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USDC',
  payment_signature text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Store owners can view their orders
CREATE POLICY "Store owners can view their orders"
ON orders FOR SELECT
USING (
  store_id IN (
    SELECT id FROM stores WHERE user_id = auth.uid()
  )
);

-- Anyone can create orders (during checkout)
CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
WITH CHECK (true);

-- System can update orders
CREATE POLICY "System can update orders"
ON orders FOR UPDATE
USING (true);

-- Create index for faster queries
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);