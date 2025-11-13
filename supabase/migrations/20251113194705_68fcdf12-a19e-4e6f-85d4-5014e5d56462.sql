-- Add Shopify integration columns to stores table
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS shopify_store_url text,
ADD COLUMN IF NOT EXISTS shopify_access_token text;