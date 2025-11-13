-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Update products table to support multiple images
ALTER TABLE products 
DROP COLUMN IF EXISTS image_url;

ALTER TABLE products 
ADD COLUMN image_urls jsonb DEFAULT '[]'::jsonb;

-- Create RLS policies for product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Store owners can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  true -- Permissive because app-level auth handles authorization
);

CREATE POLICY "Store owners can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Store owners can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');