-- Remove all product images for demo store
UPDATE products 
SET image_urls = '[]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d';

-- Update demo store logo to new SIM logo
UPDATE stores 
SET logo_url = 'sim-logo.png'
WHERE x_username = 'sim';